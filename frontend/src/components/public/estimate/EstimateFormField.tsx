import type { ReactNode } from "react";

type EstimateFormFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export const estimateInputClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 disabled:bg-slate-100 disabled:text-slate-500";

export function EstimateFormField({
  label,
  error,
  children,
  className = "",
}: EstimateFormFieldProps) {
  return (
    <label className={`text-sm font-semibold text-slate-800 ${className}`}>
      {label}
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-red-700">{error}</p> : null}
    </label>
  );
}
