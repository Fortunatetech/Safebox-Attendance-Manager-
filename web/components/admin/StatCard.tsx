import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "brass" | "brick";
}) {
  const valueTone =
    tone === "brass" ? "text-brass-400" : tone === "brick" ? "text-brick-400" : "text-ink-100";
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-400">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold tabular-nums ${valueTone}`}>{value}</p>
    </Card>
  );
}
