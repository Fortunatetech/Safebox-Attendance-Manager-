"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Label, PlainInput } from "@/components/ui/Field";
import { loginAction } from "@/app/actions/auth";
import { initialActionState } from "@/lib/actionState";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Verifying…" : "Enter console"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="username">Username</Label>
        <PlainInput id="username" name="username" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <PlainInput id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <SubmitButton />

      {state.status === "error" && (
        <div role="alert" className="rounded-md bg-brick-500/10 px-3.5 py-2.5 text-sm text-brick-400">
          {state.message}
        </div>
      )}
    </form>
  );
}
