# Revilend.uz — Dual-Mode Developer Portfolio

A dark, cinematic portfolio for **Revilend**, a creative developer based in Tashkent. One header switches instantly between:

- **2D Sayt** — a clean, mobile-first portfolio with a hero, metrics, real project cards, tech stack, identity card and contact form.
- **3D Xona** — a full-screen Three.js cyber-room with a modeled desk, textured monitors, server rack, floating project pins and clickable screens, plus first-person walking with a virtual joystick, proximity-based desk interaction and a full Windows 11-style in-monitor desktop.

Both modes share the same project data and the same slide-in project drawer.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS 3** with a custom obsidian / electric-cyan / plasma-violet theme
- **Three.js** for the cyber-room, rendered in a lazily loaded chunk
- **Lucide React** icons
- Inter, Space Grotesk and JetBrains Mono from Google Fonts

## Local development

```bash
npm install
npm run dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the production build on port 3000
```

Optional: `cp .env.example .env.local` and set `VITE_CONTACT_ENDPOINT` to switch the
contact section from the Telegram handoff to a real form (see Notes).

Quality gates (all must pass before a change lands):

```bash
npm run lint         # ESLint: react + hooks rules, exhaustive-deps as error
npm test             # Vitest unit tests (focus trap, project data invariants)
npm run format       # Prettier write (check only: npm run format:check)
```

## The two modes

### 2D Sayt

- Fixed frosted header with the centered `2D Sayt / 3D Xona` switcher.
- Hero with availability badge, headline, subheadline, mode CTAs and a four-column metrics strip.
- Three glassmorphic project cards — click **Batafsil maʼlumot** to open the drawer.
- Categorized tech stack: Frontend & 3D, Backend & Database, Automation & APIs.
- Terminal identity card whose JSON is generated from the same object it copies, plus a direct-contact panel that hands the visitor to Telegram (there is no form and no data collection).
- Sections and cards reveal on scroll with a short stagger; the hero glows and the background grid drift slowly. All motion respects `prefers-reduced-motion`.

### 3D Xona

- Full-screen room with an illuminated floor, cyan grid, animated server LEDs and a neon **REVILEND.UZ** wall sign.
- Ultrawide monitor showing `teachermuzaffar.uz`, a vertical monitor for `Echoes of Room 404`, and a laptop running `Telegram Auto-Bots`.
- Lighting: ambient 2.8, directional 3.2, cyan desk point light 4.5, purple rim lights, ACES tone mapping at exposure 1.35.
- Camera FOV is 58 on mobile / 46 on desktop. Drag to orbit with clamped vertical tilt.
- Quick camera bar: **Stol**, **1. Taʼlim Portali**, **2. 3D Oʻyin**, **3. Telegram Bot**.
- Wheel zoom, on-screen zoom buttons and a reset control; zoom distance is clamped per breakpoint.
- **Avto sayr** glides through all four camera presets every 5.2 seconds and stops on manual navigation.
- Fullscreen mode, floating light motes, pulsing pins and a pointer cursor over clickable monitors.
- **Yurish** mode: first-person eye-level walking with `WASD` / arrow keys, `Shift` to move faster, drag or pointer lock to look, and a bottom-left analog virtual joystick for touch and mouse. Circular player collision against the desk, server rack and room bounds keeps the camera inside the scene.
- **Sichqonchani qulflash** enables pointer-lock free look on desktop; `Esc` releases the pointer without leaving walk mode.
- Near the desk a floating **Kompyuterga oʻtirish** prompt appears. It glides the camera into the chair and opens a full **Windows 11 desktop simulation**: taskbar, Start menu, live clock, desktop shortcuts, resizable windows with minimize/maximize/close, and project app windows with external links. Close their windows with the close button, minimize them to the taskbar, or open them again from the desktop.
- **Real window management:** drag titlebars, resize from any of eight edges/corners, double-click a titlebar to maximize, and drag a window to the top/left/right screen edge to maximize or snap it to a half. Taskbar buttons focus, restore or minimize their app; right-clicking the desktop opens a context menu that creates a note, opens built-in tools or minimizes all windows.
- **Working built-in apps:** Notepad with saved notes (`Ctrl+S`), `.txt` download and word count; a keyboard- and mouse-driven Calculator; and Settings for live wallpaper, brightness, volume, night light, Wi-Fi/Bluetooth state and system information. Settings and notes persist in `localStorage`.
- **System tray:** quick settings (Wi-Fi, Bluetooth, night light, brightness, volume) and a real month calendar with previous/next navigation and today selection open from the taskbar. Right-clicking the desktop opens a Windows-style context menu.
- **Oʻrindan turish** closes the Windows desktop and returns directly to walk mode beside the chair, ready for the joystick.
- Keyboard shortcuts: `1`–`3` project screens, `R` / `0` desk, `+` / `−` zoom, `T` auto tour, `F` fullscreen. In walk mode: `E` to sit when near the desk, `Esc` to exit.
- Floating screen-space pins are projected from 3D anchors; clicking a pin or monitor opens the shared drawer.
- If WebGL is unavailable, the mode shows a clear fallback message.

