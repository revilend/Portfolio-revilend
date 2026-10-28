import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex justify-end sm:inset-x-auto sm:bottom-6 sm:right-6">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3.5 shadow-[0_24px_80px_-24px_rgba(16,185,129,0.7)] backdrop-blur-xl"
      >
        <span className="mt-0.5 shrink-0 text-emerald-300">
          <CheckCircle2 size={18} />
        </span>
        <p className="flex-1 text-sm leading-relaxed text-emerald-50">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded p-1 text-emerald-300/70 transition hover:bg-emerald-400/10 hover:text-emerald-200"
          aria-label="Bildirishnomani yopish"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
