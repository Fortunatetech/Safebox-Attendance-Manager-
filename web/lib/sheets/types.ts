export interface Employee {
  employeeId: string;
  employeeName: string;
  phoneNumber: string;
  email: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  shiftDays: string;
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

/** Sheet header names, in the order the original app used them. Reads are header-driven (order-independent); writes emit rows in this order. */
export const EMPLOYEE_HEADERS = [
  "Employee ID",
  "Employee Name",
  "Phone Number",
  "E-mail Address",
  "Job Title",
  "Department",
  "Joining Date",
  "Shift Days",
  "Supervisor Name",
  "Address",
] as const;

export const ATTENDANCE_HEADERS = [
  "Employee ID",
  "Employee Name",
  "Department",
  "Date",
  "Day",
  "In-Time",
  "Attendance Status In",
  "Break Start",
  "Break End",
  "Out-Time",
  "Attendance Status Out",
] as const;

export const EMPLOYEE_SHEET_TITLE = "Employee Master Data";
export const ATTENDANCE_SHEET_TITLE = "Attendance Data";

export const employeeToRow = (e: Partial<Employee>): string[] => [
  e.employeeId ?? "",
  e.employeeName ?? "",
  e.phoneNumber ?? "",
  e.email ?? "",
  e.jobTitle ?? "",
  e.department ?? "",
  e.joiningDate ?? "",
  e.shiftDays ?? "",
  e.supervisorName ?? "",
  e.address ?? "",
];

export const rowToEmployee = (row: Record<string, string>): Employee => ({
  employeeId: row["Employee ID"] ?? "",
  employeeName: row["Employee Name"] ?? "",
  phoneNumber: row["Phone Number"] ?? "",
  email: row["E-mail Address"] ?? "",
  jobTitle: row["Job Title"] ?? "",
  department: row["Department"] ?? "",
  joiningDate: row["Joining Date"] ?? "",
  shiftDays: row["Shift Days"] ?? "",
  supervisorName: row["Supervisor Name"] ?? "",
  address: row["Address"] ?? "",
});

export const attendanceToRow = (a: Partial<AttendanceRecord>): string[] => [
  a.employeeId ?? "",
  a.employeeName ?? "",
  a.department ?? "",
  a.date ?? "",
  a.day ?? "",
  a.inTime ?? "",
  a.attendanceStatusIn ?? "",
  a.breakStart ?? "",
  a.breakEnd ?? "",
  a.outTime ?? "",
  a.attendanceStatusOut ?? "",
];

export const rowToAttendance = (row: Record<string, string>): AttendanceRecord => ({
  employeeId: row["Employee ID"] ?? "",
  employeeName: row["Employee Name"] ?? "",
  department: row["Department"] ?? "",
  date: row["Date"] ?? "",
  day: row["Day"] ?? "",
  inTime: row["In-Time"] ?? "",
  attendanceStatusIn: row["Attendance Status In"] ?? "",
  breakStart: row["Break Start"] ?? "",
  breakEnd: row["Break End"] ?? "",
  outTime: row["Out-Time"] ?? "",
  attendanceStatusOut: row["Attendance Status Out"] ?? "",
});

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

export const EMPLOYEE_ID_PATTERN = /^sbx\d{3}$/;
