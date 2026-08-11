#!/usr/bin/env node
// One-time setup: creates the "Employee Master Data" and "Attendance Data" tabs
// (with header rows) in an empty Google Sheet, using the same service account
// credentials the app itself reads from .env.local.
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

const EMPLOYEE_HEADERS = [
  "Employee ID", "Employee Name", "Phone Number", "E-mail Address", "Job Title",
  "Department", "Joining Date", "Shift Days", "Supervisor Name", "Address",
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

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'Employee Master Data'!A1",
    valueInputOption: "RAW",
    requestBody: { values: [EMPLOYEE_HEADERS] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'Attendance Data'!A1",
    valueInputOption: "RAW",
    requestBody: { values: [ATTENDANCE_HEADERS] },
  });
  console.log("Header rows written to both tabs.");

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
