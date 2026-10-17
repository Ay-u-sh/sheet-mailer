import type { MailingFile } from "./MailingFile";
import type { RecipientColumn } from "./MailingSetup";

export type EmailDraft = {
  senderEmail: string;
  subject: string;
  messageBodyHtml: string;
  selectedRecipientColumn: RecipientColumn;
  recipientCount: number;
  attachments: MailingFile[];
  images: MailingFile[];
};