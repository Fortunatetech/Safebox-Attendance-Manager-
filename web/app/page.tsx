import Link from "next/link";
import { VaultDial } from "@/components/ui/VaultDial";
import { KioskConsole } from "@/components/kiosk/KioskConsole";
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
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <div className="mb-7 flex flex-col items-center gap-2.5 text-center">
        <VaultDial className="h-9 w-9 text-brass-500 sm:h-10 sm:w-10" />
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink-100 sm:text-2xl">
            Safebox Attendance
          </h1>
          <p className="mt-1 text-sm text-ink-400">{dateLabel}</p>
        </div>
      </div>

      <KioskConsole />

      <details className="group mt-6 w-full max-w-sm rounded-2xl border border-graphite-700 bg-graphite-900/40 open:pb-4">
        <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-ink-300 marker:content-none">
          <span className="inline-flex items-center gap-2">
            <span className="text-brass-400 transition-transform group-open:rotate-90">›</span>
            How this works
          </span>
        </summary>
        <div className="space-y-3 px-5 text-sm text-ink-400">
          <p>
            Enter your Employee ID (e.g. <code className="font-mono text-brass-300">SBX-DT-2201-07</code>) and
            tap Sign In or Sign Out — dashes and letter case don&apos;t matter. The time is stamped by the
            server the moment you tap, so it&apos;s always accurate.
          </p>
          <p>
            You can only sign in once per day, and you can&apos;t sign out until you&apos;ve signed in.
          </p>
          {geofenced && (
            <p>
              This terminal also checks that you&apos;re physically at the office. Your browser will ask for
              location permission — allow it, or sign-in/out will be blocked.
            </p>
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
