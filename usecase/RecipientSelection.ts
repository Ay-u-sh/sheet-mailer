
import type { EmailDraft } from "../models/EmailDraft";
import type {
  GoogleSheet,
  GoogleSpreadsheet,
  RecipientColumn,
} from "../models/MailingSetup";

import {
  findSheetById,
  getRecipientColumns,
  getDefaultRecipientColumn,
  getRecipientCount,
} from "../common/SheetLookup";

export type PrepareRecipientSelectionInput = {
  draft: EmailDraft;
  sheetId: number;
  firstRowContainsHeaders: boolean;
};

export type RecipientSelection = {
  draft: EmailDraft;
  possibleColumns: RecipientColumn[];
};

export type ChangeRecipientColumnInput = {
  draft: EmailDraft;
  sheetId: number;
  selectedColumn: RecipientColumn;
  firstRowContainsHeaders: boolean;
};

export type ChangeFirstRowContainsHeadersInput = {
  draft: EmailDraft;
  sheetId: number;
  firstRowContainsHeaders: boolean;
};

function getRecipientSelectionData(
  sheetId: number,
  firstRowContainsHeaders: boolean,
): {
  sheet: GoogleSheet;
  possibleColumns: RecipientColumn[];
} {
  const spreadsheet: GoogleSpreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet: GoogleSheet =
    findSheetById(spreadsheet, sheetId);

  const possibleColumns: RecipientColumn[] =
    getRecipientColumns(sheet, firstRowContainsHeaders);

  return {
    sheet,
    possibleColumns,
  };
}

export function prepareRecipientSelection(
  input: PrepareRecipientSelectionInput,
): RecipientSelection {
  const selection = getRecipientSelectionData(
    input.sheetId,
    input.firstRowContainsHeaders,
  );

  const selectedColumn: RecipientColumn =
    getDefaultRecipientColumn(selection.possibleColumns);

  const recipientCount: number = getRecipientCount(
    selection.sheet,
    selectedColumn.columnPosition,
    input.firstRowContainsHeaders,
  );

  const draft: EmailDraft = {
    ...input.draft,
    selectedRecipientColumn: selectedColumn,
    recipientCount,
  };

  return {
    draft,
    possibleColumns: selection.possibleColumns,
  };
}

export function changeRecipientColumn(
  input: ChangeRecipientColumnInput,
): EmailDraft {
  const selection = getRecipientSelectionData(
    input.sheetId,
    input.firstRowContainsHeaders,
  );

  const selectedColumn: RecipientColumn | undefined =
    selection.possibleColumns.find(
      (column: RecipientColumn): boolean =>
        column.columnPosition === input.selectedColumn.columnPosition,
    );

  if (!selectedColumn)
    throw new Error("The selected recipient column is unavailable.");

  const recipientCount: number = getRecipientCount(
    selection.sheet,
    selectedColumn.columnPosition,
    input.firstRowContainsHeaders,
  );

  return {
    ...input.draft,
    selectedRecipientColumn: selectedColumn,
    recipientCount,
  };
}

export function changeFirstRowContainsHeaders(
  input: ChangeFirstRowContainsHeadersInput,
): RecipientSelection {
  const selection = getRecipientSelectionData(
    input.sheetId,
    input.firstRowContainsHeaders,
  );

  const existingColumn: RecipientColumn | undefined =
    selection.possibleColumns.find(
      (column: RecipientColumn): boolean =>
        column.columnPosition ===
        input.draft.selectedRecipientColumn.columnPosition,
    );

  const selectedColumn: RecipientColumn =
    existingColumn
      ? existingColumn
      : getDefaultRecipientColumn(selection.possibleColumns);

  const recipientCount: number = getRecipientCount(
    selection.sheet,
    selectedColumn.columnPosition,
    input.firstRowContainsHeaders,
  );

  const draft: EmailDraft = {
    ...input.draft,
    selectedRecipientColumn: selectedColumn,
    recipientCount,
  };

  return {
    draft,
    possibleColumns: selection.possibleColumns,
  };
}