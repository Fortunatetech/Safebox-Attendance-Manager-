import { getEmployees } from "@/lib/sheets";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmployeeManager } from "@/components/admin/EmployeeManager";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <PageHeader title="Employee Management" description="Search, edit, add, and remove employee records." />
      <div className="px-6 py-6 sm:px-10">
        <EmployeeManager employees={employees} />
      </div>
    </div>
  );
}
