import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Box, FileText, Github, MessageCircle, Search } from 'lucide-react';

const SECTIONS = [
  { id: 'top', label: 'Bosh sahifa', hint: 'Hero', keywords: 'bosh home top yuqori' },
  {
    id: 'projects',
    label: 'Tanlangan loyihalar',
    hint: '01',
    keywords: 'loyiha projects ish bot oyin',
  },
  { id: 'arsenal', label: 'Texnologiyalar', hint: '02', keywords: 'texnologiya stack arsenal' },
  { id: 'about', label: 'Men haqimda', hint: '03', keywords: 'about men haqimda' },
  { id: 'contact', label: 'Bogʻlanish', hint: '04', keywords: 'contact aloqa xabar telegram' },
];

const LINKS = [
  {
    id: 'telegram',
    label: 'Telegram profilini ochish',
    hint: '@revilend',
    icon: MessageCircle,
    href: 'https://t.me/revilend',
    keywords: 'telegram chat aloqa',
  },
  {
    id: 'github',
    label: 'GitHub profilini ochish',
    hint: 'revilend',
    icon: Github,
    href: 'https://github.com/revilend',
    keywords: 'github kod repo',
  },
];

export default function CommandPalette({ open, mode, onClose, onNavigate, onModeChange }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const commands = useMemo(() => {
    const items = [
      ...SECTIONS.map((section) => ({
        ...section,
        group: 'Boʻlimlar',
        icon: ArrowRight,
        run: () => onNavigate(section.id),
      })),
      {
        id: 'mode-toggle',
        label: mode === '3d' ? '2D saytga qaytish' : '3D xonaga oʻtish',
        hint: 'Koʻrinish',
        group: 'Amallar',
        icon: mode === '3d' ? FileText : Box,
        keywords: '3d xona sayt rejim mode',
        run: () => onModeChange(mode === '3d' ? '2d' : '3d'),
      },
      ...LINKS.map((link) => ({
        ...link,
        group: 'Havolalar',
        run: () => window.open(link.href, '_blank', 'noopener,noreferrer'),
      })),
    ];

    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    return items.filter((item) =>
      `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase().includes(needle)
    );
  }, [mode, onModeChange, onNavigate, query]);

  useEffect(() => {
    if (!open) return undefined;

    setQuery('');
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const run = (command) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const handleKeyDown = (event) => {
    const count = commands.length;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (count ? (index + 1) % count : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (count ? (index - 1 + count) % count : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(commands[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110]">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex min-h-full items-start justify-center px-4 pt-[12vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buyruqlar paneli"
          onKeyDown={handleKeyDown}
          className="w-full max-w-lg animate-modal-in overflow-hidden rounded-2xl border border-slate-700/60 bg-ink-900/90 shadow-panel backdrop-blur-2xl"
        >
          <span
            aria-hidden="true"
            className="block h-px w-full bg-gradient-to-r from-transparent via-electric/70 to-transparent"
          />

          <div className="flex items-center gap-3 border-b border-slate-800/80 px-4">
            <Search size={15} className="shrink-0 text-slate-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Boʻlim yoki amalni qidiring…"
              aria-label="Buyruq qidirish"
              className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            <kbd className="hidden rounded border border-slate-700/80 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:block">
              ESC
            </kbd>
          </div>

          <ul role="listbox" aria-label="Buyruqlar" className="max-h-[52vh] overflow-y-auto p-2">
            {commands.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-slate-500">
                Hech narsa topilmadi.
              </li>
            ) : null}

            {commands.map((command, index) => {
              const Icon = command.icon;
              const isActive = index === active;
              const showGroup = index === 0 || commands[index - 1].group !== command.group;

              return (
                <li key={command.id}>
                  {showGroup ? (
                    <p className="px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-label text-slate-600">
                      {command.group}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => run(command)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition ${
                      isActive
                        ? 'bg-electric/10 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${
                        isActive
                          ? 'border-electric/40 text-electric'
                          : 'border-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{command.label}</span>
                    {command.hint ? (
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-label text-slate-600">
                        {command.hint}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 px-4 py-2 font-mono text-[10px] uppercase tracking-label text-slate-500">
            <span>↑ ↓ tanlash · ⏎ ochish</span>
            <span>⌘K / Ctrl+K</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
