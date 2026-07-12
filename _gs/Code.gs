function doPost(e) {
  try {
    var spreadsheetId = "1PmsFHopLF08Icdi3rsNjF6pOoSKDM5yigIlEHdbkJ9I";

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Missing postData.contents");
    }

    var data = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName("logSheet");

    if (!sheet) {
      sheet = spreadsheet.insertSheet("logSheet");
      sheet.appendRow(["timeStamp", "userName", "userEmail", "log"]);
    }

    var userName = data.userName || "";
    var userEmail = data.userEmail || "";
    var log = typeof data.log === "string" ? data.log : JSON.stringify(data.log || "");

    sheet.appendRow([new Date(), userName, userEmail, log]);

    return ContentService
      .createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService
      .createTextOutput(error && error.message ? error.message : String(error))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
