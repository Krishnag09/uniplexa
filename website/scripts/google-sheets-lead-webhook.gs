/**
 * Uniplexa — Google Sheets lead webhook.
 *
 * Receives lead JSON POSTed by the website (lib/leads.ts) and appends one row
 * per lead to the active sheet. Deploy this from the target spreadsheet:
 *
 *   1. Open the sheet → Extensions → Apps Script.
 *   2. Delete the default code, paste this whole file, Save.
 *   3. Deploy → New deployment → type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   4. Authorize when prompted. Copy the Web app URL (ends in /exec).
 *   5. Paste that URL into NEXT_PUBLIC_LEAD_WEBHOOK_URL and rebuild the site.
 *
 * Test it quickly by pasting the /exec URL in a browser — doGet returns "ok".
 */

var HEADERS = [
  "timestamp",
  "email",
  "buildingAddress",
  "source",
  "buildingType",
  "sqft",
  "penalty2030",
  "cumulative",
  "leadId",
  "raw",
];

function doPost(e) {
  try {
    var lead = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var ctx = lead.context || {};
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, on an empty sheet.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      lead.createdAt || new Date().toISOString(),
      lead.email || "",
      lead.buildingAddress || "",
      lead.source || "",
      ctx.buildingType || "",
      ctx.sqft || "",
      ctx.penalty2030 || "",
      ctx.cumulative || "",
      lead.id || "",
      JSON.stringify(lead),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: "uniplexa-lead-webhook" });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
