import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const IDENTITY = {
  handle: 'Revilend',
  role: 'Kreativ dasturchi',
  location: 'Toshkent, Oʻzbekiston',
  focus: [
    '3D veb-tajribalar',
    'Toʻliq stackli tizimlar',
    'Real vaqtli arxitektura',
    'Bulutli avtomatizatsiya',
  ],
  stack: ['Three.js', 'React', 'Supabase', 'Node.js'],
  mindset: 'Tizim qur, detallarni sayqal.',
  available: true,
};

const IDENTITY_JSON = JSON.stringify(IDENTITY, null, 2);
const LINE_COUNT = 19;

const PRINCIPLES = [
  {
    title: 'Unumdorlik ham xususiyat',
    detail: 'Sahna haqiqiy qurilmalarda kadr tezligini saqlab turmaguncha tugallangan hisoblanmaydi.',
  },
  {
    title: 'Avval tizim, keyin ekran',
    detail: 'Maʼlumot modeli, ruxsatlar va xatolik holatlari vizual sayqaldan oldin hal qilinadi.',
  },
  {
    title: 'Detallar — mahsulot',
    detail: 'Vaqt, animatsiya va matn sayqalning oxirgi bosqichi emas, buildning bir qismi.',
  },
];

function copyFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } catch {
    /* clipboard is best-effort */
  }
  document.body.removeChild(textarea);
}

function IdentityCard({ onNotify }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(IDENTITY_JSON);
      } else {
        copyFallback(IDENTITY_JSON);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onNotify?.('developer_identity.json buferga nusxalandi.');
    } catch {
      copyFallback(IDENTITY_JSON);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onNotify?.('developer_identity.json buferga nusxalandi.');
    }
  };

  return (
    <div className="relative min-w-0 max-w-full">
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-electric/10 via-transparent to-plasma/20 blur-2xl"
      />
      <div className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-[#060a12]/90 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400/70" />
              <span className="h-2 w-2 rounded-full bg-amber-300/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
            </span>
            <span className="truncate font-mono text-[11px] text-slate-400">
              developer_identity.json
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition hover:border-electric/40 hover:text-electric"
            aria-label="Dasturchi identifikatsiyasi JSON nusxasini olish"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'nusxalandi' : 'nusxalash'}
          </button>
        </div>

        <div className="flex min-w-0">
          <div
            aria-hidden="true"
            className="shrink-0 select-none border-r border-slate-800/70 px-3 py-4 text-right font-mono text-[11px] leading-6 text-slate-700"
          >
            {Array.from({ length: LINE_COUNT }, (_, index) => (
              <div key={index}>{String(index + 1).padStart(2, '0')}</div>
            ))}
          </div>

          <pre className="min-w-0 flex-1 overflow-x-auto py-4 pl-4 pr-5 font-mono text-[11.5px] leading-6 text-slate-300">
            <span className="text-slate-500">{'{'}</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;handle&quot;</span>
            <span className="text-slate-500">: </span>
            <span className="text-emerald-300">&quot;Revilend&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;role&quot;</span>
            <span className="text-slate-500">: </span>
            <span className="text-emerald-300">&quot;Kreativ dasturchi&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;location&quot;</span>
            <span className="text-slate-500">: </span>
            <span className="text-emerald-300">&quot;Toshkent, Oʻzbekiston&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;focus&quot;</span>
            <span className="text-slate-500">: [</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;3D veb-tajribalar&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;Toʻliq stackli tizimlar&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;Real vaqtli arxitektura&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;Bulutli avtomatizatsiya&quot;</span>
            {'\n  '}
            <span className="text-slate-500">],</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;stack&quot;</span>
            <span className="text-slate-500">: [</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;Three.js&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;React&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;Supabase&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n    '}
            <span className="text-emerald-300">&quot;Node.js&quot;</span>
            {'\n  '}
            <span className="text-slate-500">],</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;mindset&quot;</span>
            <span className="text-slate-500">: </span>
            <span className="text-emerald-300">&quot;Tizim qur, detallarni sayqal.&quot;</span>
            <span className="text-slate-500">,</span>
            {'\n  '}
            <span className="text-cyan-300">&quot;available&quot;</span>
            <span className="text-slate-500">: </span>
            <span className="text-violet-300">true</span>
            {'\n'}
            <span className="text-slate-500">{'}'}</span>
            <span className="ml-1 inline-block h-3.5 w-[7px] translate-y-0.5 animate-blink bg-electric/80" />
          </pre>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 bg-ink-950/60 px-4 py-2.5 font-mono text-[10px] text-slate-600">
          <span className="truncate">// terminal · UTF-8 · LF</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            json toʻgʻri
          </span>
        </div>
      </div>
    </div>
  );
}

export default function About({ onNotify }) {
  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="container-x">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal className="min-w-0">
            <SectionHeading
              index="03"
              label="Men haqimda"
              title="Muhandislik tartibi, vizual did."
              description="Brauzer oddiy hujjat emas, haqiqiy makon boʻlib tuyuladigan loyihalar yarataman."
            />

            <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-slate-400">
              <p>
                Men Revilend — Toshkentda yashovchi kreativ dasturchiman. Ishlarim real vaqtda
                ishlaydigan Three.js sahnalarini mahsulotni ishonchli qiladigan muhim qismlar
                bilan uygʻunlashtiradi: Postgres sxemalari, qatorlar darajasidagi xavfsizlik,
                navbatga asoslangan vazifalar va barqaror bulutli joylashtirishlar.
              </p>
              <p>
                Chiqargan ishlarimning aksariyati brauzerda ishlaydi: har kuni ochiladigan maktab
                portali, men uxlayotganimda javob beradigan bot tarmogʻi. Menga unumdorlik va
                taassurot uchrashadigan nuqta yoqadi.
              </p>
            </div>

            <ul className="mt-8 space-y-4 border-t border-slate-800/80 pt-6">
              {PRINCIPLES.map((principle) => (
                <li key={principle.title} className="flex gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-electric shadow-[0_0_10px_rgba(0,242,254,0.9)]" />
                  <div>
                    <p className="font-display text-sm font-semibold text-slate-200">
                      {principle.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">
                      {principle.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="min-w-0">
            <IdentityCard onNotify={onNotify} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
