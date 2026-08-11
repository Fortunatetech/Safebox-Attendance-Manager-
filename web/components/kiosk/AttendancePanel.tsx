"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Label, TextInput, SelectInput } from "@/components/ui/Field";
import { VaultDial } from "@/components/ui/VaultDial";
import type { ActionState } from "@/lib/actionState";
import { initialActionState } from "@/lib/actionState";

export function AttendancePanel({
  mode,
  action,
  statuses,
}: {
  mode: "in" | "out";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  statuses: readonly string[];
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);
  const [isTransitioning, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isIn = mode === "in";
  const pending = isPending || isTransitioning || locating;

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          formData.set("latitude", String(pos.coords.latitude));
          formData.set("longitude", String(pos.coords.longitude));
          setLocating(false);
          startTransition(() => formAction(formData));
        },
        () => {
          // Permission denied or unavailable — submit without a position;
          // the server decides whether a location was actually required.
          setLocating(false);
          startTransition(() => formAction(formData));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      startTransition(() => formAction(formData));
    }
  }

  return (
    <div className="flex-1 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <VaultDial className="h-6 w-6 text-brass-500" engaged={state.status === "success"} />
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-100">
          {isIn ? "Sign In" : "Sign Out"}
        </h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor={`employeeId-${mode}`}>Employee ID</Label>
          <TextInput
            id={`employeeId-${mode}`}
            name="employeeId"
            placeholder="SBX-DT-2201-07"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </div>
        <div>
          <Label htmlFor={`status-${mode}`}>Attendance status</Label>
          <SelectInput id={`status-${mode}`} name="status" defaultValue={statuses[0]} required>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {locating ? "Locating…" : pending ? "Verifying…" : isIn ? "Engage sign-in" : "Release sign-out"}
        </Button>

        <div
          role="status"
          aria-live="polite"
          className={`min-h-11 rounded-md px-3.5 py-2.5 text-sm leading-snug transition-colors ${
            state.status === "idle"
              ? "opacity-0"
              : state.status === "success"
                ? "bg-brass-500/10 text-brass-300 animate-glow-pulse"
                : "bg-brick-500/10 text-brick-400"
          }`}
        >
          {state.message || " "}
        </div>
      </form>
    </div>
  );
}
