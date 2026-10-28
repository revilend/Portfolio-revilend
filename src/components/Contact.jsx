import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github, MapPin, MessageCircle, Send } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_PATTERN = /^@?[a-zA-Z0-9_]{4,32}$/;

function validate(values) {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Kamida 2 ta belgi kiriting.';
  }

  const contact = values.contact.trim();
  if (!contact) {
    errors.contact = 'Javob berishim uchun Telegram manzili yoki email kiriting.';
  } else if (!EMAIL_PATTERN.test(contact) && !TELEGRAM_PATTERN.test(contact)) {
    errors.contact = 'Bu email yoki @handle ga oʻxshamaydi.';
  }

  if (values.message.trim().length < 10) {
    errors.message = 'Biroz batafsil yozing (kamida 10 ta belgi).';
  }

  return errors;
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mono-label">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 font-mono text-[11px] text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function Contact({ onNotify }) {
  const [values, setValues] = useState({ name: '', contact: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    timerRef.current = window.setTimeout(() => {
      setSending(false);
      setValues({ name: '', contact: '', message: '' });
      onNotify?.('Xabar yuborildi — 24 soat ichida javob beraman.');
    }, 800);
  };

  const inputClass = (field) =>
    `field ${errors[field] ? 'border-rose-500/60 focus:border-rose-500/60 focus:ring-rose-500/20' : ''}`;

  return (
    <section id="contact" className="relative scroll-mt-24 pb-24 pt-4 sm:pb-28">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-md sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-electric/10 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-plasma/10 blur-[120px]"
          />

          <div className="relative grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <SectionHeading
                index="04"
                label="Aloqa"
                title="Birga eʼtiborga molik loyiha yarataylik."
                description="3D gʻoyangiz, ishga tushirilishi kerak boʻlgan mahsulot yoki allaqachon ishlashi kerak boʻlgan avtomatlashtirish bormi? Gʻoyangizni ayting."
              />

              <div className="mt-8 space-y-3">
                <a
                  href="https://t.me/revilend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 transition hover:border-electric/30 hover:bg-slate-900/70"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-800 bg-ink-950 text-electric">
                    <MessageCircle size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Telegram
                    </span>
                    <span className="block truncate text-sm text-slate-200">@revilend</span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="ml-auto shrink-0 text-slate-600 transition group-hover:text-electric"
                  />
                </a>

                <a
                  href="https://github.com/revilend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 transition hover:border-electric/30 hover:bg-slate-900/70"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-800 bg-ink-950 text-electric">
                    <Github size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      GitHub
                    </span>
                    <span className="block truncate text-sm text-slate-200">github.com/revilend</span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="ml-auto shrink-0 text-slate-600 transition group-hover:text-electric"
                  />
                </a>
              </div>

              <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-electric/60" />
                  Toshkent · GMT+5
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  24 soat ichida javob
                </span>
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-slate-800/80 bg-ink-950/50 p-5 backdrop-blur sm:p-6"
            >
              <div className="space-y-5">
                <Field id="name" label="Ism" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Sizga qanday murojaat qilay?"
                    className={inputClass('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </Field>

                <Field id="contact" label="Telegram / Email" error={errors.contact}>
                  <input
                    id="contact"
                    name="contact"
                    type="text"
                    autoComplete="email"
                    value={values.contact}
                    onChange={handleChange}
                    placeholder="@handle yoki siz@domen.com"
                    className={inputClass('contact')}
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? 'contact-error' : undefined}
                  />
                </Field>

                <Field id="message" label="Xabar" error={errors.message}>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
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

              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
                spam yoʻq · toʻgʻridan-toʻgʻri javob
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
