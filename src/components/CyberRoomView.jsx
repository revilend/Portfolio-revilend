import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Armchair,
  Footprints,
  Maximize2,
  Minimize2,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import ComputerScreen from './ComputerScreen.jsx';

const VIEWS = [
  {
    key: 'desk',
    label: 'Stol',
    target: [0, 1.52, -0.3],
    radius: 4.7,
    mobileRadius: 6.6,
    theta: 0,
    phi: 1.38,
  },
  {
    key: 'teachermuzaffar',
    label: '1. Taʼlim Portali',
    target: [-0.35, 1.92, -0.55],
    radius: 2.25,
    mobileRadius: 5.2,
    theta: 0.04,
    phi: 1.46,
  },
  {
    key: 'echoes-of-room-404',
    label: '2. 3D Oʻyin',
    target: [1.55, 1.92, -0.5],
    radius: 2.05,
    mobileRadius: 3.3,
    theta: -0.4,
    phi: 1.44,
  },
  {
    key: 'telegram-automation',
    label: '3. Telegram Bot',
    target: [-1.95, 1.45, 0.05],
    radius: 1.9,
    mobileRadius: 2.8,
    theta: 0.38,
    phi: 1.34,
  },
];

const PINS = [
  { id: 'teachermuzaffar', label: 'teachermuzaffar.uz', anchor: [-0.35, 2.72, -0.4] },
  { id: 'echoes-of-room-404', label: 'Echoes 404', anchor: [1.55, 2.8, -0.35] },
  { id: 'telegram-automation', label: 'Telegram Bot', anchor: [-1.95, 1.95, 0.2] },
];

const SEAT_VIEW = {
  key: 'seat',
  label: 'Stol oldi',
  target: [0, 1.82, -0.65],
  radius: 2.2,
  mobileRadius: 3.6,
  theta: 0,
  phi: 1.58,
};

const VIEW_MAP = Object.fromEntries([...VIEWS, SEAT_VIEW].map((view) => [view.key, view]));

