"use client";
import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export const colorThemes = {
  default: { from: "142 76% 36%", to: "160 60% 40%", foreground: "0 0% 100%" },
  blue:    { from: "217 91% 55%", to: "221 83% 48%", foreground: "0 0% 100%" },
  violet:  { from: "262 83% 55%", to: "262 70% 46%", foreground: "0 0% 100%" },
  orange:  { from: "24 94% 48%",  to: "35 92% 56%",  foreground: "0 0% 100%" },
};

export type CardColor = keyof typeof colorThemes;

export interface HighlightCardProps {
  title: string;
  description: string;
  metricValue: string;
  metricLabel: string;
  buttonText: string;
  onButtonClick: () => void;
  icon: React.ReactNode;
  color?: CardColor;
  className?: string;
  badge?: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.38, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export const HighlightCard = React.forwardRef<HTMLDivElement, HighlightCardProps>(
  ({ title, description, metricValue, metricLabel, buttonText, onButtonClick, icon, color = "default", className, badge }, ref) => {
    const theme = colorThemes[color] ?? colorThemes.default;

    return (
      <motion.div
        ref={ref}
        className={cn("relative w-full overflow-hidden rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer select-none", className)}
        style={{
          "--card-from": `hsl(${theme.from})`,
          "--card-to":   `hsl(${theme.to})`,
          "--card-fg":   `hsl(${theme.foreground})`,
          color: "var(--card-fg)",
          backgroundImage: `
            radial-gradient(circle at 1px 1px, hsla(0,0%,100%,0.12) 1px, transparent 0),
            linear-gradient(135deg, var(--card-from), var(--card-to))
          `,
          backgroundSize: "0.5rem 0.5rem, 100% 100%",
        } as React.CSSProperties}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.18 } }}
        whileTap={{ scale: 0.98 }}
        onClick={onButtonClick}
      >
        {/* Bookmark icon */}
        <div className="absolute top-0 right-5 h-14 w-10 bg-white/90 backdrop-blur-sm [clip-path:polygon(0%_0%,_100%_0%,_100%_100%,_50%_78%,_0%_100%)] flex items-center justify-center"
          style={{ color: `hsl(${theme.from})` }}>
          <div className="mt-[-10px]">{icon}</div>
        </div>

        {/* Badge */}
        {badge && (
          <motion.span variants={itemVariants} className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-white/20 text-[0.65rem] font-bold uppercase tracking-widest backdrop-blur-sm">
            {badge}
          </motion.span>
        )}

        <div className="flex h-full flex-col justify-between gap-3">
          <div className="pr-8">
            <motion.h3 variants={itemVariants} className="text-base sm:text-lg font-bold tracking-tight leading-snug line-clamp-2">
              {title}
            </motion.h3>
            <motion.p variants={itemVariants} className="mt-1 text-xs sm:text-sm opacity-80 leading-relaxed line-clamp-2">
              {description}
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="h-px w-full bg-white/20" />

          <div className="flex items-end justify-between">
            <motion.div variants={itemVariants}>
              <p className="text-2xl sm:text-3xl font-bold tracking-tighter leading-none">{metricValue}</p>
              <p className="text-xs opacity-80 mt-0.5">{metricLabel}</p>
            </motion.div>
            <motion.button
              variants={itemVariants}
              onClick={(e) => { e.stopPropagation(); onButtonClick(); }}
              className="rounded-full bg-white/25 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shrink-0"
            >
              {buttonText}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }
);
HighlightCard.displayName = "HighlightCard";
