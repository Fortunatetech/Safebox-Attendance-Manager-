"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteEmployeeAction } from "@/app/actions/employees";

export function RemoveEmployeeButton({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <>
      <Button type="button" variant="ghost" className="text-brick-400" onClick={() => dialogRef.current?.showModal()}>
        Remove
      </Button>

      <dialog
        ref={dialogRef}
        className="w-[min(90vw,26rem)] rounded-2xl border border-graphite-700 bg-graphite-800 p-6 text-ink-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop:bg-black/70"
      >
        <h2 className="mb-2 font-display text-lg font-semibold">Remove {employeeName}?</h2>
        <p className="mb-5 text-sm text-ink-400">
          This permanently deletes <span className="font-mono text-brass-300">{employeeId}</span> from Employee
          Master Data. This cannot be undone.
        </p>
        {error && <p className="mb-4 rounded-md bg-brick-500/10 px-3.5 py-2.5 text-sm text-brick-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => dialogRef.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isPending}
            onClick={() => {
              setError("");
              startTransition(async () => {
                try {
                  await deleteEmployeeAction(employeeId);
                  dialogRef.current?.close();
                } catch {
                  setError("Could not remove employee. Please try again.");
                }
              });
            }}
          >
            {isPending ? "Removing…" : "Remove employee"}
          </Button>
        </div>
      </dialog>
    </>
  );
}
