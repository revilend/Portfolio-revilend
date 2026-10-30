import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BatteryFull,
  Bot,
  Calculator,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Folder,
  Ghost,
  Github,
  GraduationCap,
  HardDrive,
  LayoutGrid,
  LogOut,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  Monitor,
  Search,
  Settings,
  StickyNote,
  Terminal,
  Trash2,
  User,
  Volume2,
  Wifi,
  X,
} from 'lucide-react';
import { projects } from '../data/projects.js';
import {
  CalendarFlyout,
  CalculatorApp,
  DesktopContextMenu,
  DesktopWallpaper,
  NotepadApp,
  QuickSettings,
  SettingsApp,
  loadWindowsSettings,
  saveWindowsSettings,
} from './Windows11Apps.jsx';

const PROJECT_ACCENTS = {
  teachermuzaffar: {
    gradient: 'linear-gradient(135deg, #06283d 0%, #0e7490 58%, #0f766e 100%)',
    accent: '#0e7490',
    soft: '#e0f2fe',
  },
  'echoes-of-room-404': {
    gradient: 'linear-gradient(135deg, #160a2c 0%, #4c1d95 56%, #831843 100%)',
    accent: '#7c3aed',
    soft: '#f3e8ff',
  },
  'telegram-automation': {
    gradient: 'linear-gradient(135deg, #04231f 0%, #047857 58%, #0f766e 100%)',
    accent: '#059669',
    soft: '#d1fae5',
  },
};

const PROJECT_LINKS = {
  teachermuzaffar: {
    href: 'https://teachermuzaffar.uz',
    label: 'Jonli saytni ochish',
    icon: ExternalLink,
  },
  'echoes-of-room-404': {
    href: 'https://github.com/revilend',
    label: "GitHub'da ochish",
    icon: Github,
  },
  'telegram-automation': {
    href: 'https://t.me/revilend',
    label: "Telegram'da ochish",
    icon: MessageCircle,
  },
};

const APPS = {
  teachermuzaffar: {
    label: 'teachermuzaffar.uz',
    short: 'Taʼlim portali',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)',
  },
  'echoes-of-room-404': {
    label: 'Echoes of Room 404',
    short: '3D oʻyin',
    icon: Ghost,
    gradient: 'linear-gradient(135deg, #8b5cf6, #be185d)',
  },
  'telegram-automation': {
    label: 'Telegram Auto-Bots',
    short: 'Telegram bot',
    icon: Bot,
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
  },
  terminal: {
    label: 'Windows Terminal (CMD)',
    short: 'Terminal',
    icon: Terminal,
    gradient: 'linear-gradient(135deg, #475569, #020617)',
  },
  notepad: {
    label: 'Notepad',
    short: 'Matn muharriri',
    icon: StickyNote,
    gradient: 'linear-gradient(135deg, #38bdf8, #1d4ed8)',
  },
  calculator: {
    label: 'Kalkulyator',
    short: 'Calculator',
    icon: Calculator,
    gradient: 'linear-gradient(135deg, #475569, #0f172a)',
  },
  'this-pc': {
    label: 'Bu kompyuter',
    short: 'This PC',
    icon: Monitor,
    gradient: 'linear-gradient(135deg, #38bdf8, #0369a1)',
  },
  settings: {
    label: 'Sozlamalar',
    short: 'Settings',
    icon: Settings,
    gradient: 'linear-gradient(135deg, #94a3b8, #334155)',
  },
  'recycle-bin': {
    label: 'Savatcha',
    short: 'Recycle Bin',
    icon: Trash2,
    gradient: 'linear-gradient(135deg, #94a3b8, #475569)',
  },
};

const APP_IDS = [
  'teachermuzaffar',
  'echoes-of-room-404',
  'telegram-automation',
  'terminal',
  'notepad',
  'calculator',
  'this-pc',
  'settings',
  'recycle-bin',
];

const TASKBAR_IDS = [
  'teachermuzaffar',
  'echoes-of-room-404',
  'telegram-automation',
  'terminal',
  'this-pc',
];

const PROJECT_IDS = new Set([
  'teachermuzaffar',
  'echoes-of-room-404',
  'telegram-automation',
]);

const WINDOW_SIZES = {
  teachermuzaffar: { width: 760, height: 548 },
  'echoes-of-room-404': { width: 720, height: 536 },
  'telegram-automation': { width: 720, height: 514 },
  terminal: { width: 720, height: 456 },
  notepad: { width: 720, height: 500 },
  calculator: { width: 372, height: 552 },
  'this-pc': { width: 780, height: 520 },
  settings: { width: 760, height: 540 },
  'recycle-bin': { width: 560, height: 390 },
};

const MIN_WINDOW_SIZES = {
  calculator: { w: 340, h: 450 },
  notepad: { w: 360, h: 300 },
  settings: { w: 360, h: 340 },
  terminal: { w: 340, h: 280 },
  'this-pc': { w: 340, h: 300 },
};

