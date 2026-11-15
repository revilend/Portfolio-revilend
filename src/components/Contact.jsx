import { ArrowUpRight, Clock, Github, MapPin, MessageCircle, Send } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const TELEGRAM_URL = 'https://t.me/revilend';
const GITHUB_URL = 'https://github.com/revilend';

const CHANNELS = [
  {
    id: 'telegram',
    label: 'Telegram',
    value: '@revilend',
    note: 'Eng tez yoʻl — odatda bir necha soat ichida javob',
    href: TELEGRAM_URL,
    icon: MessageCircle,
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/revilend',
    note: 'Ochiq kod, tajribalar va commitlar tarixi',
    href: GITHUB_URL,
    icon: Github,
  },
];

const BRIEF = [
  'Nima qurmoqchisiz va u kim uchun ishlaydi',
  'Muddat va taxminiy budjet',
  'Havolalar: mavjud sayt, dizayn yoki namuna',
];

export default function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-24 pb-24 pt-4 sm:pb-28">
      <div className="container-x">
        <div className="relative overflow-hidden glass rounded-3xl p-6 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-electric/10 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-plasma/10 blur-[120px]"
          />

          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <Reveal className="min-w-0">
              <SectionHeading
                index="04"
                label="Aloqa"
                title="Birga eʼtiborga molik loyiha yarataylik."
                description="3D gʻoyangiz, ishga tushirilishi kerak boʻlgan mahsulot yoki allaqachon ishlashi kerak boʻlgan avtomatlashtirish bormi? Gʻoyangizni ayting."
              />

              <div className="mt-8 space-y-3">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <a
                      key={channel.id}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 glass rounded-xl p-4 transition hover:border-electric/30 hover:bg-slate-900/70"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-800 bg-ink-950 text-electric">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-2xs uppercase tracking-label text-slate-400">
                          {channel.label}
                        </span>
                        <span className="block truncate text-sm text-slate-200">
                          {channel.value}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-slate-400">
                          {channel.note}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="ml-auto shrink-0 text-slate-400 transition group-hover:text-electric"
                      />
                    </a>
                  );
                })}
              </div>

              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-2xs uppercase tracking-tag text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-electric/60" />
                  Toshkent · GMT+5
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  24 soat ichida javob
                </span>
              </p>
            </Reveal>

            <Reveal delay={120} className="min-w-0">
              <div className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-800/80 bg-ink-950/50 p-5 backdrop-blur sm:p-6">
                <p className="mono-label">Bevosita xabar</p>

                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white sm:text-[22px]">
                  Xabarni Telegram orqali yuboring.
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
                  Bu saytda forma yoʻq: xabar hech qayerda toʻplanmaydi va yoʻqolmaydi. Telegram
                  chatini ochib, gʻoyangizni toʻgʻridan-toʻgʻri yozing — javobni oʻsha yerda olasiz.
                </p>

                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-6 w-full"
                >
                  <Send size={16} />
                  @revilend ga yozish
                </a>

                <div className="mt-6 border-t border-slate-800/80 pt-5">
                  <p className="mono-label">Xabarda nima boʻlsa foydali</p>
                  <ul className="mt-3 space-y-2.5">
                    {BRIEF.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-300"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-electric shadow-[0_0_10px_rgba(0,242,254,0.9)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-auto flex items-center gap-2 pt-6 font-mono text-2xs uppercase tracking-label text-slate-400">
                  <Clock size={12} className="text-electric/60" />
                  spam yoʻq · toʻgʻridan-toʻgʻri javob
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
