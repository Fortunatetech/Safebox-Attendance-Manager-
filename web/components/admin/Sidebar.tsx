"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VaultDial } from "@/components/ui/VaultDial";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reports", label: "Detailed Reports" },
  { href: "/admin/employees", label: "Employee Management" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/help", label: "Help" },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2" onClick={onNavigate}>
        <VaultDial className="h-7 w-7 text-brass-500" />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-tight text-ink-100">Safebox</p>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-600">Admin Console</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`relative block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brass-500/10 text-brass-300"
                  : "text-ink-400 hover:bg-graphite-800 hover:text-ink-100"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brass-500" />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-ink-400 transition-colors hover:bg-graphite-800 hover:text-brick-400"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
