import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Github, X } from 'lucide-react';
import { trapTabKey } from '../lib/focusTrap.js';
import { hasShots } from '../lib/projectShots.js';
import ProjectShot from './ProjectShot.jsx';
import StatusBadge from './StatusBadge.jsx';

/**
 * Project detail as a centered glass panel. Deep links still open it, Escape and
 * the backdrop close it, and focus stays inside while it is open.
 */
export default function ProjectDrawer({ project, onClose }) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;
    const previousFocus = document.activeElement;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      trapTabKey(event, panelRef.current);
    };
    document.addEventListener('keydown', handleKey);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  const caseStudy = project.problem && project.decisions?.length ? project : null;

  return createPortal(
    <div className="fixed inset-0 z-[95] overflow-y-auto">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-drawer-title"
          className="relative flex max-h-[88vh] w-full max-w-2xl animate-modal-in flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-ink-900/85 shadow-panel backdrop-blur-2xl"
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/70 to-transparent"
          />

          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-2xs uppercase tracking-label text-slate-400">
                  /{project.index}
                </span>
                <span className="font-mono text-2xs uppercase tracking-tag text-electric">
                  {project.tagline}
                </span>
                <StatusBadge status={project.status} />
              </div>
              <h3
                id="project-drawer-title"
                className="mt-2.5 break-words font-display text-2xl font-semibold tracking-tight text-white sm:text-[28px]"
              >
                {project.title}
              </h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-ink-950/80 text-slate-400 transition hover:border-slate-700 hover:text-white"
              aria-label="Loyiha panelini yopish"
            >
              <X size={16} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-7">
            <p className="text-sm leading-relaxed text-slate-300">{project.description}</p>

            {hasShots(project) ? (
              <figure className="mt-5 overflow-hidden rounded-xl border border-slate-800/80 bg-ink-950">
                <ProjectShot
                  project={project}
                  sizes="(min-width: 640px) 620px, 92vw"
                  className="h-auto w-full object-cover"
                />
                <figcaption className="border-t border-slate-800/80 px-3 py-2 font-mono text-2xs uppercase tracking-label text-slate-500">
                  {project.shots.caption}
                </figcaption>
              </figure>
            ) : null}

            <div className="mt-6">
              <p className="mono-label">Texnologiyalar</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {caseStudy ? (
              <>
                <div className="mt-7">
                  <p className="mono-label">Muammo va cheklovlar</p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-slate-300">
                    {project.problem}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {project.constraints.map((constraint) => (
                      <li key={constraint} className="chip">
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  <p className="mono-label">Arxitektura qarorlari</p>
                  <ol className="mt-3 space-y-4">
                    {project.decisions.map((decision, position) => (
                      <li key={decision.choice} className="border-l border-slate-800 pl-3.5">
                        <p className="flex items-baseline gap-2 text-[13.5px] font-medium text-white">
                          <span className="font-mono text-2xs tracking-label text-electric/70">
                            {String(position + 1).padStart(2, '0')}
                          </span>
                          {decision.choice}
                        </p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
                          {decision.why}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-7">
                  <p className="mono-label">Natija raqamlarda</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2.5">
                    {project.results.map((result) => (
                      <div
                        key={result.label}
                        className="rounded-xl border border-slate-800/80 bg-ink-950/60 px-3 py-2.5"
                      >
                        <dt className="font-display text-lg font-semibold tracking-tight text-white">
                          {result.value}
                        </dt>
                        <dd className="mt-0.5 font-mono text-2xs uppercase leading-snug tracking-tag text-slate-400">
                          {result.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800/80 bg-ink-950/60 px-5 py-4 sm:flex-row sm:px-7">
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 px-4 py-2.5 text-[13px]"
            >
              <Github size={15} />
              GitHubʼda koʻrish ↗
            </a>
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 px-4 py-2.5 text-[13px]"
              >
                Ochish
                <ExternalLink size={15} />
              </a>
            ) : (
              <p className="flex items-center gap-2 self-center px-1 font-mono text-2xs uppercase tracking-tag text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-plasma" />
                Faqat manba kodi
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
