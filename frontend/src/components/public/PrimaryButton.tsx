import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  to?: string;
};

export function PrimaryButton({
  children,
  className = "",
  to,
  type = "button",
  ...buttonProps
}: PrimaryButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${className}`;

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
