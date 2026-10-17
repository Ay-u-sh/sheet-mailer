import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import type { MailingFile } from "../models/MailingFile";

import FileChip from "./FileChip";

import "./MessageEditor.css";

declare const Squire: {
  new (element: HTMLElement): SquireEditor;
};

type SquireEditor = {
  setHTML: (html: string) => void;
  getHTML: () => string;
  addEventListener: (event: string, handler: () => void) => void;
  focus: () => void;
  insertHTML: (html: string) => void;
  insertElement: (element: HTMLElement) => void;
  bold: () => void;
  italic: () => void;
  underline: () => void;
  removeLink: () => void;
};

type MessageEditorProps = {
  value: string;
  onChange: (messageBodyHtml: string) => void;
  onFocusField: () => void;
  attachments: MailingFile[];
  images: MailingFile[];
  onAttachmentRemoved: (file: MailingFile) => void;
  onImageRemoved: (file: MailingFile) => void;
};

export type MessageEditorHandle = {
  insertVariable: (placeholder: string) => void;
  bold: () => void;
  italic: () => void;
  underline: () => void;
  insertLink: (text: string, url: string) => void;
  removeLink: () => void;
};

const MessageEditor = forwardRef<MessageEditorHandle, MessageEditorProps>(
  (
    {
      value,
      onChange,
      onFocusField,
      attachments,
      images,
      onAttachmentRemoved,
      onImageRemoved,
    },
    ref,
  ) => {
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const squireRef = useRef<SquireEditor | null>(null);

    const [isEmpty, setIsEmpty] = useState<boolean>(value === "");

    useEffect(() => {
      if (!surfaceRef.current)
        return;

      const squireEditor: SquireEditor =
        new Squire(surfaceRef.current);

      squireEditor.setHTML(value);

      squireEditor.addEventListener("input", () => {
        const html: string = squireEditor.getHTML();

        onChange(html);
        setIsEmpty(html === "" || html === "<div><br></div>");
      });

      squireEditor.addEventListener("focus", () => {
        onFocusField();
      });

      squireRef.current = squireEditor;
    }, []);

    useImperativeHandle(ref, () => ({
      insertVariable: (placeholder: string): void => {
        const squireEditor: SquireEditor | null =
          squireRef.current;

        if (!squireEditor)
          return;

        squireEditor.focus();
        squireEditor.insertHTML(placeholder);
        setIsEmpty(false);
      },

      bold: (): void => {
        const squireEditor: SquireEditor | null =
          squireRef.current;

        if (!squireEditor)
          return;

        squireEditor.focus();
        squireEditor.bold();
      },

      italic: (): void => {
        const squireEditor: SquireEditor | null =
          squireRef.current;

        if (!squireEditor)
          return;

        squireEditor.focus();
        squireEditor.italic();
      },

      underline: (): void => {
        const squireEditor: SquireEditor | null =
          squireRef.current;

        if (!squireEditor)
          return;

        squireEditor.focus();
        squireEditor.underline();
      },

      insertLink: (text: string, url: string): void => {
        const squireEditor: SquireEditor | null =
          squireRef.current;

        if (!squireEditor)
          return;

        const link: HTMLAnchorElement =
          document.createElement("a");

        link.href = url;
        link.textContent = text;

        squireEditor.focus();
        squireEditor.insertElement(link);
        setIsEmpty(false);
      },

      removeLink: (): void => {
        const squireEditor: SquireEditor | null =
          squireRef.current;

        if (!squireEditor)
          return;

        squireEditor.focus();
        squireEditor.removeLink();
      },
    }));

    const handlePlaceholderClick = (): void => {
      const squireEditor: SquireEditor | null =
        squireRef.current;

      if (!squireEditor)
        return;

      squireEditor.focus();
    };

    return (
      <div className="message-editor">
        <div className="message-editor__body">
          {isEmpty && (
            <button
              type="button"
              className="message-editor__placeholder"
              onClick={handlePlaceholderClick}
            >
              Write your message… click {"{}"} to insert a column
            </button>
          )}

          <div
            ref={surfaceRef}
            className="message-editor__surface"
          />
        </div>

        {(attachments.length > 0 || images.length > 0) && (
          <div className="message-editor__files">
            {attachments.map((file: MailingFile) => (
              <FileChip
                key={file.name}
                name={file.name}
                icon="📎"
                onRemove={() => onAttachmentRemoved(file)}
              />
            ))}

            {images.map((file: MailingFile) => (
              <FileChip
                key={file.name}
                name={file.name}
                icon="🖼"
                onRemove={() => onImageRemoved(file)}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

MessageEditor.displayName = "MessageEditor";

export default MessageEditor;