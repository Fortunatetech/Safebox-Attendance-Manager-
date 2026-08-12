"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { VaultDial } from "@/components/ui/VaultDial";
import { signInAction, signOutAction } from "@/app/actions/attendance";
import type { ActionState } from "@/lib/actionState";

type Mode = "in" | "out";

const EMPTY_ID_ERROR: ActionState = { status: "error", message: "Please enter your Employee ID." };

export function KioskConsole() {
  const [employeeId, setEmployeeId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [busyMode, setBusyMode] = useState<Mode | null>(null);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<ActionState | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = busyMode !== null || isPending;

  useEffect(() => {
    if (result) dialogRef.current?.showModal();
  }, [result]);

  useEffect(() => {
    if (result?.status === "success") {
      const t = setTimeout(() => dialogRef.current?.close(), 2200);
      return () => clearTimeout(t);
    }
  }, [result]);

  function runAction(mode: Mode) {
    if (busy) return;
    if (!employeeId.trim()) {
      setResult(EMPTY_ID_ERROR);
      return;
    }

    setBusyMode(mode);
    const formData = new FormData();
    formData.set("employeeId", employeeId);

    const proceed = (lat?: number, lng?: number, accuracy?: number) => {
      if (lat != null && lng != null) {
        formData.set("latitude", String(lat));
        formData.set("longitude", String(lng));
        if (accuracy != null) formData.set("accuracy", String(accuracy));
      }
      startTransition(async () => {
        const action = mode === "in" ? signInAction : signOutAction;
        const res = await action({ status: "idle", message: "" }, formData);
        setBusyMode(null);
        setLocating(false);
        setResult(res);
        if (res.status === "success") setEmployeeId("");
      });
    };

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => proceed(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => proceed(),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      proceed();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runAction("in");
  }

  const isError = result?.status === "error";
  const isSuccess = result?.status === "success";

  return (
    <div className="w-full max-w-sm">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-graphite-700 bg-graphite-800/50 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8"
      >
        <label
          htmlFor="employeeId"
          className="mb-2 block text-center text-xs font-medium uppercase tracking-[0.14em] text-ink-400"
        >
          Employee ID
        </label>
        <input
          ref={inputRef}
          id="employeeId"
          name="employeeId"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="SBX-DT-2201-07"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
          disabled={busy}
          className="w-full rounded-2xl border border-graphite-600 bg-graphite-900/70 px-4 py-4 text-center font-mono text-xl tracking-[0.06em] text-ink-100 placeholder:text-ink-600 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-colors focus:border-brass-400 focus:outline-none disabled:opacity-60"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex h-16 items-center justify-center rounded-2xl bg-brass-500 text-base font-semibold text-graphite-950 shadow-[0_0_0_1px_rgba(217,164,65,0.35)] transition-all hover:bg-brass-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locating && busyMode === "in" ? "Locating…" : busyMode === "in" ? "Verifying…" : "Sign In"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction("out")}
            className="flex h-16 items-center justify-center rounded-2xl border border-graphite-600 bg-graphite-900/60 text-base font-semibold text-ink-100 transition-all hover:border-brass-500/60 hover:text-brass-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locating && busyMode === "out" ? "Locating…" : busyMode === "out" ? "Verifying…" : "Sign Out"}
          </button>
        </div>
      </form>

      <dialog
        ref={dialogRef}
        onClose={() => {
          setResult(null);
          inputRef.current?.focus();
        }}
        aria-live="assertive"
        className="w-[min(90vw,24rem)] rounded-3xl border border-graphite-700 bg-graphite-800 p-0 text-ink-100"
      >
        <div
          className={`animate-modal-in flex flex-col items-center gap-4 p-8 text-center ${
            isError ? "animate-shake" : ""
          }`}
        >
          <VaultDial
            className={`h-12 w-12 ${isError ? "text-brick-400" : "text-brass-500"}`}
            engaged={isSuccess}
          />
          <p className={`text-base font-medium leading-snug ${isError ? "text-brick-300" : "text-ink-100"}`}>
            {result?.message}
          </p>
          {isError && (
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="mt-1 w-full rounded-xl bg-graphite-700 px-4 py-3 text-sm font-semibold text-ink-100 transition-colors hover:bg-graphite-600"
            >
              Try again
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
