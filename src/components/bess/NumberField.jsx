export default function NumberField({ id, label, unit, step, value, error, onChange }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[0.8125rem] font-medium text-[#1F4E3D]">{label}</span>
        <span className="text-xs text-[#6B7280]">{unit}</span>
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 h-11 w-full rounded-md border bg-white px-2.5 text-base text-[#1F4E3D] outline-none transition-colors focus:border-[#1F4E3D] focus:ring-2 focus:ring-[#1F4E3D]/20 ${
          error ? "border-[#B42318]" : "border-slate-300"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs leading-snug text-[#B42318]">
          {error}
        </p>
      ) : null}
    </div>
  );
}