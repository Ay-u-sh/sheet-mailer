import React from "react";

export type MergeVariable = {
  columnPosition: number;
  label: string;
  placeholder: string;
};

type VariableBarProps = {
  variables: MergeVariable[];
  onInsertVariable: (placeholder: string) => void;
};

function VariableBar({ variables, onInsertVariable }: VariableBarProps) {
  return (
    <div className="variable-bar">
      {variables.map((variable) => (
        <button
          key={variable.columnPosition}
          type="button"
          onClick={() => onInsertVariable(variable.placeholder)}
        >
          {variable.label}
        </button>
      ))}
    </div>
  );
}

export default VariableBar;
