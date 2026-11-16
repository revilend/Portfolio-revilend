import { useEffect, useRef } from 'react';
import { motionAllowed } from '../lib/scrollMotion.js';
import { attachWebglDiagnostics } from '../lib/telemetry.js';

// The whole page sits on one full-viewport fragment shader: a dark eclipse disc
// ringed by magenta and cyan aurora. Scroll feeds `u_scroll` (0 → 1) so the disc
// expands and the rings spin faster, and the cursor feeds `u_mouse` for a small
// camera parallax. Rendering it as a single fullscreen triangle keeps the draw
// call count at one per frame.

const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform vec2 u_mouse;

const vec3 INK = vec3(0.019607, 0.027451, 0.054902);
const vec3 MAGENTA = vec3(0.658824, 0.333333, 0.968627);
const vec3 FUCHSIA = vec3(0.850980, 0.274510, 0.937255);
const vec3 CYAN = vec3(0.023529, 0.713725, 0.831373);
const vec3 AQUA = vec3(0.133333, 0.827451, 0.933333);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  local = local * local * (3.0 - 2.0 * local);
  float a = hash21(cell);
  float b = hash21(cell + vec2(1.0, 0.0));
  float c = hash21(cell + vec2(0.0, 1.0));
  float d = hash21(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    sum += valueNoise(p) * amplitude;
    p *= 2.03;
    amplitude *= 0.5;
  }
  return sum;
}

void main() {
  float scroll = clamp(u_scroll, 0.0, 1.0);
  float time = u_time;

  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);

  // Scrolling pushes the eye in: the same screen radius covers more world, so
  // the disc and its rings swell while the cursor nudges the whole scene.
  vec2 pointer = u_mouse * (0.05 + scroll * 0.05);
  vec2 point = uv * mix(1.0, 0.86, scroll) - pointer;

  float radius = mix(0.33, 0.50, scroll) + sin(time * 0.55) * 0.006 + u_mouse.y * 0.008;
  float distanceToCenter = length(point);
  float angle = atan(point.y, point.x);

  float swirl = fbm(vec2(angle * 1.6 + time * 0.10, distanceToCenter * 3.0 - time * 0.16 + scroll * 1.8));
  float rays = 0.5 + 0.5 * sin(angle * 30.0 + swirl * 7.0 - time * (0.35 + scroll * 1.2));
  rays = pow(rays, 5.0);

  float rim = smoothstep(radius - 0.01, radius + 0.03, distanceToCenter) *
              (1.0 - smoothstep(radius + 0.04, radius + 0.40, distanceToCenter));
  float halo = exp(-max(0.0, distanceToCenter - radius) * 5.2);

  // Two counter-facing lobes keep magenta and cyan on opposite shoulders of the
  // rim instead of averaging into one grey-violet band.
  float lobeMagenta = pow(0.5 + 0.5 * cos(angle - time * (0.30 + scroll * 0.70) - 1.1), 2.0);
  float lobeCyan = pow(0.5 + 0.5 * cos(angle - time * (0.30 + scroll * 0.70) + 2.2), 2.0);
  float accent = pow(0.5 + 0.5 * cos(angle * 3.0 + time * 0.25), 3.0);

  vec3 aurora = mix(AQUA, FUCHSIA, lobeMagenta) + CYAN * lobeCyan * 0.35 + MAGENTA * accent * 0.30;

  float ring = rim * (0.28 + 0.95 * rays) + halo * (0.10 + 0.22 * swirl) * (0.40 + 0.60 * rays);
  vec3 color = INK + aurora * ring * (0.60 + scroll * 0.40);

  // Faint nebula haze so the empty corners are not flat black.
  float nebula = fbm(point * 1.35 + vec2(time * 0.02, -time * 0.03));
  color += mix(MAGENTA, CYAN, nebula) * nebula * 0.17 * smoothstep(0.25, 1.6, distanceToCenter);

  // The disc stays almost black: a crisp cut-out, never another glow.
  float disc = 1.0 - smoothstep(radius - 0.006, radius + 0.006, distanceToCenter);
  color = mix(color, vec3(0.006, 0.009, 0.020), disc);

  float innerRing = smoothstep(radius - 0.05, radius - 0.005, distanceToCenter) *
                    (1.0 - smoothstep(radius - 0.005, radius + 0.012, distanceToCenter));
  color += AQUA * innerRing * 0.45;

  float grain = hash21(gl_FragCoord.xy + fract(time) * 137.0) - 0.5;
  color += grain * 0.022;

  float vignette = 1.0 - smoothstep(0.55, 1.85, distanceToCenter);
  color *= mix(0.45, 1.0, vignette);

  gl_FragColor = vec4(color, 1.0);
}
`;

const STATIC_TIME = 12.0;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default function EclipseShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const attributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    };

    const gl =
      canvas.getContext('webgl2', attributes) ||
      canvas.getContext('webgl', attributes) ||
      canvas.getContext('experimental-webgl', attributes);

    // No WebGL: the canvas keeps its CSS gradient, which reads as a dim eclipse
    // and keeps the page fully usable on old browsers.
    if (!gl) return undefined;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    if (!program) return undefined;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // One oversized triangle covers the viewport without a vertex index buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const positionAttribute = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      scroll: gl.getUniformLocation(program, 'u_scroll'),
      mouse: gl.getUniformLocation(program, 'u_mouse'),
    };

    gl.clearColor(0.019607, 0.027451, 0.054902, 1);

    let width = 1;
    let height = 1;
    let running = true;
    let scroll = 0;
    let scrollGoal = 0;
    let elapsedTime = 0;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const scrollProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / scrollable));
    };

    const render = (time) => {
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform1f(uniforms.time, time);
      gl.uniform1f(uniforms.scroll, scroll);
      gl.uniform2f(uniforms.mouse, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.5);
      width = Math.max(1, Math.round(window.innerWidth * ratio));
      height = Math.max(1, Math.round(window.innerHeight * ratio));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      if (!running) {
        scroll = scrollProgress();
        render(STATIC_TIME);
      }
    };

    const handlePointer = (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = 1 - (event.clientY / window.innerHeight) * 2;
    };

    let frameId = 0;
    let last = performance.now();

    const frame = (now) => {
      frameId = requestAnimationFrame(frame);
      const delta = Math.min(64, now - last);
      last = now;

      // A hidden tab should cost nothing: no uploads, no draw calls.
      if (document.hidden) return;

      elapsedTime += delta / 1000;
      scrollGoal = scrollProgress();
      scroll += (scrollGoal - scroll) * Math.min(1, (delta / 1000) * 6);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      render(elapsedTime);
    };

    const stopDiagnostics = attachWebglDiagnostics(canvas, { label: 'eclipse-shader' });

    resize();
    window.addEventListener('resize', resize);

    if (!motionAllowed()) {
      // Reduced motion: one composed frame that still follows the scroll offset,
      // repainted only when the viewport changes.
      running = false;
      scroll = scrollProgress();
      render(STATIC_TIME);

      return () => {
        window.removeEventListener('resize', resize);
        stopDiagnostics();
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      };
    }

    window.addEventListener('pointermove', handlePointer, { passive: true });
    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointer);
      stopDiagnostics();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-eclipse-shader
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-85 [background:radial-gradient(120%_95%_at_50%_42%,#0b1120_0%,#070a14_46%,#05070e_100%)]"
    />
  );
}
