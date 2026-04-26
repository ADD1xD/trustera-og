"use client";

import { NavbarWrapper } from "@/components/NavbarWrapper";
import { BrutalButton } from "@/components/BrutalButton";
import { WalletGate } from "@/components/WalletGate";
import { SocialShare } from "@/components/SocialShare";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Bounty, Submission } from "@/lib/supabase";
import { useBrutalNotification } from "@/components/ui/BrutalNotification";
import { UserDisplay } from "@/components/UserDisplay";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { formatUSDC } from "@/lib/format";
import { colorThemes, CardColor } from "@/components/ui/card-5";

// ── Helpers ───────────────────────────────────────────────────────────────────
const COLORS: CardColor[] = ["default", "blue", "violet", "orange"];
function pickColor(id: string): CardColor {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[n % COLORS.length];
}

function getTotalPrize(bounty: Bounty): number {
  if (bounty.reward) return bounty.reward;
  if (bounty.reward_breakdown?.length) {
    return bounty.reward_breakdown.reduce((a, t) => a + (t.amount || 0), 0);
  }
  return parseFloat(bounty.prize ?? "0") || 0;
}

function formatDate(ds: string) {
  return new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown(targetDate?: string) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0, ended: false });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setParts({ d: 0, h: 0, m: 0, s: 0, ended: true }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setParts({ d, h, m, s, ended: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return parts;
}

function CountdownBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)] leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[0.6rem] uppercase tracking-widest text-[var(--text-tertiary)] mt-0.5">{label}</span>
    </div>
  );
}

// ── Tab types ─────────────────────────────────────────────────────────────────
type Tab = "details" | "submissions" | "rules";

