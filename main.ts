
import { prepareMailingSetup } from "./usecase/MailingSetup";
import type { MailingSetup } from "./usecase/MailingSetup";

import {
  prepareRecipientSelection,
  changeRecipientColumn,
  changeFirstRowContainsHeaders,
} from "./usecase/RecipientSelection";

import type {
  PrepareRecipientSelectionInput,
  RecipientSelection,
  ChangeRecipientColumnInput,
  ChangeFirstRowContainsHeadersInput,
} from "./usecase/RecipientSelection";

import type { EmailDraft } from "./models/EmailDraft";

declare const global: {
  onOpen?: (e?: GoogleAppsScript.Events.AppsScriptEvent) => void;
  onInstall?: (e?: GoogleAppsScript.Events.AppsScriptEvent) => void;
  startCampaign?: () => void;
  prepareMailingSetup?: () => MailingSetup;
  prepareRecipientSelection?: (
    input: PrepareRecipientSelectionInput,
  ) => RecipientSelection;
  changeRecipientColumn?: (
    input: ChangeRecipientColumnInput,
  ) => EmailDraft;
  changeFirstRowContainsHeaders?: (
    input: ChangeFirstRowContainsHeadersInput,
  ) => RecipientSelection;
};

global.prepareMailingSetup = (): MailingSetup => {
  return prepareMailingSetup();
};

global.prepareRecipientSelection = (
  input: PrepareRecipientSelectionInput,
): RecipientSelection => {
  return prepareRecipientSelection(input);
};

global.changeRecipientColumn = (
  input: ChangeRecipientColumnInput,
): EmailDraft => {
  return changeRecipientColumn(input);
};

global.changeFirstRowContainsHeaders = (
  input: ChangeFirstRowContainsHeadersInput,
): RecipientSelection => {
  return changeFirstRowContainsHeaders(input);
};

global.onOpen = (): void => {
  SpreadsheetApp.getUi()
    .createMenu("Sheet Mailer")
    .addItem("Start campaign", "startCampaign")
    .addToUi();
};

global.onInstall = (e): void => {
  global.onOpen?.(e);
};

global.startCampaign = (): void => {
  const campaignEditor = HtmlService
    .createHtmlOutputFromFile("editor")
    .setWidth(680)
    .setHeight(410);

  SpreadsheetApp.getUi().showModalDialog(
    campaignEditor,
    "Sheet Mailer",
  );
};