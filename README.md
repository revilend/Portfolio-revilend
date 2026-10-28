# Revilend.uz — Dual-Mode Developer Portfolio

A dark, cinematic portfolio for **Revilend**, a creative developer based in Tashkent. One header switches instantly between:

- **2D Sayt** — a clean, mobile-first portfolio with a hero, metrics, real project cards, tech stack, identity card and contact form.
- **3D Xona** — a full-screen Three.js cyber-room with a modeled desk, textured monitors, server rack, floating project pins and clickable screens.

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

## The two modes

### 2D Sayt

- Fixed frosted header with the centered `📄 2D Sayt / 🛸 3D Xona` switcher.
- Hero with availability badge, headline, subheadline, mode CTAs and a four-column metrics strip.
- Three glassmorphic project cards — click **Batafsil maʼlumot** to open the drawer.
- Categorized tech stack: Frontend & 3D, Backend & Database, Automation & APIs.
- Terminal identity card and a validated contact form with success toast.

### 3D Xona

- Full-screen room with an illuminated floor, cyan grid, animated server LEDs and a neon **REVILEND.UZ** wall sign.
- Ultrawide monitor showing `teachermuzaffar.uz`, a vertical monitor for `Echoes of Room 404`, and a laptop running `Telegram Auto-Bots`.
- Lighting: ambient 2.8, directional 3.2, cyan desk point light 4.5, purple rim lights, ACES tone mapping at exposure 1.35.
- Camera FOV is 58 on mobile / 46 on desktop. Drag to orbit with clamped vertical tilt.
- Quick camera bar: **Stol**, **1. Taʼlim Portali**, **2. 3D Oʻyin**, **3. Telegram Bot**.
- Floating screen-space pins are projected from 3D anchors; clicking a pin or monitor opens the shared drawer.
- If WebGL is unavailable, the mode shows a clear fallback message.

## Structure

```
src/
├── App.jsx                  # mode state, lazy 3D loading, scroll lock, toast
├── data/projects.js         # shared project case studies
├── components/
│   ├── Header.jsx           # frosted navbar + segmented mode switcher
│   ├── Hero.jsx             # 2D hero + metrics
│   ├── Projects.jsx         # featured project card grid
│   ├── ProjectDrawer.jsx    # shared project drawer (2D + 3D)
│   ├── CyberRoomView.jsx    # Three.js room, camera, textures, pins
│   ├── Arsenal.jsx          # categorized tech stack
│   ├── About.jsx            # identity narrative + JSON card
│   ├── Contact.jsx          # validated form + direct links
│   ├── Toast.jsx            # success notification
│   ├── Footer.jsx
│   ├── SectionHeading.jsx
│   └── StatusBadge.jsx
└── index.css                # Tailwind layers, theme primitives, motion
```

## Notes

- **The 3D chunk is lazy.** The initial 2D bundle stays around 58 KB gzipped; Three.js loads on demand and is prefetched after first paint.
- **Contact form is client-side only** — validation and the success toast are local. Wire `handleSubmit` in `src/components/Contact.jsx` to an endpoint to deliver messages.
- **Project data** lives in `src/data/projects.js`; card content, drawer content, pin IDs and 3D screen associations are driven from the same IDs.
- **Direct links** point to `t.me/revilend` and `github.com/revilend`; update those handles if they change.
- `PREVIEW_HOST` (optional env var) is passed to Vite's `allowedHosts` for hosted previews; no machine-specific hostname is committed.
- Scroll is locked while the 3D room or project drawer is open.

## Accessibility & performance

- Mode switch uses `aria-pressed`; pins and camera presets are real buttons with labels.
- Project drawer supports Escape, restores focus and returns it to the trigger.
- Room render loop pauses when the tab is hidden; device pixel ratio is capped at 2; all geometries, materials and canvas textures are disposed on unmount.
- Motion is reduced under `prefers-reduced-motion`.
