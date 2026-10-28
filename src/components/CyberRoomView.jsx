import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const VIEWS = [
  {
    key: 'desk',
    label: '💻 Stol',
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

const VIEW_MAP = Object.fromEntries(VIEWS.map((view) => [view.key, view]));

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

export default function CyberRoomView({ onOpenProject }) {
  const mountRef = useRef(null);
  const pinRefs = useRef({});
  const cameraApiRef = useRef(null);
  const openProjectRef = useRef(onOpenProject);
  const [activeView, setActiveView] = useState('desk');
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    openProjectRef.current = onOpenProject;
  }, [onOpenProject]);

  const focusView = (key) => {
    setActiveView(key);
    cameraApiRef.current?.focus(key);
  };

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

    const addMesh = (mesh, castShadow = true, receiveShadow = true) => {
      mesh.castShadow = castShadow;
      mesh.receiveShadow = receiveShadow;
      scene.add(mesh);
      return mesh;
    };

    const floor = addMesh(
      new THREE.Mesh(
        new THREE.PlaneGeometry(22, 22),
        new THREE.MeshStandardMaterial({ color: '#060d16', metalness: 0.92, roughness: 0.24 })
      ),
      false,
      true
    );
    floor.rotation.x = -Math.PI / 2;

    const grid = new THREE.GridHelper(22, 44, '#00f2fe', '#0e7490');
    grid.position.y = 0.012;
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    grid.material.depthWrite = false;
    grid.material.toneMapped = false;
    scene.add(grid);

    const floorGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({
        map: floorGlowTexture,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, 0.015, 0.3);
    scene.add(floorGlow);

    const wall = addMesh(
      new THREE.Mesh(
        new THREE.BoxGeometry(15, 7, 0.2),
        new THREE.MeshStandardMaterial({ color: '#081018', metalness: 0.4, roughness: 0.78 })
      ),
      false,
      true
    );
    wall.position.set(0, 3.5, -4.1);

    [-5.6, 5.6].forEach((x) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 2.4, 0.035),
        new THREE.MeshBasicMaterial({ color: '#6d28d9', toneMapped: false })
      );
      bar.position.set(x, 3.1, -4.0);
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
    neonSign.position.set(0, 3.6, -3.96);
    scene.add(neonSign);

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

    const focus = (key) => {
      const view = VIEW_MAP[key] ?? initialView;
      const mobile = window.innerWidth < 768;
      cameraState.goalTarget.set(...view.target);
      cameraState.goalRadius = mobile ? view.mobileRadius : view.radius;
      cameraState.goalTheta = view.theta;
      cameraState.goalPhi = view.phi;
    };
    cameraApiRef.current = { focus };

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

    const pick = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(clickTargets, false);
      if (intersections.length > 0) {
        const projectId = intersections[0].object.userData.projectId;
        if (projectId) openProjectRef.current?.(projectId);
      }
    };

    const handlePointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag.active = true;
      drag.moved = false;
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
      if (!drag.active) return;
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8) {
        drag.moved = true;
      }
      cameraState.goalTheta -= deltaX * 0.005;
      cameraState.goalPhi = THREE.MathUtils.clamp(
        cameraState.goalPhi - deltaY * 0.004,
        1.04,
        1.53
      );
    };

    const handlePointerEnd = (event) => {
      if (!drag.active) return;
      drag.active = false;
      canvas.style.cursor = 'grab';
      if (!drag.moved) pick(event.clientX, event.clientY);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerEnd);
    canvas.addEventListener('pointercancel', handlePointerEnd);

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

      cameraState.target.lerp(cameraState.goalTarget, ease);
      cameraState.radius += (cameraState.goalRadius - cameraState.radius) * ease;
      cameraState.theta += (cameraState.goalTheta - cameraState.theta) * ease;
      cameraState.phi += (cameraState.goalPhi - cameraState.phi) * ease;
      cameraState.phi = THREE.MathUtils.clamp(cameraState.phi, 1.02, 1.54);

      offsetVector.setFromSphericalCoords(cameraState.radius, cameraState.phi, cameraState.theta);
      camera.position.copy(cameraState.target).add(offsetVector);
      camera.lookAt(cameraState.target);

      const viewportWidth = mount.clientWidth || 1;
      const viewportHeight = mount.clientHeight || 1;
      const pinTop = window.innerWidth < 768 ? 150 : 96;

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
          y < viewportHeight - 140;

        element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
        element.style.opacity = visible ? '1' : '0';
        element.style.pointerEvents = visible ? 'auto' : 'none';
      });

      ledMaterials.forEach((material, index) => {
        material.opacity = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(elapsed * 2.2 + index * 0.8));
      });
      signLight.intensity = 5.5 + Math.sin(elapsed * 1.6) * 1.1;

      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = window.innerWidth < 768 ? 58 : 46;
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
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerEnd);
      canvas.removeEventListener('pointercancel', handlePointerEnd);
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

      <div className="pointer-events-none absolute inset-0 z-10">
        {PINS.map((pin) => (
          <button
            key={pin.id}
            ref={(node) => {
              pinRefs.current[pin.id] = node;
            }}
            type="button"
            onClick={() => onOpenProject?.(pin.id)}
            aria-label={`${pin.label} loyihasini ochish`}
            className="pointer-events-auto absolute left-0 top-0 whitespace-nowrap rounded-full border border-electric/30 bg-ink-900/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-200 shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors hover:border-electric/60 hover:text-white"
            style={{ opacity: 0, willChange: 'transform' }}
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-electric align-middle shadow-[0_0_8px_rgba(0,242,254,0.9)]" />
            {pin.label}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent px-3 pb-4 pt-24 sm:px-6 sm:pb-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3">
            <div
              role="group"
              aria-label="3D kamera manzillari"
              className="no-scrollbar pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-700/60 bg-ink-900/85 p-1.5 shadow-2xl backdrop-blur-xl"
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
            <p className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">
              Sudrab aylantiring · monitor yoki pin ustiga bosing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
