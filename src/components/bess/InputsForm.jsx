import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import NumberField from "@/components/bess/NumberField";
import { INPUT_FIELDS } from "@/lib/formState";

export default function InputsForm({ form, fieldErrors, isValid, onChange, onCalculate }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-[1.125rem] font-semibold text-[#1F4E3D]">Model inputs</h2>
          <p className="mt-0.5 text-xs text-[#4A5568]">
            One cycle per day. Prices PHP/MWh, capex PHP/kWh.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="model-inputs-body"
          className="rounded-md p-2 text-[#1F4E3D] hover:bg-[#F4F6F5] lg:hidden"
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="sr-only">Toggle model inputs</span>
        </button>
      </div>

      <div id="model-inputs-body" className={cn(!open && "hidden lg:block")}>
        <div className="grid grid-cols-2 gap-3 p-4">
          {INPUT_FIELDS.map((field) => (
            <NumberField
              key={field.key}
              id={field.key}
              label={field.label}
              unit={field.unit}
              step={field.step}
              value={form[field.key]}
              error={fieldErrors[field.key]}
              onChange={(next) => onChange(field.key, next)}
            />
          ))}
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onCalculate}
            disabled={!isValid}
            className={cn(
              "min-h-[44px] w-full rounded-md px-4 py-3 text-sm font-semibold transition-colors",
              isValid
                ? "bg-[#1F4E3D] text-white hover:bg-[#16382c]"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            )}
          >
            Calculate arbitrage
          </button>
          <p className="mt-2 text-xs leading-snug text-[#4A5568]">
            {isValid
              ? "Uses 365 synthetic days from the monthly WESM-shaped profile."
              : "Fix the highlighted inputs to run the model."}
          </p>
        </div>
      </div>
    </section>
  );
}