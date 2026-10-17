
import type { EmailDraft } from "../models/EmailDraft";
import type { MailingSetup } from "../usecase/MailingSetup";

import type {
  PrepareRecipientSelectionInput,
  RecipientSelection,
  ChangeRecipientColumnInput,
  ChangeFirstRowContainsHeadersInput,
} from "../usecase/RecipientSelection";

declare const google: {
  script: {
    run: {
      withSuccessHandler<T>(handler: (result: T) => void): {
        withFailureHandler(handler: (error: Error) => void): {
          prepareMailingSetup(): void;
          prepareRecipientSelection(
            input: PrepareRecipientSelectionInput,
          ): void;
          changeRecipientColumn(
            input: ChangeRecipientColumnInput,
          ): void;
          changeFirstRowContainsHeaders(
            input: ChangeFirstRowContainsHeadersInput,
          ): void;
        };
      };
    };
  };
};

export function prepareMailingSetup(): Promise<MailingSetup> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler<MailingSetup>(resolve)
      .withFailureHandler(reject)
      .prepareMailingSetup();
  });
}

export function prepareRecipientSelection(
  input: PrepareRecipientSelectionInput,
): Promise<RecipientSelection> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler<RecipientSelection>(resolve)
      .withFailureHandler(reject)
      .prepareRecipientSelection(input);
  });
}

export function changeRecipientColumn(
  input: ChangeRecipientColumnInput,
): Promise<EmailDraft> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler<EmailDraft>(resolve)
      .withFailureHandler(reject)
      .changeRecipientColumn(input);
  });
}

export function changeFirstRowContainsHeaders(
  input: ChangeFirstRowContainsHeadersInput,
): Promise<RecipientSelection> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler<RecipientSelection>(resolve)
      .withFailureHandler(reject)
      .changeFirstRowContainsHeaders(input);
  });
}