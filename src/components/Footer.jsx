import { ArrowUp, Github, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-800/80 bg-ink-950/60">
      <div className="container-x flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <a href="#top" className="flex items-center gap-2.5" aria-label="Revilend.uz — yuqoriga qaytish">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(120deg,#00f2fe,#8b5cf6)] font-display text-xs font-bold text-ink-950 ring-1 ring-white/20">
              R
            </span>
            <span className="font-display text-sm font-semibold text-white">
              Revilend<span className="text-electric">.uz</span>
            </span>
          </a>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-500">
            Toshkentdan immersiv brauzer tajribalari va ishonchli toʻliq stackli tizimlar
            yaratuvchi kreativ dasturchi.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Sayt navigatsiyasi">
          {[
            { label: 'Loyihalar', href: '#projects' },
            { label: 'Koʻnikmalar', href: '#arsenal' },
            { label: 'Men haqimda', href: '#about' },
            { label: 'Aloqa', href: '#contact' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-slate-500 transition hover:text-slate-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/revilend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram profili"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
          >
            <MessageCircle size={16} />
          </a>
          <a
            href="https://github.com/revilend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profili"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
          >
            <Github size={16} />
          </a>
          <a
            href="#top"
            aria-label="Yuqoriga qaytish"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
          >
            <ArrowUp size={16} />
          </a>
        </div>
      </div>

      <div className="border-t border-slate-800/60">
        <div className="container-x flex flex-col gap-2 py-5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Revilend.uz — barcha huquqlar himoyalangan</p>
          <p>React · Three.js · Tailwind CSS asosida yaratilgan</p>
        </div>
      </div>
    </footer>
  );
}
