import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BatteryFull,
  Bluetooth,
  CalendarDays,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FilePlus2,
  Minimize2,
  Monitor,
  Moon,
  RotateCcw,
  Save,
  Settings,
  SlidersHorizontal,
  StickyNote,
  Sun,
  Terminal,
  Volume2,
  Wifi,
} from 'lucide-react';

const SETTINGS_KEY = 'revilend.win11.settings.v1';
const NOTEPAD_KEY = 'revilend.win11.notepad.v1';

export const WALLPAPERS = [
  {
    id: 'bloom',
    name: 'Bloom',
    description: 'Windows 11 ilhomidagi moviy oqim',
    base: 'radial-gradient(circle at 18% 12%, #163a75 0%, #0b213c 32%, #06111f 68%, #030912 100%)',
    accent:
      'conic-gradient(from 210deg at 50% 50%, #0ea5e9 0deg, #1d4ed8 92deg, #312e81 190deg, #0e7490 270deg, #0ea5e9 360deg)',
    transform: 'rotate(-18deg)',
  },
  {
    id: 'violet',
    name: 'Nebula',
    description: 'Binafsha va pushti yorugʻlik',
    base: 'radial-gradient(circle at 74% 18%, #3b1e6e 0%, #1b1238 36%, #080c18 74%, #03050b 100%)',
    accent:
      'conic-gradient(from 120deg at 50% 50%, #8b5cf6 0deg, #db2777 96deg, #312e81 196deg, #7c3aed 286deg, #8b5cf6 360deg)',
    transform: 'rotate(14deg)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Yashil va moviy shimoliy yogʻdu',
    base: 'radial-gradient(circle at 28% 16%, #064e3b 0%, #062b35 36%, #041018 72%, #02070c 100%)',
    accent:
      'conic-gradient(from 190deg at 50% 50%, #10b981 0deg, #06b6d4 104deg, #0f766e 192deg, #1e40af 284deg, #10b981 360deg)',
    transform: 'rotate(-28deg)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Minimal qorongʻi fon',
    base: 'radial-gradient(circle at 50% 18%, #182235 0%, #0a111d 42%, #04070c 78%, #020407 100%)',
    accent:
      'conic-gradient(from 0deg at 50% 50%, #334155 0deg, #0f766e 92deg, #1e293b 180deg, #334155 268deg, #334155 360deg)',
    transform: 'rotate(0deg)',
  },
];

export const DEFAULT_WINDOWS_SETTINGS = {
  wallpaper: 'bloom',
  brightness: 100,
  volume: 70,
  wifi: true,
  bluetooth: false,
  nightLight: false,
};

const getWallpaper = (id) => WALLPAPERS.find((item) => item.id === id) ?? WALLPAPERS[0];

export function loadWindowsSettings() {
  if (typeof window === 'undefined') return DEFAULT_WINDOWS_SETTINGS;
  try {
    const saved = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_WINDOWS_SETTINGS;
    return {
      ...DEFAULT_WINDOWS_SETTINGS,
      ...saved,
      wallpaper: getWallpaper(saved.wallpaper).id,
      brightness: Math.min(100, Math.max(30, Number(saved.brightness) || 100)),
      volume: Math.min(100, Math.max(0, Number(saved.volume) || 0)),
    };
  } catch {
    return DEFAULT_WINDOWS_SETTINGS;
  }
}

export function saveWindowsSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* Persistence is optional; the desktop keeps working without storage. */
  }
}

