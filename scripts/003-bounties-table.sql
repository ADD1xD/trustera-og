-- Create bounties table
create table if not exists public.bounties (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  description     text        not null default '',
  reward          numeric     not null default 0,
  reward_breakdown jsonb       not null default '[]',
  status          text        not null default 'open' check (status in ('open','closed','review')),
  category        text        not null default 'general',
  creator_address text        not null default '',
  submission_count int         not null default 0,
  deadline        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.bounties disable row level security;

create or replace function public.handle_bounty_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_bounties_updated_at on public.bounties;
create trigger set_bounties_updated_at
  before update on public.bounties
  for each row execute function public.handle_bounty_updated_at();

-- Demo bounty: WorldChain Video Content
insert into public.bounties (
  id,
  title,
  description,
  reward,
  reward_breakdown,
  status,
  category,
  creator_address,
  deadline
) values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'WorldChain Video Content Creator Challenge',
  E'## Overview\n\nWorldChain is on a mission to become the most human-centric blockchain in the world — and we need creators like YOU to help tell that story.\n\nWe''re looking for high-quality, engaging video content that explains what WorldChain is, why it matters, and how everyday people can benefit from it. Whether you''re a seasoned Web3 creator or a newcomer with a fresh perspective, this bounty is open to everyone.\n\n---\n\n## What We''re Looking For\n\nCreate a video (3–10 minutes) on **any of the following topics**:\n\n- **What is WorldChain?** — An explainer for people new to crypto\n- **WorldChain vs. other L2s** — A technical or non-technical comparison\n- **Building on WorldChain** — A developer walkthrough or tutorial\n- **World ID & Privacy** — How World ID protects users while enabling proof-of-humanity\n- **Why WorldChain for DeFi** — Explaining the benefits of a human-verified chain\n- **A Day in the Life on WorldChain** — A creative storytelling piece showing real use cases\n\nYou are free to choose your format: talking head, screen recording, animation, documentary-style, or any combination.\n\n---\n\n## Prizes\n\n| Place | Reward |\n|-------|--------|\n| 1st   | 1,000 USDC |\n| 2nd   | 500 USDC |\n| 3rd   | 250 USDC |\n\n**Total prize pool: 1,750 USDC**\n\nWinners will be selected by the WorldChain core team based on creativity, accuracy, production quality, and reach.\n\n---\n\n## Judging Criteria\n\n- **Accuracy (25%)** — Is the information about WorldChain technically correct?\n- **Clarity (25%)** — Is the content easy to understand for the target audience?\n- **Production Quality (20%)** — Audio, visuals, editing, and overall presentation\n- **Originality (20%)** — Fresh angle, unique storytelling, memorable delivery\n- **Reach & Engagement (10%)** — Views, comments, and shares after posting\n\n---\n\n## How to Enter\n\n1. **Create your video** — Produce a video meeting the requirements above. Minimum length is 3 minutes, maximum is 10 minutes.\n2. **Upload it** — Publish your video to YouTube, X (Twitter), TikTok, or any major video platform. The video must be publicly accessible.\n3. **Submit your entry** — Click the "Submit Entry" button on this page and paste your video URL along with a short description (2–3 sentences) explaining your angle.\n4. **Share it** — Post your video on X (Twitter) tagging @worldchain and using the hashtag **#WorldChainCreator**. This is required for your submission to be considered.\n5. **Wait for results** — Winners will be announced within 14 days of the deadline. You will be contacted via the submission form.\n\n---\n\n## Rules & Requirements\n\n- The video must be **original content** created specifically for this bounty. Repurposed or previously published content is not eligible.\n- The video must be **in English**. Subtitled versions in other languages are welcome but the primary language must be English.\n- AI-generated voiceovers are allowed, but the **script and editing must be your own work**.\n- You may submit **up to 2 entries**.\n- All factual claims about WorldChain must be accurate. Misleading content will be disqualified.\n- Submissions must remain publicly accessible for at least 60 days after the deadline.\n- By submitting, you grant WorldChain a non-exclusive license to share and promote your video.\n\n---\n\n## Resources\n\n- WorldChain Documentation: https://docs.world.org\n- World ID Overview: https://worldcoin.org/world-id\n- WorldChain Explorer: https://worldchain-mainnet.explorer.alchemy.com\n- Brand Assets & Guidelines: Available on request via the submission form\n\n---\n\n## Questions?\n\nDrop your questions in the submission comments or reach out on X @worldchain. The team monitors submissions daily and will respond within 48 hours.',
  1750,
  '[{"place": 1, "label": "1st Place", "amount": 1000, "token": "USDC"}, {"place": 2, "label": "2nd Place", "amount": 500, "token": "USDC"}, {"place": 3, "label": "3rd Place", "amount": 250, "token": "USDC"}]',
  'open',
  'video',
  '0x0000000000000000000000000000000000000000',
  now() + interval '30 days'
)
on conflict (id) do nothing;
