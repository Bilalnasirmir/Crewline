# CLAUDE.md: read this first

Crewline is an AI-agent CRM prototype. **This phase is front end only.** It is a clickable React prototype on sample data, with no backend, no real APIs and no auth.

## Read before any work
1. `PROJECT_BRIEF.md`: the full handover. It covers what we're building, every decision the owner made, screen status and next steps.
2. `docs/DESIGN_SYSTEM.md`: the owner's design spec (Shopify admin / Polaris look). This is binding.
3. `docs/reference-screenshots/*.png`: 12 Shopify admin screenshots. Match their fonts, sizes, colours, spacing and radii.
4. `docs/UPDATE_BRIEF.md` and `docs/ORIGINAL_DESCRIPTION.md`: the owner's own feature briefs, verbatim.

## Top priority right now
The owner's last unresolved complaint is that font size, colour and style don't match the Shopify screenshots. Fix typography and consistency before adding features:
- One text scale: 12/13/14/16/20/24.
- Body is 14px/400 #303030; secondary text is #616161.
- Titles are 600 weight.
- Controls use the same heights: buttons 32/36, inputs 40.
- Radii: card 16, control 8, tag 6, menu 12.

Tokens live in `src/index.css`. Change tokens and the shared `src/components/ui/*` first, not individual pages.

## Working rules (from the owner)
- **No full rebuilds.** Make targeted changes, one screen at a time. Show it, get approval, then commit.
- The owner is non-technical and cost-sensitive. Keep explanations short and plain.
- Every button, menu, tab and setting must do something clickable, even if only a toast, dialog or state change on sample data.
- Never use `window.prompt`, `alert` or `confirm`; use Dialogs or Sheets instead.
- Layout is ours to decide. The UI look (fonts, colours, components) must follow the Shopify reference.
- It must be simple enough for a 15-year-old to run campaigns. It must be friendlier than GoHighLevel.
- Sample data only: `src/data/seed.ts`. State lives in `src/store/index.ts` (Zustand).

## Commands
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build (must stay clean)
npm run preview
```

## Stack
- Vite, React 19, TypeScript and Tailwind v4 (`@theme inline` in `src/index.css`).
- Radix UI (`radix-ui`), shadcn-style components in `src/components/ui`, lucide-react icons and Zustand.
- React Router 7 (hash router, `src/main.tsx`), Recharts, cmdk, sonner and Inter (self-hosted via @fontsource).
- Path alias: `@` → `src`.

## Git
Commit as the owner:
`git -c user.name="Bilal Nasir" -c user.email="bilalnasirmir@gmail.com" commit`. Push to `main` only after the owner approves a change.
