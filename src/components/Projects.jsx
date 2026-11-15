import { ArrowUpRight, Bot, Ghost, GraduationCap } from 'lucide-react';
import { projects } from '../data/projects.js';
import { hasShots } from '../lib/projectShots.js';
import ProjectShot from './ProjectShot.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import StatusBadge from './StatusBadge.jsx';

const VISUALS = {
  teachermuzaffar: {
    icon: GraduationCap,
    kicker: 'Taʼlim / Real vaqt',
    surface: 'from-cyan-500/[0.18] via-sky-500/[0.06] to-transparent',
    glow: 'bg-cyan-400/20',
    iconClass: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    rule: 'from-cyan-300/60',
  },
  'echoes-of-room-404': {
    icon: Ghost,
    kicker: '3D / Eksperimental',
    surface: 'from-violet-500/[0.20] via-fuchsia-500/[0.06] to-transparent',
    glow: 'bg-violet-400/20',
    iconClass: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
    rule: 'from-violet-300/60',
  },
  'telegram-automation': {
    icon: Bot,
    kicker: 'Avtomatlashtirish / Bulut',
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
                <article className="card card-hover group relative flex h-full min-w-0 flex-col overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-3">
                    <span className="font-mono text-2xs uppercase tracking-label text-slate-400">
                      System / {project.index}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="relative h-44 shrink-0 overflow-hidden border-b border-slate-800/80">
                    {hasShots(project) ? (
                      <>
                        <div className="absolute inset-0">
                          <ProjectShot
                            project={project}
                            sizes="(min-width: 1024px) 380px, (min-width: 768px) 46vw, 92vw"
                            className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                          />
                        </div>
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950/95 via-ink-950/55 to-transparent"
                        />
                      </>
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${visual.surface}`} />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 opacity-[0.12] bg-grid [--grid:28px]"
                        />
                        <div
                          aria-hidden="true"
                          className={`absolute -right-10 -top-14 h-44 w-44 rounded-full blur-3xl ${visual.glow}`}
                        />
                      </>
                    )}

                    <div className="relative flex h-full flex-col justify-end p-5">
                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-mono text-2xs uppercase tracking-tag text-slate-300 [text-shadow:0_1px_6px_rgba(5,8,15,0.95)]">
                            {visual.kicker}
                          </p>
                          <h3 className="mt-1.5 break-words font-display text-[1.2rem] font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_10px_rgba(5,8,15,0.95)]">
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
                    <p className="font-mono text-2xs uppercase tracking-label text-electric/75">
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
                        className="btn-outline"
                      >
                        Batafsil maʼlumot
                        <ArrowUpRight
                          size={15}
                          className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric"
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
          <p className="mt-8 font-mono text-2xs text-slate-400">
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
