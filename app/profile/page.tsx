"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { BrutalButton } from "@/components/BrutalButton";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import Link from "next/link";
import { formatUSDC } from "@/lib/format";
import { Submission } from "@/lib/supabase";
import { XIcon, GitBranch, Globe, Pencil, CheckCircle2 } from "lucide-react";

// ── Skills catalogue ──────────────────────────────────────────────────────────
const SKILL_CATEGORIES: Record<string, string[]> = {
  Development: [
    "Solidity","Rust","TypeScript","JavaScript","Python","Go","C++","Java",
    "React","Next.js","Vue","Svelte","Node.js","GraphQL",
    "Hardhat","Foundry","Anchor (Solana)","The Graph",
    "IPFS/Filecoin","Docker","PostgreSQL","MongoDB","Redis",
  ],
  "Web3 & Blockchain": [
    "Smart Contract Auditing","DeFi","NFTs","DAOs","ZK Proofs","Layer 2s",
    "Cross-chain","Tokenomics","Protocol Design","Wallet Integration",
    "On-chain Analytics","MEV","Account Abstraction",
  ],
  "Design & Creative": [
    "UI/UX Design","Figma","Brand Design","Motion Graphics","Illustration",
    "3D Modeling","Video Production","Photography","Meme Creation",
    "Content Writing","Copywriting","Technical Writing","Documentation",
  ],
  "Product & Growth": [
    "Product Management","Community Management","Discord Moderation",
    "Marketing","Growth Hacking","Social Media","Business Development",
    "Partnerships","Data Analysis","Research","Translations",
  ],
};

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  x_username: string;
  github_username: string;
  portfolio_url: string;
  skills: string[];
}

const EMPTY: ProfileData = {
  name: "", username: "", bio: "",
  x_username: "", github_username: "", portfolio_url: "", skills: [],
};

