import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Github, MessageCircle, Monitor, Terminal } from 'lucide-react';
import { projects } from '../data/projects.js';
import StatusBadge from './StatusBadge.jsx';

export default function ComputerScreen({ onClose, onOpenProject, drawerOpen = false }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape' && !drawerOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [drawerOpen, onClose]);

  const time = new Intl.DateTimeFormat('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tashkent',
  }).format(new Date());

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 z-30 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="computer-screen-title"
    >
      <div className="relative flex h-full flex-col overflow-hidden border-t border-electric/20 bg-[#040910]/95 text-slate-200 backdrop-blur-2xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 grid-lines opacity-25" />
          <div className="absolute -top-40 left-1/3 h-[420px] w-[680px] rounded-full bg-electric/[0.07] blur-[130px]" />
          <div className="absolute bottom-[-30%] right-[-10%] h-[440px] w-[440px] rounded-full bg-plasma/[0.10] blur-[130px]" />
        </div>

        <div className="relative flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-800/80 bg-ink-950/85 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-rose-400/80" />
              <span className="h-2 w-2 rounded-full bg-amber-300/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            </span>
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
              revilend-os <span className="text-slate-700">/</span> loyihalar
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden font-mono text-[10px] tracking-[0.12em] text-slate-500 sm:inline">
              TOSHKENT · {time}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-[10px] font-medium text-slate-300 transition hover:border-electric/40 hover:text-white"
            >
              <ArrowLeft size={13} />
              3D xonaga qaytish
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-800/80 pb-7">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-electric/80">
                  <Monitor size={13} />
                  REVILEND OS · ish stoli
                </p>
                <h2
                  id="computer-screen-title"
                  className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl"
                >
                  Kompyuter ichidagi loyihalar.
                </h2>
                <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-slate-400">
                  Monitorga oʻtirdingiz. Bu yerda ishlab chiqarishdagi uchta tizim — har birini
                  ochib, arxitektura va imkoniyatlarini koʻrishingiz mumkin.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                3 loyiha · tizim faol
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onOpenProject(project.id)}
                  className="group flex h-full animate-rise flex-col rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 text-left backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-electric/40 hover:bg-slate-900/80 hover:shadow-[0_30px_80px_-45px_rgba(0,242,254,0.9)]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-slate-600">
                      /{project.index}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>

                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-electric/80">
                    {project.tagline}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-electric">
                    {project.title}
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-400">
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.slice(0, 3).map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/70 pt-4 text-[12px] font-medium text-slate-300">
                    <span>Loyihani ochish</span>
                    <ArrowUpRight
                      size={15}
                      className="text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric"
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-slate-800/80 bg-ink-950/70 p-4 font-mono text-[11px] leading-relaxed">
                <p className="flex items-center gap-2 text-emerald-400">
                  <Terminal size={13} />
                  revilend@cyber-room:~$ open projects
                </p>
                <p className="mt-1 text-slate-500">
                  3 loyiha yuklandi · monitor sinxron · barcha tizimlar onlayn
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="https://t.me/revilend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3 text-[12px] text-slate-300 transition hover:border-electric/40 hover:text-white"
                >
                  <MessageCircle size={14} className="text-electric" />
                  Telegram
                </a>
                <a
                  href="https://github.com/revilend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3 text-[12px] text-slate-300 transition hover:border-electric/40 hover:text-white"
                >
                  <Github size={14} className="text-electric" />
                  GitHub
                </a>
              </div>
            </div>

            <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
              Esc yoki “3D xonaga qaytish” bilan stolga qaytish
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