## Structure

```
src/
├── App.jsx                  # mode state, lazy 3D loading, scroll lock, toast
├── data/projects.js         # shared project case studies
├── lib/focusTrap.js         # shared Tab focus containment for the modals
├── components/
│   ├── Header.jsx           # frosted navbar + segmented mode switcher
│   ├── Hero.jsx             # 2D hero + metrics
│   ├── Projects.jsx         # featured project card grid
│   ├── ProjectDrawer.jsx    # shared project drawer (2D + 3D)
│   ├── CyberRoomView.jsx    # Three.js room, orbit/walk cameras, textures, pins
│   ├── ComputerScreen.jsx   # Windows 11 desktop: window manager, taskbar, Start menu and apps
│   ├── Windows11Apps.jsx    # Notepad, Calculator, Settings, quick settings, calendar, wallpaper
│   ├── Arsenal.jsx          # categorized tech stack
│   ├── About.jsx            # identity narrative + JSON card
│   ├── Contact.jsx          # direct-contact channels (Telegram, GitHub)
│   ├── Toast.jsx            # success notification
│   ├── Footer.jsx
│   ├── Reveal.jsx           # IntersectionObserver scroll reveal
│   ├── SectionHeading.jsx
│   └── StatusBadge.jsx
└── index.css                # Tailwind layers, theme primitives, motion
```

## Notes

- **The 3D chunk is lazy.** The initial 2D bundle is about 60 KB gzipped and the interactive room is a separate chunk (~155 KB gzipped, with Three.js split into its own vendor chunk). The room is fetched on demand and prefetched after first paint — but skipped entirely when `navigator.connection.saveData` is set or the connection reports 2G.
- **The contact section has two modes, and neither ever fakes success.** Without configuration a static build has nowhere to deliver a message, so it shows a Telegram handoff to `t.me/revilend` and collects nothing. Set `VITE_CONTACT_ENDPOINT` (copy `.env.example` to `.env.local`) to the hosted bot's `POST /api/contact` route and a validated form appears instead. The form clears and reports success **only** after the endpoint answers 2xx with `{ "ok": true }`; a failed request shows an error with the Telegram fallback, and the visitor's text is kept so it is not lost. The original implementation showed "Xabar yuborildi" while sending nothing — that is what this design prevents.
- **`main.py` is the bot behind that endpoint** (aiogram + aiohttp, `requirements.txt`). It serves `GET /` as a health check and `POST /api/contact` with `{ name, contact, message }`, forwarding the payload to `ADMIN_ID` in Telegram. Two things must be set on the host or messages will be acknowledged but never delivered: `BOT_TOKEN` and `ADMIN_ID`. Its CORS header only allows `https://revilend.uz`, so adjust it if the site moves to another origin.
- **Windows 11 desktop data is local.** Notepad text and personalization/quick-setting choices use `localStorage`; they never leave the browser and are not part of the deployed repository.
- **Project data** lives in `src/data/projects.js`; card content, drawer content, pin IDs, project URLs and 3D screen associations are all driven from it, so a renamed id cannot leave a dead pin or link behind.
- **`public/og.png`** is the 1200×630 share card behind `og:image` and `twitter:image`. Regenerate it from the hero if the headline or palette changes.
- **Direct links** point to `t.me/revilend` and `github.com/revilend`; update those handles if they change.
- `PREVIEW_HOST` (optional env var) is passed to Vite's `allowedHosts` for hosted previews; no machine-specific hostname is committed.
- Scroll is locked while the 3D room or project drawer is open.

## Accessibility & performance

- Mode switch and auto-tour control use `aria-pressed`; pins and camera presets are real buttons with labels.
- Project drawer and the Windows desktop support Escape, restore focus to the trigger, and contain `Tab` inside the dialog so `aria-modal` is truthful.
- Room render loop pauses when the tab is hidden; device pixel ratio is capped at 2; all geometries, materials and canvas textures are disposed on unmount.
- Walk mode has keyboard controls plus an analog touch joystick; the desk prompt opens the Windows desktop without requiring pointer lock. Desktop app windows have labeled close, minimize and maximize controls.
- Scroll reveals, ambient grid motion, auto-tour timing and 3D animations are reduced under `prefers-reduced-motion`.
