import { getEmployees, getAttendance } from "@/lib/sheets";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { TrendChart, DepartmentChart } from "@/components/admin/OverviewCharts";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const NOT_PRESENT_STATUSES = new Set(["Leave", "Holiday"]);

export default async function OverviewPage() {
  const [employees, attendance] = await Promise.all([getEmployees(), getAttendance()]);

  const today = new Date().toLocaleDateString("en-CA");
  const todaysRecords = attendance.filter((r) => r.date === today);

  const presentToday = todaysRecords.filter((r) => !NOT_PRESENT_STATUSES.has(r.attendanceStatusIn)).length;
  const absentToday = Math.max(employees.length - presentToday, 0);
  const lateArrivals = todaysRecords.filter((r) => r.attendanceStatusIn === "Tardy(Late Arrival)").length;
  const earlyArrivals = todaysRecords.filter((r) => r.attendanceStatusIn === "Early").length;

  const trendMap = new Map<string, number>();
  for (const r of attendance) {
    if (!r.date || NOT_PRESENT_STATUSES.has(r.attendanceStatusIn)) continue;
    trendMap.set(r.date, (trendMap.get(r.date) ?? 0) + 1);
  }
  const trendData = Array.from(trendMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-21)
    .map(([date, count]) => ({
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    }));

  const deptMap = new Map<string, number>();
  for (const r of attendance) {
    if (!r.department) continue;
    deptMap.set(r.department, (deptMap.get(r.department) ?? 0) + 1);
  }
  const deptData = Array.from(deptMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([department, count]) => ({ department, count }));

  return (
    <div>
      <PageHeader title="Overview" description="Live attendance metrics across the organization." />

      <div className="space-y-6 px-6 py-6 sm:px-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Employees" value={employees.length} />
          <StatCard label="Present Today" value={presentToday} tone="brass" />
          <StatCard label="Absent Today" value={absentToday} tone={absentToday > 0 ? "brick" : "default"} />
          <StatCard label="Late Arrivals" value={lateArrivals} />
          <StatCard label="Early Arrivals" value={earlyArrivals} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-1 font-display text-base font-semibold text-ink-100">
              Attendance trend
            </h2>
            <p className="mb-4 text-xs text-ink-400">Present headcount, last three weeks</p>
            {trendData.length > 0 ? (
              <TrendChart data={trendData} />
            ) : (
              <EmptyChart message="No attendance history yet." />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 font-display text-base font-semibold text-ink-100">
              Department-wise attendance
            </h2>
            <p className="mb-4 text-xs text-ink-400">All-time recorded sign-ins by department</p>
            {deptData.length > 0 ? (
              <DepartmentChart data={deptData} />
            ) : (
              <EmptyChart message="No attendance history yet." />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-md border border-dashed border-graphite-600 text-sm text-ink-600">
      {message}
    </div>
  );
}
