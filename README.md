# Crewline

Crewline is an AI-agent CRM. AI agents do the sales, marketing and receptionist work: they call, text and email, book appointments, send quotes, move leads through stages and enrich contacts. The owner watches and steers in plain language through **Max**, the built-in assistant.

This repo is currently a **clickable front-end prototype** on sample data. There is no backend yet.

## Run it
```bash
npm install
npm run dev        # open http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the build at http://localhost:4173
```

## Where things are
```
src/
  index.css              design tokens: verified Polaris values (colours, type scale, radii, shadows, themes)
  main.tsx               routes (hash router)
  components/ui/         buttons, inputs, selects, dialogs, tables, cards…
  components/app/        app shell (top bar, sidebar), page layout, shared bits
  data/                  types.ts + seed.ts (all sample data)
  store/                 Zustand store (contacts, stages, live simulation)
  features/
    max/                 Max assistant (chat engine, page, side panel)
    home/                Home dashboard
    contacts/            Contacts list, folders, DNC, health, profile, dialogs
    campaigns/           Campaigns list
    shared/              reusable editors (follow-ups, line lists)
    stub.tsx             placeholder for screens not built yet
docs/
  POLARIS_MASTER_PROMPT.md  owner's binding UI instruction (Shopify admin / Polaris)
  DESIGN_SYSTEM.md       earlier design spec: mood and principles (sizes superseded)
  UPDATE_BRIEF.md        owner's feature brief (verbatim)
  ORIGINAL_DESCRIPTION.md
  reference-screenshots/ 12 reference screenshots (captured at 125% scaling)
  legacy/prototype-v2/   older plain-JS prototype (reference only)
PROJECT_BRIEF.md         full handover: decisions, screens, status, next steps
CLAUDE.md                short instructions for Claude Code
```

Start with `PROJECT_BRIEF.md`.
