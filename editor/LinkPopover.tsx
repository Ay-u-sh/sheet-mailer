import React, { useState } from "react";

import "./LinkPopover.css";

type LinkPopoverProps = {
  onApply: (text: string, url: string) => void;
  onCancel: () => void;
};

function LinkPopover({onApply,onCancel}: LinkPopoverProps) {
  const [text, setText] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  const handleApply = (): void => {
    if (!text.trim() || !url.trim())
      return;

    onApply(text.trim(), url.trim());
  };

  return (
    <div className="link-popover">
      <label className="link-popover__field">
        <span className="link-popover__label">Text</span>
        <input
          className="link-popover__input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoFocus
        />
      </label>

      <label className="link-popover__field">
        <span className="link-popover__label">URL</span>
        <input
          className="link-popover__input"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://"
        />
      </label>

      <div className="link-popover__actions">
        <button
          type="button"
          className="link-popover__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="link-popover__apply"
          onClick={handleApply}
          disabled={!text.trim() || !url.trim()}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default LinkPopover;