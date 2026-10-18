
export type PendingRecipient = {
    id: string;
    campaignId: string;
    userId: string;
    email: string;
    subject: string;
    messageBodyHtml: string;
    attemptCount: number;
  };
  
  export type RecipientSendResult = {
    messageId: string;
  };
  
  export type EmailSendErrorType =
    | "RATE_LIMIT"
    | "QUOTA_EXCEEDED"
    | "AUTHORIZATION_REVOKED"
    | "PERMANENT_FAILURE"
    | "UNCERTAIN";
  
  export class EmailSendError extends Error {
    constructor(
      message: string,
      public readonly type: EmailSendErrorType,
      public readonly retryAfterMs: number = 0
    ) {
      super(message);
    }
  }
  
  export interface CampaignProcessingRepository {
    claimNextReadyRecipient(): Promise<PendingRecipient | undefined>;
    markRecipientSent(recipientId: string, messageId: string): Promise<void>;
    scheduleRecipientRetry(recipientId: string, retryAt: number, reason: string): Promise<void>;
    markRecipientFailed(recipientId: string, reason: string): Promise<void>;
    markRecipientUncertain(recipientId: string, reason: string): Promise<void>;
    pauseCampaign(campaignId: string, reason: string, resumeAt?: number): Promise<void>;
    updateCampaignStatus(campaignId: string): Promise<void>;
  }
  
  export interface CampaignEmailSender {
    send(recipient: PendingRecipient): Promise<RecipientSendResult>;
  }
  
  export class ProcessCampaign {
    private readonly maxAttempts: number = 5;
    private readonly baseRetryDelayMs: number = 2000;
    private readonly maxRetryDelayMs: number = 15 * 60 * 1000;
  
    constructor(
      private readonly campaigns: CampaignProcessingRepository,
      private readonly emailSender: CampaignEmailSender
    ) {}
  
    async execute(): Promise<boolean> {
      const recipient: PendingRecipient | undefined = await this.campaigns.claimNextReadyRecipient();
  
      if (!recipient)
        return false;
  
      try {
        const result: RecipientSendResult = await this.emailSender.send(recipient);
  
        await this.campaigns.markRecipientSent(recipient.id, result.messageId);
      } catch (error: unknown) {
        if (!(error instanceof EmailSendError)) {
          const reason: string = error instanceof Error ? error.message : "Unknown sending outcome.";
  
          await this.campaigns.markRecipientUncertain(recipient.id, reason);
          await this.campaigns.updateCampaignStatus(recipient.campaignId);
  
          return true;
        }
  
        await this.handleSendError(recipient, error);
      }
  
      await this.campaigns.updateCampaignStatus(recipient.campaignId);
  
      return true;
    }
  
    private async handleSendError(recipient: PendingRecipient, error: EmailSendError): Promise<void> {
      if (error.type === "AUTHORIZATION_REVOKED") {
        await this.campaigns.pauseCampaign(recipient.campaignId, "GMAIL_REAUTHORIZATION_REQUIRED");
        await this.campaigns.scheduleRecipientRetry(recipient.id, Date.now(), error.message);
        return;
      }
  
      if (error.type === "QUOTA_EXCEEDED") {
        await this.campaigns.pauseCampaign(recipient.campaignId, "GMAIL_QUOTA_EXCEEDED");
        await this.campaigns.scheduleRecipientRetry(recipient.id, Date.now(), error.message);
        return;
      }
  
      if (error.type === "PERMANENT_FAILURE") {
        await this.campaigns.markRecipientFailed(recipient.id, error.message);
        return;
      }
  
      if (error.type === "UNCERTAIN") {
        await this.campaigns.markRecipientUncertain(recipient.id, error.message);
        return;
      }
  
      if (recipient.attemptCount >= this.maxAttempts) {
        await this.campaigns.markRecipientFailed(recipient.id, error.message);
        return;
      }
  
      const exponentialDelay: number = Math.min(
        this.baseRetryDelayMs * 2 ** recipient.attemptCount,
        this.maxRetryDelayMs
      );
  
      const retryDelay: number = Math.max(exponentialDelay, error.retryAfterMs);
      const retryAt: number = Date.now() + retryDelay;
  
      await this.campaigns.scheduleRecipientRetry(recipient.id, retryAt, error.message);
    }
  }
  