"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { addEmployee, updateEmployee, deleteEmployee, findEmployee } from "@/lib/sheets";
import { EMPLOYEE_ID_PATTERN } from "@/lib/sheets/types";
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
    shiftDays: String(formData.get("shiftDays") ?? "").trim(),
    supervisorName: String(formData.get("supervisorName") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
  };
}

export async function addEmployeeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const employeeId = String(formData.get("employeeId") ?? "").trim().toLowerCase();
  const fields = readEmployeeFields(formData);

  if (!employeeId || !fields.employeeName) {
    return { status: "error", message: "Employee ID and Name are required fields." };
  }
  if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
    return { status: "error", message: "ID format not supported. Please use the format sbxXXX." };
  }
  if (await findEmployee(employeeId)) {
    return { status: "error", message: "An employee with this ID already exists." };
  }

  await addEmployee({ employeeId, ...fields });
  revalidatePath("/admin/employees");
  return { status: "success", message: `Added new employee: ${fields.employeeName}` };
}

export async function updateEmployeeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const employeeId = String(formData.get("employeeId") ?? "").trim().toLowerCase();
  const fields = readEmployeeFields(formData);

  if (!fields.employeeName) {
    return { status: "error", message: "Name is required." };
  }

  const found = await updateEmployee(employeeId, fields);
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
