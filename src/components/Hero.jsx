import { ArrowDown, Box, Bot, Database, Smartphone } from 'lucide-react';

const METRICS = [
  { icon: Box, label: 'Three.js', value: '3D Web' },
  { icon: Database, label: 'Supabase', value: 'Realtime DB' },
  { icon: Bot, label: 'Automation', value: 'Telegram Bots' },
  { icon: Smartphone, label: '100%', value: 'Mobile Responsive' },
];

export default function Hero({ onEnter3D }) {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-lines mask-fade-top opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-electric/[0.07] blur-[130px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-plasma/[0.10] blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />
      </div>

      <div className="container-x relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300 sm:text-[11px]">
              Full-Stack Web &amp; 3D Interactive Specialist
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-3xl font-semibold leading-[1.18] tracking-[-0.025em] text-white sm:text-5xl sm:leading-[1.1] lg:text-[3.6rem]">
            Gʻoyalarni <span className="text-gradient">interaktiv va jonli</span> tizimlarga
            aylantiraman.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Revilend — Three.js 3D veb-grafika, taʼlim platformalari va avtomatlashtirilgan cloud
            tizimlar yaratuvchisi.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button type="button" onClick={onEnter3D} className="btn-primary w-full sm:w-auto">
              <span aria-hidden="true">🛸</span>
              3D Xonaga Kirish
            </button>
            <a href="#projects" className="btn-secondary w-full sm:w-auto">
              Loyihalarni koʻrish
              <ArrowDown size={16} />
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-900/30 p-2 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-800/60 md:grid-cols-4">
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="flex items-center gap-3 bg-ink-900/85 px-4 py-4 sm:px-5 sm:py-5"
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
