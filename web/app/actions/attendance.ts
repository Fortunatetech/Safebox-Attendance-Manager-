"use server";

import { revalidatePath } from "next/cache";
import {
  EMPLOYEE_ID_PATTERN,
  BREAK_START,
  BREAK_END,
} from "@/lib/sheets/types";
import { findEmployee, getAttendance, appendAttendance, recordSignOut } from "@/lib/sheets";
import type { ActionState } from "@/lib/actionState";

function todayParts() {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-CA"), // YYYY-MM-DD in local time
    day: now.toLocaleDateString("en-US", { weekday: "long" }),
    time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const employeeId = String(formData.get("employeeId") ?? "").trim().toLowerCase();
  const status = String(formData.get("status") ?? "");

  if (!employeeId) return { status: "error", message: "Please enter an Employee ID." };
  if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
    return { status: "error", message: "ID format not supported. Please enter an ID in the format sbxXXX." };
  }

  const employee = await findEmployee(employeeId);
  if (!employee) {
    return { status: "error", message: "Employee ID not found in Employee Master Data." };
  }

  const { date, day, time } = todayParts();
  const records = await getAttendance();
  const alreadyToday = records.some((r) => r.employeeId === employeeId && r.date === date);
  if (alreadyToday) {
    return { status: "error", message: "This ID is already registered for today." };
  }

  await appendAttendance({
    employeeId,
    employeeName: employee.employeeName,
    department: employee.department,
    date,
    day,
    inTime: time,
    attendanceStatusIn: status,
    breakStart: BREAK_START,
    breakEnd: BREAK_END,
    outTime: "",
    attendanceStatusOut: "",
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: `Signed in — welcome, ${employee.employeeName}.` };
}

export async function signOutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const employeeId = String(formData.get("employeeId") ?? "").trim().toLowerCase();
  const status = String(formData.get("status") ?? "");

  if (!employeeId) return { status: "error", message: "Please enter an Employee ID." };
  if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
    return { status: "error", message: "ID format not supported. Please enter an ID in the format sbxXXX." };
  }

  const employee = await findEmployee(employeeId);
  if (!employee) {
    return { status: "error", message: "Employee ID not found in Employee Master Data." };
  }

  const { date, time } = todayParts();
  const records = await getAttendance();
  const alreadySignedOut = records.some(
    (r) => r.employeeId === employeeId && r.date === date && r.outTime !== ""
  );
  if (alreadySignedOut) {
    return { status: "error", message: "You have already signed out today." };
  }

  const found = await recordSignOut(employeeId, date, time, status);
  if (!found) {
    return { status: "error", message: "No open sign-in record found for today." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: `Signed out — see you tomorrow, ${employee.employeeName}.` };
}
