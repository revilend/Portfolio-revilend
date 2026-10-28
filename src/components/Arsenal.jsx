import { Code2, Database, Terminal } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';

const GROUPS = [
  {
    title: 'Frontend & 3D',
    description: 'Tez chizadigan va qoʻlda ushlagandek tuyuladigan interfeyslar.',
    icon: Code2,
    items: ['JavaScript (ES6+)', 'Three.js', 'Canvas API', 'Tailwind CSS', 'Web Audio API', 'HTML5 / CSS3'],
    accent: {
      icon: 'border-electric/25 bg-electric/10 text-electric',
      hover:
        'hover:border-electric/30 hover:shadow-[0_36px_90px_-55px_rgba(0,242,254,0.9)]',
      marker: 'bg-electric',
    },
    index: '01',
  },
  {
    title: 'Backend & Database',
    description: 'Maʼlumot modellari va ruxsatlar birinchi pikseldan oldin oʻylanadi.',
    icon: Database,
    items: ['Node.js', 'Supabase', 'PostgreSQL', 'REST APIs', 'Row Level Security'],
    accent: {
      icon: 'border-plasma/25 bg-plasma/10 text-plasma',
      hover: 'hover:border-plasma/30 hover:shadow-[0_36px_90px_-55px_rgba(139,92,246,0.9)]',
      marker: 'bg-plasma',
    },
    index: '02',
  },
  {
    title: 'Automation & APIs',
    description: 'Qoʻlda bajariladigan soatlarni jimgina yoʻq qiladigan kichik tizimlar.',
    icon: Terminal,
    items: ['Telegram Bot API', 'Gemini API', 'Webhooks', 'Lua', 'Git', 'Render'],
    accent: {
      icon: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400',
      hover: 'hover:border-emerald-400/30 hover:shadow-[0_36px_90px_-55px_rgba(52,211,153,0.8)]',
      marker: 'bg-emerald-400',
    },
    index: '03',
  },
];

export default function Arsenal() {
  return (
    <section id="arsenal" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Texnologiyalar"
          title="Har bir qatlam uchun toʻgʻri vosita."
          description="Ataylab ixcham tanlangan va chuqur qoʻllaniladigan texnologiyalar toʻplami — 3D sahnalardan realtime maʼlumotlar bazasi va avtomatlashtirishgacha."
        />

        <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-3">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className={`group relative flex animate-rise flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md transition duration-500 hover:-translate-y-1 ${group.accent.hover}`}
              >
                <span className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] text-slate-700">
                  /{group.index}
                </span>

                <div className={`grid h-11 w-11 place-items-center rounded-xl border ${group.accent.icon}`}>
                  <Icon size={20} />
                </div>

                <h3 className="mt-5 font-display text-lg font-semibold text-white">{group.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{group.description}</p>

                <div className="mt-5 flex flex-1 flex-wrap content-start gap-1.5 border-t border-slate-800/80 pt-5">
                  {group.items.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>

                <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  <span className={`h-1 w-1 rounded-full ${group.accent.marker}`} />
                  {String(group.items.length).padStart(2, '0')} ta vosita ishlatilmoqda
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