export function DesktopWallpaper({ wallpaper }) {
  const selected = getWallpaper(wallpaper);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: selected.base }} />
      <div
        className="absolute left-[8%] top-[-18%] h-[85vmax] w-[85vmax] rounded-[42%] opacity-55 blur-[2px]"
        style={{ background: selected.accent, transform: selected.transform }}
      />
      <div className="absolute inset-0 bg-[#03101f]/35" />
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #93c5fd 1px, transparent 1px), linear-gradient(to bottom, #93c5fd 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(1,6,13,0.58)_100%)]" />
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        checked ? 'border-sky-300 bg-sky-400' : 'border-slate-500 bg-slate-600/60'
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-1'
        }`}
      />
    </button>
  );
}

export function QuickSettings({ settings, onChange }) {
  const toggles = [
    {
      key: 'wifi',
      label: 'Wi-Fi',
      detail: settings.wifi ? 'Ulangan' : 'Oʻchirilgan',
      icon: Wifi,
    },
    {
      key: 'bluetooth',
      label: 'Bluetooth',
      detail: settings.bluetooth ? 'Yoqilgan' : 'Oʻchirilgan',
      icon: Bluetooth,
    },
    {
      key: 'nightLight',
      label: 'Kecha rejimi',
      detail: settings.nightLight ? 'Yoniq' : 'Oʻchiq',
      icon: Moon,
    },
  ];

  return (
    <aside
      data-panel
      role="dialog"
      aria-label="Tez sozlamalar"
      className="absolute bottom-14 right-1.5 z-[57] w-[min(94vw,21rem)] animate-fade-in overflow-hidden rounded-2xl border border-white/15 bg-[#101b2a]/95 text-white shadow-[0_28px_80px_-18px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:right-2.5"
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
        <p className="text-[11px] font-semibold">Tez sozlamalar</p>
        <SlidersHorizontal size={13} className="text-slate-400" />
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
        {toggles.map((item) => {
          const Icon = item.icon;
          const active = Boolean(settings[item.key]);
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ [item.key]: !active })}
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-center transition ${
                active
                  ? 'border-sky-300/60 bg-sky-400 text-slate-950'
                  : 'border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10'
              }`}
            >
              <Icon size={17} />
              <span className="w-full truncate text-[9.5px] font-medium">{item.label}</span>
              <span className={`text-[8px] ${active ? 'text-slate-800' : 'text-slate-500'}`}>
                {item.detail}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-white/10 px-4 py-3">
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sun size={12} className="text-slate-400" />
              Yorqinlik
            </span>
            <span className="font-mono text-[9px] text-slate-500">{settings.brightness}%</span>
          </span>
          <input
            type="range"
            min="30"
            max="100"
            step="1"
            value={settings.brightness}
            onChange={(event) => onChange({ brightness: Number(event.target.value) })}
            aria-label="Ekran yorqinligi"
            className="h-1.5 w-full cursor-pointer accent-[#4cc2ff]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <Volume2 size={12} className="text-slate-400" />
              Ovoz
            </span>
            <span className="font-mono text-[9px] text-slate-500">{settings.volume}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.volume}
            onChange={(event) => onChange({ volume: Number(event.target.value) })}
            aria-label="Ovoz balandligi"
            className="h-1.5 w-full cursor-pointer accent-[#4cc2ff]"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2.5 text-[9.5px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <BatteryFull size={14} className="text-emerald-400" />
          Quvvat manbaida
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.12em]">Windows 11</span>
      </div>
    </aside>
  );
}

const WEEKDAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];
const MONTH_FORMAT = new Intl.DateTimeFormat('uz-UZ', { month: 'long', year: 'numeric' });
const DAY_FORMAT = new Intl.DateTimeFormat('uz-UZ', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarFlyout({ now }) {
  const [viewDate, setViewDate] = useState(() => new Date(now));
  const [selected, setSelected] = useState(() => new Date(now));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstOffset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  const changeMonth = (offset) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <aside
      data-panel
      role="dialog"
      aria-label="Kalendar"
      className="absolute bottom-14 right-1.5 z-[57] w-[min(94vw,21rem)] animate-fade-in overflow-hidden rounded-2xl border border-white/60 bg-[#f7fafd]/95 text-slate-900 shadow-[0_28px_80px_-18px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:right-2.5"
    >
      <div className="border-b border-slate-200 bg-white/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
              Toshkent vaqti
            </p>
            <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-slate-900">
              {new Intl.DateTimeFormat('uz-UZ', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Tashkent',
              }).format(now)}
            </p>
          </div>
          <CalendarDays size={20} className="text-sky-600" />
        </div>
        <p className="mt-1 text-[10.5px] capitalize text-slate-500">{DAY_FORMAT.format(now)}</p>
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Oldingi oy"
            className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="truncate text-[11.5px] font-semibold capitalize text-slate-800">
            {MONTH_FORMAT.format(viewDate)}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Keyingi oy"
            className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((day) => (
            <span key={day} className="py-1 font-mono text-[8px] uppercase text-slate-400">
              {day}
            </span>
          ))}
          {cells.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />;
            const date = new Date(year, month, day);
            const isToday = sameDay(date, now);
            const isSelected = sameDay(date, selected);
            return (
              <button
                key={`${year}-${month}-${day}`}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={isSelected}
                aria-label={DAY_FORMAT.format(date)}
                className={`grid h-7 place-items-center rounded-full text-[10.5px] tabular-nums transition ${
                  isSelected
                    ? 'bg-sky-500 font-semibold text-white'
                    : isToday
                      ? 'border border-sky-400 font-semibold text-sky-700 hover:bg-sky-50'
                      : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white/70 px-4 py-2.5">
        <span className="truncate text-[9.5px] capitalize text-slate-500">
          {DAY_FORMAT.format(selected)}
        </span>
        <button
          type="button"
          onClick={() => {
            setViewDate(new Date(now));
            setSelected(new Date(now));
          }}
          className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[9px] font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-700"
        >
          Bugun
        </button>
      </div>
    </aside>
  );
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function DesktopContextMenu({ x, y, viewport, onOpenApp, onMinimizeAll, onClose }) {
  const items = [
    { label: 'Yangi matn fayli', icon: StickyNote, appId: 'notepad' },
    { label: 'Windows Terminal', icon: Terminal, appId: 'terminal' },
    { label: 'Kalkulyator', icon: Calculator, appId: 'calculator' },
    { label: 'Sozlamalar', icon: Settings, appId: 'settings' },
  ];
  const left = clamp(x, 8, Math.max(8, viewport.width - 240));
  const top = clamp(y, 8, Math.max(8, viewport.height - 280));

  return (
    <div
      data-panel
      role="menu"
      aria-label="Ish stoli menyusi"
      className="absolute z-[57] w-[224px] animate-fade-in overflow-hidden rounded-xl border border-white/20 bg-[#f7fafd]/95 p-1.5 text-slate-800 shadow-[0_24px_70px_-16px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      style={{ left, top }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.appId}
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenApp(item.appId);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[11px] transition hover:bg-sky-100"
          >
            <Icon size={14} className="text-slate-500" />
            {item.label}
          </button>
        );
      })}
      <div className="my-1 h-px bg-slate-200" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onMinimizeAll();
        }}
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[11px] transition hover:bg-sky-100"
      >
        <Minimize2 size={14} className="text-slate-500" />
        Barcha oynalarni yigʻish
      </button>
    </div>
  );
}

const DEFAULT_NOTE = `Revilend Windows 11 — Notepad

Bu haqiqiy matn muharriri: yozing, saqlang yoki .txt fayl qilib yuklab oling.
Matn brauzer xotirasida saqlanadi va keyingi ochilishda tiklanadi.

Ctrl + S — saqlash
Ctrl + A — barchasini tanlash

Loyihalar:
01  teachermuzaffar.uz
02  Echoes of Room 404
03  Telegram Auto-Bots
`;

function loadNote() {
  if (typeof window === 'undefined') return DEFAULT_NOTE;
  try {
    return window.localStorage.getItem(NOTEPAD_KEY) ?? DEFAULT_NOTE;
  } catch {
    return DEFAULT_NOTE;
  }
}

function formatSavedTime() {
  return new Intl.DateTimeFormat('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function NotepadApp() {
  const [text, setText] = useState(loadNote);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('Tayyor');
  const [wrap, setWrap] = useState(true);
  const textareaRef = useRef(null);

  const save = useCallback(() => {
    try {
      window.localStorage.setItem(NOTEPAD_KEY, text);
      setDirty(false);
      setStatus(`Saqlandi · ${formatSavedTime()}`);
    } catch {
      setStatus('Saqlash imkoni yoʻq');
    }
  }, [text]);

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'revilend-notes.txt';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    setStatus('Fayl yuklab olindi');
  };

  const newNote = () => {
    if (text.trim() && !window.confirm('Joriy matn saqlanmagan boʻlishi mumkin. Yangi fayl ochilsinmi?')) {
      return;
    }
    setText('');
    setDirty(false);
    setStatus('Yangi fayl');
    textareaRef.current?.focus();
  };

  const count = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;

  return (
    <div className="flex h-full flex-col bg-white text-slate-900">
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-[#f6f8fb] px-2 py-1.5">
        <button
          type="button"
          onClick={newNote}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] text-slate-600 transition hover:bg-slate-200"
        >
          <FilePlus2 size={13} />
          Yangi
        </button>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium text-sky-700 transition hover:bg-sky-100"
        >
          <Save size={13} />
          Saqlash
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] text-slate-600 transition hover:bg-slate-200"
        >
          <Download size={13} />
          .txt
        </button>
        <button
          type="button"
          onClick={() => setWrap((value) => !value)}
          aria-pressed={wrap}
          className={`ml-auto inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] transition ${
            wrap ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Soʻz oʻrash
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-1.5 text-[9.5px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          revilend-notes.txt
        </span>
        <span className="ml-auto truncate">{status}</span>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setDirty(true);
          setStatus('Saqlanmagan oʻzgarishlar');
        }}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            save();
          }
        }}
        wrap={wrap ? 'soft' : 'off'}
        spellCheck
        aria-label="Notepad matni"
        className="light-scroll min-h-0 flex-1 resize-none bg-white px-4 py-3 font-mono text-[12.5px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-300"
        placeholder="Matn yozing…"
      />

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-200 bg-[#f6f8fb] px-3 py-1.5 font-mono text-[9px] text-slate-400">
        <span>Qatorlar: {lines}</span>
        <span>Soʻzlar: {words}</span>
        <span>Belgilar: {count}</span>
        <span className="ml-auto">Ctrl+S — saqlash</span>
      </div>
    </div>
  );
}

