"use client";

import { useMemo, useState } from "react";
import { AttendanceRecord, SIGN_IN_STATUSES } from "@/lib/sheets/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, PlainInput } from "@/components/ui/Field";
import { FilterChip } from "@/components/admin/FilterChip";
import { AttendanceTable } from "@/components/admin/AttendanceTable";
import { downloadAttendanceCsv, downloadAttendancePdf } from "@/lib/export";

export function ReportsExplorer({
  records,
  departments,
}: {
  records: AttendanceRecord[];
  departments: string[];
}) {
  const dates = records.map((r) => r.date).filter(Boolean).sort();
  const [startDate, setStartDate] = useState(dates[0] ?? "");
  const [endDate, setEndDate] = useState(dates[dates.length - 1] ?? "");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(departments);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([...SIGN_IN_STATUSES]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      if (!selectedDepartments.includes(r.department)) return false;
      if (r.attendanceStatusIn && !selectedStatuses.includes(r.attendanceStatusIn)) return false;
      return true;
    });
  }, [records, startDate, endDate, selectedDepartments, selectedStatuses]);

  const lateOrEarlyLeavers = useMemo(
    () =>
      filtered.filter(
        (r) => r.attendanceStatusIn === "Tardy(Late Arrival)" || r.attendanceStatusOut === "Left Early"
      ),
    [filtered]
  );
  const siteWork = useMemo(() => filtered.filter((r) => r.attendanceStatusIn === "Site Work"), [filtered]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-100">Filters</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="start-date">Start date</Label>
            <PlainInput
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End date</Label>
            <PlainInput id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-400">Department</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <FilterChip
                key={d}
                active={selectedDepartments.includes(d)}
                onClick={() => toggle(selectedDepartments, setSelectedDepartments, d)}
              >
                {d}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-400">Attendance status</p>
          <div className="flex flex-wrap gap-2">
            {SIGN_IN_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={selectedStatuses.includes(s)}
                onClick={() => toggle(selectedStatuses, setSelectedStatuses, s)}
              >
                {s}
              </FilterChip>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">Employee Attendance Report</h2>
            <p className="text-xs text-ink-400">{filtered.length} record{filtered.length === 1 ? "" : "s"}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => downloadAttendanceCsv(filtered)}
              disabled={filtered.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              disabled={filtered.length === 0 || isExportingPdf}
              onClick={async () => {
                setIsExportingPdf(true);
                try {
                  await downloadAttendancePdf(filtered);
                } finally {
                  setIsExportingPdf(false);
                }
              }}
            >
              {isExportingPdf ? "Generating…" : "Export PDF"}
            </Button>
          </div>
        </div>
        <AttendanceTable records={filtered} emptyMessage="No records match the current filters." />
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-100">Late Comers &amp; Early Leavers</h2>
        <AttendanceTable records={lateOrEarlyLeavers} emptyMessage="No late arrivals or early departures in range." />
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-100">Site Work</h2>
        <AttendanceTable records={siteWork} emptyMessage="No site-work entries in range." />
      </Card>
    </div>
  );
}
