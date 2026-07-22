import { AttendanceRecord } from "@/lib/sheets/types";
import { StatusPill } from "@/components/ui/Card";

const statusTone = (status: string): "brass" | "brick" | "moss" | "neutral" => {
  if (["Tardy(Late Arrival)", "Left Early"].includes(status)) return "brick";
  if (["Early", "On Time"].includes(status)) return "moss";
  if (status === "") return "neutral";
  return "brass";
};

export function AttendanceTable({ records, emptyMessage }: { records: AttendanceRecord[]; emptyMessage: string }) {
  if (records.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-graphite-600 text-sm text-ink-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="max-h-[420px] overflow-auto rounded-md border border-graphite-700">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="sticky top-0 bg-graphite-900 text-xs uppercase tracking-wide text-ink-400">
          <tr>
            <th className="px-3 py-2.5 font-medium">Employee ID</th>
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Department</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium">In</th>
            <th className="px-3 py-2.5 font-medium">Status In</th>
            <th className="px-3 py-2.5 font-medium">Out</th>
            <th className="px-3 py-2.5 font-medium">Status Out</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-800">
          {records.map((r, i) => (
            <tr key={`${r.employeeId}-${r.date}-${i}`} className="text-ink-300 hover:bg-graphite-800/40">
              <td className="px-3 py-2.5 font-mono text-brass-300">{r.employeeId}</td>
              <td className="px-3 py-2.5">{r.employeeName}</td>
              <td className="px-3 py-2.5 text-ink-400">{r.department}</td>
              <td className="px-3 py-2.5 font-mono">{r.date}</td>
              <td className="px-3 py-2.5 font-mono">{r.inTime || "—"}</td>
              <td className="px-3 py-2.5">
                {r.attendanceStatusIn ? <StatusPill tone={statusTone(r.attendanceStatusIn)}>{r.attendanceStatusIn}</StatusPill> : "—"}
              </td>
              <td className="px-3 py-2.5 font-mono">{r.outTime || "—"}</td>
              <td className="px-3 py-2.5">
                {r.attendanceStatusOut ? <StatusPill tone={statusTone(r.attendanceStatusOut)}>{r.attendanceStatusOut}</StatusPill> : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
