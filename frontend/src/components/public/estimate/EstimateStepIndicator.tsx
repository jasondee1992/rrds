type EstimateStepIndicatorProps = {
  steps: string[];
  currentStep: number;
};

export function EstimateStepIndicator({ steps, currentStep }: EstimateStepIndicatorProps) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li
          className={`rounded-lg border p-3 ${
            index === currentStep
              ? "border-blue-700 bg-blue-50"
              : index < currentStep
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-white"
          }`}
          key={step}
        >
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
              index === currentStep
                ? "bg-blue-700 text-white"
                : index < currentStep
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {index + 1}
          </span>
          <p className="mt-2 text-sm font-bold text-slate-950">{step}</p>
        </li>
      ))}
    </ol>
  );
}
