
export type TestEmail = {
    recipientEmail: string;
    subject: string;
    messageBodyHtml: string;
  };
  
  export type SentEmail = {
    messageId: string;
  };
  
  export interface EmailSender {
    send(userId: string, email: TestEmail): Promise<SentEmail>;
  }
  
export class SendTestEmail {
    constructor(private readonly emailSender: EmailSender) {}
  
    async execute(userId: string, email: TestEmail): Promise<SentEmail> {
      if (!email.recipientEmail.trim())
        throw new Error("Recipient email is required.");
  
      return await this.emailSender.send(userId, email);
    }
  }
  