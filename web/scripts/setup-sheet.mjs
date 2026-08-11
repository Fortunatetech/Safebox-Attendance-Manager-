#!/usr/bin/env node
// One-time setup: creates the "Employee Master Data" and "Attendance Data" tabs
// (with header rows) in a BRAND NEW, EMPTY Google Sheet, using the same service
// account credentials the app itself reads from .env.local.
//
// Refuses to touch a tab that already has a header row, so it's safe to re-run
// and can't clobber a sheet someone has already started populating.
//
// Usage: node scripts/setup-sheet.mjs
import { readFileSync, existsSync } from "node:fs";
import { google } from "googleapis";

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

// Only the columns this app actually reads/writes (see lib/sheets/types.ts
// EMPLOYEE_FIELD_HEADERS / ATTENDANCE_FIELD_HEADERS). A real HR sheet may have
// more columns than this — that's fine, the app ignores anything it doesn't
// recognize by header name.
const EMPLOYEE_HEADERS = [
  "Employee ID", "Full Name", "Department", "Departmental Code", "Job Title",
  "Phone Number", "Email Adress", "Date of Hire", "Line Manager", "Home Address",
];
const ATTENDANCE_HEADERS = [
  "Employee ID", "Employee Name", "Department", "Date", "Day", "In-Time",
  "Attendance Status In", "Break Start", "Break End", "Out-Time", "Attendance Status Out",
];

async function main() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !rawKey || !spreadsheetId) {
    console.error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_ID in .env.local");
    process.exit(1);
  }
  const key = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
  const auth = new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  const sheets = google.sheets({ version: "v4", auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = new Set(meta.data.sheets.map((s) => s.properties.title));

  const addRequests = [];
  for (const title of ["Employee Master Data", "Attendance Data"]) {
    if (!existingTitles.has(title)) {
      addRequests.push({ addSheet: { properties: { title } } });
    }
  }
  if (addRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: addRequests } });
    console.log(`Created tab(s): ${addRequests.map((r) => r.addSheet.properties.title).join(", ")}`);
  }

  for (const [title, headers] of [
    ["Employee Master Data", EMPLOYEE_HEADERS],
    ["Attendance Data", ATTENDANCE_HEADERS],
  ]) {
    const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${title}'!A1:A1` });
    if (existing.data.values && existing.data.values.length > 0) {
      console.log(`Skipped "${title}" — it already has a header row (refusing to overwrite existing data).`);
      continue;
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${title}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    console.log(`Header row written to "${title}".`);
  }

  const sheet1 = meta.data.sheets.find((s) => s.properties.title === "Sheet1");
  if (sheet1) {
    const check = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'Sheet1'!A1:Z10" });
    if (!check.data.values || check.data.values.length === 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ deleteSheet: { sheetId: sheet1.properties.sheetId } }] },
      });
      console.log("Removed empty default 'Sheet1' tab.");
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
