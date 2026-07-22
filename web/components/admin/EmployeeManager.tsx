"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PlainInput } from "@/components/ui/Field";
import type { Employee } from "@/lib/sheets/types";
import { EmployeeFormDialog } from "@/components/admin/EmployeeFormDialog";
import { RemoveEmployeeButton } from "@/components/admin/RemoveEmployeeButton";
import { addEmployeeAction, updateEmployeeAction } from "@/app/actions/employees";

export function EmployeeManager({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((e) =>
      [e.employeeId, e.employeeName, e.department, e.jobTitle, e.email].some((v) =>
        v.toLowerCase().includes(term)
      )
    );
  }, [employees, search]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-sm flex-1">
            <PlainInput
              placeholder="Search by Employee ID, Name, or Department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search employees"
            />
          </div>
          <EmployeeFormDialog mode="add" action={addEmployeeAction} triggerLabel="Add Employee" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="sticky top-0 bg-graphite-900 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Job Title</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Supervisor</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-800">
              {filtered.map((emp) => (
                <tr key={emp.employeeId} className="text-ink-300 hover:bg-graphite-800/40">
                  <td className="px-4 py-3 font-mono text-brass-300">{emp.employeeId}</td>
                  <td className="px-4 py-3 text-ink-100">{emp.employeeName}</td>
                  <td className="px-4 py-3 text-ink-400">{emp.department}</td>
                  <td className="px-4 py-3 text-ink-400">{emp.jobTitle}</td>
                  <td className="px-4 py-3 font-mono text-xs">{emp.phoneNumber}</td>
                  <td className="px-4 py-3 text-ink-400">{emp.supervisorName}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <EmployeeFormDialog
                        mode="edit"
                        employee={emp}
                        action={updateEmployeeAction}
                        triggerLabel="Edit"
                        triggerVariant="secondary"
                      />
                      <RemoveEmployeeButton employeeId={emp.employeeId} employeeName={emp.employeeName} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-600">
                    No employees found for the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
