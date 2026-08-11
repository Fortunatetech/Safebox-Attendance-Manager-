import {
  Employee,
  AttendanceRecord,
  EMPLOYEE_SHEET_TITLE,
  ATTENDANCE_SHEET_TITLE,
  EMPLOYEE_FIELD_HEADERS,
  ATTENDANCE_FIELD_HEADERS,
  rowToEmployee,
  rowToAttendance,
} from "./types";
import { isSheetsConfigured, mockEmployees, mockAttendance } from "./mock";
import * as gs from "./googleSheets";

export { isSheetsConfigured };
export type { Employee, AttendanceRecord };

/** Re-keys a partial record from our field names to the sheet's real header text, dropping unset fields. */
function toHeaderKeyedData<T>(fieldHeaders: Record<keyof T, string>, data: Partial<T>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(fieldHeaders) as (keyof T)[]) {
    const value = data[key];
    if (value !== undefined) out[fieldHeaders[key]] = value as unknown as string;
  }
  return out;
}

export async function getEmployees(): Promise<Employee[]> {
  if (!isSheetsConfigured()) return mockEmployees;
  const table = await gs.readTable(EMPLOYEE_SHEET_TITLE);
  return table.rows.map(rowToEmployee);
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  if (!isSheetsConfigured()) return mockAttendance;
  const table = await gs.readTable(ATTENDANCE_SHEET_TITLE);
  return table.rows.map(rowToAttendance);
}

export async function findEmployee(employeeId: string): Promise<Employee | undefined> {
  const employees = await getEmployees();
  return employees.find((e) => e.employeeId === employeeId);
}

export async function addEmployee(employee: Employee): Promise<void> {
  if (!isSheetsConfigured()) {
    mockEmployees.push(employee);
    return;
  }
  // Fetch the sheet's actual live header order and place each field at its real
  // column position — never assume a fixed order (the real sheet has many more
  // columns than this app manages; everything else is left blank on new rows).
  const table = await gs.readTable(EMPLOYEE_SHEET_TITLE);
  const keyedData = toHeaderKeyedData(EMPLOYEE_FIELD_HEADERS, employee);
  const row = gs.buildRowForHeaders(table.headers, keyedData);
  await gs.appendRow(EMPLOYEE_SHEET_TITLE, row);
}

export async function updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<boolean> {
  if (!isSheetsConfigured()) {
    const idx = mockEmployees.findIndex((e) => e.employeeId === employeeId);
    if (idx === -1) return false;
    mockEmployees[idx] = { ...mockEmployees[idx], ...updates };
    return true;
  }
  const table = await gs.readTable(EMPLOYEE_SHEET_TITLE);
  const idx = table.rows.findIndex((r) => r[EMPLOYEE_FIELD_HEADERS.employeeId] === employeeId);
  if (idx === -1) return false;
  // Targeted per-cell update only — never overwrite the whole row, which would
  // wipe every column this app doesn't manage (Entity, Bank, Probation, etc.).
  const keyedUpdates = toHeaderKeyedData(EMPLOYEE_FIELD_HEADERS, updates);
  await gs.updateRowCells(EMPLOYEE_SHEET_TITLE, table.headers, table.rowNumbers[idx], keyedUpdates);
  return true;
}

export async function deleteEmployee(employeeId: string): Promise<boolean> {
  if (!isSheetsConfigured()) {
    const idx = mockEmployees.findIndex((e) => e.employeeId === employeeId);
    if (idx === -1) return false;
    mockEmployees.splice(idx, 1);
    return true;
  }
  const table = await gs.readTable(EMPLOYEE_SHEET_TITLE);
  const idx = table.rows.findIndex((r) => r[EMPLOYEE_FIELD_HEADERS.employeeId] === employeeId);
  if (idx === -1) return false;
  await gs.deleteRow(EMPLOYEE_SHEET_TITLE, table.rowNumbers[idx]);
  return true;
}

export async function appendAttendance(record: AttendanceRecord): Promise<void> {
  if (!isSheetsConfigured()) {
    mockAttendance.push(record);
    return;
  }
  const table = await gs.readTable(ATTENDANCE_SHEET_TITLE);
  const keyedData = toHeaderKeyedData(ATTENDANCE_FIELD_HEADERS, record);
  const row = gs.buildRowForHeaders(table.headers, keyedData);
  await gs.appendRow(ATTENDANCE_SHEET_TITLE, row);
}

/** Finds today's open sign-in row for the employee and stamps the sign-out fields. */
export async function recordSignOut(
  employeeId: string,
  date: string,
  outTime: string,
  statusOut: string
): Promise<boolean> {
  if (!isSheetsConfigured()) {
    for (let i = mockAttendance.length - 1; i >= 0; i--) {
      const r = mockAttendance[i];
      if (r.employeeId === employeeId && r.date === date && r.outTime === "") {
        r.outTime = outTime;
        r.attendanceStatusOut = statusOut;
        return true;
      }
    }
    return false;
  }
  const table = await gs.readTable(ATTENDANCE_SHEET_TITLE);
  for (let i = table.rows.length - 1; i >= 0; i--) {
    const r = table.rows[i];
    if (
      r[ATTENDANCE_FIELD_HEADERS.employeeId] === employeeId &&
      r[ATTENDANCE_FIELD_HEADERS.date] === date &&
      r[ATTENDANCE_FIELD_HEADERS.outTime] === ""
    ) {
      await gs.updateRowCells(ATTENDANCE_SHEET_TITLE, table.headers, table.rowNumbers[i], {
        [ATTENDANCE_FIELD_HEADERS.outTime]: outTime,
        [ATTENDANCE_FIELD_HEADERS.attendanceStatusOut]: statusOut,
      });
      return true;
    }
  }
  return false;
}
