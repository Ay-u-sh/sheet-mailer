import React, { useEffect, useRef, useState } from "react";

import type { RecipientColumn } from "../models/MailingSetup";

import "./RecipientColumnSelector.css";

type RecipientColumnSelectorProps = {
  columns: RecipientColumn[];
  selectedColumn: RecipientColumn;
  recipientCount: number;
  firstRowContainsHeaders: boolean;
  onColumnSelected: (column: RecipientColumn) => void;
  onFirstRowContainsHeadersChange: (value: boolean) => void;
};

function RecipientColumnSelector({
  columns,
  selectedColumn,
  recipientCount,
  firstRowContainsHeaders,
  onColumnSelected,
  onFirstRowContainsHeadersChange,
}: RecipientColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      const target: Node = event.target as Node;

      if (selectorRef.current && !selectorRef.current.contains(target))
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const handleColumnSelected = (column: RecipientColumn): void => {
    onColumnSelected(column);
    setIsOpen(false);
  };

  return (
    <section className="recipient-column-selector">
      <div className="recipient-column-selector__row">
        <span className="recipient-column-selector__label">
          To
        </span>

        <div
          ref={selectorRef}
          className="recipient-column-selector__dropdown"
        >
          <button
            type="button"
            className="recipient-column-selector__trigger"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className="recipient-column-selector__value">
              {selectedColumn.label}
            </span>

            <span
              className="recipient-column-selector__arrow"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {isOpen && (
            <div
              className="recipient-column-selector__menu"
              role="listbox"
            >
              {columns.map((column: RecipientColumn) => (
                <button
                  key={column.columnPosition}
                  type="button"
                  className="recipient-column-selector__option"
                  onClick={() => handleColumnSelected(column)}
                  role="option"
                  aria-selected={
                    column.columnPosition === selectedColumn.columnPosition
                  }
                >
                  <span className="recipient-column-selector__check">
                    {column.columnPosition ===
                      selectedColumn.columnPosition
                      ? "✓"
                      : ""}
                  </span>

                  <span>{column.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="recipient-column-selector__count">
          {recipientCount} recipients
        </span>
      </div>

      <label className="recipient-column-selector__headers">
        <input
          type="checkbox"
          checked={firstRowContainsHeaders}
          onChange={(event) =>
            onFirstRowContainsHeadersChange(event.target.checked)
          }
        />

        <span>First row contains headers</span>
      </label>
    </section>
  );
}

export default RecipientColumnSelector;