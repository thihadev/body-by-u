# Membership "Coming Soon" toggle + Trainers→About Us nav swap

Date: 2026-10-27

## Why

Membership is launching later. For now the app shows free programs only, and
membership is temporarily closed. The on/off state is controlled from `.env`
without code changes. The Trainers nav link is replaced with About Us.

## Goals

- `NEXT_PUBLIC_MEMBERSHIP_ENABLED=false` → membership hidden everywhere; anyone
  who lands on `/membership` (from old links, dashboard, program detail) sees a
  "Coming soon" screen.
- Nav (desktop + mobile) drops Trainers, gains About Us.

## Non-goals / anti-goals

- No hiding of premium program cards/badges (backend data side already being
  limited to free programs by the client).
- No changes to payment/checkout logic — just gated behind the flag.

## Approaches considered

1. **Choke point (chosen)** — one flag, nav links filtered, `/membership`
   renders "Coming soon"; all other CTAs (dashboard Upgrade, "Unlock with
   membership") still work and land on the coming-soon screen. Least code,
   nothing can dangle.
2. Full CTA polish — also rewording every membership CTA. Deferred: unnecessary
   while the choke point already gives a clean landing.
3. Central feature-flag system — overkill for one flag.

## Decisions

- Flag: `NEXT_PUBLIC_MEMBERSHIP_ENABLED`; missing/"true" = enabled (safe
  default), `false` = coming soon. Read once in a new `src/lib/config.ts`.
- `/membership`: when disabled, render a styled "Membership coming soon" screen
  instead of plans/checkout (keep the logged-out gate order: coming soon wins
  over login gate).
- Nav: filter `/membership` link from `links` arrays in `Navbar.tsx` and
  `MobileNav.tsx`; replace `/trainers` with `/about`. `/trainers` route stays
  reachable by URL (not deleted).
- New `/about` page (`src/app/about/page.tsx`): simple static About Us — who
  Body By U is, what's free today, what's coming. Copy drafted by builder in
  the house style (zinc/lime, Tailwind), user can retouch later.
- `.env.example` + `.env.local` gain the flag with a comment.

## Left to builder

- Exact coming-soon and About Us page wording/layout (house style).
- Whether `/about` also appears in Footer (yes — trivially consistent).

## Note

`NEXT_PUBLIC_*` is inlined at build time — changing the flag in production
requires a rebuild/redeploy (e.g. `vercel env` + redeploy), not a runtime
restart.
