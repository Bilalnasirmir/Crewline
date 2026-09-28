# CLAUDE.md: read this first

Crewline is an AI-agent CRM. **This phase is front end only**: a fully clickable React app on sample data, with no backend, no real APIs and no auth. The owner has decided this front end is the **final** one (only a backend will be added later), so write production-quality code and keep data access behind the store actions in `src/store/index.ts`.

## Read before any work
1. `PROJECT_BRIEF.md`: the full handover. It covers what we're building, every decision the owner made (Round 5 is the latest), screen status and next steps.
2. `docs/POLARIS_MASTER_PROMPT.md`: the owner's binding UI instruction. Follow the current Shopify admin / Polaris system; typography first; official Polaris tokens over screenshot guesses; original branding.
3. `PROJECT_BRIEF.md` §4: the **verified** design values (from Polaris tokens, checked pixel by pixel). `docs/DESIGN_SYSTEM.md` still gives the mood and principles, but **its pixel sizes are superseded**.
4. `docs/reference-screenshots/*.png`: 12 Shopify admin screenshots, **captured at 125% display scaling**. Colours are exact; divide any size you measure by 1.25.
5. `docs/UPDATE_BRIEF.md` and `docs/ORIGINAL_DESCRIPTION.md`: the owner's feature briefs, verbatim.

## Where things stand (28 Sep 2026)
- **Every screen is built** on the Polaris system: Home, Max, Get Started, Inbox, Contacts, Campaigns (wizard + detail), Stages, Bookings, AI Agents (editor, test/review panels, builder), Assigned to me, Expenses, Reports, Settings (26 sections) and Pricing. Status and known gaps: `PROJECT_BRIEF.md` §5.
- **Next:** the owner reviews the whole front end; fix what they flag; then commit and push to `main` after approval. The backend comes later and replaces the store actions.

## Design rules in one screen (details in PROJECT_BRIEF.md §4)
- **Font:** Inter ("Inter Variable", self-hosted) + the Polaris system stack. **Never declare or claim "ShopifyInter"**; it is not public. Body uses `font-feature-settings: "calt" 0`.
- **Weights:** 450 / 550 / 650 / 700. Tailwind's `font-normal/medium/semibold/bold` are mapped to these.
- **Type:**
  - page title `h1` 18/24 (650)
  - big numbers `text-2xl` 20/24
  - section `h2` 14/20
  - card title `h3` 13/20 (650)
  - body `text-sm` 13/20 (450)
  - buttons, badges, tabs and table headers `text-xs` 12/16 (550)
- **Colours:** text #303030, secondary #616161, bg #F1F1F1, border #E3E3E3, link and focus #005BD3, primary button #303030. No AI purple; AI actions are neutral with the `Sparkles` icon.
- **Sizes:**
  - top bar 56, sidebar 240, nav items 28
  - buttons 28 (32 on phones), inputs 32
  - table header 36, rows 33, badges 20
- **Radius:** 8 for controls and badges, 12 for cards and menus, 16 for modals. No pill buttons.
- **Use the variants; don't restyle per page:**
  - `Button`: `primary | secondary | ghost | header | destructive | link`
  - `Select variant="button"` for toolbar filters
  - `Card` / `CardHeader` / `CardBody` / `Banner`, `PageHeader` / `PageBody` / `Toolbar`
- **Verify visually:**
  1. Check computed styles first.
  2. Capture at device scale factor 1.25 (1532×720 viewport).
  3. Compare against the screenshots.
  4. Measure identical words (for example "Settings" = 63×15 px in both).

## Working rules (from the owner)
- **No full rebuilds.** Make targeted changes, one screen at a time. Show it, get approval, then commit and push to `main`.
- The owner is non-technical and cost-sensitive. Keep explanations short and plain.
- Every button, menu, tab and setting must do something clickable, even if only a toast, dialog or state change on sample data.
- Never use `window.prompt`, `alert` or `confirm`; use Dialogs or Sheets instead.
- The layout is ours to decide. The look must follow Polaris / the Shopify admin.
- It must be simple enough for a 15-year-old to run campaigns, and friendlier than GoHighLevel.
- Sample data only: `src/data/seed.ts`. State lives in `src/store/index.ts` (Zustand).

## Commands
```bash
npm install
npm run dev      # http://localhost:5173 (also the crewline-dev entry in .claude/launch.json)
npm run build    # tsc -b && vite build (must stay clean)
npm run preview
```

## Stack
- Vite, React 19, TypeScript and Tailwind v4 (`@theme inline` in `src/index.css`).
- Radix UI (`radix-ui`), shadcn-style components in `src/components/ui`, lucide-react icons and Zustand.
- React Router 7 (hash router, `src/main.tsx`), Recharts, cmdk, sonner and Inter (self-hosted via @fontsource).
- Path alias: `@` → `src`. `cn()` (`src/lib/utils.ts`) is tailwind-merge extended with the custom theme names.
- Do not install `@shopify/polaris`: its licence only covers apps that integrate with Shopify.

## Git
Commit as the owner:
`git -c user.name="Bilal Nasir" -c user.email="bilalnasirmir@gmail.com" commit`. Push to `main` only after the owner approves a change.
