export interface Employee {
  employeeId: string;
  employeeName: string;
  department: string;
  departmentCode: string;
  jobTitle: string;
  phoneNumber: string;
  email: string;
  joiningDate: string;
  supervisorName: string;
  address: string;
}

export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  day: string;
  inTime: string;
  attendanceStatusIn: string;
  breakStart: string;
  breakEnd: string;
  outTime: string;
  attendanceStatusOut: string;
}

export const EMPLOYEE_SHEET_TITLE = "Employee Master Data";
export const ATTENDANCE_SHEET_TITLE = "Attendance Data";

/**
 * Maps each Employee field to the exact header text in the real sheet (the sheet has
 * many more HR columns than this app manages — Entity, Employment Type, Probation
 * dates, Bank, guarantor attachments, etc. — those are left untouched on every
 * read/write; only the fields listed here are ever read from or written to).
 * Matches the real header text exactly, including its "Adress" typo.
 */
export const EMPLOYEE_FIELD_HEADERS: Record<keyof Employee, string> = {
  employeeId: "Employee ID",
  employeeName: "Full Name",
  department: "Department",
  departmentCode: "Departmental Code",
  jobTitle: "Job Title",
  phoneNumber: "Phone Number",
  email: "Email Adress",
  joiningDate: "Date of Hire",
  supervisorName: "Line Manager",
  address: "Home Address",
};

export const ATTENDANCE_FIELD_HEADERS: Record<keyof AttendanceRecord, string> = {
  employeeId: "Employee ID",
  employeeName: "Employee Name",
  department: "Department",
  date: "Date",
  day: "Day",
  inTime: "In-Time",
  attendanceStatusIn: "Attendance Status In",
  breakStart: "Break Start",
  breakEnd: "Break End",
  outTime: "Out-Time",
  attendanceStatusOut: "Attendance Status Out",
};

function rowFromFieldHeaders<T>(fieldHeaders: Record<keyof T, string>, row: Record<string, string>): T {
  const result = {} as T;
  for (const key of Object.keys(fieldHeaders) as (keyof T)[]) {
    result[key] = (row[fieldHeaders[key]] ?? "") as T[keyof T];
  }
  return result;
}

export const rowToEmployee = (row: Record<string, string>): Employee =>
  rowFromFieldHeaders(EMPLOYEE_FIELD_HEADERS, row);

export const rowToAttendance = (row: Record<string, string>): AttendanceRecord =>
  rowFromFieldHeaders(ATTENDANCE_FIELD_HEADERS, row);

export const SIGN_IN_STATUSES = [
  "Early",
  "Leave",
  "Holiday",
  "Work from Home",
  "Site Work",
  "Late(On Official Duty)",
  "Tardy(Late Arrival)",
] as const;

export const SIGN_OUT_STATUSES = [
  "On Time",
  "Left Early",
  "Early(On Official Duty)",
] as const;

export const BREAK_START = "12:00 PM";
export const BREAK_END = "12:40 PM";
