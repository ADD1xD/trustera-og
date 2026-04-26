"use client";

import { NavbarWrapper } from "@/components/NavbarWrapper";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Bounty } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { formatUSDC } from "@/lib/format";
import { HighlightCard, CardColor } from "@/components/ui/card-5";

// ── Skill-category → color + icon mapping ────────────────────────────────────
const CATEGORIES = ["All", "Dev", "Design", "Marketing", "Video", "AI", "Sales", "Community", "Content"] as const;
type Category = (typeof CATEGORIES)[number];

function getBountyCategory(bounty: Bounty): Category {
  const text = (bounty.title + " " + bounty.description).toLowerCase();
  if (/ai|gpt|llm|automati|bot|agent/.test(text)) return "AI";
  if (/video|reel|youtube|tiktok|clip/.test(text)) return "Video";
  if (/design|ui|ux|figma|landing|logo/.test(text)) return "Design";
  if (/market|growth|twitter|seo|campaign|ads/.test(text)) return "Marketing";
  if (/sales|bd|business|deal|partner/.test(text)) return "Sales";
  if (/communit|discord|telegram|engage/.test(text)) return "Community";
  if (/meme|content|creat|write|blog|article/.test(text)) return "Content";
  if (/dev|build|code|smart|contract|api|web3|sol|react|rust/.test(text)) return "Dev";
  return "Dev";
}

// Deterministic color from bounty id
const COLORS: CardColor[] = ["default", "blue", "violet", "orange"];
function pickColor(id: string): CardColor {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[n % COLORS.length];
}

// ── Category icon SVGs ────────────────────────────────────────────────────────
function CategoryIcon({ cat }: { cat: Category }) {
  const paths: Record<Category, string> = {
    All: "M4 6h16M4 12h16M4 18h16",
    Dev: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    Design: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    Marketing: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
    Video: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    AI: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M12 21v-1M6.343 17.657l-.707.707M17.657 17.657l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z",
    Sales: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    Community: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    Content: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  };
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[cat]} />
    </svg>
  );
}

// ── Bounty card icon (per category) ──────────────────────────────────────────
function BountyIcon({ cat, size = 20 }: { cat: Category; size?: number }) {
  const s = `${size}px`;
  const paths: Record<Category, string> = {
    All: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M12 21v-1",
    Dev: "M8 9l3 3-3 3m5 0h3",
    Design: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    Marketing: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    Video: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14",
    AI: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M12 21v-1",
    Sales: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2",
    Community: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857",
    Content: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  };
  return (
    <svg style={{ width: s, height: s }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[cat]} />
    </svg>
  );
}

// ── Prize helper ──────────────────────────────────────────────────────────────
function getTotalPrize(bounty: Bounty): string {
  if (bounty.reward) return String(bounty.reward);
  if (bounty.reward_breakdown?.length) {
    const total = bounty.reward_breakdown.reduce((a, t) => a + (t.amount || 0), 0);
    return String(total);
  }
  if (bounty.prizes?.length) {
    const total = bounty.prizes.reduce((a, p) => a + (parseFloat(p.amount) || 0), 0);
    return String(total);
  }
  return bounty.prize || "0";
}

function isOpenBounty(b: Bounty) {
  return b.status === "open" || b.status === "OPEN";
}

export default function BountiesPage() {
  const router = useRouter();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "ALL">("OPEN");

  useEffect(() => {
    fetch("/api/bounties")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBounties(Array.isArray(data) ? data : []))
      .catch(() => setBounties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return bounties.filter((b) => {
      if (statusFilter === "OPEN" && !isOpenBounty(b)) return false;
      if (category !== "All" && getBountyCategory(b) !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [bounties, search, category, statusFilter]);

  const openCount = bounties.filter(isOpenBounty).length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavbarWrapper />

      <main className="px-4 sm:px-6 pt-5 pb-28 sm:pb-10 max-w-6xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                Bounty Board
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                {openCount} open {openCount === 1 ? "bounty" : "bounties"} — earn USDC for your work
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {(["OPEN", "ALL"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === s
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "bg-[var(--bg-elev-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {s === "OPEN" ? "Open" : "All"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Search + Filter ── */}
        <motion.div
          className="mb-6 space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bounties..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent shadow-sm transition"
            />
          </div>

          {/* Category chips — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                  category === cat
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-white border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
                }`}
              >
                <CategoryIcon cat={cat} />
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-[var(--bg-elev-2)] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-elev-2)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M12 21v-1" />
              </svg>
            </div>
            <p className="text-base font-semibold text-[var(--text-primary)]">No bounties found</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }} className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold">Clear filters</button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence>
              {filtered.map((bounty) => {
                const cat = getBountyCategory(bounty);
                const prize = getTotalPrize(bounty);
                const color = pickColor(bounty.id);
                return (
                  <HighlightCard
                    key={bounty.id}
                    color={color}
                    title={bounty.title}
                    description={bounty.description}
                    metricValue={`$${formatUSDC(prize).replace(" USDC", "")}`}
                    metricLabel="USDC prize"
                    buttonText="View Bounty"
                    onButtonClick={() => router.push(`/bounties/${bounty.id}`)}
                    icon={<BountyIcon cat={cat} size={18} />}
                    badge={cat}
                    className={bounty.status !== "OPEN" ? "opacity-70" : ""}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Footer count ── */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">
            Showing {filtered.length} of {bounties.length} bounties
          </p>
        )}
      </main>
    </div>
  );
}
