import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { motion } from "framer-motion";

type MotionDivProps = Omit<ComponentPropsWithoutRef<typeof motion.div>, "children">;

interface BrutalCardProps extends MotionDivProps {
  children?: ReactNode;
  variant?: "default" | "green" | "pink" | "yellow" | "dark";
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

/**
 * Liquid-glass card. Maintains the original API ("default" / "green" / "pink"
 * / "yellow" / "dark" variants) but renders translucent frosted surfaces with
 * subtle accent glows instead of brutalist borders.
 */
export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  (
    {
      children,
      variant = "default",
      padding = "md",
      hover = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      relative overflow-hidden
      glass glass-shadow
    `;

    const variants: Record<string, string> = {
      default: "",
      green: "ring-1 ring-[rgba(52,211,153,0.25)]",
      pink: "ring-1 ring-[rgba(244,114,182,0.25)]",
      yellow: "ring-1 ring-[rgba(251,191,36,0.25)]",
      dark: "bg-black/40 border-white/10",
    };

    const paddings = {
      sm: "p-4 md:p-5",
      md: "p-5 md:p-6",
      lg: "p-6 md:p-8",
    };

    const accentGlow: Record<string, string> = {
      default: "",
      green:
        "before:absolute before:inset-0 before:-z-0 before:bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.18),transparent_60%)] before:pointer-events-none",
      pink:
        "before:absolute before:inset-0 before:-z-0 before:bg-[radial-gradient(ellipse_at_top_left,rgba(244,114,182,0.18),transparent_60%)] before:pointer-events-none",
      yellow:
        "before:absolute before:inset-0 before:-z-0 before:bg-[radial-gradient(ellipse_at_top_left,rgba(251,191,36,0.18),transparent_60%)] before:pointer-events-none",
      dark: "",
    };

    return (
      <motion.div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${accentGlow[variant]}
          ${paddings[padding]}
          ${hover ? "cursor-pointer glass-hover" : ""}
          ${className}
        `}
        whileHover={
          hover
            ? {
                y: -2,
                transition: {
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                },
              }
            : undefined
        }
        {...props}
      >
        <span className="relative z-10 block">{children}</span>
      </motion.div>
    );
  }
);

BrutalCard.displayName = "BrutalCard";
