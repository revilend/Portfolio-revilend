import { ArrowUpRight } from 'lucide-react';
import { projects } from '../data/projects.js';
import SectionHeading from './SectionHeading.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function Projects({ onOpenProject }) {
  const handleSpotlight = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <section id="projects" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="container-x">
        <SectionHeading
          index="01"
          label="Tanlangan loyihalar"
          title="Ishlayotgan tizimlar."
          description="Har biri real muammo uchun qurilgan. Batafsil maʼlumotni oching yoki 3D xonada monitorlar oldiga boring."
        />

        <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.id}
              onPointerMove={handleSpotlight}
              className="group relative flex animate-rise flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:border-electric/30 hover:shadow-[0_36px_90px_-50px_rgba(0,242,254,0.85)]"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(0,242,254,0.10), transparent 65%)',
                }}
              />

              <div className="relative flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-slate-600">
                  /{project.index}
                </span>
                <StatusBadge status={project.status} />
              </div>

              <p className="relative mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-electric/80">
                {project.tagline}
              </p>
              <h3 className="relative mt-2 font-display text-xl font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-electric">
                {project.title}
              </h3>
              <p className="relative mt-3 text-[13.5px] leading-relaxed text-slate-400">
                {project.description}
              </p>

              <div className="relative mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>

              <div className="relative mt-auto pt-6">
                <button
                  type="button"
                  onClick={() => onOpenProject(project)}
                  aria-haspopup="dialog"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-[13px] font-medium text-slate-200 transition hover:border-electric/50 hover:bg-electric/10 hover:text-white"
                >
                  Batafsil maʼlumot
                  <ArrowUpRight
                    size={15}
                    className="text-slate-500 transition group-hover:text-electric"
                  />
                </button>
              </div>
            </article>
          ))}
        </div>

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
      </div>
    </section>
  );
}
