var global = this;
function prepareMailingSetup() {};
function prepareRecipientSelection(input) {};
function changeRecipientColumn(input) {};
function changeFirstRowContainsHeaders(input) {};
function onOpen() {};
function onInstall(e) {};
function startCampaign() {};
(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    function findSheetById(spreadsheet, sheetId) {
        const sheet = spreadsheet
            .getSheets()
            .find((candidate) => candidate.getSheetId() === sheetId);
        if (!sheet)
            throw new Error(`Sheet ${sheetId} was not found.`);
        return sheet;
    }
    function getColumnLabel(columnPosition) {
        let label = "";
        let position = columnPosition;
        while (position > 0) {
            const remainder = (position - 1) % 26;
            label = String.fromCharCode(65 + remainder) + label;
            position = Math.floor((position - 1) / 26);
        }
        return label;
    }
    function getHeaderLabel(sheet, columnPosition) {
        const value = sheet.getRange(1, columnPosition).getValue();
        return String(value).trim();
    }
    function getRecipientColumns(sheet, firstRowContainsHeaders) {
        // An empty sheet reports getLastColumn() === 0, which would otherwise produce
        // zero columns — leaving getDefaultRecipientColumn's fallback selection with
        // nothing in the list to match. Always offer at least column A.
        const lastColumnPosition = Math.max(sheet.getLastColumn(), 1);
        const columns = [];
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
    function getDefaultRecipientColumn(columns) {
        const columnA = columns.find((column) => column.columnPosition === 1);
        return columnA !== null && columnA !== void 0 ? columnA : { columnPosition: 1, label: "A" };
    }
    function getRecipientCount(sheet, columnPosition, firstRowContainsHeaders) {
        const lastRowPosition = sheet.getLastRow();
        if (lastRowPosition === 0)
            return 0;
        const firstRowPosition = firstRowContainsHeaders ? 2 : 1;
        if (firstRowPosition > lastRowPosition)
            return 0;
        const values = sheet
            .getRange(firstRowPosition, columnPosition, lastRowPosition - firstRowPosition + 1, 1)
            .getValues();
        return values.filter((row) => String(row[0]).trim() !== "").length;
    }

    const FIRST_ROW_CONTAINS_HEADERS_BY_DEFAULT = true;
    function prepareMailingSetup() {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const possibleSheets = spreadsheet.getSheets().map((sheet) => ({
            sheetId: sheet.getSheetId(),
            name: sheet.getName(),
        }));
        const selectedGoogleSheet = spreadsheet.getSheets()[0];
        const selectedSheet = {
            sheetId: selectedGoogleSheet.getSheetId(),
            name: selectedGoogleSheet.getName(),
        };
        const firstRowContainsHeaders = FIRST_ROW_CONTAINS_HEADERS_BY_DEFAULT;
        const possibleRecipientColumns = getRecipientColumns(selectedGoogleSheet, firstRowContainsHeaders);
        const selectedRecipientColumn = getDefaultRecipientColumn(possibleRecipientColumns);
        const recipientCount = getRecipientCount(selectedGoogleSheet, selectedRecipientColumn.columnPosition, firstRowContainsHeaders);
        const senderEmail = Session.getActiveUser().getEmail();
        const draft = {
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

    function getRecipientSelectionData(sheetId, firstRowContainsHeaders) {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = findSheetById(spreadsheet, sheetId);
        const possibleColumns = getRecipientColumns(sheet, firstRowContainsHeaders);
        return {
            sheet,
            possibleColumns,
        };
    }
    function prepareRecipientSelection(input) {
        const selection = getRecipientSelectionData(input.sheetId, input.firstRowContainsHeaders);
        const selectedColumn = getDefaultRecipientColumn(selection.possibleColumns);
        const recipientCount = getRecipientCount(selection.sheet, selectedColumn.columnPosition, input.firstRowContainsHeaders);
        const draft = {
            ...input.draft,
            selectedRecipientColumn: selectedColumn,
            recipientCount,
        };
        return {
            draft,
            possibleColumns: selection.possibleColumns,
        };
    }
    function changeRecipientColumn(input) {
        const selection = getRecipientSelectionData(input.sheetId, input.firstRowContainsHeaders);
        const selectedColumn = selection.possibleColumns.find((column) => column.columnPosition === input.selectedColumn.columnPosition);
        if (!selectedColumn)
            throw new Error("The selected recipient column is unavailable.");
        const recipientCount = getRecipientCount(selection.sheet, selectedColumn.columnPosition, input.firstRowContainsHeaders);
        return {
            ...input.draft,
            selectedRecipientColumn: selectedColumn,
            recipientCount,
        };
    }
    function changeFirstRowContainsHeaders(input) {
        const selection = getRecipientSelectionData(input.sheetId, input.firstRowContainsHeaders);
        const existingColumn = selection.possibleColumns.find((column) => column.columnPosition ===
            input.draft.selectedRecipientColumn.columnPosition);
        const selectedColumn = existingColumn
            ? existingColumn
            : getDefaultRecipientColumn(selection.possibleColumns);
        const recipientCount = getRecipientCount(selection.sheet, selectedColumn.columnPosition, input.firstRowContainsHeaders);
        const draft = {
            ...input.draft,
            selectedRecipientColumn: selectedColumn,
            recipientCount,
        };
        return {
            draft,
            possibleColumns: selection.possibleColumns,
        };
    }

    global.prepareMailingSetup = () => {
        return prepareMailingSetup();
    };
    global.prepareRecipientSelection = (input) => {
        return prepareRecipientSelection(input);
    };
    global.changeRecipientColumn = (input) => {
        return changeRecipientColumn(input);
    };
    global.changeFirstRowContainsHeaders = (input) => {
        return changeFirstRowContainsHeaders(input);
    };
    global.onOpen = () => {
        SpreadsheetApp.getUi()
            .createMenu("Sheet Mailer")
            .addItem("Start campaign", "startCampaign")
            .addToUi();
    };
    global.onInstall = (e) => {
        var _a;
        (_a = global.onOpen) === null || _a === void 0 ? void 0 : _a.call(global, e);
    };
    global.startCampaign = () => {
        const campaignEditor = HtmlService
            .createHtmlOutputFromFile("editor")
            .setWidth(680)
            .setHeight(410);
        SpreadsheetApp.getUi().showModalDialog(campaignEditor, "Sheet Mailer");
    };

}));
