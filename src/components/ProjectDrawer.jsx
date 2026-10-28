import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ExternalLink, X } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function ProjectDrawer({ project, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;
    const previousFocus = document.activeElement;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95]">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-drawer-in flex-col border-l border-slate-800/80 bg-ink-900/95 shadow-2xl backdrop-blur-xl"
      >
        <div className="h-1 w-full bg-gradient-to-r from-electric via-cyan-300 to-plasma" aria-hidden="true" />

        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              /{project.index}
            </span>
            <span className="mono-label">Loyiha tafsilotlari</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-ink-950/80 text-slate-400 transition hover:border-slate-700 hover:text-white"
            aria-label="Loyiha panelini yopish"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-electric">
              {project.tagline}
            </span>
            <span className="text-slate-700">/</span>
            <StatusBadge status={project.status} />
          </div>

          <h3
            id="project-drawer-title"
            className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-[28px]"
          >
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{project.description}</p>

          <div className="mt-8">
            <p className="mono-label">Texnologiyalar</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="mono-label">Asosiy imkoniyatlar</p>
            <ul className="mt-3 space-y-2.5">
              {project.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-slate-300">
                  <Check size={14} className="mt-0.5 shrink-0 text-electric" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 bg-ink-950/60 px-5 py-4 sm:px-7">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full px-5 py-3 text-[13px]"
            >
              Saytni ochish
              <ExternalLink size={15} />
            </a>
          ) : (
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-plasma" />
              Yopiq loyiha · soʻrov boʻyicha namoyish
            </p>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}