const TASKBAR_HEIGHT = 48;
const TIME_FORMAT = new Intl.DateTimeFormat('uz-UZ', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Tashkent',
});
const DATE_FORMAT = new Intl.DateTimeFormat('uz-UZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Tashkent',
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function WindowsMark({ className = '' }) {
  return (
    <span aria-hidden="true" className={`grid grid-cols-2 gap-[2px] ${className}`}>
      <span className="rounded-[1px] bg-[#5dbaff]" />
      <span className="rounded-[1px] bg-[#5dbaff]" />
      <span className="rounded-[1px] bg-[#5dbaff]" />
      <span className="rounded-[1px] bg-[#5dbaff]" />
    </span>
  );
}

function AppIcon({ appId, className = 'h-10 w-10', iconSize = 19 }) {
  const app = APPS[appId];
  if (!app) return null;
  const Icon = app.icon;
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-[9px] text-white shadow-[0_5px_14px_-5px_rgba(2,6,23,0.75),inset_0_1px_0_rgba(255,255,255,0.28)] ring-1 ring-white/15 ${className}`}
      style={{ backgroundImage: app.gradient }}
    >
      <Icon size={iconSize} strokeWidth={1.8} />
    </span>
  );
}

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1280 : window.innerWidth,
    height: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return viewport;
}

const RESIZE_HANDLES = {
  n: 'top-0 left-2 right-2 h-1.5 cursor-ns-resize',
  s: 'bottom-0 left-2 right-2 h-1.5 cursor-ns-resize',
  e: 'right-0 top-2 bottom-2 w-1.5 cursor-ew-resize',
  w: 'left-0 top-2 bottom-2 w-1.5 cursor-ew-resize',
  ne: 'right-0 top-0 h-3 w-3 cursor-nesw-resize',
  nw: 'left-0 top-0 h-3 w-3 cursor-nwse-resize',
  se: 'right-0 bottom-0 h-3 w-3 cursor-nwse-resize',
  sw: 'left-0 bottom-0 h-3 w-3 cursor-nesw-resize',
};

function ResizeHandle({ direction, win, onFocus, onResize }) {
  const resizeRef = useRef(null);
  const minimum = MIN_WINDOW_SIZES[win.appId] ?? { w: 320, h: 220 };
  const MIN_WIDTH = minimum.w;
  const MIN_HEIGHT = minimum.h;

  const start = (event) => {
    if (win.maximized || win.snap || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onFocus(win.id);
    resizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: win.x,
      y: win.y,
      w: win.w,
      h: win.h,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is optional. */
    }
  };

  const move = (event) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    event.preventDefault();

    const dx = event.clientX - resize.startX;
    const dy = event.clientY - resize.startY;
    let nextX = resize.x;
    let nextY = resize.y;
    let nextW = resize.w;
    let nextH = resize.h;

    if (direction.includes('e')) {
      nextW = clamp(resize.w + dx, MIN_WIDTH, window.innerWidth - resize.x);
    }
    if (direction.includes('w')) {
      nextW = clamp(resize.w - dx, MIN_WIDTH, resize.x + resize.w);
      nextX = resize.x + resize.w - nextW;
    }
    if (direction.includes('s')) {
      nextH = clamp(
        resize.h + dy,
        MIN_HEIGHT,
        window.innerHeight - TASKBAR_HEIGHT - resize.y
      );
    }
    if (direction.includes('n')) {
      nextH = clamp(resize.h - dy, MIN_HEIGHT, resize.y + resize.h);
      nextY = resize.y + resize.h - nextH;
    }

    onResize(win.id, { x: nextX, y: nextY, w: nextW, h: nextH });
  };

  const end = (event) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is optional. */
    }
  };

  return (
    <span
      aria-hidden="true"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      className={`absolute z-20 touch-none select-none hover:bg-sky-400/40 ${RESIZE_HANDLES[direction]}`}
    />
  );
}

function WindowFrame({
  win,
  app,
  onFocus,
  onMove,
  onDragEnd,
  onResize,
  onClose,
  onMinimize,
  onToggleMaximize,
  children,
}) {
  const dragRef = useRef(null);

  const beginDrag = (event) => {
    if (win.maximized || win.snap || event.button !== 0) return;
    if (event.target.closest('button')) return;
    onFocus(win.id);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: win.x,
      originY: win.y,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is optional. */
    }
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    onMove(
      win.id,
      drag.originX + (event.clientX - drag.startX),
      drag.originY + (event.clientY - drag.startY)
    );
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Pointer capture is optional. */
    }
    onDragEnd(win.id, event.clientX, event.clientY);
  };

  const style = win.maximized
    ? {
        left: 0,
        top: 0,
        width: '100%',
        height: `calc(100% - ${TASKBAR_HEIGHT}px)`,
        zIndex: win.z,
      }
    : win.snap
      ? {
          left: win.snap === 'right' ? '50%' : 0,
          top: 0,
          width: '50%',
          height: `calc(100% - ${TASKBAR_HEIGHT}px)`,
          zIndex: win.z,
        }
      : {
          left: win.x,
          top: win.y,
          width: win.w,
          height: win.h,
          zIndex: win.z,
        };

  return (
    <section
      data-window
      role="dialog"
      aria-label={`${app.label} oynasi`}
      aria-hidden={win.minimized || undefined}
      style={style}
      onPointerDown={() => onFocus(win.id)}
      className={`pointer-events-auto absolute flex min-w-0 flex-col overflow-hidden border border-white/30 bg-white text-slate-900 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.8)] animate-rise ${
        win.minimized ? 'hidden' : ''
      } ${win.maximized || win.snap ? 'rounded-none' : 'rounded-xl'}`}
    >
      <header
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => onToggleMaximize(win.id)}
        className="flex h-10 shrink-0 touch-none select-none items-center gap-2 border-b border-slate-200 bg-[#f2f5f9]/95 px-2.5"
      >
        <AppIcon appId={win.appId} className="h-5 w-5 rounded-[5px]" iconSize={11} />
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-600 sm:text-xs">
          {app.label}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label="Oynani minimallashtirish"
            onClick={() => onMinimize(win.id)}
            onPointerDown={(event) => event.stopPropagation()}
            className="grid h-7 w-8 place-items-center rounded text-slate-500 transition hover:bg-slate-300/70 hover:text-slate-900"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            aria-label={win.maximized ? 'Oynani tiklash' : 'Oynani kattalashtirish'}
            onClick={() => onToggleMaximize(win.id)}
            onPointerDown={(event) => event.stopPropagation()}
            className="grid h-7 w-8 place-items-center rounded text-slate-500 transition hover:bg-slate-300/70 hover:text-slate-900"
          >
            {win.maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            type="button"
            aria-label="Oynani yopish"
            onClick={() => onClose(win.id)}
            onPointerDown={(event) => event.stopPropagation()}
            className="grid h-7 w-9 place-items-center rounded text-slate-500 transition hover:bg-[#c42b1c] hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 select-text overflow-hidden">{children}</div>

      {!win.maximized && !win.snap
        ? Object.keys(RESIZE_HANDLES).map((direction) => (
            <ResizeHandle
              key={direction}
              direction={direction}
              win={win}
              onFocus={onFocus}
              onResize={onResize}
            />
          ))
        : null}
    </section>
  );
}

function ProjectApp({ project, onOpenProject }) {
  const meta = PROJECT_ACCENTS[project.id];
  const link = PROJECT_LINKS[project.id];
  const LinkIcon = link?.icon ?? ExternalLink;

  return (
    <div className="flex h-full flex-col bg-[#f7f9fc] text-slate-900">
      <div
        className="relative shrink-0 overflow-hidden px-4 py-4 text-white sm:px-6 sm:py-5"
        style={{ backgroundImage: meta.gradient }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-20 h-52 w-52 rounded-full border border-white/10 bg-white/10 blur-2xl"
        />
        <div className="relative flex items-start gap-3">
          <AppIcon appId={project.id} className="h-11 w-11 sm:h-12 sm:w-12" iconSize={22} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">
                {project.tagline}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {project.status.label}
              </span>
            </div>
            <h2 className="mt-1.5 break-words font-display text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">
              {project.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-white/70 sm:text-xs">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      <div className="light-scroll min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-[13px] font-semibold text-slate-900">Loyiha haqida</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{project.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] leading-4 text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <aside className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
              Tashqi havola
            </p>
            {link ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-110"
                style={{ backgroundColor: meta.accent }}
              >
                {link.label}
                <LinkIcon size={14} />
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => onOpenProject(project.id)}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Batafsil maʼlumot
              <ArrowUpRight size={14} />
            </button>

            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">Holat</dt>
                <dd className="font-medium text-slate-700">{project.status.label}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">Stack</dt>
                <dd className="font-medium text-slate-700">{project.stack.length} texnologiya</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-400">Imkoniyatlar</dt>
                <dd className="font-medium text-slate-700">{project.features.length} ta</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-[13px] font-semibold text-slate-900">Asosiy imkoniyatlar</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {project.features.map((feature) => (
              <li key={feature} className="flex min-w-0 items-start gap-2 text-[12px] text-slate-600">
                <Check size={13} className="mt-0.5 shrink-0" style={{ color: meta.accent }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

const TERMINAL_INTRO = [
  { type: 'system', text: 'Microsoft Windows [Version 11.0]' },
  { type: 'system', text: '(c) Revilend. Barcha huquqlar himoyalangan.' },
  { type: 'blank' },
  { type: 'system', text: 'Yordam uchun "help" buyrugʻini kiriting.' },
  { type: 'blank' },
];

const TERMINAL_ALIASES = {
  teacher: 'teachermuzaffar',
  'teachermuzaffar': 'teachermuzaffar',
  'teachermuzaffar.uz': 'teachermuzaffar',
  echoes: 'echoes-of-room-404',
  'echoes-of-room-404': 'echoes-of-room-404',
  '404': 'echoes-of-room-404',
  telegram: 'telegram-automation',
  bot: 'telegram-automation',
  'telegram-automation': 'telegram-automation',
  terminal: 'terminal',
  'this-pc': 'this-pc',
  thispc: 'this-pc',
};

function TerminalApp({ onOpenApp, onClose }) {
  const [lines, setLines] = useState(TERMINAL_INTRO);
  const [value, setValue] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const execute = (rawInput) => {
    const raw = rawInput.trim();
    setValue('');
    if (!raw) return;

    const [name, ...args] = raw.split(/\s+/);
    const command = name.toLowerCase();
    let output = [];

    if (command === 'clear' || command === 'cls') {
      setLines([]);
      return;
    }

    if (command === 'help') {
      output = [
        'Mavjud buyruqlar:',
        '  help ................ yordam',
        '  projects ............ loyihalar roʻyxati',
        '  open <loyiha> ....... loyihani ochish',
        '  whoami .............. developer profili',
        '  date ................ sana va vaqt',
        '  clear ............... ekranni tozalash',
        '  exit ................ terminalni yopish',
        '',
        'Masalan: open teacher',
      ];
    } else if (command === 'projects') {
      output = [
        '01  teachermuzaffar.uz      live        teachermuzaffar.uz',
        '02  Echoes of Room 404      prototype   github.com/revilend',
        '03  Telegram Auto-Bots      production  t.me/revilend',
        '',
        'Ochish: open teacher | open echoes | open telegram',
      ];
    } else if (command === 'open') {
      const target = TERMINAL_ALIASES[(args[0] ?? '').toLowerCase()];
      if (target && APPS[target]) {
        onOpenApp(target);
        output = [`Ochilmoqda: ${APPS[target].label}`];
      } else {
        output = ['Foydalanish: open teacher | open echoes | open telegram'];
      }
    } else if (command === 'whoami') {
      output = [
        'Revilend — creative developer',
        'Toshkent, Uzbekistan',
        '3D web · full-stack · automation',
        'telegram: t.me/revilend',
        'github: github.com/revilend',
      ];
    } else if (command === 'date') {
      output = [
        new Intl.DateTimeFormat('uz-UZ', {
          dateStyle: 'full',
          timeStyle: 'medium',
          timeZone: 'Asia/Tashkent',
        }).format(new Date()),
      ];
    } else if (command === 'exit') {
      onClose();
      return;
    } else {
      output = [`'${raw}' buyrugʻi tanilmadi. "help" ni sinab koʻring.`];
    }

    setLines((previous) => [
      ...previous,
      { type: 'prompt', text: raw },
      ...output.map((text) => ({ type: text ? 'output' : 'blank', text })),
    ]);
  };

  const submit = (event) => {
    event.preventDefault();
    execute(value);
  };

  const shortcut = (command) => {
    execute(command);
  };

  return (
    <div className="flex h-full flex-col bg-[#0c0c0c] text-[#d4d4d4]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#1b1b1b] px-3 py-1.5 text-[10px] text-slate-400">
        <Terminal size={13} className="text-electric" />
        <span className="font-medium text-slate-300">Command Prompt</span>
        <span className="text-slate-600">—</span>
        <span className="truncate">revilend@REVILEND-PC</span>
      </div>

      <div
        ref={logRef}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5 font-mono text-[11px] leading-[1.7] sm:px-4 sm:text-[12px]"
      >
        {lines.map((line, index) => {
          if (line.type === 'blank') return <div key={`blank-${index}`} className="h-3" />;
          if (line.type === 'prompt') {
            return (
              <div key={`prompt-${index}`} className="break-words">
                <span className="text-emerald-400">C:\Users\Revilend&gt;</span>{' '}
                <span className="text-slate-200">{line.text}</span>
              </div>
            );
          }
          return (
            <pre
              key={`line-${index}`}
              className={`whitespace-pre-wrap break-words font-mono ${
                line.type === 'system' ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {line.text}
            </pre>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-[#111111] px-3 py-2 sm:px-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {['help', 'projects', 'open teacher', 'clear'].map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => shortcut(command)}
              className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-slate-400 transition hover:border-electric/40 hover:text-electric"
            >
              {command}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 font-mono text-[11px] sm:text-[12px]">
          <label htmlFor="windows-terminal-input" className="shrink-0 text-emerald-400">
            C:\Users\Revilend&gt;
          </label>
          <input
            id="windows-terminal-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Terminal buyrugʻi"
            className="min-w-0 flex-1 bg-transparent text-slate-200 caret-emerald-400 outline-none placeholder:text-slate-600"
            placeholder="buyruq kiriting…"
          />
        </form>
      </div>
    </div>
  );
}

