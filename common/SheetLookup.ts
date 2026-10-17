import { GoogleSheet, GoogleSpreadsheet, RecipientColumn } from "../models/MailingSetup";

export function findSheetById(spreadsheet: GoogleSpreadsheet, sheetId: number): GoogleSheet {
  const sheet: GoogleSheet | undefined = spreadsheet
    .getSheets()
    .find((candidate: GoogleSheet): boolean => candidate.getSheetId() === sheetId);

  if (!sheet)
    throw new Error(`Sheet ${sheetId} was not found.`);

  return sheet;
}

export function getColumnLabel(columnPosition: number): string {
  let label: string = "";
  let position: number = columnPosition;

  while (position > 0) {
    const remainder: number = (position - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    position = Math.floor((position - 1) / 26);
  }

  return label;
}

export function getHeaderLabel(sheet: GoogleSheet, columnPosition: number): string {
  const value: unknown = sheet.getRange(1, columnPosition).getValue();

  return String(value).trim();
}

export function getRecipientColumns(sheet: GoogleSheet, firstRowContainsHeaders: boolean): RecipientColumn[] {
  // An empty sheet reports getLastColumn() === 0, which would otherwise produce
  // zero columns — leaving getDefaultRecipientColumn's fallback selection with
  // nothing in the list to match. Always offer at least column A.
  const lastColumnPosition: number = Math.max(sheet.getLastColumn(), 1);
  const columns: RecipientColumn[] = [];

  for (let columnPosition = 1; columnPosition <= lastColumnPosition; columnPosition++) {
    columns.push({
      columnPosition,
      label: firstRowContainsHeaders
        ? getHeaderLabel(sheet, columnPosition)
        : getColumnLabel(columnPosition),
    });
  }

  return columns;
}

export function getDefaultRecipientColumn(columns: RecipientColumn[]): RecipientColumn {
  const columnA: RecipientColumn | undefined = columns.find(
    (column: RecipientColumn): boolean => column.columnPosition === 1,
  );

  return columnA ?? { columnPosition: 1, label: "A" };
}
export function getRecipientCount(
  sheet: GoogleSheet,
  columnPosition: number,
  firstRowContainsHeaders: boolean,
): number {
  const lastRowPosition: number = sheet.getLastRow();

  if (lastRowPosition === 0)
    return 0;

  const firstRowPosition: number =
    firstRowContainsHeaders ? 2 : 1;

  if (firstRowPosition > lastRowPosition)
    return 0;

  const values: unknown[][] = sheet
    .getRange(
      firstRowPosition,
      columnPosition,
      lastRowPosition - firstRowPosition + 1,
      1,
    )
    .getValues();

  return values.filter(
    (row: unknown[]): boolean => String(row[0]).trim() !== "",
  ).length;
}