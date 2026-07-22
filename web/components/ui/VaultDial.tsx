export function VaultDial({ className = "", engaged = false }: { className?: string; engaged?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`${className} ${engaged ? "animate-dial-engage" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="24" cy="24" r="14.5" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = (24 + 15.5 * Math.sin(angle)).toFixed(3);
        const y1 = (24 - 15.5 * Math.cos(angle)).toFixed(3);
        const x2 = (24 + 18.5 * Math.sin(angle)).toFixed(3);
        const y2 = (24 - 18.5 * Math.cos(angle)).toFixed(3);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? 1.75 : 1}
            opacity={i % 3 === 0 ? 0.9 : 0.4}
          />
        );
      })}
      <line x1="24" y1="24" x2="24" y2="12" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.25" fill="currentColor" />
    </svg>
  );
}
