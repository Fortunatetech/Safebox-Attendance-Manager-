import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let cachedClient: sheets_v4.Sheets | null = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("Google service account credentials are not configured.");
  }
  // Vercel/`.env` values often escape newlines as \n literally.
  const key = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
  // Use googleapis' own bundled google-auth-library to avoid a duplicate-types
  // conflict between the standalone package and googleapis' internal copy.
  return new google.auth.JWT({ email, key, scopes: SCOPES });
}

export function getSheetsClient() {
  if (!cachedClient) {
    cachedClient = google.sheets({ version: "v4", auth: getAuth() });
  }
  return cachedClient;
}

export function getSpreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not configured.");
  return id;
}

function columnLetter(index: number) {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

export interface SheetTable {
  headers: string[];
  rows: Record<string, string>[];
  /** 1-indexed sheet row number for each entry in `rows` (accounts for the header row). */
  rowNumbers: number[];
}

export async function readTable(sheetTitle: string): Promise<SheetTable> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A1:Z`,
  });
  const values = res.data.values ?? [];
  const headers = (values[0] ?? []).map((h) => String(h ?? "").trim());
  const rows: Record<string, string>[] = [];
  const rowNumbers: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const raw = values[i];
    if (!raw || raw.every((cell) => cell === "" || cell == null)) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = String(raw[idx] ?? "");
    });
    rows.push(obj);
    rowNumbers.push(i + 1);
  }

  return { headers, rows, rowNumbers };
}

export async function appendRow(sheetTitle: string, headers: readonly string[], row: string[]) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetTitle}'!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/** Updates specific header-named cells in a given (1-indexed) sheet row. */
export async function updateRowCells(
  sheetTitle: string,
  headers: string[],
  rowNumber: number,
  updates: Record<string, string>
) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const data = Object.entries(updates).map(([header, value]) => {
    const colIndex = headers.indexOf(header);
    if (colIndex === -1) throw new Error(`Unknown column header: ${header}`);
    return {
      range: `'${sheetTitle}'!${columnLetter(colIndex)}${rowNumber}`,
      values: [[value]],
    };
  });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data },
  });
}

export async function overwriteRow(
  sheetTitle: string,
  rowNumber: number,
  row: string[]
) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetTitle}'!A${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

async function getGridSheetId(sheetTitle: string): Promise<number> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetTitle);
  const id = sheet?.properties?.sheetId;
  if (id == null) throw new Error(`Sheet tab not found: ${sheetTitle}`);
  return id;
}

export async function deleteRow(sheetTitle: string, rowNumber: number) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const gridSheetId = await getGridSheetId(sheetTitle);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: gridSheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}
