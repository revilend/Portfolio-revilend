import {
  ArrowDown,
  ArrowUpRight,
  Box,
  Code2,
  Database,
  Bot,
  Github,
  MapPin,
  MessageCircle,
  Smartphone,
} from 'lucide-react';

const METRICS = [
  { icon: Box, label: 'Three.js', value: '3D Web' },
  { icon: Database, label: 'Supabase', value: 'Realtime DB' },
  { icon: Bot, label: 'Automation', value: 'Telegram Bots' },
  { icon: Smartphone, label: '100%', value: 'Mobile Responsive' },
];

const STACK = ['Three.js', 'React', 'Supabase', 'Node.js'];

function ProfilePanel() {
  return (
    <aside className="relative hidden lg:block">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-electric/10 via-transparent to-plasma/15 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[linear-gradient(155deg,rgba(15,23,42,0.8),rgba(5,7,13,0.94))] p-6 shadow-[0_40px_100px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Profile / 01
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Ochiq
          </span>
        </div>

        <div className="relative mt-7 flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,#00f2fe,#38bdf8,#8b5cf6)] font-display text-xl font-bold text-ink-950 shadow-[0_12px_30px_-12px_rgba(0,242,254,0.8)] ring-1 ring-white/30">
            R
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold tracking-tight text-white">Revilend</p>
            <p className="mt-0.5 text-[12px] text-slate-400">Creative developer</p>
          </div>
        </div>

        <div className="relative mt-6 space-y-3.5 border-y border-slate-800/80 py-5">
          <div className="flex items-center gap-2.5 text-[12px]">
            <MapPin size={14} className="shrink-0 text-electric" />
            <span className="text-slate-500">Joylashuv</span>
            <span className="ml-auto text-slate-300">Toshkent, UZ</span>
          </div>
          <div className="flex items-center gap-2.5 text-[12px]">
            <Code2 size={14} className="shrink-0 text-plasma" />
            <span className="text-slate-500">Fokus</span>
            <span className="ml-auto text-slate-300">3D · Full-stack</span>
          </div>
          <div className="flex items-center gap-2.5 text-[12px]">
            <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
              <span className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-slate-500">Holat</span>
            <span className="ml-auto text-slate-300">Yangi loyihalarga ochiq</span>
          </div>
        </div>

        <div className="relative mt-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
            Asosiy stack
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {STACK.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-6 flex items-center gap-2">
          <a href="#contact" className="btn-primary flex-1 px-4 py-2.5 text-[12px]">
            Bogʻlanish
            <ArrowUpRight size={14} />
          </a>
          <a
            href="https://t.me/revilend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700/70 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
          >
            <MessageCircle size={15} />
          </a>
          <a
            href="https://github.com/revilend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700/70 bg-slate-900/60 text-slate-400 transition hover:border-electric/40 hover:text-electric"
          >
            <Github size={15} />
          </a>
        </div>
      </div>
    </aside>
  );
}

export default function Hero({ onEnter3D }) {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-36 sm:pb-28 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-lines mask-fade-top opacity-50" />
        <div className="absolute -top-44 left-[42%] h-[560px] w-[880px] -translate-x-1/2 rounded-full bg-electric/[0.07] blur-[140px]" />
        <div className="absolute -right-32 top-[12%] h-[460px] w-[460px] rounded-full bg-plasma/[0.09] blur-[130px]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-ink-900" />
      </div>

      <div className="container-x relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16">
          <div className="max-w-3xl animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300 sm:text-[11px]">
                Loyihalar va hamkorlik uchun ochiq
              </span>
            </div>

            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-electric/80">
              Full-stack va 3D interaktiv dasturchi
            </p>

            <h1 className="mt-4 max-w-[15ch] font-display text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.65rem] lg:leading-[1.04]">
              Gʻoyalarni{' '}
              <span className="text-gradient">interaktiv va jonli</span> tizimlarga aylantiraman.
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-base">
              Revilend — Three.js 3D veb-grafika, zamonaviy taʼlim platformalari va
              avtomatlashtirilgan cloud tizimlar yaratuvchisi.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button type="button" onClick={onEnter3D} className="btn-primary w-full sm:w-auto">
                <Box size={17} />
                3D xonaga kirish
              </button>
              <a href="#projects" className="btn-secondary w-full sm:w-auto">
                Loyihalarni koʻrish
                <ArrowDown size={16} />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-electric/60" />
                Toshkent · UZT
              </span>
              <span className="hidden h-3 w-px bg-slate-800 sm:block" />
              <span>3D · Full-stack · Automation</span>
            </div>
          </div>

          <div className="hidden animate-rise lg:block [animation-delay:120ms]">
            <ProfilePanel />
          </div>
        </div>

        <div className="mt-14 animate-rise overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md [animation-delay:200ms]">
          <div className="grid grid-cols-2 gap-px bg-slate-800/60 md:grid-cols-4">
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="flex items-center gap-3 bg-ink-950/90 px-4 py-4 sm:px-5 sm:py-5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900/70 text-electric">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      {metric.label}
                    </span>
                    <span className="block truncate text-[13px] font-medium text-slate-200">
                      {metric.value}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
