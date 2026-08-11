import Link from "next/link";
import { VaultDial } from "@/components/ui/VaultDial";
import { AttendancePanel } from "@/components/kiosk/AttendancePanel";
import { signInAction, signOutAction } from "@/app/actions/attendance";
import { SIGN_IN_STATUSES, SIGN_OUT_STATUSES } from "@/lib/sheets/types";
import { isGeofenceConfigured } from "@/lib/geofence";

export default function KioskPage() {
  const geofenced = isGeofenceConfigured();
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <VaultDial className="h-10 w-10 text-brass-500" />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
            Safebox Attendance Terminal
          </h1>
          <p className="mt-1 text-sm text-ink-400">{dateLabel}</p>
        </div>
      </div>

      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-graphite-700 bg-graphite-800/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col divide-y divide-graphite-700 sm:flex-row sm:divide-x sm:divide-y-0">
          <AttendancePanel mode="in" action={signInAction} statuses={SIGN_IN_STATUSES} />
          <AttendancePanel mode="out" action={signOutAction} statuses={SIGN_OUT_STATUSES} />
        </div>
      </div>

      <details className="group mt-8 w-full max-w-3xl rounded-xl border border-graphite-700 bg-graphite-900/40 open:pb-5">
        <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-ink-300 marker:content-none">
          <span className="inline-flex items-center gap-2">
            <span className="text-brass-400 transition-transform group-open:rotate-90">›</span>
            How this terminal works
          </span>
        </summary>
        <div className="grid gap-5 px-5 text-sm text-ink-400 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 font-medium text-ink-300">Signing in</p>
            <p>
              Enter your Employee ID in the <code className="font-mono text-brass-300">sbxXXX</code> format,
              choose your attendance status, and submit. You can only sign in once per day.
            </p>
          </div>
          <div>
            <p className="mb-1.5 font-medium text-ink-300">Signing out</p>
            <p>
              Use the same Employee ID on the Sign Out side. You can only sign out once, and only after
              you&apos;ve signed in for the day.
            </p>
          </div>
          {geofenced && (
            <div className="sm:col-span-2">
              <p className="mb-1.5 font-medium text-ink-300">Location access</p>
              <p>
                This terminal checks that you&apos;re physically at the office before recording your
                attendance. Your browser will ask for location permission — allow it, or sign-in/out will
                be blocked.
              </p>
            </div>
          )}
        </div>
      </details>

      <Link
        href="/admin"
        className="mt-6 text-xs font-medium tracking-wide text-ink-600 transition-colors hover:text-brass-400"
      >
        Admin access →
      </Link>
    </main>
  );
}
