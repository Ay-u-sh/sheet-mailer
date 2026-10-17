import React from "react";

import "./FileChip.css";

type FileChipProps = {
  name: string;
  icon: string;
  onRemove: () => void;
};

function FileChip({name,icon,onRemove}: FileChipProps) {
  return (
    <div className="file-chip">
      <span className="file-chip__icon">{icon}</span>

      <span className="file-chip__name">{name}</span>

      <button
        type="button"
        className="file-chip__remove"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}

export default FileChip;