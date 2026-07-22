import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-xl border border-graphite-700 bg-graphite-800/60 backdrop-blur-sm ${className}`}
    />
  );
}

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "brass" | "brick" | "moss";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-graphite-700 text-ink-300",
    brass: "bg-brass-500/15 text-brass-300 ring-1 ring-inset ring-brass-500/30",
    brick: "bg-brick-500/15 text-brick-400 ring-1 ring-inset ring-brick-500/30",
    moss: "bg-moss-500/15 text-moss-400 ring-1 ring-inset ring-moss-500/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
