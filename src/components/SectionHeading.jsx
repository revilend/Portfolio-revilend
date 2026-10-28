export default function SectionHeading({ index, label, title, description, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-electric">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-electric/70 to-transparent" />
        <span className="mono-label">{label}</span>
      </div>
      <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
