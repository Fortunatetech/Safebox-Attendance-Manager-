import { AttendanceRecord } from "./sheets/types";

const COLUMNS: { key: keyof AttendanceRecord; label: string }[] = [
  { key: "employeeId", label: "Employee ID" },
  { key: "employeeName", label: "Employee Name" },
  { key: "department", label: "Department" },
  { key: "date", label: "Date" },
  { key: "day", label: "Day" },
  { key: "inTime", label: "In-Time" },
  { key: "attendanceStatusIn", label: "Attendance Status In" },
  { key: "outTime", label: "Out-Time" },
  { key: "attendanceStatusOut", label: "Attendance Status Out" },
];

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function downloadAttendanceCsv(records: AttendanceRecord[], filename = "attendance-report.csv") {
  const header = COLUMNS.map((c) => c.label).join(",");
  const rows = records.map((r) => COLUMNS.map((c) => csvEscape(String(r[c.key] ?? ""))).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAttendancePdf(records: AttendanceRecord[], filename = "attendance-report.pdf") {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Safebox Attendance Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [COLUMNS.map((c) => c.label)],
    body: records.map((r) => COLUMNS.map((c) => String(r[c.key] ?? ""))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [217, 164, 65], textColor: [20, 24, 28] },
  });

  doc.save(filename);
}
