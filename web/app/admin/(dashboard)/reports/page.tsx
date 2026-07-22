import { getAttendance } from "@/lib/sheets";
import { PageHeader } from "@/components/admin/PageHeader";
import { ReportsExplorer } from "@/components/admin/ReportsExplorer";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const records = await getAttendance();
  const departments = Array.from(new Set(records.map((r) => r.department).filter(Boolean))).sort();

  return (
    <div>
      <PageHeader title="Detailed Reports" description="Filter, review, and export attendance history." />
      <div className="px-6 py-6 sm:px-10">
        <ReportsExplorer records={records} departments={departments} />
      </div>
    </div>
  );
}
