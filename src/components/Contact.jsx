import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Clock,
  Github,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';

const TELEGRAM_URL = 'https://t.me/revilend';
const GITHUB_URL = 'https://github.com/revilend';

// Set VITE_CONTACT_ENDPOINT to the hosted bot's POST /api/contact route (see
// main.py). Without it the section stays an honest Telegram handoff: a static
// build has nowhere to deliver a message, and faking success is worse than
// asking the visitor to write directly.
const CONTACT_ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT ?? '').trim();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_PATTERN = /^@?[a-zA-Z0-9_]{4,32}$/;
const MAX_LENGTH = { name: 80, contact: 120, message: 4000 };

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

function validate(values) {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Kamida 2 ta belgi kiriting.';
  } else if (values.name.trim().length > MAX_LENGTH.name) {
    errors.name = `Koʻpi bilan ${MAX_LENGTH.name} ta belgi.`;
  }

  const contact = values.contact.trim();
  if (!contact) {
    errors.contact = 'Javob berishim uchun Telegram manzili yoki email kiriting.';
  } else if (contact.length > MAX_LENGTH.contact) {
    errors.contact = `Koʻpi bilan ${MAX_LENGTH.contact} ta belgi.`;
  } else if (!EMAIL_PATTERN.test(contact) && !TELEGRAM_PATTERN.test(contact)) {
    errors.contact = 'Bu email yoki @handle ga oʻxshamaydi.';
  }

  const message = values.message.trim();
  if (message.length < 10) {
    errors.message = 'Biroz batafsil yozing (kamida 10 ta belgi).';
  } else if (message.length > MAX_LENGTH.message) {
    errors.message = `Koʻpi bilan ${MAX_LENGTH.message} ta belgi.`;
  }

  return errors;
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mono-label">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 font-mono text-2xs text-rose-300">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function ContactForm({ onNotify }) {
  const [values, setValues] = useState({ name: '', contact: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const abortRef = useRef(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setOutcome(null);
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setOutcome(null);
    if (Object.keys(nextErrors).length > 0) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setSending(true);

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          contact: values.contact.trim(),
          message: values.message.trim(),
        }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);

      // Only a real, acknowledged delivery may show success.
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || `HTTP ${response.status}`);
      }

      setValues({ name: '', contact: '', message: '' });
      setOutcome('sent');
      onNotify?.('Xabar yuborildi — 24 soat ichida javob beraman.');
    } catch {
      if (controller.signal.aborted) return;
      setOutcome('failed');
    } finally {
      if (!controller.signal.aborted) setSending(false);
    }
  };

  const inputClass = (field) =>
    `field ${
      errors[field] ? 'border-rose-500/60 focus:border-rose-500/60 focus:ring-rose-500/20' : ''
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-800/80 bg-ink-950/50 p-5 backdrop-blur sm:p-6"
    >
      <p className="mono-label">Xabar yuborish</p>
      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white sm:text-[22px]">
        Loyihangiz haqida yozing.
      </h3>

      <div className="mt-5 space-y-5">
        <Field id="name" label="Ism" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={MAX_LENGTH.name}
            value={values.name}
            onChange={handleChange}
            placeholder="Sizga qanday murojaat qilay?"
            className={inputClass('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </Field>

        {/* The section owns id="contact" for the nav anchor, so the field needs
            its own id or the label would point at the section. */}
        <Field id="contact-field" label="Telegram / Email" error={errors.contact}>
          <input
            id="contact-field"
            name="contact"
            type="text"
            autoComplete="email"
            maxLength={MAX_LENGTH.contact}
            value={values.contact}
            onChange={handleChange}
            placeholder="@handle yoki siz@domen.com"
            className={inputClass('contact')}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? 'contact-field-error' : undefined}
          />
        </Field>

        <Field
          id="message"
          label="Xabar"
          error={errors.message}
          hint={`${values.message.trim().length} / ${MAX_LENGTH.message} belgi`}
        >
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={MAX_LENGTH.message}
            value={values.message}
            onChange={handleChange}
            placeholder="Taxminiy gʻoya, muddat yoki havola — har qanday maʼlumot yordam beradi."
            className={`${inputClass('message')} resize-none`}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
        </Field>
      </div>

      <button type="submit" disabled={sending} className="btn-primary mt-6 w-full">
        {sending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
            Yuborilmoqda…
          </>
        ) : (
          <>
            Xabar yuborish
            <Send size={16} />
          </>
        )}
      </button>

      <div aria-live="polite" className="mt-3 min-h-[2.5rem]">
        {outcome === 'sent' ? (
          <p className="flex items-center gap-2 text-[12.5px] text-emerald-300">
            <ShieldCheck size={14} className="shrink-0" />
            Xabar yetib bordi. 24 soat ichida javob beraman.
          </p>
        ) : outcome === 'failed' ? (
          <p className="flex items-start gap-2 text-[12.5px] text-rose-300">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span>
              Xabar yuborilmadi — qayta urinib koʻring yoki{' '}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-rose-400/50 underline-offset-2 hover:text-white"
              >
                Telegram orqali yozing
              </a>
              .
            </span>
          </p>
        ) : (
          <p className="text-[12px] leading-relaxed text-slate-400">
            Xabar faqat Telegram orqali yetkaziladi. Reklama yoʻq, uchinchi tomonlarga berilmaydi.
          </p>
        )}
      </div>
    </form>
  );
}

function TelegramPanel() {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-800/80 bg-ink-950/50 p-5 backdrop-blur sm:p-6">
      <p className="mono-label">Bevosita xabar</p>

      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-white sm:text-[22px]">
        Xabarni Telegram orqali yuboring.
      </h3>
      <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
        Bu saytda forma yoʻq: xabar hech qayerda toʻplanmaydi va yoʻqolmaydi. Telegram chatini
        ochib, gʻoyangizni toʻgʻridan-toʻgʻri yozing — javobni oʻsha yerda olasiz.
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
  );
}

export default function Contact({ onNotify }) {
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
              {CONTACT_ENDPOINT ? <ContactForm onNotify={onNotify} /> : <TelegramPanel />}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
