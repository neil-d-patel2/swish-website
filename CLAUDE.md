<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Log Every Error

**When an error occurs, document it in `errors-notes.md` before moving on.**

For every error encountered (build failures, runtime errors, CI failures, config issues):
1. Add a new entry to `errors-notes.md` with:
   - The exact error message or output
   - What went wrong and why (root cause, not just symptoms)
   - The fix applied
   - Why the fix worked (the underlying reason, not just "it fixed it")
2. Keep entries in chronological order with a date.
3. If a first fix attempt fails and a second is needed, document both — the failed attempt and the reason it didn't work are as valuable as the solution.

This log is the project's institutional memory for debugging. Future sessions should check `errors-notes.md` before reaching for a generic solution to a familiar-looking error.

Before making ANY change in the codebase, create a short summary of the change, then prompt the user to allow the write.

## Theming / Dark mode

Dark mode is session-only (resets on reload) and covers every page **except the home/hero** (`index.tsx` → `SignInHero`, which is fixed-light via hardcoded Tailwind colors).

- **State:** `src/components/theme-provider.tsx` holds `"light" | "dark"` in React state (no persistence) and toggles the `.dark` class on `<html>`. `ThemeProvider` wraps `<Outlet/>` in `__root.tsx`. Toggle button (sun/moon) lives in `Navbar`, which is what the 6 themeable pages share.
- **App pages** (`admin`, `projects`, kanban components) are shadcn-based and flip automatically via the existing `.dark { --background … }` block in `index.css`. They have no Navbar/toggle — reached after toggling on `dashboard`/`store`.
- **Marketing pages** (`pricing`, `stores`, `store`, `waitlist`, `contact`, `dashboard`) used hardcoded cream/black constants. These now point at a `--mk-*` CSS-variable palette defined in `index.css` (`:root` = light, `.dark` = dark overrides). Key vars: `--mk-bg` (page canvas), `--mk-surface` (cards, was `#ffffff`), `--mk-cream`/`-card`/`-deep`, `--mk-ink` (text), `--mk-muted`/`-faint`, `--mk-hairline`, `--mk-border`, `--mk-accent` + `--mk-on-accent` (inverted blocks: primary buttons, CTA bands — accent goes light/on-accent goes dark in dark mode), `--mk-tint`/`-tint-strong`. Inline semantic status colors (red `#ba1a1a`, green, amber) were intentionally left as literals.

- **Light-mode background rules (do not regress):** the page canvas `--mk-bg` is pure white `#ffffff`. Card/box surfaces (`--mk-surface`, `--mk-cream`/`-card`/`-deep`) are `#f5f5f5` so boxes stand out against the white page. **Page footers must use `background: "var(--mk-bg)"` (white) — not `surface`** — so the bottom of every page matches the page background. `--mk-muted` and `--mk-faint` are pure black `#000000` in light mode for body-text contrast. Keep these invariants when editing marketing pages.

## Deployment

Deploys to **GitHub Pages** via `.github/workflows/deploy.yml` on push to `starter` (build: `npx convex deploy --cmd 'pnpm run build'`, which also pushes Convex). The committed `vercel.json` is **not used** — ignore it. Served at **root** (`vite base: "/"`).

- **SPA deep links:** GitHub Pages has no SPA fallback, so the build copies `dist/index.html` → `dist/404.html` (`cp` appended to the `build` script). Pages serves that 404.html for unknown paths; being a copy of index.html, the app boots and TanStack Router renders the route. **Don't** reintroduce a `public/404.html` "?p=" redirect — it was misconfigured for a project page and broke direct loads of routes like `/approvals`. Keep the `cp dist/index.html dist/404.html` step.

## Auth (two separate systems)

This codebase has **two unrelated auth stacks** — don't confuse them:

- **Supabase Auth (Google OAuth)** is the real end-user sign-in (home hero `SignInHero.tsx` → `supabase.auth.signInWithOAuth({ provider: "google" })`). Store data lives in **Supabase Postgres** (`stores`, `items`) with RLS; migrations in `supabase/migrations/`. The `dashboard`/`store` routes use `useSupabaseAuth()` and the `supabase` client.
- **Convex Auth (GitHub)** is a separate internal stack (`convex/auth.ts`, `sign-in-button.tsx`) used by the shadcn admin/`projects` side. The `/admin` route is a Convex **waitlist** broadcast tool — unrelated to store access.

## Store-access approval gate

New Google users must be **approved by the owner** before they can create/see a store. Flow: sign in → a `pending` request is created + the owner is emailed → owner approves on `/approvals` → user gets access.

- **Enforcement is in Supabase RLS** (`supabase/migrations/006_user_approval.sql`), not just the UI: table `user_approvals(id=auth.users.id, email, status pending|approved|denied, …)`; users can read/insert only their own row (insert forced to `pending`); the owner can read all + update status. The `stores` INSERT policy now requires the owner to be `approved` (or be the admin), so the gate can't be bypassed via the API.
- **Owner/admin email is hardcoded** as `swishappdev@gmail.com` in **three places that must stay in sync**: `006_user_approval.sql` (RLS), `src/hooks/use-approval.ts` (`ADMIN_EMAIL`), and the Resend recipient in `convex/approvalEmail.ts`. The admin is always treated as approved.
- **Frontend:** `useApproval()` (`src/hooks/use-approval.ts`) resolves status and, on first sign-in, creates the pending row + calls the `api.approvalEmail.notify` Convex action (reuses Resend) once. `dashboard.tsx` and `store.tsx` render `<PendingApproval/>` when status ≠ approved. Owner-only page is `src/routes/approvals.tsx` (`/approvals`).
- **Deploy step:** applying migration `006` to Supabase is required for the feature to work (no `supabase/config.toml` is committed — run it via the linked Supabase project / SQL editor). The Convex action deploys with the normal Convex push.
- **Known limitation:** `approvalEmail.notify` is callable from the client and always emails the fixed owner address, so it's low-risk but not abuse-proof; a DB-trigger/webhook send would be more robust later.