function VirtualJoystick({ onChange }) {
  const padRef = useRef(null);
  const activeRef = useRef(false);
  const pointerRef = useRef(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });

  const update = useCallback(
    (event) => {
      const pad = padRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = rect.width * 0.32;
      let dx = event.clientX - centerX;
      let dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      if (distance > radius) {
        dx = (dx / distance) * radius;
        dy = (dy / distance) * radius;
      }
      setThumb({ x: dx, y: dy });
      onChange(Number((dx / radius).toFixed(3)), Number((dy / radius).toFixed(3)));
    },
    [onChange]
  );

  const end = (event) => {
    if (!activeRef.current) return;
    if (event?.pointerId != null && pointerRef.current !== event.pointerId) return;
    activeRef.current = false;
    pointerRef.current = null;
    setThumb({ x: 0, y: 0 });
    onChange(0, 0);
  };

  const start = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    activeRef.current = true;
    pointerRef.current = event.pointerId;
    if (event.currentTarget.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* pointer capture is best-effort */
      }
    }
    update(event);
  };

  const move = (event) => {
    if (!activeRef.current || pointerRef.current !== event.pointerId) return;
    event.preventDefault();
    update(event);
  };

  return (
    <div
      ref={padRef}
      role="group"
      aria-label="Virtual joystick — yurish uchun"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onContextMenu={(event) => event.preventDefault()}
      className="relative h-28 w-28 touch-none select-none rounded-full border border-electric/25 bg-[radial-gradient(circle_at_50%_40%,rgba(0,242,254,0.13),rgba(6,12,20,0.92)_62%)] shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl sm:h-32 sm:w-32"
    >
      <span aria-hidden="true" className="absolute inset-3 rounded-full border border-slate-600/50" />
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 -translate-y-1/2 bg-slate-500/20" />
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-x-1/2 -translate-y-1/2 bg-slate-500/20" />
      <span aria-hidden="true" className="absolute left-1/2 top-1.5 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">
        Old
      </span>
      <span aria-hidden="true" className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">
        Orqa
      </span>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 block transition-transform duration-75"
        style={{ transform: `translate(-50%, -50%) translate(${thumb.x}px, ${thumb.y}px)` }}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full border border-electric/50 bg-gradient-to-br from-electric/30 to-slate-900/90 shadow-[0_0_28px_rgba(0,242,254,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] sm:h-14 sm:w-14">
          <span className="h-2 w-2 rounded-full bg-electric shadow-[0_0_10px_rgba(0,242,254,0.95)]" />
        </span>
      </span>
      <span className="sr-only">Yurish uchun joystick. Klaviaturada WASD yoki strelkalar ham ishlaydi.</span>
    </div>
  );
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawTeacherScreen(ctx, width, height) {
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#07131f');
  background.addColorStop(0.6, '#050a12');
  background.addColorStop(1, '#0b0819');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const halo = ctx.createRadialGradient(
    width * 0.3,
    height * 0.35,
    0,
    width * 0.3,
    height * 0.35,
    width * 0.6
  );
  halo.addColorStop(0, 'rgba(0,242,254,0.16)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(4,10,18,0.92)';
  ctx.fillRect(0, 0, width, 84);
  ctx.strokeStyle = 'rgba(0,242,254,0.22)';
  ctx.beginPath();
  ctx.moveTo(0, 84);
  ctx.lineTo(width, 84);
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.shadowColor = 'rgba(52,211,153,0.8)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(46, 42, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#7d94a8';
  ctx.font = '500 21px monospace';
  ctx.fillText('revilend.os / workspace', 70, 50);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#34d399';
  ctx.fillText('LIVE · teachermuzaffar.uz', width - 52, 50);
  ctx.textAlign = 'left';

  ctx.save();
  ctx.shadowColor = 'rgba(0,242,254,0.55)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#f2feff';
  ctx.font = '700 76px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText('teachermuzaffar.uz', 62, 234);
  ctx.restore();

  ctx.fillStyle = '#67e8f9';
  ctx.font = '500 24px monospace';
  ctx.fillText('TAʼLIM PLATFORMASI  ·  DAVOMAT  ·  BAHOLAR', 64, 282);

  ctx.fillStyle = 'rgba(2,8,14,0.82)';
  roundedRect(ctx, 64, 322, width * 0.56, 208, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,242,254,0.18)';
  ctx.stroke();

  const codeLines = [
    ['01', 'const session = await supabase.auth', '#7dd3fc'],
    ['02', 'const classes = await getClasses(user.id)', '#a5f3fc'],
    ['03', 'attendance.sync({ realtime: true })', '#a7f3d0'],
    ['04', 'return <Gradebook role="teacher" />', '#c4b5fd'],
  ];
  ctx.font = '500 21px "JetBrains Mono", monospace';
  codeLines.forEach(([number, text, color], index) => {
    const y = 366 + index * 39;
    ctx.fillStyle = '#334155';
    ctx.fillText(number, 88, y);
    ctx.fillStyle = color;
    ctx.fillText(text, 142, y);
  });

  ctx.fillStyle = 'rgba(0,242,254,0.06)';
  roundedRect(ctx, width * 0.65, 322, width * 0.3, 208, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,242,254,0.2)';
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px monospace';
  ctx.fillText('DAVOMAT', width * 0.675, 360);
  ctx.fillStyle = '#ecfeff';
  ctx.font = '700 62px "Space Grotesk", sans-serif';
  ctx.fillText('96%', width * 0.675, 432);
  ctx.fillStyle = '#34d399';
  ctx.font = '500 18px monospace';
  ctx.fillText('▲ 4.2% bu hafta', width * 0.675, 474);
  ctx.fillStyle = '#64748b';
  ctx.fillText('SUPABASE · REALTIME', width * 0.675, 508);

  ctx.fillStyle = 'rgba(71,85,105,0.5)';
  ctx.fillRect(64, 556, width - 128, 1);
  ctx.fillStyle = '#475569';
  ctx.font = '400 17px monospace';
  ctx.fillText('rollar: admin / oʻqituvchi / oʻquvchi   ·   Postgres RLS', 64, 582);
}

function drawEchoesScreen(ctx, width, height) {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#0b0513');
  background.addColorStop(0.55, '#07040c');
  background.addColorStop(1, '#02030a');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const halo = ctx.createRadialGradient(
    width * 0.5,
    height * 0.35,
    0,
    width * 0.5,
    height * 0.35,
    width * 0.85
  );
  halo.addColorStop(0, 'rgba(139,92,246,0.26)');
  halo.addColorStop(0.55, 'rgba(244,63,94,0.07)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = '500 19px monospace';
  ctx.fillText('● PROTOTYPE', width / 2, 80);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 16px monospace';
  ctx.fillText('THREE.JS · WEB AUDIO API', width / 2, 118);

  ctx.save();
  ctx.shadowColor = 'rgba(167,139,250,0.55)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#f5f3ff';
  ctx.font = '700 86px "Space Grotesk", sans-serif';
  ctx.fillText('ECHOES', width / 2, 292);
  ctx.font = '600 58px "Space Grotesk", sans-serif';
  ctx.fillText('OF ROOM', width / 2, 370);
  ctx.font = '800 168px "Space Grotesk", sans-serif';
  ctx.shadowColor = 'rgba(0,242,254,0.5)';
  ctx.fillStyle = '#f0fdff';
  ctx.fillText('404', width / 2, 545);
  ctx.restore();

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundedRect(ctx, width * 0.3, 640, width * 0.4, 300, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(139,92,246,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(244,63,94,0.28)';
  ctx.beginPath();
  ctx.moveTo(width * 0.38, 940);
  ctx.lineTo(width * 0.38, 740);
  ctx.quadraticCurveTo(width / 2, 700, width * 0.62, 740);
  ctx.lineTo(width * 0.62, 940);
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 21px monospace';
  ctx.fillText('The corridor loops.', width / 2, 1010);
  ctx.fillStyle = '#64748b';
  ctx.font = '400 18px monospace';
  ctx.fillText('Keep walking.', width / 2, 1042);

  ctx.fillStyle = 'rgba(15,23,42,0.45)';
  for (let y = 0; y < height; y += 6) ctx.fillRect(0, y, width, 1);

  ctx.fillStyle = '#7c3aed';
  ctx.font = '500 17px monospace';
  ctx.fillText('FIRST-PERSON · PURE THREE.JS', width / 2, 1130);
  ctx.textAlign = 'left';
}

function drawTelegramScreen(ctx, width, height) {
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#04120e');
  background.addColorStop(0.55, '#050b12');
  background.addColorStop(1, '#071521');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const halo = ctx.createRadialGradient(
    width * 0.7,
    height * 0.3,
    0,
    width * 0.7,
    height * 0.3,
    width * 0.55
  );
  halo.addColorStop(0, 'rgba(52,211,153,0.18)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(52, 56, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8ba3b5';
  ctx.font = '500 20px monospace';
  ctx.fillText('AUTOMATION NODE · 03', 70, 63);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#34d399';
  ctx.fillText('PRODUCTION', width - 52, 63);
  ctx.textAlign = 'left';

  ctx.save();
  ctx.shadowColor = 'rgba(0,242,254,0.5)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#f0fdff';
  ctx.font = '700 88px "Space Grotesk", sans-serif';
  ctx.fillText('Telegram', 58, 255);
  ctx.font = '700 88px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#7df9ff';
  ctx.fillText('Auto-Bots', 58, 355);
  ctx.restore();

  ctx.fillStyle = '#5b7183';
  ctx.font = '500 21px monospace';
  ctx.fillText('High-speed delivery · queued jobs · Gemini AI', 60, 402);

  ctx.fillStyle = 'rgba(3,10,16,0.82)';
  roundedRect(ctx, width * 0.63, 178, width * 0.3, 238, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(52,211,153,0.25)';
  ctx.stroke();

  ctx.fillStyle = '#6b8494';
  ctx.font = '500 17px monospace';
  ctx.fillText('MESSAGES / DAY', width * 0.655, 218);
  ctx.fillStyle = '#ecfeff';
  ctx.font = '700 54px "Space Grotesk", sans-serif';
  ctx.fillText('12K+', width * 0.655, 278);
  ctx.fillStyle = '#34d399';
  ctx.font = '500 17px monospace';
  ctx.fillText('GEMINI API · ONLINE', width * 0.655, 320);
  ctx.fillStyle = '#475569';
  ctx.fillText('queue: 0 pending', width * 0.655, 356);
  ctx.fillText('render: healthy', width * 0.655, 386);

  const lines = [
    ['›', 'bot.on("message", enqueueUpdate)', '#67e8f9'],
    ['›', 'worker.consume({ retries: 3 })', '#a7f3d0'],
    ['›', 'gemini.generate({ stream: true })', '#c4b5fd'],
  ];
  ctx.font = '500 20px "JetBrains Mono", monospace';
  lines.forEach(([prefix, text, color], index) => {
    const y = 480 + index * 38;
    ctx.fillStyle = '#334155';
    ctx.fillText(prefix, 64, y);
    ctx.fillStyle = color;
    ctx.fillText(text, 92, y);
  });

  ctx.fillStyle = 'rgba(71,85,105,0.5)';
  ctx.fillRect(60, 618, width - 120, 1);
  ctx.fillStyle = '#475569';
  ctx.font = '400 17px monospace';
  ctx.fillText('Node.js · Telegram Bot API · Webhooks · Render', 60, 652);
}

function drawNeonSign(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const gradient = ctx.createLinearGradient(width * 0.18, 0, width * 0.82, 0);
  gradient.addColorStop(0, '#22d3ee');
  gradient.addColorStop(0.5, '#e6fdff');
  gradient.addColorStop(1, '#8b5cf6');

  ctx.font = '800 148px "Space Grotesk", "Inter", sans-serif';
  ctx.shadowColor = '#00f2fe';
  ctx.shadowBlur = 48;
  ctx.fillStyle = gradient;
  ctx.fillText('REVILEND.UZ', width / 2, height / 2 - 12);

  ctx.globalAlpha = 0.35;
  ctx.shadowBlur = 90;
  ctx.fillText('REVILEND.UZ', width / 2, height / 2 - 12);
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 18;
  ctx.shadowColor = 'rgba(139,92,246,0.9)';
  ctx.fillStyle = 'rgba(196,181,253,0.9)';
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillText('INTERAKTIV 3D XONA', width / 2, height - 42);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawWallPoster(ctx, width, height, accent, label, index) {
  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#0a1622');
  background.addColorStop(0.55, '#060d15');
  background.addColorStop(1, '#03070b');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const halo = ctx.createRadialGradient(
    width * 0.72,
    height * 0.26,
    0,
    width * 0.72,
    height * 0.26,
    width * 0.55
  );
  halo.addColorStop(0, accent);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.strokeStyle = 'rgba(148,163,184,0.10)';
  ctx.lineWidth = 1;
  for (let x = 32; x < width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 32; y < height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(226,232,240,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.38, width * 0.24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.38, width * 0.18, -Math.PI * 0.2, Math.PI * 1.15);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.font = '500 17px monospace';
  ctx.fillText(label, 38, 64);
  ctx.fillStyle = '#64748b';
  ctx.font = '400 13px monospace';
  ctx.fillText(`SERIES ${index} / REVILEND`, 38, 90);

  ctx.fillStyle = 'rgba(226,232,240,0.07)';
  ctx.font = '700 280px "Space Grotesk", sans-serif';
  ctx.fillText(index, 20, height - 112);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 36px "Space Grotesk", sans-serif';
  ctx.fillText('REVILEND', 38, height - 84);
  ctx.fillStyle = 'rgba(148,163,184,0.72)';
  ctx.font = '500 16px monospace';
  ctx.fillText('CREATIVE SYSTEMS', 38, height - 54);
  ctx.fillStyle = accent;
  ctx.fillRect(38, height - 38, 54, 2);
}

function drawKeyboard(ctx, width, height) {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#031019');
  background.addColorStop(1, '#020a10');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const columns = 14;
  const rows = 4;
  const padding = 28;
  const gap = 8;
  const keyWidth = (width - padding * 2 - gap * (columns - 1)) / columns;
  const keyHeight = 62;
  const startY = 42;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = padding + column * (keyWidth + gap);
      const y = startY + row * (keyHeight + gap);
      ctx.fillStyle = 'rgba(7,28,39,0.9)';
      ctx.strokeStyle = 'rgba(34,211,238,0.32)';
      ctx.lineWidth = 1;
      roundedRect(ctx, x, y, keyWidth, keyHeight, 6);
      ctx.fill();
      ctx.stroke();

      if ((row === 2 && column === 0) || (row === 2 && column === 12)) {
        ctx.fillStyle = 'rgba(0,242,254,0.4)';
        roundedRect(ctx, x, y, keyWidth, keyHeight, 6);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = 'rgba(0,242,254,0.5)';
  ctx.fillRect(padding, height - 28, width - padding * 2, 2);
}

function drawFloorGlow(ctx, width, height) {
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
  gradient.addColorStop(0, 'rgba(0,242,254,0.6)');
  gradient.addColorStop(0.45, 'rgba(0,160,210,0.18)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export default function CyberRoomView({ onOpenProject, drawerOpen = false }) {
  const mountRef = useRef(null);
  const pinRefs = useRef({});
  const cameraApiRef = useRef(null);
  const openProjectRef = useRef(onOpenProject);
  const walkAxisRef = useRef({ x: 0, y: 0 });
  const nearDeskRef = useRef(false);
  const [activeView, setActiveView] = useState('desk');
  const [webglError, setWebglError] = useState(false);
  const [autoTour, setAutoTour] = useState(false);
  const [walkMode, setWalkMode] = useState(false);
  const [nearDesk, setNearDesk] = useState(false);
  const [computerOpen, setComputerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [canPointerLock] = useState(
    () => typeof document !== 'undefined' && 'pointerLockElement' in document
  );
  const [canFullscreen] = useState(
    () =>
      typeof document !== 'undefined' &&
      typeof document.documentElement.requestFullscreen === 'function'
  );

  useEffect(() => {
    openProjectRef.current = onOpenProject;
  }, [onOpenProject]);

  const focusView = useCallback((key) => {
    setAutoTour(false);
    setActiveView(key);
    cameraApiRef.current?.focus(key);
  }, []);

  const setWalkAxis = useCallback((x, y) => {
    if (walkAxisRef.current) {
      walkAxisRef.current.x = x;
      walkAxisRef.current.y = y;
    }
  }, []);

  const toggleWalk = useCallback(() => {
    setAutoTour(false);
    if (walkMode) {
      cameraApiRef.current?.stopWalk();
      setWalkMode(false);
      setNearDesk(false);
      setActiveView('desk');
    } else {
      cameraApiRef.current?.startWalk();
      setWalkMode(true);
    }
  }, [walkMode]);

  const exitWalk = useCallback(() => {
    cameraApiRef.current?.stopWalk();
    setWalkMode(false);
    setNearDesk(false);
    setActiveView('desk');
  }, []);

  const sitAtComputer = useCallback(() => {
    cameraApiRef.current?.sit();
    setWalkMode(false);
    setNearDesk(false);
    setComputerOpen(true);
  }, []);

  const closeComputer = useCallback(() => {
    setComputerOpen(false);
    setWalkMode(true);
    setActiveView('desk');
    // Oʻrindan turgandan soʻng stol oldida, joystick bilan yurishga tayyor holda qaytamiz.
    cameraApiRef.current?.stand();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* Fullscreen can be refused by the browser; the room keeps working. */
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (computerOpen || drawerOpen) return;
      if (walkMode) {
        if (key === 'escape' && !pointerLocked) exitWalk();
        else if (key === 'e' && nearDesk) sitAtComputer();
        return;
      }
      if (key === '1') focusView('teachermuzaffar');
      else if (key === '2') focusView('echoes-of-room-404');
      else if (key === '3') focusView('telegram-automation');
      else if (key === '0' || key === 'r') focusView('desk');
      else if (key === '+' || key === '=') cameraApiRef.current?.zoom(0.88);
      else if (key === '-' || key === '_') cameraApiRef.current?.zoom(1.14);
      else if (key === 't') setAutoTour((value) => !value);
      else if (key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    focusView,
    toggleFullscreen,
    walkMode,
    computerOpen,
    drawerOpen,
    pointerLocked,
    exitWalk,
    sitAtComputer,
    nearDesk,
  ]);

  useEffect(() => {
    if (!autoTour) return undefined;

    let index = 0;
    const step = () => {
      index = (index + 1) % VIEWS.length;
      const view = VIEWS[index];
      setActiveView(view.key);
      cameraApiRef.current?.focus(view.key);
    };

    step();
    const timer = window.setInterval(step, 5200);
    return () => window.clearInterval(timer);
  }, [autoTour]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#05070d');
    scene.fog = new THREE.Fog('#05070d', 14, 32);

    const camera = new THREE.PerspectiveCamera(window.innerWidth < 768 ? 58 : 46, 1, 0.1, 100);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(1, 1, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'block h-full w-full touch-none';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    // Lighting is intentionally generous so the room reads clearly, never pitch black.
    scene.add(new THREE.AmbientLight('#9fc6ff', 2.8));

    const keyLight = new THREE.DirectionalLight('#ffffff', 3.2);
    keyLight.position.set(4.5, 7, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    const deskLight = new THREE.PointLight('#00f2fe', 4.5, 10, 2);
    deskLight.position.set(0, 1.75, 1.3);
    scene.add(deskLight);

    const rimLeft = new THREE.PointLight('#8b5cf6', 8, 16, 2);
    rimLeft.position.set(-4.5, 3, -1.5);
    scene.add(rimLeft);

    const rimRight = new THREE.PointLight('#7c3aed', 6, 14, 2);
    rimRight.position.set(4.6, 2.4, 1.4);
    scene.add(rimRight);

    const signLight = new THREE.PointLight('#22d3ee', 6, 10, 2);
    signLight.position.set(0, 3.3, -2.7);
    scene.add(signLight);

    const makeTexture = (width, height, draw) => {
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = width;
      textureCanvas.height = height;
      const ctx = textureCanvas.getContext('2d');
      draw(ctx, width, height);
      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return texture;
    };

    const teacherTexture = makeTexture(1536, 600, drawTeacherScreen);
    const echoesTexture = makeTexture(768, 1200, drawEchoesScreen);
    const telegramTexture = makeTexture(1200, 700, drawTelegramScreen);
    const neonTexture = makeTexture(1600, 360, drawNeonSign);
    const keyboardTexture = makeTexture(1024, 420, drawKeyboard);
    const floorGlowTexture = makeTexture(256, 256, drawFloorGlow);
    const posterOneTexture = makeTexture(560, 760, (ctx, width, height) =>
      drawWallPoster(ctx, width, height, '#22d3ee', 'SPATIAL INTERFACES', '01')
    );
    const posterTwoTexture = makeTexture(560, 760, (ctx, width, height) =>
      drawWallPoster(ctx, width, height, '#a78bfa', 'SYSTEM ARCHITECTURE', '02')
    );

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: '#0a121c',
      metalness: 0.9,
      roughness: 0.26,
    });
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: '#101b27',
      metalness: 0.82,
      roughness: 0.3,
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: '#070f17',
      metalness: 0.75,
      roughness: 0.42,
    });
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#0a141f',
      metalness: 0.14,
      roughness: 0.88,
    });
    const trimMaterial = new THREE.MeshStandardMaterial({
      color: '#050c13',
      metalness: 0.55,
      roughness: 0.44,
    });
    const rugMaterial = new THREE.MeshStandardMaterial({
      color: '#06101a',
      metalness: 0.04,
      roughness: 0.98,
    });

    const addMesh = (mesh, castShadow = true, receiveShadow = true) => {
      mesh.castShadow = castShadow;
      mesh.receiveShadow = receiveShadow;
      scene.add(mesh);
      return mesh;
    };

    const ROOM = {
      width: 14.4,
      depth: 12.8,
      centerZ: 2.2,
      height: 5.2,
      backZ: -4.2,
      frontZ: 8.6,
    };

    const floor = addMesh(
      new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
        new THREE.MeshStandardMaterial({ color: '#06101a', metalness: 0.9, roughness: 0.28 })
      ),
      false,
      true
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, ROOM.centerZ);

    const grid = new THREE.GridHelper(ROOM.width, 32, '#00f2fe', '#0e7490');
    grid.scale.z = ROOM.depth / ROOM.width;
    grid.position.set(0, 0.012, ROOM.centerZ);
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    grid.material.depthWrite = false;
    grid.material.toneMapped = false;
    scene.add(grid);

    const floorGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 9),
      new THREE.MeshBasicMaterial({
        map: floorGlowTexture,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, 0.015, 1.2);
    scene.add(floorGlow);

    const rug = addMesh(
      new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.8), rugMaterial),
      false,
      true
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.018, 2.05);

    const rugInset = new THREE.Mesh(
      new THREE.PlaneGeometry(5.9, 3.2),
      new THREE.MeshStandardMaterial({ color: '#0a1722', metalness: 0.03, roughness: 1 })
    );
    rugInset.rotation.x = -Math.PI / 2;
    rugInset.position.set(0, 0.022, 2.05);
    scene.add(rugInset);

    [-1, 1].forEach((side) => {
      const rugLine = new THREE.Mesh(
        new THREE.BoxGeometry(4.9, 0.012, 0.018),
        new THREE.MeshBasicMaterial({ color: '#0e7490', toneMapped: false })
      );
      rugLine.position.set(0, 0.028, 2.05 + side * 1.62);
      scene.add(rugLine);
    });

    const backWall = addMesh(
      new THREE.Mesh(new THREE.BoxGeometry(ROOM.width, ROOM.height, 0.18), wallMaterial),
      false,
      true
    );
    backWall.position.set(0, ROOM.height / 2, ROOM.backZ);

    const frontWall = addMesh(
      new THREE.Mesh(new THREE.BoxGeometry(ROOM.width, ROOM.height, 0.18), wallMaterial),
      false,
      true
    );
    frontWall.position.set(0, ROOM.height / 2, ROOM.frontZ);

    [-1, 1].forEach((side) => {
      const sideWall = addMesh(
        new THREE.Mesh(new THREE.BoxGeometry(0.18, ROOM.height, ROOM.depth), wallMaterial),
        false,
        true
      );
      sideWall.position.set(side * (ROOM.width / 2), ROOM.height / 2, ROOM.centerZ);
    });

    const ceiling = addMesh(
      new THREE.Mesh(new THREE.BoxGeometry(ROOM.width, 0.12, ROOM.depth), wallMaterial),
      false,
      true
    );
    ceiling.position.set(0, ROOM.height + 0.06, ROOM.centerZ);

    [
      [ROOM.width, 0.12, 0.08, 0, 0.06, ROOM.backZ + 0.14],
      [ROOM.width, 0.12, 0.08, 0, 0.06, ROOM.frontZ - 0.14],
      [0.08, 0.12, ROOM.depth, -(ROOM.width / 2) + 0.14, 0.06, ROOM.centerZ],
      [0.08, 0.12, ROOM.depth, ROOM.width / 2 - 0.14, 0.06, ROOM.centerZ],
    ].forEach(([width, height, depth, x, y, z]) => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), trimMaterial);
      trim.position.set(x, y, z);
      trim.receiveShadow = true;
      scene.add(trim);
    });

    for (let index = 0; index < 14; index += 1) {
      const z = -2.85 + index * 0.43;
      [-1, 1].forEach((side) => {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 3.4, 0.13),
          trimMaterial
        );
        slat.position.set(side * (ROOM.width / 2 - 0.1), 2.35, z);
        slat.receiveShadow = true;
        scene.add(slat);
      });
    }

    const coveMaterial = new THREE.MeshBasicMaterial({ color: '#bff8ff', toneMapped: false });
    [0.9, 4.1].forEach((z, index) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(index === 0 ? 7.4 : 6.2, 0.03, 0.08),
        coveMaterial
      );
      strip.position.set(0, ROOM.height - 0.02, z);
      scene.add(strip);
    });

    [-1, 1].forEach((side) => {
      const cove = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 2.5, 0.05),
        new THREE.MeshBasicMaterial({ color: side < 0 ? '#8b5cf6' : '#22d3ee', toneMapped: false })
      );
      cove.position.set(side * (ROOM.width / 2 - 0.13), 2.7, 4.7);
      scene.add(cove);
    });

    const ceilingLight = new THREE.PointLight('#bdefff', 3.6, 13, 2);
    ceilingLight.position.set(0, 4.75, 2.1);
    scene.add(ceilingLight);

    const frontLight = new THREE.PointLight('#6d8dff', 2.2, 10, 2);
    frontLight.position.set(0, 3.4, 6.6);
    scene.add(frontLight);

    [-5.6, 5.6].forEach((x) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 2.4, 0.035),
        new THREE.MeshBasicMaterial({ color: '#6d28d9', toneMapped: false })
      );
      bar.position.set(x, 3.1, ROOM.backZ + 0.16);
      scene.add(bar);
    });

    const neonSign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 1.08),
      new THREE.MeshBasicMaterial({
        map: neonTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      })
    );
    neonSign.position.set(0, 3.6, ROOM.backZ + 0.16);
    scene.add(neonSign);

    [
      { texture: posterOneTexture, x: -4.65 },
      { texture: posterTwoTexture, x: 4.65 },
    ].forEach(({ texture, x }) => {
      const posterFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 2.06, 0.06),
        frameMaterial
      );
      posterFrame.position.set(x, 3.0, ROOM.backZ + 0.13);
      posterFrame.castShadow = true;
      scene.add(posterFrame);

      const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.9),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
      );
      poster.position.set(x, 3.0, ROOM.backZ + 0.17);
      scene.add(poster);
    });

    const shelf = addMesh(
      new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 2.45), frameMaterial),
      true,
      true
    );
    shelf.position.set(ROOM.width / 2 - 0.29, 2.74, 1.7);

    const bookColors = ['#1d4ed8', '#0f766e', '#7c3aed', '#0e7490', '#334155', '#9f1239'];
    bookColors.forEach((color, index) => {
      const bookHeight = 0.25 + (index % 3) * 0.06;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, bookHeight, 0.09),
        new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.72 })
      );
      book.position.set(
        ROOM.width / 2 - 0.34,
        2.77 + bookHeight / 2,
        0.72 + index * 0.3
      );
      book.castShadow = true;
      scene.add(book);
    });

    const doorGroup = new THREE.Group();
    doorGroup.position.set(3.35, 0, ROOM.frontZ - 0.16);

    const doorPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.54, 2.72, 0.07),
      new THREE.MeshStandardMaterial({ color: '#0b1722', metalness: 0.38, roughness: 0.62 })
    );
    doorPanel.position.y = 1.36;
    doorPanel.castShadow = true;
    doorGroup.add(doorPanel);

    [
      [-0.84, 1.4, 0.1, 2.9],
      [0.84, 1.4, 0.1, 2.9],
      [0, 2.84, 1.78, 0.1],
    ].forEach(([x, y, width, height]) => {
      const framePart = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.12),
        trimMaterial
      );
      framePart.position.set(x, y, 0.01);
      doorGroup.add(framePart);
    });

    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#8b9aab', metalness: 0.9, roughness: 0.22 })
    );
    handle.position.set(0.55, 1.28, -0.06);
    doorGroup.add(handle);
    scene.add(doorGroup);

    const doorLight = new THREE.PointLight('#4cc2ff', 1.5, 4.5, 2);
    doorLight.position.set(3.35, 3.15, ROOM.frontZ - 0.5);
    scene.add(doorLight);

    const plant = new THREE.Group();
    plant.position.set(5.35, 0, -2.5);

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.36, 0.52, 20),
      new THREE.MeshStandardMaterial({ color: '#11212c', metalness: 0.2, roughness: 0.76 })
    );
    pot.position.y = 0.26;
    pot.castShadow = true;
    plant.add(pot);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: '#1a120b', roughness: 1 })
    );
    soil.position.y = 0.52;
    plant.add(soil);

    for (let index = 0; index < 9; index += 1) {
      const angle = (index / 9) * Math.PI * 2;
      const stemHeight = 0.45 + (index % 3) * 0.2;
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.02, stemHeight, 6),
        new THREE.MeshStandardMaterial({ color: '#1e5f4d', roughness: 0.9 })
      );
      stem.position.set(Math.cos(angle) * 0.08, 0.55 + stemHeight / 2, Math.sin(angle) * 0.08);
      stem.rotation.z = Math.cos(angle) * 0.18;
      plant.add(stem);

      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 6),
        new THREE.MeshStandardMaterial({
          color: index % 2 === 0 ? '#2d7a62' : '#1f6b54',
          roughness: 0.86,
        })
      );
      leaf.scale.set(1.35, 0.28, 0.62);
      leaf.position.set(
        Math.cos(angle) * 0.33,
        0.55 + stemHeight,
        Math.sin(angle) * 0.33
      );
      leaf.rotation.z = Math.cos(angle) * 0.6;
      leaf.castShadow = true;
      plant.add(leaf);
    }
    scene.add(plant);

    const plantLight = new THREE.PointLight('#34d399', 1.2, 4, 2);
    plantLight.position.set(5.0, 1.2, -2.3);
    scene.add(plantLight);

    const mug = new THREE.Group();
    mug.position.set(2.35, 1.075, 0.5);
    const mugBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.1, 0.19, 20),
      new THREE.MeshStandardMaterial({ color: '#0d1a24', metalness: 0.3, roughness: 0.45 })
    );
    mugBody.position.y = 0.095;
    mugBody.castShadow = true;
    mug.add(mugBody);
    const mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.018, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#0d1a24', metalness: 0.3, roughness: 0.45 })
    );
    mugHandle.position.set(0.11, 0.1, 0);
    mugHandle.rotation.y = Math.PI / 2;
    mug.add(mugHandle);
    scene.add(mug);

    const notebook = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.025, 0.4),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.82 })
    );
    notebook.position.set(2.3, 1.085, -0.18);
    notebook.rotation.y = 0.12;
    notebook.castShadow = true;
    scene.add(notebook);

    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8),
      new THREE.MeshStandardMaterial({ color: '#22d3ee', metalness: 0.5, roughness: 0.3 })
    );
    pen.position.set(2.52, 1.1, -0.1);
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.35;
    scene.add(pen);

    const deskTop = addMesh(new THREE.Mesh(new THREE.BoxGeometry(6, 0.14, 1.75), deskMaterial));
    deskTop.position.set(0, 1.0, 0);

    const legGeometry = new THREE.BoxGeometry(0.1, 0.93, 0.1);
    [
      [-2.7, -0.65],
      [2.7, -0.65],
      [-2.7, 0.65],
      [2.7, 0.65],
    ].forEach(([x, z]) => {
      const leg = addMesh(new THREE.Mesh(legGeometry, darkMetal));
      leg.position.set(x, 0.465, z);
    });

    const frontStrip = new THREE.Mesh(
      new THREE.BoxGeometry(5.7, 0.035, 0.035),
      new THREE.MeshBasicMaterial({ color: '#00f2fe', toneMapped: false })
    );
    frontStrip.position.set(0, 0.92, 0.87);
    scene.add(frontStrip);

    const backStrip = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.03, 0.03),
      new THREE.MeshBasicMaterial({ color: '#8b5cf6', toneMapped: false })
    );
    backStrip.position.set(0, 0.92, -0.87);
    scene.add(backStrip);

    const clickTargets = [];

    const makeMonitor = ({ texture, width, height, x, y, z, rotationY = 0, projectId }) => {
      const group = new THREE.Group();

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.12, height + 0.12, 0.08),
        frameMaterial
      );
      frame.castShadow = true;
      frame.receiveShadow = true;
      frame.userData.projectId = projectId;
      group.add(frame);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
      );
      screen.position.z = 0.046;
      screen.userData.projectId = projectId;
      group.add(screen);

      clickTargets.push(screen, frame);

      const poleHeight = Math.max(0.14, y - height / 2 - 1.07);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, poleHeight, 16), frameMaterial);
      pole.position.set(0, -(height / 2 + poleHeight / 2), 0);
      pole.castShadow = true;
      group.add(pole);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.34), frameMaterial);
      base.position.set(0, 1.075 - y, 0.03);
      group.add(base);

      group.position.set(x, y, z);
      group.rotation.y = rotationY;
      scene.add(group);
      return group;
    };

    makeMonitor({
      texture: teacherTexture,
      width: 2.7,
      height: 1.05,
      x: -0.35,
      y: 1.95,
      z: -0.65,
      projectId: 'teachermuzaffar',
    });

    makeMonitor({
      texture: echoesTexture,
      width: 0.78,
      height: 1.24,
      x: 1.55,
      y: 1.95,
      z: -0.58,
      rotationY: -0.2,
      projectId: 'echoes-of-room-404',
    });

    const laptop = new THREE.Group();
    laptop.position.set(-1.95, 1.07, 0.12);

    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.055, 0.8), frameMaterial);
    laptopBase.position.y = 0.028;
    laptopBase.castShadow = true;
    laptopBase.receiveShadow = true;
    laptop.add(laptopBase);

    const keyboard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 0.42),
      new THREE.MeshBasicMaterial({ map: keyboardTexture, toneMapped: false })
    );
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, 0.06, 0.08);
    laptop.add(keyboard);

    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 0.05, -0.37);
    lidPivot.rotation.x = -0.24;

    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.74, 0.04), frameMaterial);
    lid.position.y = 0.37;
    lid.castShadow = true;
    lid.userData.projectId = 'telegram-automation';
    lidPivot.add(lid);

    const laptopScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.06, 0.62),
      new THREE.MeshBasicMaterial({ map: telegramTexture, toneMapped: false })
    );
    laptopScreen.position.set(0, 0.37, 0.023);
    laptopScreen.userData.projectId = 'telegram-automation';
    lidPivot.add(laptopScreen);

    clickTargets.push(laptopScreen, lid);
    laptop.add(lidPivot);
    scene.add(laptop);

    const rack = new THREE.Group();
    rack.position.set(-3.5, 0, -1.15);

    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.35, 0.85),
      new THREE.MeshStandardMaterial({ color: '#050b12', metalness: 0.85, roughness: 0.32 })
    );
    tower.position.y = 1.175;
    tower.castShadow = true;
    tower.receiveShadow = true;
    rack.add(tower);

    const rackPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 2.12, 0.03),
      new THREE.MeshStandardMaterial({ color: '#0a1722', metalness: 0.7, roughness: 0.4 })
    );
    rackPanel.position.set(0, 1.18, 0.44);
    rack.add(rackPanel);

    const ledMaterials = [];
    for (let index = 0; index < 9; index += 1) {
      const ledMaterial = new THREE.MeshBasicMaterial({
        color: index % 3 === 0 ? '#34d399' : '#22d3ee',
        transparent: true,
        opacity: 0.8,
        toneMapped: false,
      });
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.02), ledMaterial);
      led.position.set(0, 0.34 + index * 0.22, 0.465);
      rack.add(led);
      ledMaterials.push(ledMaterial);
    }

    const rackStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.9, 0.02),
      new THREE.MeshBasicMaterial({ color: '#00f2fe', toneMapped: false })
    );
    rackStrip.position.set(0.43, 1.2, 0.1);
    rack.add(rackStrip);
    scene.add(rack);

    const pinObjects = PINS.map((pin, index) => ({
      ...pin,
      position: new THREE.Vector3(...pin.anchor),
      phase: index * 1.8,
    }));

    const dustCount = 260;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let index = 0; index < dustCount; index += 1) {
      dustPositions[index * 3] = (Math.random() - 0.5) * 11.8;
      dustPositions[index * 3 + 1] = 0.3 + Math.random() * 4.5;
      dustPositions[index * 3 + 2] = -3.8 + Math.random() * 11.4;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: '#7df9ff',
      size: 0.028,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    const initialView = VIEW_MAP.desk;
    const compact = window.innerWidth < 768;
    const cameraState = {
      target: new THREE.Vector3(...initialView.target),
      goalTarget: new THREE.Vector3(...initialView.target),
      radius: compact ? initialView.mobileRadius : initialView.radius,
      goalRadius: compact ? initialView.mobileRadius : initialView.radius,
      theta: initialView.theta,
      goalTheta: initialView.theta,
      phi: initialView.phi,
      goalPhi: initialView.phi,
    };

    const WALK_EYE = 1.62;
    const WALK_RADIUS = 0.32;
    const WALK_BOUNDS = { minX: -6.52, maxX: 6.52, minZ: -3.55, maxZ: 7.9 };
    const walkState = {
      active: false,
      position: new THREE.Vector3(0, WALK_EYE, 3.4),
      yaw: 0,
      pitch: 0,
      bob: 0,
    };
    const walkKeys = { forward: false, back: false, left: false, right: false, sprint: false };

    const resetWalkInput = () => {
      walkKeys.forward = false;
      walkKeys.back = false;
      walkKeys.left = false;
      walkKeys.right = false;
      walkKeys.sprint = false;

      if (walkAxisRef.current) {
        walkAxisRef.current.x = 0;
        walkAxisRef.current.y = 0;
      }
    };

    // Dumaloq tana radiusi bilan stol va server rack atrofidagi AABB toʻqnashuvi.
    const isWalkBlocked = (x, z) => {
      const intersects = (minX, maxX, minZ, maxZ) =>
        x > minX - WALK_RADIUS &&
        x < maxX + WALK_RADIUS &&
        z > minZ - WALK_RADIUS &&
        z < maxZ + WALK_RADIUS;

      return (
        intersects(-3.02, 3.02, -0.98, 0.98) ||
        intersects(-3.98, -3.02, -1.76, -0.54) ||
        intersects(4.96, 5.74, -2.89, -2.11)
      );
    };

    const isNearDeskPosition = (x, z) =>
      Math.abs(x) < 2.85 && z > 1.14 && z < 2.42;

    const updateNearDesk = () => {
      if (!walkState.active) return;
      const near = isNearDeskPosition(walkState.position.x, walkState.position.z);
      if (near === nearDeskRef.current) return;
      nearDeskRef.current = near;
      setNearDesk(near);
    };

    const focus = (key) => {
      const view = VIEW_MAP[key] ?? initialView;
      const mobile = window.innerWidth < 768;
      cameraState.goalTarget.set(...view.target);
      cameraState.goalRadius = clampRadius(mobile ? view.mobileRadius : view.radius);
      cameraState.goalTheta = THREE.MathUtils.clamp(view.theta, -0.86, 0.86);
      cameraState.goalPhi = THREE.MathUtils.clamp(view.phi, 1.12, 1.53);
    };

    const clampRadius = (value) => {
      const mobile = window.innerWidth < 768;
      return THREE.MathUtils.clamp(value, mobile ? 2.1 : 1.35, 7.8);
    };

    const zoom = (factor) => {
      cameraState.goalRadius = clampRadius(cameraState.goalRadius * factor);
    };

    const startWalk = () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      walkState.active = true;
      walkState.position.copy(camera.position);
      walkState.position.x = THREE.MathUtils.clamp(
        walkState.position.x,
        WALK_BOUNDS.minX,
        WALK_BOUNDS.maxX
      );
      walkState.position.z = THREE.MathUtils.clamp(
        walkState.position.z,
        WALK_BOUNDS.minZ,
        WALK_BOUNDS.maxZ
      );
      if (isWalkBlocked(walkState.position.x, walkState.position.z)) {
        walkState.position.x = 0;
        walkState.position.z = 2.05;
      }
      walkState.yaw = Math.atan2(-direction.x, -direction.z);
      walkState.pitch = THREE.MathUtils.clamp(
        Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1)),
        -0.55,
        0.4
      );
      walkState.bob = 0;
      resetWalkInput();
      updateNearDesk();
    };

    const syncOrbitFromWalk = () => {
      const cosPitch = Math.cos(walkState.pitch);
      const direction = new THREE.Vector3(
        -Math.sin(walkState.yaw) * cosPitch,
        Math.sin(walkState.pitch),
        -Math.cos(walkState.yaw) * cosPitch
      );

      cameraState.target.copy(walkState.position).addScaledVector(direction, 3);
      cameraState.goalTarget.copy(cameraState.target);

      const offset = camera.position.clone().sub(cameraState.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      cameraState.radius = cameraState.goalRadius = spherical.radius;
      cameraState.theta = cameraState.goalTheta = spherical.theta;
      cameraState.phi = cameraState.goalPhi = THREE.MathUtils.clamp(
        spherical.phi,
        1.12,
        1.53
      );
    };

    const releasePointerLock = () => {
      if (document.pointerLockElement === canvas && document.exitPointerLock) {
        document.exitPointerLock();
      }
    };

    const lockPointer = () => {
      if (!walkState.active || document.pointerLockElement === canvas) return;
      try {
        const request = canvas.requestPointerLock?.();
        if (request && typeof request.catch === 'function') request.catch(() => {});
      } catch {
        /* Pointer lock is best-effort and needs browser support. */
      }
    };

    const stopWalk = () => {
      if (!walkState.active) return;
      releasePointerLock();
      syncOrbitFromWalk();
      walkState.active = false;
      resetWalkInput();
      nearDeskRef.current = false;
      setNearDesk(false);
      focus('desk');
    };

    const sit = () => {
      releasePointerLock();
      if (walkState.active) syncOrbitFromWalk();
      walkState.active = false;
      resetWalkInput();
      nearDeskRef.current = false;
      setNearDesk(false);
      focus('seat');
    };

    const stand = () => {
      releasePointerLock();
      walkState.active = true;
      walkState.position.set(0, WALK_EYE, 2.05);
      walkState.yaw = 0;
      walkState.pitch = -0.06;
      walkState.bob = 0;
      resetWalkInput();
      nearDeskRef.current = true;
      setNearDesk(true);
    };

    cameraApiRef.current = { focus, zoom, startWalk, stopWalk, sit, stand, lockPointer };

    const initialOffset = new THREE.Vector3().setFromSphericalCoords(
      cameraState.radius,
      cameraState.phi,
      cameraState.theta
    );
    camera.position.copy(cameraState.target).add(initialOffset);
    camera.lookAt(cameraState.target);

    const drag = { active: false, moved: false, x: 0, y: 0, startX: 0, startY: 0 };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const hitTest = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(clickTargets, false);
      return intersections.find((intersection) => intersection.object.userData.projectId) ?? null;
    };

    const pick = (clientX, clientY) => {
      const hit = hitTest(clientX, clientY);
      if (hit) openProjectRef.current?.(hit.object.userData.projectId);
    };

    const handlePointerDown = (event) => {
      if (document.pointerLockElement === canvas) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      setAutoTour(false);
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      canvas.style.cursor = 'grabbing';
      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          /* pointer capture is best-effort */
        }
      }
    };

    const handlePointerMove = (event) => {
      if (!drag.active) {
        canvas.style.cursor = hitTest(event.clientX, event.clientY) ? 'pointer' : 'grab';
        return;
      }
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8) {
        drag.moved = true;
      }
      if (walkState.active) {
        walkState.yaw -= deltaX * 0.0032;
        walkState.pitch = THREE.MathUtils.clamp(walkState.pitch - deltaY * 0.0026, -0.6, 0.45);
        return;
      }
      cameraState.goalTheta = THREE.MathUtils.clamp(
        cameraState.goalTheta - deltaX * 0.005,
        -0.86,
        0.86
      );
      cameraState.goalPhi = THREE.MathUtils.clamp(
        cameraState.goalPhi - deltaY * 0.004,
        1.12,
        1.53
      );
    };

    const handlePointerEnd = (event) => {
      if (!drag.active) return;
      drag.active = false;
      canvas.style.cursor = 'grab';
      if (!drag.moved) pick(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      if (!drag.active) canvas.style.cursor = 'grab';
    };

    const handleWheel = (event) => {
      if (walkState.active || Math.abs(event.deltaY) < 1) return;
      event.preventDefault();
      setAutoTour(false);
      const factor = event.deltaY > 0 ? 1.08 : 0.92;
      cameraState.goalRadius = clampRadius(cameraState.goalRadius * factor);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerEnd);
    canvas.addEventListener('pointercancel', handlePointerEnd);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const walkKeyMap = {
      w: 'forward',
      arrowup: 'forward',
      s: 'back',
      arrowdown: 'back',
      a: 'left',
      arrowleft: 'left',
      d: 'right',
      arrowright: 'right',
    };

    const handleWalkKeyDown = (event) => {
      if (!walkState.active) return;
      const key = event.key.toLowerCase();
      if (key === 'shift') walkKeys.sprint = true;
      const direction = walkKeyMap[key];
      if (direction) {
        event.preventDefault();
        walkKeys[direction] = true;
      }
    };

    const handleWalkKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'shift') walkKeys.sprint = false;
      const direction = walkKeyMap[key];
      if (direction) walkKeys[direction] = false;
    };

    const handleWalkBlur = () => resetWalkInput();

    const handlePointerLockChange = () => {
      setPointerLocked(document.pointerLockElement === canvas);
    };

    const handleLockedMouseMove = (event) => {
      if (!walkState.active || document.pointerLockElement !== canvas) return;
      walkState.yaw -= event.movementX * 0.0024;
      walkState.pitch = THREE.MathUtils.clamp(
        walkState.pitch - event.movementY * 0.0024,
        -0.7,
        0.5
      );
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleLockedMouseMove);
    window.addEventListener('keydown', handleWalkKeyDown);
    window.addEventListener('keyup', handleWalkKeyUp);
    window.addEventListener('blur', handleWalkBlur);

    let frameId = null;
    let elapsed = 0;
    let paused = false;
    const clock = new THREE.Clock();
    const offsetVector = new THREE.Vector3();
    const pinVector = new THREE.Vector3();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (paused) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;
      const ease = 1 - Math.exp(-6 * delta);

      const orbitFov = window.innerWidth < 768 ? 58 : 46;

      if (walkState.active) {
        const axis = walkAxisRef.current ?? { x: 0, y: 0 };
        const forwardInput = THREE.MathUtils.clamp(
          (walkKeys.forward ? 1 : 0) - (walkKeys.back ? 1 : 0) - axis.y,
          -1,
          1
        );
        const strafeInput = THREE.MathUtils.clamp(
          (walkKeys.right ? 1 : 0) - (walkKeys.left ? 1 : 0) + axis.x,
          -1,
          1
        );
        const inputLength = Math.hypot(forwardInput, strafeInput);
        const moving = inputLength > 0.06;

        let moved = false;
        if (moving) {
          const strength = Math.min(1, inputLength);
          const directionForward = forwardInput / inputLength;
          const directionStrafe = strafeInput / inputLength;
          const speed = (walkKeys.sprint ? 3.4 : 2.0) * strength * delta;
          const sin = Math.sin(walkState.yaw);
          const cos = Math.cos(walkState.yaw);
          const beforeX = walkState.position.x;
          const beforeZ = walkState.position.z;

          const nextX = THREE.MathUtils.clamp(
            beforeX +
              (directionForward * -sin + directionStrafe * cos) * speed,
            WALK_BOUNDS.minX,
            WALK_BOUNDS.maxX
          );
          if (!isWalkBlocked(nextX, walkState.position.z)) {
            walkState.position.x = nextX;
          }

          const nextZ = THREE.MathUtils.clamp(
            beforeZ +
              (directionForward * -cos + directionStrafe * -sin) * speed,
            WALK_BOUNDS.minZ,
            WALK_BOUNDS.maxZ
          );
          if (!isWalkBlocked(walkState.position.x, nextZ)) {
            walkState.position.z = nextZ;
          }

          moved =
            Math.abs(walkState.position.x - beforeX) > 0.0001 ||
            Math.abs(walkState.position.z - beforeZ) > 0.0001;
          if (moved) {
            walkState.bob += delta * (walkKeys.sprint ? 11 : 8) * Math.max(strength, 0.45);
          }
          updateNearDesk();
        }

        const targetEye = WALK_EYE + (moved ? Math.sin(walkState.bob) * 0.018 : 0);
        walkState.position.y +=
          (targetEye - walkState.position.y) * (1 - Math.exp(-8 * delta));

        const cosPitch = Math.cos(walkState.pitch);
        camera.position.copy(walkState.position);
        camera.lookAt(
          camera.position.x - Math.sin(walkState.yaw) * cosPitch,
          camera.position.y + Math.sin(walkState.pitch),
          camera.position.z - Math.cos(walkState.yaw) * cosPitch
        );

        const walkFov = window.innerWidth < 768 ? 66 : 60;
        if (Math.abs(camera.fov - walkFov) > 0.01) {
          camera.fov += (walkFov - camera.fov) * ease;
          camera.updateProjectionMatrix();
        }
      } else {
        cameraState.target.lerp(cameraState.goalTarget, ease);
        cameraState.radius += (cameraState.goalRadius - cameraState.radius) * ease;
        cameraState.theta += (cameraState.goalTheta - cameraState.theta) * ease;
        cameraState.phi += (cameraState.goalPhi - cameraState.phi) * ease;
        cameraState.theta = THREE.MathUtils.clamp(cameraState.theta, -0.86, 0.86);
        cameraState.phi = THREE.MathUtils.clamp(cameraState.phi, 1.12, 1.53);

        offsetVector.setFromSphericalCoords(
          cameraState.radius,
          cameraState.phi,
          cameraState.theta
        );
        camera.position.copy(cameraState.target).add(offsetVector);
        camera.position.y = Math.min(camera.position.y, ROOM.height - 0.32);
        camera.lookAt(cameraState.target);

        if (Math.abs(camera.fov - orbitFov) > 0.01) {
          camera.fov += (orbitFov - camera.fov) * ease;
          camera.updateProjectionMatrix();
        }
      }

      const viewportWidth = mount.clientWidth || 1;
      const viewportHeight = mount.clientHeight || 1;
      const pinTop = window.innerWidth < 768 ? 150 : 96;
      const pinBottom = window.innerWidth < 768 ? 190 : 150;

      pinObjects.forEach((pin) => {
        const element = pinRefs.current[pin.id];
        if (!element) return;
        pinVector.copy(pin.position);
        pinVector.y += Math.sin(elapsed * 1.5 + pin.phase) * 0.035;
        pinVector.project(camera);

        const x = (pinVector.x * 0.5 + 0.5) * viewportWidth;
        const y = (-pinVector.y * 0.5 + 0.5) * viewportHeight;
        const visible =
          pinVector.z < 1 &&
          x > 24 &&
          x < viewportWidth - 24 &&
          y > pinTop &&
          y < viewportHeight - pinBottom;

        element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
        element.style.opacity = visible ? '1' : '0';
        element.style.pointerEvents = visible ? 'auto' : 'none';
      });

      ledMaterials.forEach((material, index) => {
        material.opacity = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(elapsed * 2.2 + index * 0.8));
      });
      signLight.intensity = 5.5 + Math.sin(elapsed * 1.6) * 1.1;

      dust.position.x = Math.sin(elapsed * 0.12) * 0.18;
      dust.position.y = Math.sin(elapsed * 0.24) * 0.06;
      dustMaterial.opacity = 0.42 + Math.sin(elapsed * 0.8) * 0.12;

      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = walkState.active
        ? window.innerWidth < 768
          ? 66
          : 60
        : window.innerWidth < 768
          ? 58
          : 46;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const handleVisibility = () => {
      paused = document.hidden;
      if (!paused) clock.getDelta();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    resize();
    animate();

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleLockedMouseMove);
      window.removeEventListener('keydown', handleWalkKeyDown);
      window.removeEventListener('keyup', handleWalkKeyUp);
      window.removeEventListener('blur', handleWalkBlur);
      releasePointerLock();
      walkState.active = false;
      resetWalkInput();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerEnd);
      canvas.removeEventListener('pointercancel', handlePointerEnd);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('wheel', handleWheel);
      cameraApiRef.current = null;

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : object.material
            ? [object.material]
            : [];
        materials.forEach((material) => {
          Object.keys(material).forEach((key) => {
            const value = material[key];
            if (value && value.isTexture) value.dispose();
          });
          material.dispose();
        });
      });

      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 animate-fade-in overflow-hidden bg-[#05070d]">
      <div
        ref={mountRef}
        className="absolute inset-0 h-full w-full cursor-grab touch-none"
        role="region"
        aria-label="Revilend interaktiv 3D cyber xona"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(5,7,13,0.55) 100%)',
        }}
      />

      {webglError ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#05070d] px-6 text-center">
          <div>
            <p className="font-display text-xl font-semibold text-white">3D xona ochilmadi</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
              Brauzeringiz WebGL’ni qoʻllab-quvvatlamayapti. Yuqoridagi tugma orqali 2D portfolio
              rejimiga qaytishingiz mumkin.
            </p>
          </div>
        </div>
      ) : null}

      {walkMode || computerOpen ? null : (
        <div className="pointer-events-none absolute inset-0 z-10">
        {PINS.map((pin) => (
          <button
            key={pin.id}
            ref={(node) => {
              pinRefs.current[pin.id] = node;
            }}
            type="button"
            onClick={() => {
              setAutoTour(false);
              onOpenProject?.(pin.id);
            }}
            aria-label={`${pin.label} loyihasini ochish`}
            className="pointer-events-auto absolute left-0 top-0 whitespace-nowrap rounded-full border border-electric/30 bg-ink-900/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-200 shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors hover:border-electric/60 hover:text-white"
            style={{ opacity: 0, willChange: 'transform' }}
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-electric align-middle shadow-[0_0_8px_rgba(0,242,254,0.9)] motion-reduce:animate-none" />
            {pin.label}
          </button>
        ))}
        </div>
      )}

      {walkMode && !computerOpen ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric/60 bg-electric/30 shadow-[0_0_10px_rgba(0,242,254,0.9)]"
          />

          <div className="pointer-events-none absolute bottom-36 left-3 z-20 sm:bottom-40 sm:left-5">
            <div className="pointer-events-auto">
              <VirtualJoystick onChange={setWalkAxis} />
              <p className="mt-2 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-slate-500">
                Virtual joystick
              </p>
            </div>
          </div>

          {nearDesk ? (
            <div className="pointer-events-none absolute inset-x-0 top-32 z-30 flex justify-center px-4 sm:top-24">
              <button
                type="button"
                onClick={sitAtComputer}
                className="pointer-events-auto inline-flex animate-rise items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-electric to-cyan-300 px-5 py-3 text-[13px] font-semibold text-ink-950 shadow-[0_0_38px_-8px_rgba(0,242,254,0.95)] transition hover:scale-[1.03] active:scale-95 sm:text-sm"
              >
                <Armchair size={16} strokeWidth={1.8} />
                Kompyuterga oʻtirish
                <kbd className="ml-1 hidden rounded border border-ink-950/20 bg-ink-950/15 px-1.5 py-0.5 font-mono text-[9px] text-ink-950/70 sm:inline">
                  E
                </kbd>
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {computerOpen ? null : (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent px-3 pb-4 pt-24 sm:px-6 sm:pb-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3">
            {walkMode ? (
              <div className="pointer-events-auto flex w-full flex-wrap items-center justify-center gap-2">
                <span className="inline-flex h-9 items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-electric">
                  <Footprints size={14} />
                  Yurish rejimi
                </span>
                {canPointerLock ? (
                  pointerLocked ? (
                    <span className="hidden h-9 items-center gap-1.5 rounded-full border border-electric/25 bg-electric/10 px-3.5 text-[10px] font-medium text-electric sm:inline-flex">
                      <MousePointer2 size={14} />
                      Esc — qulfdan chiqish
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cameraApiRef.current?.lockPointer()}
                      className="hidden h-9 items-center gap-1.5 rounded-full border border-slate-700/70 bg-ink-900/85 px-3.5 text-[11px] font-medium text-slate-300 backdrop-blur-xl transition hover:border-slate-600 hover:text-white sm:inline-flex"
                    >
                      <MousePointer2 size={14} />
                      Sichqonchani qulflash
                    </button>
                  )
                ) : null}
                <button
                  type="button"
                  onClick={exitWalk}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-700/70 bg-ink-900/85 px-3.5 text-[11px] font-medium text-slate-300 backdrop-blur-xl transition hover:border-slate-600 hover:text-white"
                >
                  <X size={14} />
                  Chiqish
                </button>
              </div>
            ) : (
              <div className="pointer-events-auto flex w-full flex-wrap items-center justify-center gap-2">
                <div
                  role="group"
                  aria-label="3D kamera manzillari"
                  className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-700/60 bg-ink-900/85 p-1.5 shadow-2xl backdrop-blur-xl"
                >
                  {VIEWS.map((view) => (
                    <button
                      key={view.key}
                      type="button"
                      onClick={() => focusView(view.key)}
                      aria-pressed={activeView === view.key}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-medium transition sm:px-3.5 sm:text-[11px] ${
                        activeView === view.key
                          ? 'bg-electric text-ink-950'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>

                <div
                  role="group"
                  aria-label="3D boshqaruvlari"
                  className="flex items-center gap-0.5 rounded-full border border-slate-700/60 bg-ink-900/85 p-1.5 shadow-2xl backdrop-blur-xl"
                >
                  <button
                    type="button"
                    onClick={toggleWalk}
                    title="Birinchi shaxsda yurish"
                    className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium text-slate-400 transition hover:bg-slate-800/80 hover:text-white active:scale-95"
                  >
                    <Footprints size={14} />
                    Yurish
                  </button>

                  <span className="mx-1 h-5 w-px bg-slate-700/70" aria-hidden="true" />

                  <button
                    type="button"
                    onClick={() => cameraApiRef.current?.zoom(1.12)}
                    title="Kichiklashtirish (−)"
                    aria-label="3D kamerani kichiklashtirish"
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-800/80 hover:text-white active:scale-95"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraApiRef.current?.zoom(0.88)}
                    title="Kattalashtirish (+)"
                    aria-label="3D kamerani kattalashtirish"
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-800/80 hover:text-white active:scale-95"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => focusView('desk')}
                    title="Kamerani qayta tiklash (R)"
                    aria-label="Kamerani qayta tiklash"
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-800/80 hover:text-white active:scale-95"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <span className="mx-1 h-5 w-px bg-slate-700/70" aria-hidden="true" />

                  <button
                    type="button"
                    onClick={() => setAutoTour((value) => !value)}
                    aria-pressed={autoTour}
                    title="Avtomatik kamera sayri (T)"
                    className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-medium transition active:scale-95 ${
                      autoTour
                        ? 'bg-electric text-ink-950'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    {autoTour ? <Pause size={13} /> : <Play size={13} />}
                    <span className="hidden sm:inline">Avto sayr</span>
                  </button>

                  {canFullscreen ? (
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      title={isFullscreen ? 'Toʻliq ekrandan chiqish (F)' : 'Toʻliq ekran (F)'}
                      aria-label={isFullscreen ? 'Toʻliq ekrandan chiqish' : 'Toʻliq ekranga oʻtish'}
                      className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-800/80 hover:text-white active:scale-95"
                    >
                      {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <p className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">
              {walkMode ? (
                <>
                  <span className="sm:hidden">Chapdagi joystik bilan yuring · ekranni sudrab qarang</span>
                  <span className="hidden sm:inline">
                    WASD yoki strelkalar bilan yuring · sichqoncha bilan qarang · stol yonida E — oʻtirish
                  </span>
                </>
              ) : (
                <>
                  Sudrab aylantiring · gʻildirak bilan zoom
                  <span className="hidden sm:inline"> · 1–3, R, +/−</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      )}

      {computerOpen ? (
        <ComputerScreen
          onStandUp={closeComputer}
          onOpenProject={onOpenProject}
          drawerOpen={drawerOpen}
        />
      ) : null}
    </div>
  );
}