// ── View card (glassmorphism) ─────────────────────────────────────────────────
function ProfileViewCard({
  profile,
  isOrb,
  onEdit,
  stats,
  submissions,
}: {
  profile: ProfileData;
  isOrb: boolean;
  onEdit: () => void;
  stats: { earned: number; wins: number; winRate: number };
  submissions: Submission[];
}) {
  const initials = profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const socialLinks = [
    profile.x_username && {
      id: "x",
      href: `https://x.com/${profile.x_username}`,
      label: "X (Twitter)",
      icon: XIcon,
    },
    profile.github_username && {
      id: "github",
      href: `https://github.com/${profile.github_username}`,
      label: "GitHub",
      icon: GitBranch,
    },
    profile.portfolio_url && {
      id: "portfolio",
      href: profile.portfolio_url,
      label: "Portfolio",
      icon: Globe,
    },
  ].filter(Boolean) as { id: string; href: string; label: string; icon: React.ElementType }[];

  return (
    <div className="space-y-5">
      {/* Card */}
      <div className="relative w-full">
        <div
          className="relative flex flex-col items-center px-6 pt-8 pb-6 rounded-3xl border border-[var(--glass-border)] bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,23,42,0.08)]"
        >
          {/* Edit button */}
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] border border-[var(--glass-border)] bg-white hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            aria-label="Edit profile"
          >
            <Pencil size={12} />
            Edit
          </button>

          {/* Avatar initials */}
          <div className="w-20 h-20 mb-4 rounded-full ring-4 ring-[var(--glass-border)] overflow-hidden shrink-0 flex items-center justify-center bg-[var(--accent)]">
            <span className="text-white text-2xl font-bold select-none">{initials}</span>
          </div>

          {/* Name + username */}
          <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center">{profile.name}</h1>
          <p className="mt-0.5 text-sm font-semibold text-[var(--accent)]">@{profile.username}</p>

          {/* Verification badge */}
          {isOrb && (
            <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 size={11} />
              Orb Verified
            </span>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-center text-sm leading-relaxed text-[var(--text-secondary)] max-w-xs">
              {profile.bio}
            </p>
          )}

          {/* Divider */}
          {socialLinks.length > 0 && (
            <div className="w-1/2 h-px my-5 rounded-full bg-[var(--glass-border)]" />
          )}

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--bg-elev-2)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all duration-200"
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="mt-5 w-full space-y-2">
              <div className="w-1/2 h-px rounded-full bg-[var(--glass-border)] mx-auto" />
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {profile.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl -z-10 blur-2xl opacity-20 bg-gradient-to-r from-emerald-400/60 to-teal-400/60" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Earned", value: `$${formatUSDC(stats.earned)}` },
          { label: "Wins", value: String(stats.wins) },
          { label: "Win rate", value: `${stats.winRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-4 text-center">
            <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--glass-border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Submissions
            <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">({submissions.length})</span>
          </h2>
        </div>
        {submissions.length === 0 ? (
          <div className="px-5 py-10 text-center space-y-2">
            <p className="text-sm text-[var(--text-tertiary)]">No submissions yet.</p>
            <Link href="/bounties" className="text-sm font-semibold text-[var(--accent)] hover:underline">
              Browse open bounties
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--glass-border)]">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/bounties/${s.bounty_id}`}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-[var(--bg-elev-1)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{s.content}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {(s.prize_won ?? 0) > 0 && (
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      Won ${formatUSDC(s.prize_won!)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Edit form ─────────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-[var(--text-primary)]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-[var(--text-tertiary)] -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, prefix, maxLength, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  prefix?: React.ReactNode; maxLength?: number; type?: string; disabled?: boolean;
}) {
  return (
    <div className="flex items-center rounded-xl border border-[var(--glass-border)] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-[var(--accent)] transition-all">
      {prefix && (
        <span className="px-3 py-2.5 bg-[var(--bg-elev-2)] border-r border-[var(--glass-border)] text-[var(--text-tertiary)] text-sm shrink-0 flex items-center">
          {prefix}
        </span>
      )}
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength} disabled={disabled}
        className="flex-1 px-3 py-2.5 text-sm text-[var(--text-primary)] bg-transparent outline-none placeholder:text-[var(--text-tertiary)] disabled:opacity-50"
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile]       = useState<ProfileData | null>(null);
  const [form, setForm]             = useState<ProfileData>(EMPTY);
  const [isEditing, setIsEditing]   = useState(false);
  const [errors, setErrors]         = useState<Partial<Record<keyof ProfileData | "social", string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [savedOk, setSavedOk]       = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const uid = user?.nullifier_hash ?? null;

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async (hash: string) => {
    try {
      const [profRes, subRes] = await Promise.all([
        fetch(`/api/profile?nullifier_hash=${encodeURIComponent(hash)}`),
        fetch(`/api/submissions?hunter=${encodeURIComponent(hash)}`),
      ]);
      const profJson = await profRes.json();
      // Submissions table may not exist yet — treat any failure as empty
      let subJson: Submission[] = [];
      try {
        if (subRes.ok) subJson = await subRes.json();
      } catch { /* ignore */ }

      if (profJson.profile) {
        const p = profJson.profile;
        const data: ProfileData = {
          name:            p.name            ?? "",
          username:        p.username        ?? "",
          bio:             p.bio             ?? "",
          x_username:      p.x_username      ?? "",
          github_username: p.github_username ?? "",
          portfolio_url:   p.portfolio_url   ?? "",
          skills:          Array.isArray(p.skills) ? p.skills : [],
        };
        setProfile(data);
        setForm(data);
        // If profile has name+username, start in view mode
        setIsEditing(!data.name || !data.username);
      } else {
        // No profile yet — start in edit mode
        setIsEditing(true);
      }
      setSubmissions(Array.isArray(subJson) ? subJson : []);
    } catch (e) {
      console.error("[v0] load profile error:", e);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (uid) loadProfile(uid);
      else setLoading(false);
    }
  }, [authLoading, uid, loadProfile]);

  // ── Skill toggle ───────────��────────────────────────────────────────────���─���
  const toggleSkill = (skill: string) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.username.trim()) e.username = "Username is required";
    else if (!/^[a-z0-9_]+$/.test(form.username.trim().toLowerCase()))
      e.username = "Letters, numbers and underscores only";
    if (!form.x_username.trim() && !form.github_username.trim() && !form.portfolio_url.trim())
      e.social = "Add at least one: X, GitHub, or portfolio URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setGlobalError("");
    if (!validate() || !uid) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nullifier_hash:  uid,
          name:            form.name.trim(),
          username:        form.username.trim().toLowerCase(),
          bio:             form.bio.trim(),
          x_username:      form.x_username.trim(),
          github_username: form.github_username.trim(),
          portfolio_url:   form.portfolio_url.trim(),
          skills:          form.skills,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      const saved = json.profile as ProfileData;
      setProfile(saved);
      setForm(saved);
      setSavedOk(true);
      setIsEditing(false);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel edit ───────────────────────────────────────────────────────────
  const handleCancelEdit = () => {
    if (profile) {
      setForm(profile);
      setErrors({});
      setGlobalError("");
      setIsEditing(false);
    }
  };

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <NavbarWrapper />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <NavbarWrapper />
        <div className="max-w-sm mx-auto px-4 pt-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Sign in to view your profile</h2>
          <p className="text-sm text-[var(--text-secondary)]">Verify with World ID to create your identity on Trustera</p>
        </div>
      </div>
    );
  }

  const totalEarnings = submissions.reduce((acc, s) => acc + (s.prize_won ?? 0), 0);
  const wins          = submissions.filter((s) => (s.prize_won ?? 0) > 0).length;
  const winRate       = submissions.length > 0 ? Math.round((wins / submissions.length) * 100) : 0;

  // ── View mode ─────────────────────────────────────────────────────────────
  if (!isEditing && profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <NavbarWrapper />
        <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
          {savedOk && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <CheckCircle2 size={16} />
              Profile saved successfully!
            </div>
          )}
          <ProfileViewCard
            profile={profile}
            isOrb={user.verification_level === "orb"}
            onEdit={() => { setForm(profile); setIsEditing(true); }}
            stats={{ earned: totalEarnings, wins, winRate }}
            submissions={submissions}
          />
        </main>
      </div>
    );
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavbarWrapper />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-28 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {profile ? "Edit Profile" : "Create Profile"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Build your identity on Trustera</p>
          </div>
          {profile && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Verification badge */}
        <div>
          {user.verification_level === "orb" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 size={12} />
              Orb Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
              Device Verified
            </span>
          )}
        </div>

        {/* Global error */}
        {globalError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{globalError}</p>
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 space-y-4">
          <h2 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Basic Info</h2>

          <Field label="Full Name" required error={errors.name}>
            <TextInput
              value={form.name}
              onChange={(v) => { setForm((f) => ({ ...f, name: v })); setErrors((e) => ({ ...e, name: "" })); }}
              placeholder="e.g. Alex Johnson" maxLength={60}
            />
          </Field>

          <Field label="Username" required error={errors.username}>
            <TextInput
              value={form.username} prefix="@"
              onChange={(v) => { setForm((f) => ({ ...f, username: v })); setErrors((e) => ({ ...e, username: "" })); }}
              placeholder="alexj" maxLength={30}
            />
          </Field>

          <Field label="Bio" hint="Max 200 characters">
            <div className="relative">
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Tell the community what you build or create..."
                maxLength={200} rows={3}
                className="w-full px-3 py-2.5 text-sm text-[var(--text-primary)] bg-white rounded-xl border border-[var(--glass-border)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none resize-none placeholder:text-[var(--text-tertiary)] transition-all"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] text-[var(--text-tertiary)]">
                {form.bio.length}/200
              </span>
            </div>
          </Field>
        </div>

        {/* Social links */}
        <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Social Links</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">At least one is required</p>
          </div>

          {errors.social && <p className="text-xs text-red-500">{errors.social}</p>}

          <Field label="X (Twitter)">
            <TextInput
              value={form.x_username}
              prefix={<XIcon size={16} />}
              onChange={(v) => { setForm((f) => ({ ...f, x_username: v })); setErrors((e) => ({ ...e, social: "" })); }}
              placeholder="username (without @)" maxLength={50}
            />
          </Field>

          <Field label="GitHub">
            <TextInput
              value={form.github_username}
              prefix={<GitBranch size={16} />}
              onChange={(v) => { setForm((f) => ({ ...f, github_username: v })); setErrors((e) => ({ ...e, social: "" })); }}
              placeholder="username" maxLength={50}
            />
          </Field>

          <Field label="Portfolio / Website">
            <TextInput
              value={form.portfolio_url} type="url"
              prefix={<Globe size={16} />}
              onChange={(v) => { setForm((f) => ({ ...f, portfolio_url: v })); setErrors((e) => ({ ...e, social: "" })); }}
              placeholder="https://yoursite.com" maxLength={200}
            />
          </Field>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-[var(--glass-border)] shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Skills</h2>
            {form.skills.length > 0 && (
              <span className="text-xs font-semibold text-[var(--accent)]">{form.skills.length} selected</span>
            )}
          </div>

          {Object.entries(SKILL_CATEGORIES).map(([cat, skills]) => (
            <div key={cat} className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const selected = form.skills.includes(skill);
                  return (
                    <button
                      key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 rounded-full text-xs font-medium border transition-all min-h-[36px] ${
                        selected
                          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                          : "bg-white text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="space-y-2">
          <BrutalButton
            variant="primary" size="lg"
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving…" : "Save Profile"}
          </BrutalButton>
          {profile && (
            <button
              onClick={handleCancelEdit}
              className="w-full py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          )}
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Name and username are required · At least one social link is required
          </p>
        </div>

      </main>
    </div>
  );
}
