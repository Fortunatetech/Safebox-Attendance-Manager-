"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Label, PlainInput, Textarea } from "@/components/ui/Field";
import type { Employee } from "@/lib/sheets/types";
import { initialActionState, type ActionState } from "@/lib/actionState";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function EmployeeFormDialog({
  mode,
  employee,
  action,
  triggerLabel,
  triggerVariant = "primary",
}: {
  mode: "add" | "edit";
  employee?: Employee;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  triggerLabel: string;
  triggerVariant?: "primary" | "secondary";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state]);

  const e = employee;

  return (
    <>
      <Button type="button" variant={triggerVariant} onClick={() => dialogRef.current?.showModal()}>
        {triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        className="w-[min(90vw,32rem)] rounded-2xl border border-graphite-700 bg-graphite-800 p-6 text-ink-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop:bg-black/70"
        onClose={() => undefined}
      >
        <h2 className="mb-5 font-display text-lg font-semibold">
          {mode === "add" ? "Add New Employee" : `Edit ${e?.employeeName ?? "Employee"}`}
        </h2>

        <form action={formAction} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label htmlFor={`${mode}-employeeId`}>Employee ID</Label>
            <PlainInput
              id={`${mode}-employeeId`}
              name="employeeId"
              defaultValue={e?.employeeId ?? ""}
              placeholder="sbx001"
              readOnly={mode === "edit"}
              required
              className={mode === "edit" ? "font-mono opacity-60" : "font-mono"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`${mode}-employeeName`}>Employee Name</Label>
              <PlainInput id={`${mode}-employeeName`} name="employeeName" defaultValue={e?.employeeName ?? ""} required />
            </div>
            <div>
              <Label htmlFor={`${mode}-department`}>Department</Label>
              <PlainInput id={`${mode}-department`} name="department" defaultValue={e?.department ?? ""} />
            </div>
            <div>
              <Label htmlFor={`${mode}-jobTitle`}>Job Title</Label>
              <PlainInput id={`${mode}-jobTitle`} name="jobTitle" defaultValue={e?.jobTitle ?? ""} />
            </div>
            <div>
              <Label htmlFor={`${mode}-phoneNumber`}>Phone Number</Label>
              <PlainInput id={`${mode}-phoneNumber`} name="phoneNumber" defaultValue={e?.phoneNumber ?? ""} />
            </div>
            <div>
              <Label htmlFor={`${mode}-email`}>E-mail Address</Label>
              <PlainInput id={`${mode}-email`} name="email" type="email" defaultValue={e?.email ?? ""} />
            </div>
            <div>
              <Label htmlFor={`${mode}-joiningDate`}>Joining Date</Label>
              <PlainInput id={`${mode}-joiningDate`} name="joiningDate" type="date" defaultValue={e?.joiningDate ?? ""} />
            </div>
            <div>
              <Label htmlFor={`${mode}-shiftDays`}>Shift Days</Label>
              <PlainInput id={`${mode}-shiftDays`} name="shiftDays" defaultValue={e?.shiftDays ?? ""} placeholder="Mon-Fri" />
            </div>
            <div>
              <Label htmlFor={`${mode}-supervisorName`}>Supervisor Name</Label>
              <PlainInput id={`${mode}-supervisorName`} name="supervisorName" defaultValue={e?.supervisorName ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor={`${mode}-address`}>Address</Label>
            <Textarea id={`${mode}-address`} name="address" rows={2} defaultValue={e?.address ?? ""} />
          </div>

          {state.status === "error" && (
            <div role="alert" className="rounded-md bg-brick-500/10 px-3.5 py-2.5 text-sm text-brick-400">
              {state.message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <SubmitButton label={mode === "add" ? "Add Employee" : "Save Changes"} />
          </div>
        </form>
      </dialog>
    </>
  );
}
