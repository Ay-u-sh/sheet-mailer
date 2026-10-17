
import React from "react";

import "./EmailPreview.css";

import type { EmailDraft } from "../models/EmailDraft";

declare const DOMPurify: {
  sanitize(html: string): string;
};

type EmailPreviewProps = {
  draft: EmailDraft;
  firstRowContainsHeaders: boolean;
  onBack: () => void;
  onSendTest: () => void;
  onSendEmails: () => void;
};

function EmailPreview({
  draft,
  firstRowContainsHeaders,
  onBack,
  onSendTest,
  onSendEmails,
}: EmailPreviewProps): React.ReactElement {
  const recipientColumnLabel: string =
    draft.selectedRecipientColumn.label.trim() ||
    `Column ${draft.selectedRecipientColumn.columnPosition}`;

  const sanitizedMessage: string =
    DOMPurify.sanitize(draft.messageBodyHtml);

  return (
    <div className="email-preview">
      <header className="email-preview__header">
        <button
          type="button"
          className="email-preview__back"
          onClick={onBack}
        >
          Back to editor
        </button>

        <h1 className="email-preview__title">Preview email</h1>
      </header>

      <main className="email-preview__content">
        <section className="email-preview__details">
          <div className="email-preview__detail">
            <span className="email-preview__label">From</span>
            <span className="email-preview__value">
              {draft.senderEmail}
            </span>
          </div>

          <div className="email-preview__detail">
            <span className="email-preview__label">To</span>
            <div className="email-preview__value">
              <span>{recipientColumnLabel}</span>
              <span className="email-preview__recipient-count">
                {draft.recipientCount} recipients
              </span>
            </div>
          </div>

          <div className="email-preview__detail">
            <span className="email-preview__label">Subject</span>
            <span className="email-preview__value">
              {draft.subject || "(No subject)"}
            </span>
          </div>
        </section>

        <article className="email-preview__message">
          {sanitizedMessage ? (
            <div
              className="email-preview__body"
              dangerouslySetInnerHTML={{
                __html: sanitizedMessage,
              }}
            />
          ) : (
            <p className="email-preview__empty">
              No message content.
            </p>
          )}
        </article>

        {draft.attachments.length > 0 && (
          <section className="email-preview__attachments">
            <h2 className="email-preview__section-title">
              Attachments
            </h2>

            {draft.attachments.map((attachment, index: number) => (
              <div
                className="email-preview__attachment"
                key={`${attachment.name}-${attachment.file.lastModified}-${index}`}
              >
                <span aria-hidden="true">📎</span>
                <span>{attachment.name}</span>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="email-preview__actions">
        <button
          type="button"
          className="email-preview__send-test"
          onClick={onSendTest}
        >
          Send test
        </button>

        <button
          type="button"
          className="email-preview__send"
          onClick={onSendEmails}
        >
          Send emails
        </button>
      </footer>
    </div>
  );
}

export default EmailPreview;