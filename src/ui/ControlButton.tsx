import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "min-h-9 px-2.5 py-1.5 text-sm",
  md: "min-h-10 px-3 py-2 text-base",
} as const;

export default function ControlButton({
  children,
  active = false,
  size = "md",
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={[
        "inline-flex items-center justify-center whitespace-nowrap rounded border border-white",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        "disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "bg-white text-black font-bold hover:bg-white/90"
          : "bg-transparent text-white hover:bg-white/10",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
