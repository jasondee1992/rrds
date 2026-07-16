import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  to?: string;
};

export function SecondaryButton({
  children,
  className = "",
  to,
  type = "button",
  ...buttonProps
}: SecondaryButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-md border border-blue-700 bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${className}`;

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
