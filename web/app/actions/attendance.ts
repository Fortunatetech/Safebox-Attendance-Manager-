"use server";

import { revalidatePath } from "next/cache";
import { BREAK_START, BREAK_END } from "@/lib/sheets/types";
import { findEmployee, getAttendance, appendAttendance, recordSignOut } from "@/lib/sheets";
import { verifyGateScan } from "@/lib/gate";
import { normalizeEmployeeId } from "@/lib/employeeId";
import type { ActionState } from "@/lib/actionState";

/** Returns a user-facing error message if the required gate-QR scan is missing or wrong, else null. */
function gateError(formData: FormData): string | null {
  const scanned = formData.get("gateCode");
  const ok = verifyGateScan(typeof scanned === "string" ? scanned : null);
  if (!ok) {
    return "That QR code doesn't match the office gate code. Please scan the code posted at the gate and try again.";
  }
  return null;
}

function todayParts() {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-CA"), // YYYY-MM-DD in local time
    day: now.toLocaleDateString("en-US", { weekday: "long" }),
    time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = String(formData.get("employeeId") ?? "");

  if (!raw.trim()) return { status: "error", message: "Please enter an Employee ID." };
  const employeeId = normalizeEmployeeId(raw);
  if (!employeeId) {
    return { status: "error", message: "ID format not supported. Please enter an ID in the format SBX-DT-2201-07." };
  }

  const gateMessage = gateError(formData);
  if (gateMessage) return { status: "error", message: gateMessage };

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
    attendanceStatusIn: "",
    breakStart: BREAK_START,
    breakEnd: BREAK_END,
    outTime: "",
    attendanceStatusOut: "",
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: `Signed in at ${time} — welcome, ${employee.employeeName}.` };
}

export async function signOutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = String(formData.get("employeeId") ?? "");

  if (!raw.trim()) return { status: "error", message: "Please enter an Employee ID." };
  const employeeId = normalizeEmployeeId(raw);
  if (!employeeId) {
    return { status: "error", message: "ID format not supported. Please enter an ID in the format SBX-DT-2201-07." };
  }

  const gateMessage = gateError(formData);
  if (gateMessage) return { status: "error", message: gateMessage };

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

  const found = await recordSignOut(employeeId, date, time, "");
  if (!found) {
    return { status: "error", message: "No sign-in record found for today. You need to sign in before you can sign out." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "success", message: `Signed out at ${time} — see you tomorrow, ${employee.employeeName}.` };
}
