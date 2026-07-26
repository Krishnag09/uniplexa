/**
 * Uniplexa — Google Sheets lead webhook + email notification.
 *
 * Receives lead JSON POSTed by the website (lib/leads.ts), appends one row per
 * lead to the active sheet, and emails NOTIFY_EMAIL for every submission.
 *
 * Deploy from the target spreadsheet:
 *   1. Open the sheet → Extensions → Apps Script.
 *   2. Delete the default code, paste this whole file, Save.
 *   3. Set NOTIFY_EMAIL below to where you want lead alerts.
 *   4. Deploy → New deployment → type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5. Authorize when prompted (the email-send permission is requested here).
 *      Copy the Web app URL (ends in /exec) and set NEXT_PUBLIC_LEAD_WEBHOOK_URL.
 *
 * Updating later: after editing this code, use Deploy → Manage deployments →
 * (edit) → Version: "New version" → Deploy. That keeps the SAME /exec URL, so
 * you don't need to rebuild the site.
 *
 * Test: paste the /exec URL in a browser — doGet returns {"ok":true}.
 */

// Where lead-notification emails are sent. Blank ⇒ notifications are skipped
// (rows are still written). Comma-separate for multiple recipients.
var NOTIFY_EMAIL = "krishnag0902@gmail.com";

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

    // Email notification — never let a mail failure break the append above.
    try {
      notify_(lead, ctx);
    } catch (mailErr) {
      // Swallow; the lead is already safely in the sheet.
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function notify_(lead, ctx) {
  if (!NOTIFY_EMAIL) return;

  var money = function (n) {
    if (n === "" || n === null || n === undefined) return "—";
    return "$" + Number(n).toLocaleString("en-US");
  };
  var sourceLabel =
    lead.source === "below_threshold"
      ? "Below-threshold alert signup"
      : "Report request (calculator completed)";

  var subject =
    "New Uniplexa lead: " +
    (lead.email || "unknown") +
    (ctx.penalty2030 ? " (~" + money(ctx.penalty2030) + " / 2030)" : "");

  var lines = [
    "New lead from the LL97 calculator.",
    "",
    "Type:        " + sourceLabel,
    "Email:       " + (lead.email || "—"),
    "Building:    " + (lead.buildingAddress || "—"),
    "Building type: " + (ctx.buildingType || "—"),
    "Sq ft:       " + (ctx.sqft ? Number(ctx.sqft).toLocaleString("en-US") : "—"),
    "2030 penalty: " + money(ctx.penalty2030),
    "10-yr exposure: " + money(ctx.cumulative),
    "Submitted:   " + (lead.createdAt || new Date().toISOString()),
    "",
    "Reply to the lead: " + (lead.email || ""),
  ];

  var options = {};
  if (lead.email) options.replyTo = lead.email; // reply goes straight to them
  MailApp.sendEmail(NOTIFY_EMAIL, subject, lines.join("\n"), options);
}

function doGet() {
  return json({ ok: true, service: "uniplexa-lead-webhook" });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
