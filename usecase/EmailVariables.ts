import type { MergeVariable } from "../models/MergeVariable";
import type { RecipientColumn } from "../models/MailingSetup";

export function getEmailVariables( columns: RecipientColumn[],): MergeVariable[] {
  return columns.map((column: RecipientColumn): MergeVariable => ({
    columnPosition: column.columnPosition,
    label: column.label,
    placeholder: `{{${column.label}}}`,
  }));
}