export default function BountyDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const { walletAddress } = useAuth();
  const { notify } = useBrutalNotification();
  const bountyId = params.id as string;

  const [bounty, setBounty]         = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>("details");
  const [showForm, setShowForm]     = useState(false);
  const [content, setContent]       = useState("");
  const [contact, setContact]       = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [br, sr] = await Promise.all([
          fetch(`/api/bounties/${bountyId}`),
          fetch(`/api/submissions?bounty_id=${bountyId}`),
        ]);
        setBounty(br.ok ? await br.json() : null);
        setSubmissions(sr.ok ? await sr.json() : []);
      } finally {
        setLoading(false);
      }
    }
    if (bountyId) load();
  }, [bountyId]);

  // Use deadline from DB, fall back to 30 days from created_at
  const deadline = useMemo(() => {
    if (!bounty) return null;
    if (bounty.deadline) return bounty.deadline;
    if (bounty.created_at) {
      const d = new Date(bounty.created_at);
      d.setDate(d.getDate() + 30);
      return d.toISOString();
    }
    return null;
  }, [bounty]);
  const countdown = useCountdown(deadline ?? undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !content.trim() || !contact.trim()) return;
    // Validate URL
    try { new URL(content.trim()); } catch {
      notify.error("Please enter a valid URL (e.g. https://youtube.com/...)");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bounty_id: bountyId, hunter_address: walletAddress, content: content.trim(), contact: contact.trim() }),
      });
      if (res.ok) {
        setSubmissions([await res.json(), ...submissions]);
        setShowForm(false); setContent(""); setContact("");
        setActiveTab("submissions");
        notify.success("Submission sent! It remains private until the bounty is resolved.");
      } else {
        const err = await res.json();
        notify.error(err.message || "Failed to submit");
      }
    } catch { notify.error("Failed to submit. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Bounty not found</h1>
        <BrutalButton onClick={() => router.push("/bounties")}>Back to bounties</BrutalButton>
      </div>
    );
  }

  const color       = pickColor(bounty.id);
  const theme       = colorThemes[color];
  const totalPrize  = getTotalPrize(bounty);
  const isOpen      = bounty.status === "open" || bounty.status === "OPEN";
  const viewable    = submissions.filter((s) => {
    if (s.hunter_address.toLowerCase() === walletAddress?.toLowerCase()) return true;
    if (s.is_public || bounty.status === "PAID") return true;
    return false;
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "details",     label: "Details" },
    { id: "submissions", label: "Submissions", count: submissions.length },
    { id: "rules",       label: "Rules" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavbarWrapper />

      {/* ── Hero gradient band ── */}
      <div
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, hsl(${theme.from}), hsl(${theme.to}))` }}
      />

      <main className="px-4 sm:px-6 pt-4 pb-36 lg:pb-10 max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push("/bounties")}
          className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* ── Left: Main content ── */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">

            {/* Header card */}
            <motion.div
              className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Colored top strip */}
              <div
                className="h-1.5"
                style={{ background: `linear-gradient(90deg, hsl(${theme.from}), hsl(${theme.to}))` }}
              />
              <div className="p-5 sm:p-6">
                {/* Company row */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: `linear-gradient(135deg, hsl(${theme.from}), hsl(${theme.to}))` }}
                  >
                    {bounty.title[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Trustera</p>
                    <p className="text-xs text-[var(--text-tertiary)]">@trustera</p>
                  </div>
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isOpen
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "bg-[rgba(225,29,72,0.08)] text-[var(--soft-pink)]"
                  }`}>
                    {isOpen ? "Open" : "Ended"}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] leading-tight mb-2">
                  {bounty.title}
                </h1>
                <p className="text-xs text-[var(--text-tertiary)]">Posted {formatDate(bounty.created_at)}</p>
              </div>
            </motion.div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-[var(--bg-elev-2)] rounded-xl p-1 w-full">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === t.id
                      ? "bg-white text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t.label}
                  {t.count !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === t.id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--glass-border)] text-[var(--text-tertiary)]"
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
              {activeTab === "details" && (
                <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
                  {/* Description */}
                  <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 sm:p-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">Description</h2>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                      {bounty.description}
                    </p>
                  </div>

                  {/* Prize breakdown */}
                  {(bounty.reward_breakdown?.length > 0) && (
                    <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 sm:p-6">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">Prize Breakdown</h2>
                      <div className="space-y-2">
                        {bounty.reward_breakdown.map((tier) => {
                          const medals = ["", "🥇", "🥈", "🥉"];
                          const winner = bounty.winners?.find((w) => w.rank === tier.place);
                          return (
                            <div key={tier.place} className={`flex items-center justify-between p-3 rounded-xl border ${winner ? "bg-[var(--accent-soft)] border-[var(--accent-glow)]" : "bg-[var(--bg-elev-2)] border-[var(--glass-border)]"}`}>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                  style={{ background: `linear-gradient(135deg, hsl(${theme.from}), hsl(${theme.to}))` }}
                                >
                                  {medals[tier.place] || `#${tier.place}`}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[var(--text-primary)]">{tier.label} — {tier.amount} {tier.token}</p>
                                  {winner && <p className="text-xs text-[var(--text-secondary)]">Won by <UserDisplay address={winner.hunter_address} /></p>}
                                </div>
                              </div>
                              {winner ? (
                                <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">Winner</span>
                              ) : (
                                <span className="text-xs text-[var(--text-tertiary)] font-semibold">Open</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* How to participate */}
                  <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 sm:p-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">How to Participate</h2>
                    <ol className="space-y-2">
                      {["Verify your World ID identity", "Review the bounty requirements above", "Complete the required task", "Submit your work with proof and contact info", "Wait for the creator to review and pay winners"].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                            style={{ background: `linear-gradient(135deg, hsl(${theme.from}), hsl(${theme.to}))` }}
                          >{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              )}

              {activeTab === "submissions" && (
                <motion.div key="submissions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-widest">
                      {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {bounty.status === "PAID" ? "Public archive" : "Private until resolved"}
                    </p>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[var(--glass-border)] p-10 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--bg-elev-2)] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-[var(--text-secondary)] text-sm">No submissions yet</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">Be the first to submit!</p>
                    </div>
                  ) : viewable.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[var(--glass-border)] p-10 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--bg-elev-2)] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-[var(--text-secondary)] text-sm">Submissions are private</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">Visible after bounty resolves</p>
                    </div>
                  ) : (
                    viewable.map((s) => {
                      const isWinner = bounty.winners?.some((w) => w.submission_id === s.id) || bounty.winner_address?.toLowerCase() === s.hunter_address.toLowerCase();
                      const winDetail = bounty.winners?.find((w) => w.submission_id === s.id);
                      const isMe = s.hunter_address.toLowerCase() === walletAddress?.toLowerCase();
                      return (
                        <div key={s.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${isWinner ? "border-[var(--accent-glow)] bg-[var(--accent-soft)]" : "border-[var(--glass-border)]"}`}>
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold bg-[var(--text-primary)] text-white px-2 py-0.5 rounded">
                                <UserDisplay address={s.hunter_address} />
                              </span>
                              {isMe && <span className="text-[10px] font-bold bg-[var(--soft-amber)] text-white px-1.5 py-0.5 rounded uppercase">You</span>}
                            </div>
                            <span className="text-xs text-[var(--text-tertiary)]">{formatDate(s.created_at)}</span>
                          </div>
                          <div className="bg-[var(--bg-elev-2)] border border-[var(--glass-border)] rounded-lg p-3 text-sm whitespace-pre-wrap text-[var(--text-primary)] font-mono mb-2 leading-relaxed">
                            {s.content}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]"><span className="font-semibold">Contact:</span> {s.contact}</p>
                          {isWinner && (
                            <div className="mt-2 pt-2 border-t border-[var(--glass-border)] flex items-center gap-2">
                              <span className="text-xs font-bold text-white px-3 py-1 rounded-full" style={{ background: `linear-gradient(90deg, hsl(${theme.from}), hsl(${theme.to}))` }}>
                                Winner {winDetail ? `#${winDetail.rank} ($${winDetail.amount})` : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {activeTab === "rules" && (
                <motion.div key="rules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 sm:p-6 space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Rules &amp; Guidelines</h2>
                    {[
                      ["Eligibility", "All World ID verified users may participate. One submission per user per bounty."],
                      ["Originality", "Work must be original and created specifically for this bounty. Plagiarism disqualifies your entry."],
                      ["Submission Format", "Clearly describe your work, include links to demos, repos, or proof of work. Incomplete submissions will not be considered."],
                      ["Judging", "The bounty creator evaluates submissions based on quality, creativity, and adherence to requirements."],
                      ["Payment", "Winners receive USDC directly to their verified World ID wallet within 7 days of selection."],
                      ["Disputes", "All disputes are handled by the bounty creator. Trustera is not responsible for payment disputes."],
                    ].map(([title, body]) => (
                      <div key={title} className="border-b border-[var(--glass-border)] last:border-0 pb-4 last:pb-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{title}</p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-20">
            {/* Stats panel */}
            <motion.div
              className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm overflow-hidden"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="h-1" style={{ background: `linear-gradient(90deg, hsl(${theme.from}), hsl(${theme.to}))` }} />
              <div className="p-4 space-y-4">
                {/* Prize */}
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Total Prize</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] leading-none">
                    ${formatUSDC(totalPrize.toString()).replace(" USDC", "")}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">USDC</p>
                </div>

                <div className="h-px bg-[var(--glass-border)]" />

                {/* Countdown */}
                {isOpen && !countdown.ended && (
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Time Remaining</p>
                    <div className="flex items-center gap-2">
                      <CountdownBlock label="Days" value={countdown.d} />
                      <span className="text-[var(--text-tertiary)] font-bold text-lg leading-none mb-2">:</span>
                      <CountdownBlock label="Hrs" value={countdown.h} />
                      <span className="text-[var(--text-tertiary)] font-bold text-lg leading-none mb-2">:</span>
                      <CountdownBlock label="Min" value={countdown.m} />
                      <span className="text-[var(--text-tertiary)] font-bold text-lg leading-none mb-2">:</span>
                      <CountdownBlock label="Sec" value={countdown.s} />
                    </div>
                  </div>
                )}
                {(!isOpen || countdown.ended) && (
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Status</p>
                    <span className="text-sm font-bold text-[var(--soft-pink)]">Bounty Ended</span>
                  </div>
                )}

                <div className="h-px bg-[var(--glass-border)]" />

                {/* Submissions + Posted */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Submissions</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{submissions.length}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Posted</p>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{formatDate(bounty.created_at)}</p>
                  </div>
                </div>

                <div className="h-px bg-[var(--glass-border)]" />

                {/* Creator */}
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Creator</p>
                  <p className="text-xs font-mono text-[var(--text-primary)]">
                    <UserDisplay address={bounty.creator_address} showLink />
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Desktop CTA */}
            <div className="hidden lg:block space-y-3">
              {isOpen ? (
                <WalletGate requireWallet title="Verify to submit" description="Verify with World ID to hunt bounties">
                  {showForm ? (
                    <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-4 space-y-3">
                      <p className="text-sm font-bold text-[var(--text-primary)]">Submit your work</p>
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Submission Link</label>
                          <input
                            type="url"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            required
                            className="w-full text-sm rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elev-2)] p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          />
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Paste a public link to your video, repo, or deliverable</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Contact</label>
                          <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Telegram / Discord / Email" required className="w-full text-sm rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elev-2)] p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                        </div>
                        <div className="flex gap-2">
                          <BrutalButton type="submit" variant="primary" fullWidth disabled={submitting}>{submitting ? "Submitting..." : "Submit Entry"}</BrutalButton>
                          <BrutalButton type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</BrutalButton>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <BrutalButton variant="primary" size="lg" fullWidth onClick={() => setShowForm(true)}>Submit Entry</BrutalButton>
                  )}
                </WalletGate>
              ) : (
                <div className="bg-[rgba(225,29,72,0.06)] border border-[rgba(225,29,72,0.15)] rounded-xl p-4 text-center">
                  <p className="font-bold text-[var(--soft-pink)] text-sm">Bounty ended</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">No longer accepting submissions</p>
                </div>
              )}
              <SocialShare bountyTitle={bounty.title} bountyId={bounty.id} status={bounty.status === "PAID" ? "PAID" : "SUBMITTED"} deadline={deadline} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile: sticky CTA button ── */}
      {isOpen && !showForm && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+80px)] bg-white/95 backdrop-blur-xl border-t border-[var(--glass-border)] lg:hidden">
          <WalletGate requireWallet title="Verify to submit" description="Verify with World ID to hunt bounties">
            <BrutalButton variant="primary" size="lg" fullWidth onClick={() => setShowForm(true)}>
              Submit Entry
            </BrutalButton>
          </WalletGate>
        </div>
      )}

      {/* ── Mobile: full-screen form bottom sheet ── */}
      <AnimatePresence>
        {isOpen && showForm && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            {/* Sheet */}
            <motion.div
              className="relative bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+88px)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-[var(--glass-border)] rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-bold text-[var(--text-primary)]">Submit your work</p>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-elev-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
                    Submission Link
                  </label>
                  <input
                    type="url"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                    autoFocus
                    className="w-full text-sm rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elev-2)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Paste a public link to your video, repo, or deliverable</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Telegram / Discord / Email"
                    required
                    className="w-full text-sm rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elev-2)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <BrutalButton type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Entry"}
                </BrutalButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


