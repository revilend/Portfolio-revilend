import { useEffect, useState } from 'react';
import { ArrowUpRight, Github, MessageCircle } from 'lucide-react';

const MODES = [
  { id: '2d', label: '📄 2D Sayt' },
  { id: '3d', label: '🛸 3D Xona' },
];

function ModeToggle({ mode, onChange, full = false }) {
  return (
    <div
      role="group"
      aria-label="Koʻrinish rejimi"
      className={`inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/70 p-1 backdrop-blur-md ${
        full ? 'w-full' : ''
      }`}
    >
      {MODES.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-pressed={isActive}
            className={`flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition duration-200 sm:text-xs ${
              full ? 'flex-1' : ''
            } ${
              isActive
                ? 'bg-gradient-to-r from-electric to-cyan-300 text-ink-950 shadow-[0_0_24px_-6px_rgba(0,242,254,0.8)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Header({ mode, onModeChange, onContact }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (mode === '3d') return undefined;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  const solid = scrolled || mode === '3d';

  const handleBrandClick = (event) => {
    if (mode === '3d') {
      event.preventDefault();
      onModeChange('2d');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        solid ? 'border-slate-800/70 bg-ink-900/85' : 'border-slate-800/40 bg-ink-900/55'
      }`}
    >
      <div className="container-x">
        <div className="flex h-16 items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
          <a
            href="#top"
            onClick={handleBrandClick}
            className="flex min-w-0 items-center gap-2.5"
            aria-label="Revilend.uz — yuqoriga qaytish"
          >
            <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(120deg,#00f2fe,#22d3ee,#8b5cf6,#00f2fe)] bg-[length:220%_220%] font-display text-xs font-bold text-ink-950 shadow-[0_0_24px_-6px_rgba(0,242,254,0.75)] ring-1 ring-white/20 animate-gradient-x sm:h-9 sm:w-9 sm:text-sm">
              R
            </span>
            <span className="truncate font-display text-sm font-semibold tracking-tight text-white sm:text-[15px]">
              Revilend<span className="text-electric">.uz</span>
            </span>
          </a>

          <div className="hidden md:flex md:justify-center">
            <ModeToggle mode={mode} onChange={onModeChange} />
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <a
              href="https://t.me/revilend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram profili"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
            >
              <MessageCircle size={15} />
            </a>
            <a
              href="https://github.com/revilend"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profili"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
            >
              <Github size={15} />
            </a>
            <button
              type="button"
              onClick={onContact}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 px-2.5 text-[12px] font-medium text-slate-200 transition hover:border-electric/50 hover:text-white sm:px-3.5"
            >
              <span className="hidden sm:inline">Bogʻlanish</span>
              <ArrowUpRight size={14} className="text-electric" />
            </button>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <ModeToggle mode={mode} onChange={onModeChange} full />
        </div>
      </div>
    </header>
  );
}