const CALC_FORMAT = (value) => {
  if (!Number.isFinite(value)) return 'Xato';
  const rounded = Math.round(value * 1e10) / 1e10;
  const text = String(rounded);
  if (text.length > 12) return value.toExponential(6);
  return text;
};

const calcResult = (left, right, operator) => {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? NaN : left / right;
    default:
      return right;
  }
};

const OPERATOR_LABEL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

export function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [accumulator, setAccumulator] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [history, setHistory] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const clearAll = () => {
    setDisplay('0');
    setAccumulator(null);
    setOperator(null);
    setOverwrite(true);
    setHistory('');
  };

  const inputDigit = (digit) => {
    setDisplay((current) => {
      if (current === 'Xato' || overwrite) return digit;
      const next = current === '0' ? digit : `${current}${digit}`;
      return next.replace(/^0(?=\d)/, '').slice(0, 12);
    });
    setOverwrite(false);
  };

  const inputDecimal = () => {
    if (overwrite || display === 'Xato') {
      setDisplay('0.');
      setOverwrite(false);
      return;
    }
    if (!display.includes('.')) setDisplay(`${display}.`);
  };

  const backspace = () => {
    if (overwrite || display === 'Xato') return;
    setDisplay((current) => {
      if (current.length <= 1) return '0';
      return current.slice(0, -1);
    });
  };

  const toggleSign = () => {
    if (display === '0' || display === 'Xato') return;
    setDisplay((current) => (current.startsWith('-') ? current.slice(1) : `-${current}`));
  };

  const percent = () => {
    if (display === 'Xato') return;
    setDisplay(CALC_FORMAT((Number.parseFloat(display) || 0) / 100));
    setOverwrite(true);
  };

  const chooseOperator = (next) => {
    if (display === 'Xato') return;
    const current = Number.parseFloat(display) || 0;

    if (operator && accumulator !== null && !overwrite) {
      const result = calcResult(accumulator, current, operator);
      if (!Number.isFinite(result)) {
        setDisplay('Xato');
        setHistory('');
        setAccumulator(null);
        setOperator(null);
        setOverwrite(true);
        return;
      }
      setAccumulator(result);
      setHistory(`${CALC_FORMAT(result)} ${OPERATOR_LABEL[next]}`);
      setDisplay(CALC_FORMAT(result));
    } else {
      setAccumulator(current);
      setHistory(`${CALC_FORMAT(current)} ${OPERATOR_LABEL[next]}`);
    }
    setOperator(next);
    setOverwrite(true);
  };

  const equals = () => {
    if (operator === null || accumulator === null || display === 'Xato') return;
    const current = Number.parseFloat(display) || 0;
    const result = calcResult(accumulator, current, operator);
    setHistory(`${CALC_FORMAT(accumulator)} ${OPERATOR_LABEL[operator]} ${CALC_FORMAT(current)} =`);
    setDisplay(Number.isFinite(result) ? CALC_FORMAT(result) : 'Xato');
    setAccumulator(null);
    setOperator(null);
    setOverwrite(true);
  };

  const handleKey = (event) => {
    const isCalcKey =
      /^[0-9]$/.test(event.key) ||
      ['.', '+', '-', '*', '/', 'Enter', '=', 'Backspace', 'Escape', 'Delete', '%'].includes(
        event.key
      );
    if (!isCalcKey) return;

    event.stopPropagation();
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      inputDigit(event.key);
    } else if (event.key === '.') {
      event.preventDefault();
      inputDecimal();
    } else if (['+', '-', '*', '/'].includes(event.key)) {
      event.preventDefault();
      chooseOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
      event.preventDefault();
      equals();
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      backspace();
    } else if (event.key === 'Escape' || event.key === 'Delete') {
      event.preventDefault();
      clearAll();
    } else if (event.key === '%') {
      event.preventDefault();
      percent();
    }
  };

  const keyRows = [
    [
      { label: 'C', action: clearAll, variant: 'utility' },
      { label: '⌫', action: backspace, variant: 'utility', aria: 'Oʻchirish' },
      { label: '%', action: percent, variant: 'utility' },
      { label: '÷', action: () => chooseOperator('/'), variant: 'operator' },
    ],
    [
      { label: '7', action: () => inputDigit('7') },
      { label: '8', action: () => inputDigit('8') },
      { label: '9', action: () => inputDigit('9') },
      { label: '×', action: () => chooseOperator('*'), variant: 'operator' },
    ],
    [
      { label: '4', action: () => inputDigit('4') },
      { label: '5', action: () => inputDigit('5') },
      { label: '6', action: () => inputDigit('6') },
      { label: '−', action: () => chooseOperator('-'), variant: 'operator' },
    ],
    [
      { label: '1', action: () => inputDigit('1') },
      { label: '2', action: () => inputDigit('2') },
      { label: '3', action: () => inputDigit('3') },
      { label: '+', action: () => chooseOperator('+'), variant: 'operator' },
    ],
    [
      { label: '±', action: toggleSign },
      { label: '0', action: () => inputDigit('0') },
      { label: '.', action: inputDecimal },
      { label: '=', action: equals, variant: 'equals' },
    ],
  ];

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label="Kalkulyator"
      onKeyDown={handleKey}
      className="flex h-full flex-col bg-[#f3f6fa] text-slate-900 outline-none"
    >
      <div className="shrink-0 px-4 pb-2 pt-3 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
        Standart
      </div>
      <div className="mx-3 shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner">
        <p className="h-4 truncate text-right font-mono text-[9.5px] text-slate-400">{history}</p>
        <p
          aria-live="polite"
          className="no-scrollbar mt-1 overflow-x-auto whitespace-nowrap text-right font-display text-[2rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-[2.4rem]"
        >
          {display}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-4 gap-1.5 p-3">
        {keyRows.flat().map((key) => (
          <button
            key={key.label}
            type="button"
            tabIndex={-1}
            aria-label={key.aria ?? key.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={key.action}
            className={`min-h-10 rounded-lg border text-[13px] font-medium shadow-sm transition active:scale-[0.98] ${
              key.variant === 'operator'
                ? 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
                : key.variant === 'equals'
                  ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600'
                  : key.variant === 'utility'
                    ? 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            {key.label}
          </button>
        ))}
      </div>

      <p className="shrink-0 px-3 pb-2 text-center font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-400">
        Klaviatura: 0–9 · + − × ÷ · Enter · Esc
      </p>
    </div>
  );
}

const SETTINGS_SECTIONS = [
  { id: 'personalization', label: 'Shaxsiylashtirish', icon: Monitor },
  { id: 'system', label: 'Tizim', icon: SlidersHorizontal },
  { id: 'about', label: 'Haqida', icon: Settings },
];

function SettingsRow({ title, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[11.5px] font-medium text-slate-800">{title}</p>
        {description ? <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{description}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsApp({ settings, onChange, viewport }) {
  const [section, setSection] = useState('personalization');

  return (
    <div className="flex h-full bg-[#f7f9fc] text-slate-900">
      <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-slate-200 bg-[#eef3f9] p-3 sm:flex">
        <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-white">
            <Settings size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold">Sozlamalar</p>
            <p className="truncate text-[9px] text-slate-400">Revilend PC</p>
          </div>
        </div>
        {SETTINGS_SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-pressed={section === item.id}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-left text-[10.5px] transition ${
                section === item.id
                  ? 'bg-white font-medium text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <Icon size={13} />
              {item.label}
            </button>
          );
        })}
      </aside>

      <div className="light-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-slate-200 bg-[#eef3f9] px-3 py-2 sm:hidden">
          {SETTINGS_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[9.5px] ${
                section === item.id ? 'bg-white font-medium text-sky-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {section === 'personalization' ? (
            <>
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Shaxsiylashtirish
              </h3>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                Ish stoli fonini tanlang. Tanlov brauzer xotirasida saqlanadi.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {WALLPAPERS.map((wallpaper) => {
                  const active = settings.wallpaper === wallpaper.id;
                  return (
                    <button
                      key={wallpaper.id}
                      type="button"
                      onClick={() => onChange({ wallpaper: wallpaper.id })}
                      aria-pressed={active}
                      className={`group relative overflow-hidden rounded-xl border-2 text-left transition ${
                        active
                          ? 'border-sky-500 shadow-sm'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <span className="relative block h-20 overflow-hidden bg-slate-900">
                        <span className="absolute inset-0" style={{ background: wallpaper.base }} />
                        <span
                          className="absolute -left-4 -top-8 h-28 w-28 rounded-[42%] opacity-70"
                          style={{
                            background: wallpaper.accent,
                            transform: wallpaper.transform,
                          }}
                        />
                      </span>
                      <span className="flex items-start justify-between gap-2 bg-white px-2.5 py-2">
                        <span className="min-w-0">
                          <span className="block text-[10.5px] font-medium text-slate-700">
                            {wallpaper.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[8.5px] text-slate-400">
                            {wallpaper.description}
                          </span>
                        </span>
                        {active ? <Check size={13} className="mt-0.5 shrink-0 text-sky-600" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
                <SettingsRow title="Kecha rejimi" description="Koʻz uchun issiq rang harorati">
                  <Toggle
                    checked={settings.nightLight}
                    onChange={(value) => onChange({ nightLight: value })}
                    label="Kecha rejimi"
                  />
                </SettingsRow>
              </div>
            </>
          ) : null}

          {section === 'system' ? (
            <>
              <h3 className="font-display text-lg font-semibold tracking-tight">Tizim</h3>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                Ekran va ovoz simulyatsiyasi. Bu sozlamalar virtual ish stoliga darhol qoʻllanadi.
              </p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm">
                <SettingsRow title="Yorqinlik" description={`${settings.brightness}%`}>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={settings.brightness}
                    onChange={(event) => onChange({ brightness: Number(event.target.value) })}
                    aria-label="Yorqinlik"
                    className="w-32 cursor-pointer accent-sky-500"
                  />
                </SettingsRow>
                <SettingsRow title="Ovoz" description={`${settings.volume}%`}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(event) => onChange({ volume: Number(event.target.value) })}
                    aria-label="Ovoz"
                    className="w-32 cursor-pointer accent-sky-500"
                  />
                </SettingsRow>
                <SettingsRow title="Wi-Fi" description={settings.wifi ? 'Ulangan' : 'Oʻchirilgan'}>
                  <Toggle
                    checked={settings.wifi}
                    onChange={(value) => onChange({ wifi: value })}
                    label="Wi-Fi"
                  />
                </SettingsRow>
                <SettingsRow
                  title="Bluetooth"
                  description={settings.bluetooth ? 'Yoqilgan' : 'Oʻchirilgan'}
                >
                  <Toggle
                    checked={settings.bluetooth}
                    onChange={(value) => onChange({ bluetooth: value })}
                    label="Bluetooth"
                  />
                </SettingsRow>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm">
                <SettingsRow title="Kecha rejimi" description="Issiq rang harorati">
                  <Toggle
                    checked={settings.nightLight}
                    onChange={(value) => onChange({ nightLight: value })}
                    label="Kecha rejimi"
                  />
                </SettingsRow>
              </div>
            </>
          ) : null}

          {section === 'about' ? (
            <>
              <h3 className="font-display text-lg font-semibold tracking-tight">Tizim haqida</h3>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                Brauzer ichida ishlaydigan Windows 11 simulyatsiyasi.
              </p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm">
                <SettingsRow title="Qurilma" description="Revilend PC · virtual">
                  <span className="font-mono text-[9px] text-slate-400">Windows 11</span>
                </SettingsRow>
                <SettingsRow title="Renderer" description="React 18 · Vite · Tailwind CSS">
                  <span className="font-mono text-[9px] text-slate-400">WebGL</span>
                </SettingsRow>
                <SettingsRow title="Ekran" description={`${viewport.width} × ${viewport.height} px`}>
                  <Monitor size={15} className="text-slate-400" />
                </SettingsRow>
                <SettingsRow title="Vaqt mintaqasi" description="Asia/Tashkent · UTC+5">
                  <span className="font-mono text-[9px] text-slate-400">UZT</span>
                </SettingsRow>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-medium text-amber-900">Sozlamalarni tiklash</p>
                  <p className="mt-0.5 text-[9px] text-amber-700/70">
                    Fon, yorqinlik va tarmoq holati boshlangʻich holatga qaytadi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(DEFAULT_WINDOWS_SETTINGS)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1.5 text-[9.5px] font-medium text-amber-800 transition hover:bg-amber-100"
                >
                  <RotateCcw size={12} />
                  Tiklash
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
