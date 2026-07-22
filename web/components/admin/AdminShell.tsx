"use client";

import { useState } from "react";
import Link from "next/link";
import { VaultDial } from "@/components/ui/VaultDial";
import { Sidebar } from "@/components/admin/Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <header className="flex items-center justify-between border-b border-graphite-700 bg-graphite-900/60 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <VaultDial className="h-6 w-6 text-brass-500" />
          <span className="font-display text-sm font-semibold text-ink-100">Safebox Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-md p-2 text-ink-300 hover:bg-graphite-800 hover:text-brass-300"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-graphite-700 bg-graphite-900 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:border-r lg:bg-graphite-900/60 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
