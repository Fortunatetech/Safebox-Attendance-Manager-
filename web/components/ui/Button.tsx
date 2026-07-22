import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brass-500 text-graphite-950 hover:bg-brass-400 disabled:hover:bg-brass-500 shadow-[0_0_0_1px_rgba(217,164,65,0.35)]",
  secondary:
    "bg-graphite-800 text-ink-100 border border-graphite-600 hover:border-brass-500/60 hover:text-brass-300",
  danger: "bg-brick-500 text-graphite-950 hover:bg-brick-400",
  ghost: "bg-transparent text-ink-300 hover:text-brass-300",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    />
  );
}
