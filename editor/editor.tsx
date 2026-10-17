
import React, { useEffect, useRef, useState } from "react";

import "./editor.css";

import From from "./From";
import RecipientColumnSelector from "./RecipientColumnSelector";
import SubjectInput, { SubjectInputHandle } from "./EmailSubjectInput";
import MessageEditor, { MessageEditorHandle } from "./MessageEditor";
import EmailPreview from "./EmailPreview";
import CampaignActions from "./CampaignActions";

import type { EmailDraft } from "../models/EmailDraft";
import type { MailingFile } from "../models/MailingFile";
import type { RecipientColumn } from "../models/MailingSetup";
import type { MailingSetup } from "../usecase/MailingSetup";
import type { MergeVariable } from "../models/MergeVariable";

import { getEmailVariables } from "../usecase/EmailVariables";
import {
  addEmailAttachment,
  removeEmailAttachment,
  addEmailImage,
  removeEmailImage,
} from "../usecase/AddRemoveEmailAttachmentsAndImages";

import {
  prepareMailingSetup,
  changeRecipientColumn,
  changeFirstRowContainsHeaders,
} from "./GoogleScriptClient";

type ActiveField = "subject" | "message";

const Editor = (): React.ReactElement => {
  const [setup, setSetup] = useState<MailingSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  const activeFieldRef = useRef<ActiveField>("subject");
  const subjectInputRef = useRef<SubjectInputHandle | null>(null);
  const messageEditorRef = useRef<MessageEditorHandle | null>(null);

  useEffect(() => {
    prepareMailingSetup()
      .then(setSetup)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="editor-error">
        <strong>Unable to load mailing setup</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (!setup) {
    return <div className="editor-loading">Loading...</div>;
  }


  const draft: EmailDraft = setup.draft;

  const mergeVariables: MergeVariable[] = getEmailVariables(
    setup.possibleRecipientColumns,
  );

  const handleSubjectChange = (subject: string): void => {
    setSetup((currentSetup: MailingSetup | null) => {
      if (!currentSetup)
        return currentSetup;

      return {
        ...currentSetup,
        draft: {
          ...currentSetup.draft,
          subject,
        },
      };
    });
  };

  const handleMessageChange = (messageBodyHtml: string): void => {
    setSetup((currentSetup: MailingSetup | null) => {
      if (!currentSetup)
        return currentSetup;

      return {
        ...currentSetup,
        draft: {
          ...currentSetup.draft,
          messageBodyHtml,
        },
      };
    });
  };

  const handleRecipientColumnSelected = (
    column: RecipientColumn,
  ): void => {
    changeRecipientColumn({
      draft,
      sheetId: setup.selectedSheet.sheetId,
      selectedColumn: column,
      firstRowContainsHeaders: setup.firstRowContainsHeaders,
    })
      .then((updatedDraft: EmailDraft) => {
        setSetup((currentSetup: MailingSetup | null) => {
          if (!currentSetup)
            return currentSetup;

          return {
            ...currentSetup,
            draft: {
              ...currentSetup.draft,
              selectedRecipientColumn:
                updatedDraft.selectedRecipientColumn,
              recipientCount: updatedDraft.recipientCount,
            },
          };
        });
      })
      .catch((err: Error) => setError(err.message));
  };

  const handleFirstRowContainsHeadersChange = (
    nextValue: boolean,
  ): void => {
    changeFirstRowContainsHeaders({
      draft,
      sheetId: setup.selectedSheet.sheetId,
      firstRowContainsHeaders: nextValue,
    })
      .then((selection) => {
        setSetup((currentSetup: MailingSetup | null) => {
          if (!currentSetup)
            return currentSetup;

          return {
            ...currentSetup,
            firstRowContainsHeaders: nextValue,
            possibleRecipientColumns: selection.possibleColumns,
            draft: {
              ...currentSetup.draft,
              selectedRecipientColumn:
                selection.draft.selectedRecipientColumn,
              recipientCount: selection.draft.recipientCount,
            },
          };
        });
      })
      .catch((err: Error) => setError(err.message));
  };

  const handleInsertVariable = (placeholder: string): void => {
    if (activeFieldRef.current === "subject")
      subjectInputRef.current?.insertVariable(placeholder);
    else
      messageEditorRef.current?.insertVariable(placeholder);
  };

  const handlePreview = (): void => {
    setIsPreviewing(true);
  };
  
  const handleBackToEditor = (): void => {
    setIsPreviewing(false);
  };
  
  const handleSendTest = (): void => {
    window.alert("Send test is coming soon.");
  };

  const handleSendCampaign = (): void => {
    window.alert("Send campaign is coming soon.");
  };

  const handleBold = (): void => {
    messageEditorRef.current?.bold();
  };

  const handleItalic = (): void => {
    messageEditorRef.current?.italic();
  };

  const handleUnderline = (): void => {
    messageEditorRef.current?.underline();
  };

  const handleInsertLink = (text: string, url: string): void => {
    const messageEditor: MessageEditorHandle | null =
      messageEditorRef.current;

    if (!messageEditor)
      return;

    messageEditor.insertLink(text, url);
  };

  const handleAttachmentSelected = (file: File): void => {
    try {
      const updatedDraft: EmailDraft = addEmailAttachment(draft, file);

      const attachment: MailingFile =
        updatedDraft.attachments[updatedDraft.attachments.length - 1];

      setSetup((currentSetup: MailingSetup | null) => {
        if (!currentSetup)
          return currentSetup;

        return {
          ...currentSetup,
          draft: {
            ...currentSetup.draft,
            attachments: [
              ...currentSetup.draft.attachments,
              attachment,
            ],
          },
        };
      });
    } catch (err) {
      if (err instanceof Error)
        setError(err.message);
    }
  };

  const handleImageSelected = (file: File): void => {
    try {
      const updatedDraft: EmailDraft = addEmailImage(draft, file);

      const image: MailingFile =
        updatedDraft.images[updatedDraft.images.length - 1];

      setSetup((currentSetup: MailingSetup | null) => {
        if (!currentSetup)
          return currentSetup;

        return {
          ...currentSetup,
          draft: {
            ...currentSetup.draft,
            images: [
              ...currentSetup.draft.images,
              image,
            ],
          },
        };
      });
    } catch (err) {
      if (err instanceof Error)
        setError(err.message);
    }
  };

  const handleAttachmentRemoved = (file: MailingFile): void => {
    setSetup((currentSetup: MailingSetup | null) => {
      if (!currentSetup)
        return currentSetup;

      return {
        ...currentSetup,
        draft: removeEmailAttachment(currentSetup.draft, file),
      };
    });
  };

  const handleImageRemoved = (file: MailingFile): void => {
    setSetup((currentSetup: MailingSetup | null) => {
      if (!currentSetup)
        return currentSetup;

      return {
        ...currentSetup,
        draft: removeEmailImage(currentSetup.draft, file),
      };
    });
  };
  if (isPreviewing) {
    return (
      <EmailPreview
        draft={setup.draft}
        firstRowContainsHeaders={setup.firstRowContainsHeaders}
        onBack={handleBackToEditor}
        onSendTest={handleSendTest}
        onSendEmails={handleSendCampaign}
      />
    );
  }
  
  return (
    <div className="editor">
      <main className="editor-content">
        <From email={draft.senderEmail} />

        <RecipientColumnSelector
          columns={setup.possibleRecipientColumns}
          selectedColumn={draft.selectedRecipientColumn}
          recipientCount={draft.recipientCount}
          firstRowContainsHeaders={setup.firstRowContainsHeaders}
          onColumnSelected={handleRecipientColumnSelected}
          onFirstRowContainsHeadersChange={
            handleFirstRowContainsHeadersChange
          }
        />

        <SubjectInput
          ref={subjectInputRef}
          value={draft.subject}
          onChange={handleSubjectChange}
          onFocusField={() => (activeFieldRef.current = "subject")}
        />

        <div className="editor-message">
          <MessageEditor
            ref={messageEditorRef}
            value={draft.messageBodyHtml}
            onChange={handleMessageChange}
            onFocusField={() => (activeFieldRef.current = "message")}
            attachments={draft.attachments}
            images={draft.images}
            onAttachmentRemoved={handleAttachmentRemoved}
            onImageRemoved={handleImageRemoved}
          />

        </div>
      </main>

      <CampaignActions
        variables={mergeVariables}
        onAttachmentSelected={handleAttachmentSelected}
        onImageSelected={handleImageSelected}
        onInsertVariable={handleInsertVariable}
        onBold={handleBold}
        onItalic={handleItalic}
        onUnderline={handleUnderline}
        onInsertLink={handleInsertLink}
        onPreview={handlePreview}
        onSendCampaign={handleSendCampaign}
      />
    </div>
  );
};

export default Editor;