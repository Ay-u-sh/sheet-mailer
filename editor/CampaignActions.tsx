import React, { useState } from "react";

import type { MergeVariable } from "../models/MergeVariable";
import ToolbarMenu, { ToolbarMenuOption } from "./ToolbarMenu";
import LinkPopover from "./LinkPopover";

import "./CampaignActions.css";

type CampaignActionsProps = {
  variables: MergeVariable[];
  onAttachmentSelected: (file: File) => void;
  onImageSelected: (file: File) => void;
  onInsertVariable: (placeholder: string) => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onInsertLink: (text: string, url: string) => void;
  onPreview: () => void;
  onSendCampaign: () => void;
};

function CampaignActions({
  variables,
  onAttachmentSelected,
  onImageSelected,
  onInsertVariable,
  onBold,
  onItalic,
  onUnderline,
  onInsertLink,
  onPreview,
  onSendCampaign,
}: CampaignActionsProps) {
  const [isLinkOpen, setIsLinkOpen] = useState<boolean>(false);

  const variableOptions: ToolbarMenuOption[] = variables.map(
    (variable: MergeVariable): ToolbarMenuOption => ({
      key: String(variable.columnPosition),
      label: variable.label,
      onSelect: () => onInsertVariable(variable.placeholder),
    }),
  );

  const handleLinkApply = (text: string, url: string): void => {
    onInsertLink(text, url);
    setIsLinkOpen(false);
  };

  const handleLinkCancel = (): void => {
    setIsLinkOpen(false);
  };

  const handleAttachmentSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file: File | undefined = event.target.files?.[0];

    if (!file)
      return;

    onAttachmentSelected(file);
    event.target.value = "";
  };

  const handleImageSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file: File | undefined = event.target.files?.[0];

    if (!file)
      return;

    onImageSelected(file);
    event.target.value = "";
  };

  return (
    <footer className="campaign-actions">
      <div className="campaign-actions__toolbar">
        <ToolbarMenu
          trigger="Aa"
          triggerClassName="campaign-actions__tool"
          options={[
            {
              key: "bold",
              label: "Bold",
              onSelect: onBold,
            },
            {
              key: "italic",
              label: "Italic",
              onSelect: onItalic,
            },
            {
              key: "underline",
              label: "Underline",
              onSelect: onUnderline,
            },
          ]}
          align="left"
          direction="up"
        />

        <label className="campaign-actions__tool">
          📎

          <input
            type="file"
            className="campaign-actions__file-input"
            onChange={handleAttachmentSelected}
          />
        </label>

        <label className="campaign-actions__tool">
          🖼

          <input
            type="file"
            className="campaign-actions__file-input"
            accept="image/*"
            onChange={handleImageSelected}
          />
        </label>

        <div className="campaign-actions__link">
          <button
            type="button"
            className="campaign-actions__tool"
            aria-label="Insert link"
            onClick={() => setIsLinkOpen(!isLinkOpen)}
          >
            URL
          </button>

          {isLinkOpen && (
            <LinkPopover
              onApply={handleLinkApply}
              onCancel={handleLinkCancel}
            />
          )}
        </div>

        <ToolbarMenu
          trigger="{}"
          triggerClassName="campaign-actions__tool"
          options={variableOptions}
          align="left"
          direction="up"
        />

        <button
          type="button"
          className="campaign-actions__schedule"
          aria-label="Schedule send"
        >
          Schedule
        </button>
      </div>

      <div className="campaign-actions__primary">
        <button
          type="button"
          className="campaign-actions__preview"
          onClick={onPreview}
        >
          Preview
        </button>

        <button
          type="button"
          className="campaign-actions__send"
          onClick={onSendCampaign}
        >
          Send emails
        </button>
      </div>
    </footer>
  );
}

export default CampaignActions;