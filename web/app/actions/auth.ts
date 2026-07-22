"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import type { ActionState } from "@/lib/actionState";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return { status: "success", message: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "Invalid username or password." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
