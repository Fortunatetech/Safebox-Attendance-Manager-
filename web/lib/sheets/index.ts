import {
  Employee,
  AttendanceRecord,
  EMPLOYEE_HEADERS,
  ATTENDANCE_HEADERS,
  EMPLOYEE_SHEET_TITLE,
  ATTENDANCE_SHEET_TITLE,
  employeeToRow,
  rowToEmployee,
  attendanceToRow,
  rowToAttendance,
} from "./types";
import { isSheetsConfigured, mockEmployees, mockAttendance } from "./mock";
import * as gs from "./googleSheets";

export { isSheetsConfigured };
export type { Employee, AttendanceRecord };

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
  await gs.appendRow(EMPLOYEE_SHEET_TITLE, EMPLOYEE_HEADERS, employeeToRow(employee));
}

export async function updateEmployee(
  employeeId: string,
  updates: Partial<Employee>
): Promise<boolean> {
  if (!isSheetsConfigured()) {
    const idx = mockEmployees.findIndex((e) => e.employeeId === employeeId);
    if (idx === -1) return false;
    mockEmployees[idx] = { ...mockEmployees[idx], ...updates };
    return true;
  }
  const table = await gs.readTable(EMPLOYEE_SHEET_TITLE);
  const idx = table.rows.findIndex((r) => r["Employee ID"] === employeeId);
  if (idx === -1) return false;
  const merged = { ...rowToEmployee(table.rows[idx]), ...updates };
  await gs.overwriteRow(EMPLOYEE_SHEET_TITLE, table.rowNumbers[idx], employeeToRow(merged));
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
  const idx = table.rows.findIndex((r) => r["Employee ID"] === employeeId);
  if (idx === -1) return false;
  await gs.deleteRow(EMPLOYEE_SHEET_TITLE, table.rowNumbers[idx]);
  return true;
}

export async function appendAttendance(record: AttendanceRecord): Promise<void> {
  if (!isSheetsConfigured()) {
    mockAttendance.push(record);
    return;
  }
  await gs.appendRow(ATTENDANCE_SHEET_TITLE, ATTENDANCE_HEADERS, attendanceToRow(record));
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
    if (r["Employee ID"] === employeeId && r["Date"] === date && r["Out-Time"] === "") {
      await gs.updateRowCells(ATTENDANCE_SHEET_TITLE, table.headers, table.rowNumbers[i], {
        "Out-Time": outTime,
        "Attendance Status Out": statusOut,
      });
      return true;
    }
  }
  return false;
}
