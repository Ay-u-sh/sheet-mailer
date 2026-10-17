export type GoogleSpreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
export type GoogleSheet = GoogleAppsScript.Spreadsheet.Sheet;

export type MailingSheetOption = {
  sheetId: number;
  name: string;
};

export type RecipientColumn = {
  columnPosition: number;
  label: string;
};

export type MailingSetup = {
  possibleSheets: MailingSheetOption[];
  selectedSheet: MailingSheetOption;
  possibleRecipientColumns: RecipientColumn[];
  selectedRecipientColumn: RecipientColumn;
  recipientCount: number;
  senderEmail: string;
};
