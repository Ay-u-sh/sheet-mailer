import React, { useEffect, useRef, useState } from "react";
import './ToolbarMenu.css'
export type ToolbarMenuOption = {
  key: string;
  label: string;
  onSelect: () => void;
};

type ToolbarMenuProps = {
  trigger: React.ReactNode;
  triggerClassName: string;
  options: ToolbarMenuOption[];
  align?: "left" | "right";
  direction?: "up" | "down";
  disabled?: boolean;
};

function ToolbarMenu({
  trigger,
  triggerClassName,
  options,
  align = "left",
  direction = "down",
  disabled = false,
}: ToolbarMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen)
      return;

    function handleOutsideClick(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="toolbar-menu" ref={containerRef}>
      <button
        type="button"
        className={triggerClassName}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`toolbar-menu__panel toolbar-menu__panel--${align} toolbar-menu__panel--${direction}`}
        >
          {options.map((option: ToolbarMenuOption) => (
            <button
              key={option.key}
              type="button"
              className="toolbar-menu__option"
              onClick={() => {
                option.onSelect();
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ToolbarMenu;