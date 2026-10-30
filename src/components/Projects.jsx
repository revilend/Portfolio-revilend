import { ArrowUpRight, Bot, Ghost, GraduationCap } from 'lucide-react';
import { projects } from '../data/projects.js';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import StatusBadge from './StatusBadge.jsx';

const VISUALS = {
  teachermuzaffar: {
    icon: GraduationCap,
    kicker: 'Education / Realtime',
    surface: 'from-cyan-500/[0.18] via-sky-500/[0.06] to-transparent',
    glow: 'bg-cyan-400/20',
    iconClass: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    rule: 'from-cyan-300/60',
  },
  'echoes-of-room-404': {
    icon: Ghost,
    kicker: '3D / Experimental',
    surface: 'from-violet-500/[0.20] via-fuchsia-500/[0.06] to-transparent',
    glow: 'bg-violet-400/20',
    iconClass: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
    rule: 'from-violet-300/60',
  },
  'telegram-automation': {
    icon: Bot,
    kicker: 'Automation / Cloud',
    surface: 'from-emerald-500/[0.18] via-teal-500/[0.06] to-transparent',
    glow: 'bg-emerald-400/20',
    iconClass: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    rule: 'from-emerald-300/60',
  },
};

export default function Projects({ onOpenProject }) {
  return (
    <section id="projects" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            index="01"
            label="Tanlangan loyihalar"
            title="Ishlayotgan tizimlar."
            description="Har biri real muammo uchun qurilgan. Batafsil maʼlumotni oching yoki 3D xonada monitorlar oldiga boring."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const visual = VISUALS[project.id] ?? VISUALS.teachermuzaffar;
            const Icon = visual.icon;
            return (
              <Reveal key={project.id} delay={index * 90} className="h-full min-w-0">
                <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-ink-950/40 transition duration-500 hover:-translate-y-1 hover:border-slate-700 hover:shadow-[0_36px_90px_-55px_rgba(0,242,254,0.9)]">
                  <div className="relative h-40 shrink-0 overflow-hidden border-b border-slate-800/80">
                    <div className={`absolute inset-0 bg-gradient-to-br ${visual.surface}`} />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className={`absolute -right-10 -top-14 h-44 w-44 rounded-full blur-3xl ${visual.glow}`}
                    />

                    <div className="relative flex h-full flex-col justify-between p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                          System / {project.index}
                        </span>
                        <StatusBadge status={project.status} />
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                            {visual.kicker}
                          </p>
                          <h3 className="mt-1.5 break-words font-display text-[1.2rem] font-semibold leading-tight tracking-tight text-white">
                            {project.title}
                          </h3>
                        </div>
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition duration-500 group-hover:scale-105 ${visual.iconClass}`}
                        >
                          <Icon size={20} strokeWidth={1.7} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-electric/75">
                      {project.tagline}
                    </p>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
                      {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {project.stack.map((item) => (
                        <span key={item} className="chip">
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        type="button"
                        onClick={() => onOpenProject(project)}
                        aria-haspopup="dialog"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-4 py-2.5 text-[12.5px] font-medium text-slate-200 transition hover:border-electric/40 hover:bg-electric/[0.08] hover:text-white"
                      >
                        Batafsil maʼlumot
                        <ArrowUpRight
                          size={15}
                          className="text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric"
                        />
                      </button>
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${visual.rule} to-transparent opacity-70`}
                  />
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={220}>
          <p className="mt-8 font-mono text-[11px] text-slate-600">
            Koʻproq tajribalar va ochiq kodni{' '}
            <a
              href="https://github.com/revilend"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 underline decoration-slate-700 underline-offset-4 transition hover:text-electric"
            >
              GitHub
            </a>{' '}
            orqali topishingiz mumkin.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
