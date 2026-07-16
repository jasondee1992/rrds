import type { LucideIcon } from "lucide-react";

type ImagePlaceholderProps = {
  label: string;
  Icon: LucideIcon;
  variant?: "light" | "dark";
};

export function ImagePlaceholder({
  label,
  Icon,
  variant = "light",
}: ImagePlaceholderProps) {
  const isDark = variant === "dark";

  return (
    <div
      aria-label={`${label} image placeholder`}
      className={`flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border ${
        isDark
          ? "border-blue-800 bg-slate-950 text-white"
          : "border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-blue-800"
      }`}
      role="img"
    >
      <div className="flex flex-col items-center gap-3 px-5 text-center">
        <Icon aria-hidden="true" className="h-12 w-12" strokeWidth={1.7} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}
