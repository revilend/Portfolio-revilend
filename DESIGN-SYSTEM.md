# Revilend.uz — Design System

Dark-first "cyber" tizim. Manba: `tailwind.config.js` + `src/index.css` (+ `src/theme.js` Three.js uchun).

## Tokenlar
| Guruh | Token | Qiymat |
|---|---|---|
| Fon | `ink-950/900/800/700` | `#05070d / #080c14 / #0b111c / #0f172a` |
| Aksent | `electric` / `electric-soft` | `#00f2fe` / `#7df9ff` |
| Aksent 2 | `plasma` | `#8b5cf6` |
| Matn | `slate-300` asosiy, `slate-400` ikkilamchi/label, `slate-500` faqat ikonka | — |
| Shrift | `font-sans` Inter, `font-display` Space Grotesk, `font-mono` JetBrains Mono | — |
| O'lcham | `text-2xs` | 11px (minimal ruxsat etilgan) |
| Tracking | `tracking-tag` / `label` / `eyebrow` | 0.14 / 0.2 / 0.24em |
| Gradient | `bg-brand`, `bg-brand-flow` | logo gradientlari |
| Soya | `shadow-glow`, `glow-violet`, `card-hover`, `panel` | — |
| Motion | `rise`, `fade-in`, `modal-in`, `drawer-in`, `toast-in`, `glow-pulse` | easing `cubic-bezier(0.16,1,0.3,1)` |

Three.js/canvas ranglari: faqat `THEME` (`src/theme.js`) orqali.

## Komponentlar (`@layer components`)
| Klass | Vazifa | Holatlar |
|---|---|---|
| `btn-primary` | asosiy CTA | hover, focus-visible, disabled |
| `btn-secondary` | ikkilamchi CTA | hover, focus-visible, disabled |
| `btn-outline` (+`btn-sm`) | karta ichidagi tugma | hover, focus-visible, disabled |
| `btn-icon` (+`btn-icon-sm`) | ijtimoiy/ikonka tugma (40/36px) | hover, focus-visible |
| `card` + `card-hover` | loyiha kartasi | hover (ko'tarilish + glow) |
| `glass` | shisha panel | — |
| `chip` | texnologiya yorlig'i | hover |
| `field` | input/textarea | focus, `aria-invalid` |
| `mono-label`, `container-x`, `text-gradient` | yordamchi | — |
| `bg-grid` + `[--grid:Npx]` | to'r fon | — |

## Qoidalar
1. Hex yozmang: token yoki `THEME` ishlating. Istisno — `CyberRoomView.jsx` dagi canvas/tekstura chizuvchi funksiyalar (`draw*Screen`, `drawNeonSign`, `drawWallPoster`, `drawFloorGlow`): ular Tailwind klasslarini ishlata olmaydi, shuning uchun gradient stoplari lokal hex bo'lishi mumkin. Bunday qiymat ikki joyda takrorlansa, `THEME` ga ko'chiriladi.
2. 11px dan kichik matn yo'q (`text-2xs` minimum). `ComputerScreen.jsx` va `Windows11Apps.jsx` uchungina istisno (mock UI zichligi), `CyberRoomView.jsx` uchun emas.
3. Ikkilamchi matn `slate-400` dan to'q bo'lmasin (AA kontrast).
4. Yangi tugma/karta kerak bo'lsa avval yuqoridagi klasslarni kengaytiring.
5. Barcha harakat `prefers-reduced-motion` ni hurmat qiladi.

## Eslatma
`ComputerScreen.jsx` va `Windows11Apps.jsx` (Windows 11 simulyatsiyasi) o'z palitrasiga ega: bu ongli ravishda alohida "theme". Ularda 10px matnlar saqlangan (mock UI zichligi uchun).
