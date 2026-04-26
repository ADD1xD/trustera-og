"use client";

import { BrutalButton } from "./BrutalButton";

interface SocialShareProps {
  bountyTitle: string;
  bountyId: string;
  status?: "SUBMITTED" | "PAID";
  deadline?: string | null;
  className?: string;
}

/**
 * The "Maaz Loop" - Viral Social Share Component
 * Every submission turns into a Twitter promo
 */
function getDaysLeft(deadline?: string | null): string {
  if (!deadline) return "ending soon";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "ended";
  const days = Math.ceil(diff / 86400000);
  return days === 1 ? "ending in 1 day" : `ending in ${days} days`;
}

export function SocialShare({
  bountyTitle,
  bountyId,
  deadline,
  className = "",
}: SocialShareProps) {
  const handleShare = () => {
    const bountyUrl = `${window.location.origin}/bounties/${bountyId}`;
    const daysLeft = getDaysLeft(deadline);

    const tweetText = `Just shipped a bounty on Trustera 🟢\n\nBounty: ${bountyTitle}\nStatus: ${daysLeft}\n\n${bountyUrl}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <button
      onClick={handleShare}
      className={`
        w-full
        bg-brutal-green text-brutal-black
        border-4 border-brutal-black
        shadow-[6px_6px_0px_0px_#000000]
        font-black uppercase text-lg md:text-xl
        px-8 py-5
        transition-all duration-100 ease-in-out
        hover:shadow-[8px_8px_0px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1
        active:shadow-[2px_2px_0px_0px_#000000] active:translate-x-1 active:translate-y-1
        cursor-pointer
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-3">
        <span className="text-2xl">📢</span>
        <span>TELL THE WORLD</span>
      </span>
    </button>
  );
}

/**
 * Compact version for inline use
 */
export function SocialShareCompact({
  bountyTitle,
  bountyId,
  deadline,
}: SocialShareProps) {
  const handleShare = () => {
    const bountyUrl = `${window.location.origin}/bounties/${bountyId}`;
    const daysLeft = getDaysLeft(deadline);
    const tweetText = `Just shipped a bounty on Trustera 🟢\n\nBounty: ${bountyTitle}\nStatus: ${daysLeft}\n\n${bountyUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <BrutalButton variant="primary" size="sm" onClick={handleShare}>
      📢 SHARE
    </BrutalButton>
  );
}
