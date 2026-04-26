"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

const WHY = [
  {
    num: "01",
    title: "Verified Participation",
    desc: "Only World verified humans can join. Real work, real feedback, zero spam.",
  },
  {
    num: "02",
    title: "Instant Onchain Rewards",
    desc: "Earn USDC directly on WorldChain. Fast, transparent, trustless payouts.",
  },
  {
    num: "03",
    title: "Feedback and Bounties",
    desc: "Test apps, give insights, and get paid for meaningful contributions.",
  },
];

const HOW = [
  {
    num: "01",
    title: "Create or Discover",
    desc: "Projects post bounties or feedback tasks. Hunters browse opportunities that match their skills.",
  },
  {
    num: "02",
    title: "Submit Work or Feedback",
    desc: "Complete tasks, build features, test products, or provide insights and submit your work.",
  },
  {
    num: "03",
    title: "Verify and Reward",
    desc: "Submissions are reviewed, winners selected, and rewards sent instantly in USDC.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-16 pb-12 sm:pt-28 sm:pb-20 text-center overflow-hidden">
        {/* subtle green ambient glow — top only */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #059669 0%, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 flex flex-col items-center gap-5 w-full max-w-lg mx-auto"
        >
          {/* Logo mark */}
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--accent)] shadow-md ring-4 ring-[var(--accent-soft)]">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path d="M20 6L34 14V26L20 34L6 26V14L20 6Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              <path d="M20 6V34M6 14L34 26M34 14L6 26" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
              <circle cx="20" cy="20" r="4" fill="white" fillOpacity="0.95" />
            </svg>
          </div>

          {/* Wordmark */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none text-[var(--text-primary)]">
            TRUSTER<span className="text-[var(--accent)]">A</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xs sm:max-w-md leading-relaxed text-balance">
            A verified human bounty and feedback platform on WorldChain.{" "}
            <span className="text-[var(--text-primary)] font-semibold">Test. Build. Earn real USDC.</span>
          </p>

          {/* CTAs — stacked on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto mt-1">
            <Link
              href="/bounties"
              className="flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-dark)] transition-colors active:scale-95 shadow-sm"
            >
              Browse Bounties
            </Link>
            <a
              href="#how"
              className="flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-[var(--text-secondary)] bg-white border border-[var(--glass-border)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-strong)] transition-colors"
            >
              How it works
            </a>
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-glow)] text-[var(--accent)] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Powered by World ID &bull; WorldChain
          </div>
        </motion.div>
      </section>

      {/* ── WHY TRUSTERA ─────────────────────────────────────────────────── */}
      <section id="why" className="px-4 py-10 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease }}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              Why Trustera
            </p>
            <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] text-balance">
              Built for real builders.{" "}
              <span className="text-[var(--accent)]">Rewarding real humans.</span>
            </h2>
          </motion.div>

          {/* Mobile: vertical stack | sm+: 3 cols */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
            {WHY.map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, ease, delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 glass-hover flex gap-4 sm:flex-col sm:gap-0"
              >
                <div className="shrink-0 w-9 h-9 sm:mb-4 rounded-xl flex items-center justify-center bg-[var(--accent)] text-white text-xs font-bold shadow-sm">
                  {item.num}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1 text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="px-4 py-10 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease }}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              How it works
            </p>
            <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] text-balance">
              From task to payout.{" "}
              <span className="text-[var(--accent)]">Simple and fair.</span>
            </h2>
          </motion.div>

          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
            {HOW.map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, ease, delay: i * 0.07 }}
                className="relative bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 glass-hover overflow-hidden"
              >
                {/* green left stripe */}
                <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-[var(--accent)]" />
                {/* step badge */}
                <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest border border-[var(--glass-border-strong)] bg-[var(--bg-elev-2)] text-[var(--text-tertiary)]">
                  {item.num}
                </span>
                <h3 className="text-sm font-bold mb-1 text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="px-4 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, ease }}
            className="relative rounded-2xl overflow-hidden px-6 py-8 sm:p-12 text-center bg-[var(--text-primary)] shadow-sm"
          >
            {/* dot grid texture */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent)]" />

            <h2 className="relative text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 text-balance">
              Ready to earn on WorldChain?
            </h2>
            <p className="relative text-white/65 text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm mx-auto leading-relaxed">
              Verify with World ID and start earning USDC for your work and feedback today.
            </p>
            <Link
              href="/bounties"
              className="relative inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] transition-colors active:scale-95 shadow-sm"
            >
              Explore Bounties
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-4 pt-4 pb-6 sm:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 sm:p-8">

            {/* Mobile: 2-col grid | sm+: 3-col */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">

              {/* Brand — full width on mobile, left col on sm+ */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[var(--accent)] shadow-sm shrink-0">
                    <svg width="12" height="12" viewBox="0 0 40 40" fill="none" aria-hidden>
                      <path d="M20 6L34 14V26L20 34L6 26V14L20 6Z" stroke="white" strokeWidth="3" strokeLinejoin="round" fill="none" />
                      <circle cx="20" cy="20" r="4" fill="white" />
                    </svg>
                  </div>
                  <span className="text-sm font-black tracking-tight text-[var(--text-primary)]">
                    TRUSTER<span className="text-[var(--accent)]">A</span>
                  </span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed max-w-[200px]">
                  Verified human bounty and feedback platform on WorldChain.
                </p>
              </div>

              {/* Community */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-2.5 font-semibold">
                  Community
                </p>
                <div className="flex flex-col gap-2">
                  <a href="https://x.com/trusterax" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit">
                    X (Twitter)
                  </a>
                  <a href="https://t.me/trusterax" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit">
                    Telegram
                  </a>
                </div>
              </div>

              {/* Built by */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-2.5 font-semibold">
                  Built by
                </p>
                <div className="flex flex-col gap-2">
                  <a href="https://x.com/SheCallsMeAddy" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit">
                    @SheCallsMeAddy
                  </a>
                  <a href="https://x.com/Roh1nxd" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors w-fit">
                    @Roh1nxd
                  </a>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <p className="text-[10px] text-[var(--text-tertiary)]">
                &copy; {new Date().getFullYear()} Trustera. All rights reserved.
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Powered by World ID &bull; WorldChain
              </p>
            </div>

          </div>
        </div>
      </footer>

    </main>
  );
}
