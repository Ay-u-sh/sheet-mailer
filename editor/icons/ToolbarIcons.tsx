import React from "react";

const ICON_PROPS = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AttachmentIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M17.5 8.5 9.9 16.1a3 3 0 1 1-4.2-4.2l8.6-8.6a4.5 4.5 0 1 1 6.36 6.36L11.8 18.5a1.5 1.5 0 0 1-2.12-2.12l7.1-7.1" />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 16.5 8.5 12l3 3 3.5-4L20 16" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M10.5 6.5 12 5a3.5 3.5 0 1 1 5 5l-1.5 1.5" />
      <path d="M13.5 17.5 12 19a3.5 3.5 0 1 1-5-5l1.5-1.5" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
