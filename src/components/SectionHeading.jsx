export default function SectionHeading({ index, label, title, description, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 items-center rounded-full border border-slate-800/90 bg-slate-900/50 px-2.5 font-mono text-[10px] tracking-[0.12em] text-electric">
          {index}
        </span>
        <span className="mono-label">{label}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
      </div>
      <h2 className="mt-6 max-w-3xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[2.5rem] lg:text-[2.9rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-400 sm:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
