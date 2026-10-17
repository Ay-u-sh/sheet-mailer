
import type { EmailDraft } from "../models/EmailDraft";
import type {
  GoogleSheet,
  GoogleSpreadsheet,
  MailingSheetOption,
  RecipientColumn,
} from "../models/MailingSetup";

import {
  getRecipientColumns,
  getDefaultRecipientColumn,
  getRecipientCount,
} from "../common/SheetLookup";

const FIRST_ROW_CONTAINS_HEADERS_BY_DEFAULT: boolean = true;

export type MailingSetup = {
  possibleSheets: MailingSheetOption[];
  selectedSheet: MailingSheetOption;
  firstRowContainsHeaders: boolean;
  possibleRecipientColumns: RecipientColumn[];
  draft: EmailDraft;
};

export function prepareMailingSetup(): MailingSetup {
  const spreadsheet: GoogleSpreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  const possibleSheets: MailingSheetOption[] =
    spreadsheet.getSheets().map(
      (sheet: GoogleSheet): MailingSheetOption => ({
        sheetId: sheet.getSheetId(),
        name: sheet.getName(),
      }),
    );

  const selectedGoogleSheet: GoogleSheet =
    spreadsheet.getSheets()[0];

  const selectedSheet: MailingSheetOption = {
    sheetId: selectedGoogleSheet.getSheetId(),
    name: selectedGoogleSheet.getName(),
  };

  const firstRowContainsHeaders: boolean =
    FIRST_ROW_CONTAINS_HEADERS_BY_DEFAULT;

  const possibleRecipientColumns: RecipientColumn[] =
    getRecipientColumns(
      selectedGoogleSheet,
      firstRowContainsHeaders,
    );

  const selectedRecipientColumn: RecipientColumn =
    getDefaultRecipientColumn(possibleRecipientColumns);

  const recipientCount: number = getRecipientCount(
    selectedGoogleSheet,
    selectedRecipientColumn.columnPosition,
    firstRowContainsHeaders,
  );

  const senderEmail: string =
    Session.getActiveUser().getEmail();

  const draft: EmailDraft = {
    senderEmail,
    subject: "",
    messageBodyHtml: "",
    selectedRecipientColumn,
    recipientCount,
    attachments: [],
    images: [],
  };

  return {
    possibleSheets,
    selectedSheet,
    firstRowContainsHeaders,
    possibleRecipientColumns,
    draft,
  };
}