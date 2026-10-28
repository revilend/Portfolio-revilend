const TONES = {
  green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
};

const DOTS = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  cyan: 'bg-cyan-400',
};

export default function StatusBadge({ status, className = '' }) {
  const tone = TONES[status.tone] ?? TONES.cyan;
  const dot = DOTS[status.tone] ?? DOTS.cyan;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${tone} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.label}
    </span>
  );
}
