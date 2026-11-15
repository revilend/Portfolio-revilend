import { Fragment, useMemo, useState } from 'react';
import { ArrowUpRight, Bot, ExternalLink, Gamepad2, Github, Globe2 } from 'lucide-react';
import { PROJECT_CATEGORIES, projects } from '../data/projects.js';
import { hasShots } from '../lib/projectShots.js';
import ProjectShot from './ProjectShot.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import SpotlightCard from './SpotlightCard.jsx';
import StatusBadge from './StatusBadge.jsx';

const VISUALS = {
  bot: {
    icon: Bot,
    kicker: 'Telegram / Avtomatlashtirish',
    surface: 'from-emerald-500/[0.18] via-teal-500/[0.06] to-transparent',
    glow: 'bg-emerald-400/20',
    iconClass: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    rule: 'from-emerald-300/60',
  },
  web: {
    icon: Globe2,
    kicker: 'Veb / Taʼlim',
    surface: 'from-cyan-500/[0.18] via-sky-500/[0.06] to-transparent',
    glow: 'bg-cyan-400/20',
    iconClass: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    rule: 'from-cyan-300/60',
  },
  game: {
    icon: Gamepad2,
    kicker: 'Oʻyin / Brauzer',
    surface: 'from-violet-500/[0.20] via-fuchsia-500/[0.06] to-transparent',
    glow: 'bg-violet-400/20',
    iconClass: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
    rule: 'from-violet-300/60',
  },
};

function ProjectCard({ project, featured = false, onOpen }) {
  const visual = VISUALS[project.category] ?? VISUALS.web;
  const Icon = visual.icon;

  return (
    <SpotlightCard
      as="article"
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-ink-950/40 transition duration-500 hover:-translate-y-1 hover:border-slate-700 hover:shadow-card-hover"
    >
      <div
        className={`relative shrink-0 overflow-hidden border-b border-slate-800/80 ${
          featured ? 'h-52 sm:h-64' : 'h-40'
        }`}
      >
        {hasShots(project) ? (
          <>
            <div className="absolute inset-0">
              <ProjectShot
                project={project}
                sizes={
                  featured
                    ? '(min-width: 1024px) 620px, 92vw'
                    : '(min-width: 1024px) 340px, (min-width: 768px) 46vw, 92vw'
                }
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
              className="absolute inset-0 opacity-[0.10] bg-grid [--grid:26px]"
            />
            <div
              aria-hidden="true"
              className={`absolute -right-8 -top-10 h-40 w-40 rounded-full blur-3xl ${visual.glow}`}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_110%,rgba(255,255,255,0.06),transparent_60%)]"
            />
            <span
              aria-hidden="true"
              className={`absolute inset-x-5 bottom-4 font-display font-bold leading-none tracking-tighter text-white/[0.09] ${
                featured ? 'text-[7rem]' : 'text-[4.5rem]'
              }`}
            >
              {project.index}
            </span>
          </>
        )}

        <div className="relative flex h-full items-end justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="font-mono text-2xs uppercase tracking-tag text-slate-300 [text-shadow:0_1px_6px_rgba(5,8,15,0.95)]">
              {visual.kicker}
            </p>
            <h3
              className={`mt-1.5 break-words font-display font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_10px_rgba(5,8,15,0.95)] ${
                featured ? 'text-xl sm:text-2xl' : 'text-[1.2rem]'
              }`}
            >
              {project.title}
            </h3>
          </div>
          <span
            className={`grid shrink-0 place-items-center rounded-xl border transition duration-500 group-hover:scale-105 ${
              visual.iconClass
            } ${featured ? 'h-12 w-12' : 'h-11 w-11'}`}
          >
            <Icon size={featured ? 22 : 20} strokeWidth={1.7} />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} />
          <span className="font-mono text-2xs uppercase tracking-label text-slate-500">
            System / {project.index}
          </span>
        </div>

        <p
          className={`mt-3 leading-relaxed text-slate-400 ${
            featured ? 'text-[14px]' : 'text-[13.5px]'
          }`}
        >
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <button
            type="button"
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
            className="btn-outline flex-1 sm:flex-none"
          >
            Batafsil maʼlumot
            <ArrowUpRight
              size={15}
              className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-electric"
            />
          </button>
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} — GitHub'da koʻrish`}
            className="btn-icon btn-icon-sm"
          >
            <Github size={15} />
          </a>
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} — jonli nusxani ochish`}
              className="btn-icon btn-icon-sm"
            >
              <ExternalLink size={15} />
            </a>
          ) : null}
        </div>
      </div>

      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${visual.rule} to-transparent opacity-70`}
      />
    </SpotlightCard>
  );
}

export default function Projects({ onOpenProject }) {
  const [category, setCategory] = useState('all');

  const counts = useMemo(() => {
    const tally = { all: projects.length };
    for (const project of projects) {
      tally[project.category] = (tally[project.category] ?? 0) + 1;
    }
    return tally;
  }, []);

  const visible = useMemo(
    () => (category === 'all' ? projects : projects.filter((p) => p.category === category)),
    [category]
  );

  return (
    <section id="projects" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            index="01"
            label="Tanlangan loyihalar"
            title="Ishlayotgan tizimlar."
            description="12 ta tugallangan loyiha: Telegram botlar, veb va taʼlim platformalari hamda brauzer oʻyinlari. Har birining manba kodi ochiq."
          />

          <div role="tablist" aria-label="Loyiha toifalari" className="mt-7 flex flex-wrap gap-1.5">
            {PROJECT_CATEGORIES.map((item) => {
              const isActive = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCategory(item.id)}
                  className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-2xs uppercase tracking-tag transition duration-300 ${
                    isActive
                      ? 'border-electric/45 bg-electric/10 text-white shadow-[0_10px_30px_-18px_rgba(0,242,254,0.9)]'
                      : 'border-slate-800/90 bg-ink-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                  <span
                    className={`rounded-full px-1.5 text-[10px] transition-colors ${
                      isActive ? 'bg-electric/20 text-electric' : 'bg-slate-800/70 text-slate-500'
                    }`}
                  >
                    {counts[item.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          key={category}
          className="mt-10 grid animate-fade-in grid-cols-1 gap-5 overflow-y-clip pb-6 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((project, index) => (
            <Fragment key={project.id}>
              <Reveal
                delay={index * 60}
                parallax={0.04 + (index % 3) * 0.02}
                className={`h-full min-w-0 ${project.featured ? 'lg:col-span-2' : ''}`}
              >
                <ProjectCard
                  project={project}
                  featured={Boolean(project.featured)}
                  onOpen={onOpenProject}
                />
              </Reveal>
            </Fragment>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 font-mono text-2xs uppercase tracking-label text-slate-500">
            Bu toifada loyiha yoʻq.
          </p>
        ) : null}

        <Reveal delay={200}>
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