function ThisPCApp({ onOpenApp }) {
  return (
    <div className="flex h-full bg-[#f7f9fc] text-slate-900">
      <aside className="hidden w-40 shrink-0 flex-col gap-1 border-r border-slate-200 bg-[#eef3f9] p-3 sm:flex">
        <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm">
          <Monitor size={14} className="text-sky-600" />
          Bu kompyuter
        </div>
        {['Tez kirish', 'Ish stoli', 'Hujjatlar', 'Yuklamalar', 'Rasmlar'].map((item) => (
          <span key={item} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-slate-500">
            {item === 'Rasmlar' ? <FileText size={13} /> : <Folder size={13} />}
            {item}
          </span>
        ))}
      </aside>

      <div className="light-scroll min-w-0 flex-1 overflow-y-auto p-3.5 sm:p-5">
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
          <span>Bu kompyuter</span>
          <ChevronRight size={11} />
          <span className="font-medium text-slate-600">Revilend</span>
        </div>

        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-slate-900">
          Qurilmalar va disklar
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600">
              <HardDrive size={19} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-800">Windows (C:)</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Tizim diski · SSD</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-600">
              <User size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-800">Revilend</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Foydalanuvchi profili</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
            Loyiha papkalari
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
            3 ta loyiha
          </span>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => onOpenApp(project.id)}
              className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <AppIcon appId={project.id} className="h-9 w-9" iconSize={17} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-semibold text-slate-800 group-hover:text-sky-700">
                  {project.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                  {project.tagline}
                </span>
              </span>
              <ArrowUpRight
                size={13}
                className="mt-1 shrink-0 text-slate-300 transition group-hover:text-sky-600"
              />
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
            Hujjatlar
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
            Revilend
          </span>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onOpenApp('notepad')}
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
              <FileText size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold text-slate-800 group-hover:text-sky-700">
                revilend-notes.txt
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                Matn fayli · Notepad
              </span>
            </span>
            <ArrowUpRight
              size={13}
              className="shrink-0 text-slate-300 transition group-hover:text-sky-600"
            />
          </button>
          <button
            type="button"
            onClick={() => onOpenApp('settings')}
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
              <Settings size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold text-slate-800 group-hover:text-sky-700">
                Windows sozlamalari
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                Fon · yorqinlik · tarmoq
              </span>
            </span>
            <ArrowUpRight
              size={13}
              className="shrink-0 text-slate-300 transition group-hover:text-sky-600"
            />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white/70 p-3 text-[10px] leading-relaxed text-slate-500">
          <LayoutGrid size={13} className="mt-0.5 shrink-0 text-slate-400" />
          Ish stolidagi piktogrammalar ham toʻgʻridan-toʻgʻri loyiha oynalarini ochadi.
        </div>
      </div>
    </div>
  );
}

