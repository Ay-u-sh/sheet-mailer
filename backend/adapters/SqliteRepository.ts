import {
    createCipheriv,
    randomBytes,
    randomUUID
  } from "node:crypto";
  import type Database from "better-sqlite3-multiple-ciphers";
  import type {
    ApplicationUser,
    ApplicationUserRepository,
    GmailConnection,
    GmailConnectionRepository,
    OAuthStateRepository
  } from "../usecases/ConnectGmailAccount.js";
  import type {
    Campaign,
    CampaignRepository,
    CampaignRequest
  } from "../usecases/CreateCampaign.js";
  import type {
    CampaignProcessingRepository,
    PendingRecipient
  } from "../usecases/ProcessCampaign.js";
  
  type AccountRow = {
    id: string;
    google_sub: string;
    email: string;
  };
  
  type OAuthStateRow = {
    user_id: string;
  };
  
  type PendingRecipientRow = {
    id: string;
    campaign_id: string;
    user_id: string;
    email: string;
    subject: string;
    message_body_html: string;
    attempt_count: number;
  };
  
  type CampaignStatusRow = {
    status: string;
  };
  
  type RecipientStatusRow = {
    status: string;
  };
  
  export class SqliteRepository implements
    ApplicationUserRepository,
    GmailConnectionRepository,
    OAuthStateRepository,
    CampaignRepository,
    CampaignProcessingRepository {
    private readonly tokenEncryptionKey: Buffer;
  
    constructor(
      private readonly database: Database.Database,
      tokenEncryptionKey: string
    ) {
      if (!/^[0-9a-fA-F]{64}$/.test(tokenEncryptionKey))
        throw new Error("Token encryption key must contain 64 hexadecimal characters.");
  
      this.tokenEncryptionKey = Buffer.from(tokenEncryptionKey, "hex");
    }
  
    async findByGoogleSub(googleSub: string): Promise<ApplicationUser | undefined> {
      const row: AccountRow | undefined = this.database.prepare(`
        SELECT id, google_sub, email
        FROM accounts
        WHERE google_sub = ?
      `).get(googleSub) as AccountRow | undefined;
  
      if (!row)
        return undefined;
  
      return {
        id: row.id,
        googleSub: row.google_sub,
        email: row.email
      };
    }
  
    async create(googleSub: string, email: string): Promise<ApplicationUser> {
      const user: ApplicationUser = {
        id: randomUUID(),
        googleSub,
        email
      };
  
      this.database.prepare(`
        INSERT INTO accounts (id, google_sub, email)
        VALUES (?, ?, ?)
      `).run(user.id, user.googleSub, user.email);
  
      return user;
    }
  
    async save(userId: string, connection: GmailConnection): Promise<void> {
      const encryptedRefreshToken: string = this.encrypt(connection.refreshToken);
  
      this.database.prepare(`
        INSERT INTO gmail_connections (
          user_id,
          google_sub,
          email,
          encrypted_refresh_token
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          google_sub = excluded.google_sub,
          email = excluded.email,
          encrypted_refresh_token = excluded.encrypted_refresh_token,
          updated_at = CURRENT_TIMESTAMP
      `).run(
        userId,
        connection.googleSub,
        connection.email,
        encryptedRefreshToken
      );
    }
  
    async saveState(state: string, userId: string, expiresAt: number): Promise<void> {
      this.database.prepare(`
        INSERT INTO oauth_states (state, user_id, expires_at)
        VALUES (?, ?, ?)
      `).run(state, userId, expiresAt);
    }
  
    async consume(state: string): Promise<string | undefined> {
      const consumeState = this.database.transaction(
        (oauthState: string): string | undefined => {
          const now: number = Date.now();
  
          const row: OAuthStateRow | undefined = this.database.prepare(`
            DELETE FROM oauth_states
            WHERE state = ? AND expires_at > ?
            RETURNING user_id
          `).get(oauthState, now) as OAuthStateRow | undefined;
  
          if (row)
            return row.user_id;
  
          this.database.prepare(`
            DELETE FROM oauth_states
            WHERE state = ?
          `).run(oauthState);
  
          return undefined;
        }
      );
  
      return consumeState(state);
    }
  
    async createCampaign(userId: string, request: CampaignRequest): Promise<Campaign> {
      const campaign: Campaign = {
        id: randomUUID(),
        userId,
        recipients: [...request.recipients],
        email: {
          subject: request.email.subject,
          messageBodyHtml: request.email.messageBodyHtml
        },
        status: "pending"
      };
  
      const createCampaign = this.database.transaction((): void => {
        this.database.prepare(`
          INSERT INTO campaigns (
            id,
            user_id,
            subject,
            message_body_html,
            status
          )
          VALUES (?, ?, ?, ?, 'pending')
        `).run(
          campaign.id,
          campaign.userId,
          campaign.email.subject,
          campaign.email.messageBodyHtml
        );
  
        const insertRecipient = this.database.prepare(`
          INSERT INTO campaign_recipients (
            id,
            campaign_id,
            email
          )
          VALUES (?, ?, ?)
        `);
  
        for (const email of campaign.recipients)
          insertRecipient.run(randomUUID(), campaign.id, email);
      });
  
      createCampaign();
  
      return campaign;
    }
  
    async claimNextReadyRecipient(): Promise<PendingRecipient | undefined> {
      const claimRecipient = this.database.transaction(
        (): PendingRecipient | undefined => {
          const now: number = Date.now();
  
          const row: PendingRecipientRow | undefined = this.database.prepare(`
            SELECT
              recipients.id,
              recipients.campaign_id,
              campaigns.user_id,
              recipients.email,
              campaigns.subject,
              campaigns.message_body_html,
              recipients.attempt_count
            FROM campaign_recipients AS recipients
            INNER JOIN campaigns
              ON campaigns.id = recipients.campaign_id
            WHERE recipients.status = 'pending'
              AND recipients.retry_at <= ?
              AND campaigns.status IN ('pending', 'processing')
            ORDER BY recipients.retry_at, recipients.created_at
            LIMIT 1
          `).get(now) as PendingRecipientRow | undefined;
  
          if (!row)
            return undefined;
  
          const result = this.database.prepare(`
            UPDATE campaign_recipients
            SET status = 'sending',
                attempt_count = attempt_count + 1
            WHERE id = ? AND status = 'pending'
          `).run(row.id);
  
          if (result.changes !== 1)
            return undefined;
  
          this.database.prepare(`
            UPDATE campaigns
            SET status = 'processing'
            WHERE id = ? AND status = 'pending'
          `).run(row.campaign_id);
  
          return {
            id: row.id,
            campaignId: row.campaign_id,
            userId: row.user_id,
            email: row.email,
            subject: row.subject,
            messageBodyHtml: row.message_body_html,
            attemptCount: row.attempt_count + 1
          };
        }
      );
  
      return claimRecipient();
    }
  
    async markRecipientSent(recipientId: string, messageId: string): Promise<void> {
      this.database.prepare(`
        UPDATE campaign_recipients
        SET status = 'sent',
            message_id = ?,
            failure_reason = NULL
        WHERE id = ? AND status = 'sending'
      `).run(messageId, recipientId);
    }
  
    async scheduleRecipientRetry(
      recipientId: string,
      retryAt: number,
      reason: string
    ): Promise<void> {
      this.database.prepare(`
        UPDATE campaign_recipients
        SET status = 'pending',
            retry_at = ?,
            failure_reason = ?
        WHERE id = ? AND status = 'sending'
      `).run(retryAt, reason, recipientId);
    }
  
    async markRecipientFailed(recipientId: string, reason: string): Promise<void> {
      this.database.prepare(`
        UPDATE campaign_recipients
        SET status = 'failed',
            failure_reason = ?
        WHERE id = ? AND status = 'sending'
      `).run(reason, recipientId);
    }
  
    async markRecipientUncertain(recipientId: string, reason: string): Promise<void> {
      this.database.prepare(`
        UPDATE campaign_recipients
        SET status = 'uncertain',
            failure_reason = ?
        WHERE id = ? AND status = 'sending'
      `).run(reason, recipientId);
    }
  
    async pauseCampaign(
      campaignId: string,
      reason: string,
      resumeAt?: number
    ): Promise<void> {
      this.database.prepare(`
        UPDATE campaigns
        SET status = 'paused',
            pause_reason = ?,
            resume_at = ?
        WHERE id = ?
      `).run(reason, resumeAt ?? null, campaignId);
    }
  
    async updateCampaignStatus(campaignId: string): Promise<void> {
      const campaign: CampaignStatusRow | undefined = this.database.prepare(`
        SELECT status
        FROM campaigns
        WHERE id = ?
      `).get(campaignId) as CampaignStatusRow | undefined;
  
      if (!campaign || campaign.status === "paused")
        return;
  
      const recipients: RecipientStatusRow[] = this.database.prepare(`
        SELECT status
        FROM campaign_recipients
        WHERE campaign_id = ?
      `).all(campaignId) as RecipientStatusRow[];
  
      if (recipients.length === 0)
        return;
  
      const hasActiveRecipients: boolean = recipients.some(
        (recipient: RecipientStatusRow): boolean =>
          recipient.status === "pending" || recipient.status === "sending"
      );
  
      const status: "processing" | "completed" = hasActiveRecipients
        ? "processing"
        : "completed";
  
      this.database.prepare(`
        UPDATE campaigns
        SET status = ?
        WHERE id = ? AND status != 'paused'
      `).run(status, campaignId);
    }
  
    private encrypt(value: string): string {
      const initializationVector: Buffer = randomBytes(12);
      const cipher = createCipheriv(
        "aes-256-gcm",
        this.tokenEncryptionKey,
        initializationVector
      );
  
      const encryptedValue: Buffer = Buffer.concat([
        cipher.update(value, "utf8"),
        cipher.final()
      ]);
  
      const authenticationTag: Buffer = cipher.getAuthTag();
  
      return [
        initializationVector.toString("hex"),
        authenticationTag.toString("hex"),
        encryptedValue.toString("hex")
      ].join(":");
    }
  }