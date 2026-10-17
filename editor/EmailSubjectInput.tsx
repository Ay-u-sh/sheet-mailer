import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

import "./EmailSubjectInput.css";

type SubjectInputProps = {
  value: string;
  onChange: (subject: string) => void;
  onFocusField: () => void;
};

export type SubjectInputHandle = {
  insertVariable: (placeholder: string) => void;
};

const SubjectInput = forwardRef<SubjectInputHandle, SubjectInputProps>(
  ({ value, onChange, onFocusField }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      insertVariable: (placeholder: string): void => {
        const input: HTMLInputElement | null = inputRef.current;

        if (!input)
          return;

        const cursorPosition: number =
          input.selectionStart === null
            ? value.length
            : input.selectionStart;

        const nextValue: string =
          value.slice(0, cursorPosition) +
          placeholder +
          value.slice(cursorPosition);

        onChange(nextValue);
      },
    }));

    return (
      <div className="email-subject-input">
        <input
          ref={inputRef}
          id="email-subject"
          className="email-subject-input__input"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocusField}
          placeholder="Subject"
          aria-label="Subject"
        />
      </div>
    );
  },
);

SubjectInput.displayName = "SubjectInput";

export default SubjectInput;