function RecycleBinApp({ onOpenApp }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#f7f9fc] p-6 text-center text-slate-900">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <Trash2 size={28} />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">Savatcha boʻsh</h3>
      <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-slate-500">
        Oʻchirilgan fayllar yoʻq. Bu virtual Windows muhitida hamma loyiha fayllari joyida.
      </p>
      <button
        type="button"
        onClick={() => onOpenApp('this-pc')}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-[11px] font-medium text-white transition hover:bg-slate-700"
      >
        <Monitor size={13} />
        Bu kompyuterni ochish
      </button>
    </div>
  );
}

function StartMenu({ query, onQueryChange, onOpenApp }) {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? APP_IDS.filter((id) =>
        `${APPS[id].label} ${APPS[id].short}`.toLowerCase().includes(normalized)
      )
    : APP_IDS;

  return (
    <aside
      data-panel
      role="dialog"
      aria-label="Start menyusi"
      className="absolute bottom-14 left-1/2 z-[56] w-[min(94vw,35rem)] -translate-x-1/2 animate-fade-in overflow-hidden rounded-2xl border border-white/60 bg-[#f5f8fc]/95 text-slate-900 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
    >
      <div className="light-scroll max-h-[calc(100vh-6.5rem)] overflow-y-auto p-4 sm:p-5">
        <label className="flex h-9 items-center gap-2 rounded-full border border-slate-300/80 bg-white px-3 text-slate-500 shadow-inner focus-within:border-sky-400">
          <Search size={14} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ilovalarni qidirish"
            aria-label="Ilovalarni qidirish"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold text-slate-700">
            {normalized ? 'Qidiruv natijalari' : 'Barcha ilovalar'}
          </p>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
            {filtered.length} ta
          </span>
        </div>

        {filtered.length ? (
          <div className="mt-2 grid grid-cols-3 gap-1 sm:grid-cols-4">
            {filtered.map((appId) => (
              <button
                key={appId}
                type="button"
                onClick={() => onOpenApp(appId)}
                className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center transition hover:bg-white hover:shadow-sm"
              >
                <AppIcon appId={appId} className="h-10 w-10" iconSize={19} />
                <span className="line-clamp-2 w-full break-words text-[10px] font-medium leading-tight text-slate-700">
                  {APPS[appId].label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-[11px] text-slate-500">
            Hech narsa topilmadi. Boshqa nom bilan qidirib koʻring.
          </p>
        )}

        {!normalized ? (
          <>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold text-slate-700">Tavsiya etilgan</p>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
                Workspace
              </span>
            </div>
            <div className="mt-1.5 grid gap-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onOpenApp(project.id)}
                  className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-white"
                >
                  <AppIcon appId={project.id} className="h-8 w-8 rounded-[7px]" iconSize={15} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium text-slate-800">
                      {project.title}
                    </span>
                    <span className="block truncate text-[9.5px] text-slate-400">
                      {project.tagline} · {project.status.label}
                    </span>
                  </span>
                  <ArrowUpRight size={13} className="shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white/70 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric to-plasma font-display text-[11px] font-bold text-ink-950">
            R
          </span>
          <span className="min-w-0">
            <span className="block text-[10.5px] font-semibold text-slate-800">Revilend</span>
            <span className="block truncate text-[9px] text-slate-400">Toshkent, Uzbekistan</span>
          </span>
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400">
          Windows 11
        </span>
      </footer>
    </aside>
  );
}

function Taskbar({ windows, startOpen, tray, onStart, onTaskbar, onQuick, onCalendar, now }) {
  const topVisibleZ = Math.max(
    0,
    ...windows.filter((window) => !window.minimized).map((window) => window.z)
  );
  const taskbarIds = [...TASKBAR_IDS, ...windows.map((window) => window.appId)].filter(
    (appId, index, list) => APPS[appId] && list.indexOf(appId) === index
  );

  return (
    <nav
      data-taskbar
      aria-label="Windows taskbar"
      className="absolute inset-x-0 bottom-0 z-[60] flex h-12 items-center gap-1 border-t border-white/15 bg-[#0b1827]/85 px-1 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:gap-1.5 sm:px-2.5"
    >
      <button
        type="button"
        aria-label="Start menyusi"
        aria-expanded={startOpen}
        onClick={onStart}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
          startOpen ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        <WindowsMark className="h-[17px] w-[17px]" />
      </button>

      <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto sm:gap-1">
        {taskbarIds.map((appId) => {
          const app = APPS[appId];
          const openWindow = windows.find((window) => window.appId === appId);
          const active = openWindow && !openWindow.minimized && openWindow.z === topVisibleZ;
          return (
            <button
              key={appId}
              type="button"
              title={app.label}
              aria-label={app.label}
              onClick={() => onTaskbar(appId)}
              className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-lg transition sm:h-10 sm:w-10 ${
                active ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <AppIcon appId={appId} className="h-7 w-7 rounded-[7px]" iconSize={15} />
              {openWindow ? (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0.5 h-[2px] rounded-full transition-all ${
                    active ? 'w-4 bg-sky-300' : 'w-2 bg-slate-400'
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Tez sozlamalar"
        aria-expanded={tray === 'quick'}
        onClick={onQuick}
        className={`flex h-9 shrink-0 items-center gap-1 rounded-lg px-1.5 text-slate-300 transition sm:gap-1.5 sm:px-2 ${
          tray === 'quick' ? 'bg-white/20 text-white' : 'hover:bg-white/10'
        }`}
      >
        <Wifi size={12} aria-hidden="true" />
        <Volume2 size={12} aria-hidden="true" />
        <BatteryFull size={14} aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Kalendar va vaqt"
        aria-expanded={tray === 'calendar'}
        onClick={onCalendar}
        className={`shrink-0 rounded-md px-1 py-1 text-right leading-tight transition ${
          tray === 'calendar' ? 'bg-white/15' : 'hover:bg-white/10'
        }`}
      >
        <span className="block font-mono text-[11px] font-medium tabular-nums text-white">
          {TIME_FORMAT.format(now)}
        </span>
        <span className="hidden text-[9px] text-slate-400 sm:block">{DATE_FORMAT.format(now)}</span>
      </button>
    </nav>
  );
}

export default function ComputerScreen({ onStandUp, onOpenProject, drawerOpen = false }) {
  const viewport = useViewport();
  const [now, setNow] = useState(() => new Date());
  const [startOpen, setStartOpen] = useState(false);
  const [startQuery, setStartQuery] = useState('');
  const [windows, setWindows] = useState([]);
  const [settings, setSettings] = useState(loadWindowsSettings);
  const [tray, setTray] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const zCounterRef = useRef(10);
  const windowSeqRef = useRef(0);

  const closeSurfaces = useCallback(() => {
    setStartOpen(false);
    setStartQuery('');
    setTray(null);
    setContextMenu(null);
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  }, []);

  useEffect(() => {
    saveWindowsSettings(settings);
  }, [settings]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setWindows((previous) =>
      previous.map((win) => {
        const width = Math.min(win.w, viewport.width - 12);
        const height = Math.min(win.h, viewport.height - 104);
        return {
          ...win,
          w: width,
          h: height,
          x: clamp(win.x, 0, Math.max(0, viewport.width - width)),
          y: clamp(win.y, 0, Math.max(0, viewport.height - TASKBAR_HEIGHT - height)),
        };
      })
    );
  }, [viewport.width, viewport.height]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key !== 'Escape' || drawerOpen) return;
      if (startOpen) {
        setStartOpen(false);
        return;
      }
      if (tray) {
        setTray(null);
        return;
      }
      if (contextMenu) {
        setContextMenu(null);
        return;
      }
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      onStandUp();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [drawerOpen, startOpen, tray, contextMenu, onStandUp]);

  const openApp = useCallback(
    (appId) => {
      if (!APPS[appId]) return;
      closeSurfaces();
      const nextZ = ++zCounterRef.current;
      const sequence = ++windowSeqRef.current;

      setWindows((previous) => {
        const existing = previous.find((win) => win.appId === appId);
        if (existing) {
          return previous.map((win) =>
            win.id === existing.id ? { ...win, minimized: false, z: nextZ } : win
          );
        }

        const preferred = WINDOW_SIZES[appId] ?? { width: 720, height: 500 };
        const availableWidth = Math.max(250, viewport.width - (viewport.width < 640 ? 12 : 48));
        const availableHeight = Math.max(260, viewport.height - 112);
        const width = Math.min(preferred.width, availableWidth);
        const height = Math.min(preferred.height, availableHeight);
        const cascade = Math.min(previous.length, 4) * 16;
        const x = clamp(
          (viewport.width - width) / 2 + cascade - 8,
          6,
          Math.max(6, viewport.width - width - 6)
        );
        const y = clamp(68 + cascade, 56, Math.max(56, viewport.height - height - 56));

        return [
          ...previous,
          {
            id: `${appId}-${sequence}`,
            appId,
            x,
            y,
            w: width,
            h: height,
            z: nextZ,
            minimized: false,
            maximized: false,
            snap: null,
          },
        ];
      });
    },
    [viewport.width, viewport.height, closeSurfaces]
  );

  const focusWindow = useCallback((id) => {
    setWindows((previous) => {
      const target = previous.find((win) => win.id === id);
      if (!target) return previous;
      const topZ = Math.max(
        0,
        ...previous.filter((win) => !win.minimized).map((win) => win.z)
      );
      if (!target.minimized && target.z === topZ) return previous;
      const nextZ = ++zCounterRef.current;
      return previous.map((win) =>
        win.id === id ? { ...win, minimized: false, z: nextZ } : win
      );
    });
  }, []);

  const moveWindow = useCallback(
    (id, x, y) => {
      setWindows((previous) =>
        previous.map((win) => {
          if (win.id !== id || win.maximized || win.snap) return win;
          return {
            ...win,
            x: clamp(x, 0, Math.max(0, viewport.width - win.w)),
            y: clamp(y, 0, Math.max(0, viewport.height - TASKBAR_HEIGHT - 40)),
          };
        })
      );
    },
    [viewport.width, viewport.height]
  );

  const resizeWindow = useCallback(
    (id, rect) => {
      setWindows((previous) =>
        previous.map((win) => {
          if (win.id !== id || win.maximized || win.snap) return win;
          const x = clamp(rect.x, 0, Math.max(0, viewport.width - 320));
          const y = clamp(rect.y, 0, Math.max(0, viewport.height - TASKBAR_HEIGHT - 220));
          return {
            ...win,
            x,
            y,
            w: clamp(rect.w, 320, Math.max(320, viewport.width - x)),
            h: clamp(rect.h, 220, Math.max(220, viewport.height - TASKBAR_HEIGHT - y)),
          };
        })
      );
    },
    [viewport.width, viewport.height]
  );

  const handleDragEnd = useCallback(
    (id, x, y) => {
      setWindows((previous) =>
        previous.map((win) => {
          if (win.id !== id || win.maximized || win.snap) return win;
          if (y <= 10) return { ...win, maximized: true, snap: null };
          if (viewport.width >= 700 && x <= 10) {
            return { ...win, snap: 'left', maximized: false };
          }
          if (viewport.width >= 700 && x >= viewport.width - 10) {
            return { ...win, snap: 'right', maximized: false };
          }
          return win;
        })
      );
    },
    [viewport.width]
  );

  const minimizeAll = useCallback(() => {
    setWindows((previous) => previous.map((win) => ({ ...win, minimized: true })));
    setStartOpen(false);
    setTray(null);
    setContextMenu(null);
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows((previous) =>
      previous.map((win) => (win.id === id ? { ...win, minimized: true } : win))
    );
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((previous) => previous.filter((win) => win.id !== id));
  }, []);

  const toggleMaximize = useCallback((id) => {
    setWindows((previous) =>
      previous.map((win) =>
        win.id === id
          ? { ...win, maximized: !win.maximized, snap: null, minimized: false }
          : win
      )
    );
  }, []);

  const handleTaskbar = (appId) => {
    closeSurfaces();
    const existing = windows.find((win) => win.appId === appId);
    if (!existing) {
      openApp(appId);
      return;
    }

    const topZ = Math.max(
      0,
      ...windows.filter((win) => !win.minimized).map((win) => win.z)
    );
    if (!existing.minimized && existing.z === topZ) {
      minimizeWindow(existing.id);
    } else {
      focusWindow(existing.id);
    }
  };

  const renderContent = (win) => {
    if (PROJECT_IDS.has(win.appId)) {
      const project = projects.find((item) => item.id === win.appId);
      if (!project) return null;
      return <ProjectApp project={project} onOpenProject={onOpenProject} />;
    }
    if (win.appId === 'terminal') {
      return (
        <TerminalApp onOpenApp={openApp} onClose={() => closeWindow(win.id)} />
      );
    }
    if (win.appId === 'notepad') {
      return <NotepadApp />;
    }
    if (win.appId === 'calculator') {
      return <CalculatorApp />;
    }
    if (win.appId === 'settings') {
      return (
        <SettingsApp settings={settings} onChange={updateSettings} viewport={viewport} />
      );
    }
    if (win.appId === 'this-pc') {
      return <ThisPCApp onOpenApp={openApp} />;
    }
    return <RecycleBinApp onOpenApp={openApp} />;
  };

  const handleDesktopContextMenu = (event) => {
    if (
      event.target.closest(
        '[data-window], [data-taskbar], [data-panel], [data-start-menu], [data-top-button]'
      )
    ) {
      return;
    }
    event.preventDefault();
    setStartOpen(false);
    setTray(null);
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  return (
    <div
      className="fixed inset-0 z-[85] select-none overflow-hidden bg-[#04101d] text-slate-100 [&_button]:cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-label="Windows 11 virtual ish stoli"
      onContextMenu={handleDesktopContextMenu}
    >
      <DesktopWallpaper wallpaper={settings.wallpaper} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[65] bg-black transition-opacity duration-300"
        style={{ opacity: Math.max(0, (100 - settings.brightness) / 150) }}
      />
      {settings.nightLight ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[66] bg-[#ff9a3c] opacity-[0.08] mix-blend-screen"
        />
      ) : null}

      <button
        data-top-button
        type="button"
        onClick={onStandUp}
        className="absolute left-1/2 top-3 z-[70] inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/25 bg-slate-950/70 px-4 py-2 text-[11px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl transition hover:border-white/40 hover:bg-slate-900/85 sm:text-xs"
      >
        <LogOut size={14} strokeWidth={1.8} />
        Oʻrindan turish
        <span className="hidden font-mono text-[9px] text-slate-400 sm:inline">Esc</span>
      </button>

      <div
        aria-label="Ish stoli piktogrammalari"
        className="no-scrollbar absolute left-2 top-16 z-10 flex max-h-[calc(100%-9rem)] w-[94px] flex-col gap-0.5 overflow-y-auto pb-2 sm:left-4 sm:top-20 sm:w-[104px]"
      >
        {APP_IDS.map((appId) => {
          const app = APPS[appId];
          return (
            <button
              key={appId}
              type="button"
              onClick={() => openApp(appId)}
              title={app.label}
              className="group flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-center transition hover:bg-white/10 active:bg-white/15"
            >
              <AppIcon appId={appId} className="h-10 w-10 sm:h-11 sm:w-11" iconSize={21} />
              <span className="w-full break-words text-[9.5px] font-medium leading-[1.25] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] sm:text-[10.5px]">
                {app.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            app={APPS[win.appId]}
            onFocus={focusWindow}
            onMove={moveWindow}
            onDragEnd={handleDragEnd}
            onResize={resizeWindow}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onToggleMaximize={toggleMaximize}
          >
            {renderContent(win)}
          </WindowFrame>
        ))}
      </div>

      {startOpen || tray || contextMenu ? (
        <button
          type="button"
          aria-label="Menyuni yopish"
          tabIndex={-1}
          onClick={closeSurfaces}
          className="absolute inset-0 z-[54] cursor-default bg-slate-950/20"
        />
      ) : null}

      {startOpen ? (
        <StartMenu
          query={startQuery}
          onQueryChange={setStartQuery}
          onOpenApp={openApp}
        />
      ) : null}

      {tray === 'quick' ? (
        <QuickSettings settings={settings} onChange={updateSettings} />
      ) : null}

      {tray === 'calendar' ? <CalendarFlyout now={now} /> : null}

      {contextMenu ? (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          viewport={viewport}
          onOpenApp={openApp}
          onMinimizeAll={minimizeAll}
          onClose={() => setContextMenu(null)}
        />
      ) : null}

      <Taskbar
        windows={windows}
        startOpen={startOpen}
        tray={tray}
        onStart={() => {
          setStartOpen((open) => !open);
          setStartQuery('');
          setTray(null);
          setContextMenu(null);
        }}
        onQuick={() => {
          setTray((current) => (current === 'quick' ? null : 'quick'));
          setStartOpen(false);
          setContextMenu(null);
        }}
        onCalendar={() => {
          setTray((current) => (current === 'calendar' ? null : 'calendar'));
          setStartOpen(false);
          setContextMenu(null);
        }}
        onTaskbar={handleTaskbar}
        now={now}
      />
    </div>
  );
}
