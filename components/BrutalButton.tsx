import { ButtonHTMLAttributes, forwardRef } from "react";

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/**
 * Liquid-glass button. Same API as before, but renders rounded glass surfaces
 * with subtle hover glow and micro-interaction.
 */
export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative inline-flex items-center justify-center
      font-medium tracking-tight
      rounded-full
      select-none
      transition-all duration-300 ease-glass
      disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
    `;

    const variants = {
      primary: `
        bg-[var(--accent)] text-white font-semibold
        shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_4px_14px_rgba(5,150,105,0.30)]
        hover:bg-[var(--accent-dark)] hover:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_20px_rgba(5,150,105,0.38)]
        hover:-translate-y-px
        active:translate-y-0 active:brightness-95
      `,
      secondary: `
        bg-white border border-[var(--glass-border-strong)] text-[var(--text-primary)]
        shadow-[0_1px_3px_rgba(15,23,42,0.08)]
        hover:bg-[var(--bg-elev-2)] hover:border-[var(--accent)]
        hover:-translate-y-px
        active:translate-y-0
      `,
      danger: `
        bg-[rgba(225,29,72,0.08)] text-[var(--soft-pink)] border border-[rgba(225,29,72,0.25)]
        hover:bg-[rgba(225,29,72,0.14)] hover:border-[rgba(225,29,72,0.4)]
        hover:-translate-y-px
        active:translate-y-0
      `,
      success: `
        bg-[rgba(217,119,6,0.08)] text-[var(--soft-amber)] border border-[rgba(217,119,6,0.25)]
        hover:bg-[rgba(217,119,6,0.14)] hover:border-[rgba(217,119,6,0.4)]
        hover:-translate-y-px
        active:translate-y-0
      `,
    };

    const sizes = {
      sm: "px-4 py-2.5 text-sm min-h-[40px] sm:min-h-[36px]",
      md: "px-5 py-3 text-sm min-h-[48px] sm:min-h-[44px]",
      lg: "px-7 py-4 text-base min-h-[52px] sm:min-h-[48px]",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${widthClass}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutalButton.displayName = "BrutalButton";
