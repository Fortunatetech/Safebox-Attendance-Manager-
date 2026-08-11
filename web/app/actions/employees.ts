"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { addEmployee, updateEmployee, deleteEmployee, getEmployees } from "@/lib/sheets";
import { buildEmployeeId, maxEmployeeSerial } from "@/lib/employeeId";
import type { ActionState } from "@/lib/actionState";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

function readEmployeeFields(formData: FormData) {
  return {
    employeeName: String(formData.get("employeeName") ?? "").trim(),
    phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    jobTitle: String(formData.get("jobTitle") ?? "").trim(),
    department: String(formData.get("department") ?? "").trim(),
    joiningDate: String(formData.get("joiningDate") ?? "").trim(),
    supervisorName: String(formData.get("supervisorName") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
  };
}

export async function addEmployeeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const departmentCode = String(formData.get("departmentCode") ?? "").trim().toUpperCase();
  const fields = readEmployeeFields(formData);

  if (!fields.employeeName) {
    return { status: "error", message: "Name is required." };
  }
  if (!/^[A-Z]{2,4}$/.test(departmentCode)) {
    return { status: "error", message: "Department code must be 2-4 letters (e.g. DT, DEV, ENG)." };
  }
  if (!fields.joiningDate) {
    return { status: "error", message: "Joining date is required to generate the Employee ID." };
  }

  const employees = await getEmployees();
  const nextSerial = maxEmployeeSerial(employees.map((e) => e.employeeId)) + 1;
  const employeeId = buildEmployeeId(departmentCode, fields.joiningDate, nextSerial);

  await addEmployee({ employeeId, departmentCode, ...fields });
  revalidatePath("/admin/employees");
  return { status: "success", message: `Added new employee: ${fields.employeeName} (${employeeId})` };
}

export async function updateEmployeeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const employeeId = String(formData.get("employeeId") ?? "").trim();
  const fields = readEmployeeFields(formData);

  if (!fields.employeeName) {
    return { status: "error", message: "Name is required." };
  }

  // Only write fields the admin actually filled in. An empty value here often just
  // means the browser couldn't parse the sheet's existing value into this input (e.g.
  // a legacy date in D/M/YYYY text instead of the date picker's format) — treating
  // blank as "leave unchanged" instead of "clear this field" prevents silently wiping
  // real data on every edit.
  const nonEmptyFields = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== "")
  ) as Partial<typeof fields>;

  const found = await updateEmployee(employeeId, nonEmptyFields);
  if (!found) {
    return { status: "error", message: "Employee not found." };
  }

  revalidatePath("/admin/employees");
  return { status: "success", message: `Updated employee: ${fields.employeeName}` };
}

export async function deleteEmployeeAction(employeeId: string): Promise<void> {
  await requireAdmin();
  await deleteEmployee(employeeId);
  revalidatePath("/admin/employees");
}
