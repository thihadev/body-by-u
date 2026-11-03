# Membership Coming Soon + Trainers→About Us Nav Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate membership behind `NEXT_PUBLIC_MEMBERSHIP_ENABLED` so it shows a "Coming soon" screen, and swap the nav's Trainers link for a new About Us page.

**Architecture:** A single build-time flag read in a new `src/lib/config.ts`. The `/membership` page is the choke point — when the flag is off it renders a coming-soon screen instead of the checkout flow, so every inbound link (dashboard, program detail) lands cleanly. Nav links live duplicated in `Navbar.tsx` and `MobileNav.tsx`; both filter the membership entry and swap Trainers for `/about`. `/trainers` route is left in place.

**Tech Stack:** Next.js 16.3.8 App Router, React 19, Tailwind CSS v4, lucide-react icons. No test framework — verify with `npx tsc --noEmit`, `npm run lint`, and dev-server spot checks.

**Spec:** `docs/superpowers/specs/2026-10-27-membership-coming-soon-design.md`

## Global Constraints

- Flag semantics: `NEXT_PUBLIC_MEMBERSHIP_ENABLED` missing or any value other than `"false"` = enabled; exact string `"false"` = coming soon (safe default, follows the codebase's `?? fallback` style).
- House style: dark zinc theme, `rounded-2xl border-white/10 bg-white/[0.03]` surfaces, lime-400 accent, `cn()` from `@/lib/utils`, `SectionTitle`/`Card`/`Button` from `@/components/ui` where they fit.
- Do not delete the `/trainers` route or `/trainers/[slug]` pages.
- No membership copy appears on `/about` when the flag says membership is enabled... i.e., the "membership coming soon" line is rendered only when `!MEMBERSHIP_ENABLED`.

## Review Focus

- Env var unset (`NEXT_PUBLIC_MEMBERSHIP_ENABLED` missing) — app must behave as membership ENABLED, nothing should crash. Verify in Task 1/2 by temporarily unsetting it.
- Direct URL to `/membership` while disabled — must show coming soon even for logged-out users (coming-soon screen wins over the login gate). Spot-check in Task 2.
- A pre-existing active subscriber visiting `/membership` while disabled — sees coming soon with a pointer to Dashboard (accept this; noted in spec). Spot-check in Task 2.
- `/trainers` no longer in any nav/footer but still reachable by URL (no 404 regression). Spot-check in Task 3.
- Nav must not reference `/about` before the page exists — Task order matters: about page (Task 4) precedes nav swap (Task 5).
  Test that pins this: after Task 5, `curl -s localhost:3000/about` returns 200 and the page lists all four main nav labels.

---

### Task 1: Config flag + env wiring

**Files:**
- Create: `src/lib/config.ts`
- Modify: `.env.example` (append)
- Modify: `.env.local` (append)

**Interfaces:**
- Produces: `export const MEMBERSHIP_ENABLED: boolean` (module-level const, read once from `process.env.NEXT_PUBLIC_MEMBERSHIP_ENABLED`)

- [ ] **Step 1: Create `src/lib/config.ts`**

```ts
export const MEMBERSHIP_ENABLED =
  process.env.NEXT_PUBLIC_MEMBERSHIP_ENABLED !== "false";
```

- [ ] **Step 2: Append to `.env.example`**

```
# Set to "false" to temporarily close memberships (shows "Coming soon" instead)
NEXT_PUBLIC_MEMBERSHIP_ENABLED=true
```

- [ ] **Step 3: Append to `.env.local`**

```
# Membership temporarily closed — flip to true when launching
NEXT_PUBLIC_MEMBERSHIP_ENABLED=false
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run lint`
Expected: passes (or same pre-existing warnings as before — no new ones)

- [ ] **Step 5: Commit**

```bash
git add src/lib/config.ts .env.example
git commit -m "feat: add NEXT_PUBLIC_MEMBERSHIP_ENABLED feature flag"
```

(`.env.local` stays untracked.)

### Task 2: `/membership` coming-soon gate

**Files:**
- Modify: `src/app/membership/page.tsx` (inside `MembershipPage`, after hooks are called, before the `if (!hydrated)` block at ~line 103)

**Interfaces:**
- Consumes: `MEMBERSHIP_ENABLED` from `@/lib/config` (Task 1)

- [ ] **Step 1: Add an early return in `MembershipPage`, right before `if (!hydrated)`**

Insert an import of `MEMBERSHIP_ENABLED` from `@/lib/config`, then:

```tsx
if (!MEMBERSHIP_ENABLED) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <Crown className="mx-auto h-10 w-10 text-lime-300" />
      <h1 className="mt-4 text-3xl font-extrabold text-white">
        Membership — coming soon
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
        Premium memberships are opening soon. Meanwhile all our free programs
        are yours to train with today.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => router.push("/programs")} className="bg-lime-400 text-zinc-950 hover:bg-lime-300">
          Browse free programs
        </Button>
      </div>
      {user && (
        <p className="mt-4 text-xs text-zinc-600">
          Have an active membership? View it in your{" "}
          <Link href="/dashboard" className="hover:text-lime-300">dashboard</Link>.
        </p>
      )}
    </div>
  );
}
```

`Button` is already imported; `Link` must be imported from `next/link` (add it if missing). Screenshot: uses existing `Crown` icon import already present in the file.

- [ ] **Step 2: Verify in dev server**

Run: `npm run dev` (background), then check `http://localhost:3000/membership`
Expected: "Membership — coming soon" screen, both logged-out and logged-in (the nav link is hidden later; direct URL works now). Historical note: flag default true (env var removed) — restart dev with the var unset and confirm the normal checkout renders again.

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/membership/page.tsx
git commit -m "feat: membership page shows coming soon when flag disabled"
```

### Task 3: New About Us page

**Files:**
- Create: `src/app/about/page.tsx`

**Interfaces:**
- Consumes: `MEMBERSHIP_ENABLED` from `@/lib/config` (Task 1), `SectionTitle` from `@/components/ui`, `Dumbbell` from `lucide-react`

- [ ] **Step 1: Create the page**

Design: server component with `export const metadata = { title: "About Us — Body By U" }`. Layout: centered hero with the logo mark (`Dumbbell` in a lime rounded square, same markup as Navbar), a headline "Fitness made for Myanmar.", two short paragraphs of copy (home-grown platform; follow guided programs, learn proper form, train gym or home), then a `rounded-2xl border-white/10 bg-white/[0.03]` card row of three value props (Free programs for everyone / Real trainers in every video / Train anywhere — day-by-day plans), then a CTA row: primary `Button` → `/programs` labeled "Browse free programs", and — rendered only when `!MEMBERSHIP_ENABLED` — a one-line muted note "Membership is coming soon 🎉". Copy in English to match the rest of the app (Trainers page is English).

- [ ] **Step 2: Verify**

Run: `npm run dev` still running; check `http://localhost:3000/about`
Expected: page renders in house style, membership line shows (flag is false in dev). Restart dev with `NEXT_PUBLIC_MEMBERSHIP_ENABLED=true` and confirm the line disappears, then set it back to `false` in `.env.local`.

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add About Us page"
```

### Task 4: Nav + Footer swap (Trainers → About Us, hide Membership when disabled)

**Files:**
- Modify: `src/components/layout/Navbar.tsx:21-26` (links array)
- Modify: `src/components/layout/MobileNav.tsx:21-26` (links array)
- Modify: `src/components/layout/Footer.tsx:28` (Trainers link → About Us)

**Interfaces:**
- Consumes: `MEMBERSHIP_ENABLED` from `@/lib/config` (Task 1); `/about` page from Task 3

- [ ] **Step 1: Replace the `links` array in both `Navbar.tsx` and `MobileNav.tsx`**

```ts
const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  ...(MEMBERSHIP_ENABLED
    ? [{ href: "/membership", label: "Membership" }]
    : []),
  { href: "/about", label: "About Us" },
];
```

Add `import { MEMBERSHIP_ENABLED } from "@/lib/config";` to both files. Trainers is removed unconditionally.

- [ ] **Step 2: In `Footer.tsx`, change the Trainers list item to About Us**

Line 28: `<li><Link href="/trainers" ...>Trainers</Link></li>` →
`<li><Link href="/about" className="hover:text-lime-300">About Us</Link></li>`

- [ ] **Step 3: Verify**

Run: dev server; check both desktop nav and mobile menu on `/` — Expected: Home, Programs, About Us (Membership hidden, Trainers gone).

Run: check `http://localhost:3000/trainers` directly — Expected: still renders (no 404).

Restart dev with `NEXT_PUBLIC_MEMBERSHIP_ENABLED=true`: desktop nav shows Home, Programs, Membership, About Us.

Run: `npx tsc --noEmit` — no errors. Run: `npm run lint` — no new warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/MobileNav.tsx src/components/layout/Footer.tsx
git commit -m "feat: swap nav Trainers for About Us, hide Membership when flag disabled"
```

### Task 5: Full build + flag-flip regression pass

**Files:** none new

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: succeeds; `/about` and `/membership` routes listed in output.

- [ ] **Step 2: Flag-on sanity pass**

Set `NEXT_PUBLIC_MEMBERSHIP_ENABLED=true` in `.env.local` (temporarily): dev server — `/membership` renders checkout (logged out → login gate), nav shows Membership. Revert `.env.local` back to `false`.

- [ ] **Step 3: Commit and final check**

Run: `git status` — Expected: only changed tracked files committed; `.env.local` untracked. Restore `.env.local` to `NEXT_PUBLIC_MEMBERSHIP_ENABLED=false` before reporting done.
