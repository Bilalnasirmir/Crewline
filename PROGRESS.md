# Project Progress

Last updated: 8 Oct 2026. Written at the end of a long Claude Code session so that a new session with no memory can continue.

> **Note on completeness:** the earliest part of this conversation (and the sessions before it) was compressed into summaries before this file was written, so the exact wording of early steps is not visible any more. Those parts were rebuilt from the session summary, the git history (only 2 commits exist) and the code itself. Where something could not be confirmed it is marked "Unclear:".

---

## 1. Project Overview

**What it is.** Crewline is an AI-agent CRM. AI agents (sales, marketing, support, tech support, receptionist, finance) do the work of a sales/marketing/front-desk team: they call, text, email and message on WhatsApp/social apps, qualify leads, move them through stages, book appointments, send quotes and hand over to people when needed. The owner watches and steers in plain language through **Max**, the built-in assistant.

**Who it is for.** Small and medium businesses (examples in the sample data: Metro Mobile – telecom, Keystone Realty – real estate, BrightSmile Dental – dental clinic). It must be simple enough for a 15-year-old to run campaigns and friendlier than GoHighLevel.

**Current phase.** Front end only: a fully clickable React app on sample data. No backend, no real APIs, no authentication. The owner has decided this front end is the **final** one; only a backend will be added later, replacing the store actions.

**Owner.** Bilal Nasir (non-technical, cost-sensitive). GitHub: `Bilalnasirmir/crewline` (GitHub now reports the canonical name as `Bilalnasirmir/Crewline`; pushes to the lowercase URL still work through a redirect).

**Tech stack (versions from `package.json`).**
- Language: TypeScript `~6.0.2`, React `^19.2.8`, react-dom `^19.2.8`.
- Build: Vite `^8.3.0` with `@vitejs/plugin-react ^6.1.1`.
- Styling: Tailwind CSS `^4.3.3` (via `@tailwindcss/vite`), tokens in `src/index.css` using `@theme inline`; `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.7.0`.
- UI primitives: `radix-ui ^1.6.7` (single package), `lucide-react ^1.48.0` icons, `cmdk ^1.1.1` (command palette), `sonner ^2.0.8` (toasts).
- State: `zustand ^5.0.15`.
- Routing: `react-router-dom ^7.18.4` (hash router, data router with route-level `lazy`).
- Charts: `recharts ^3.10.1`.
- Drag and drop: `@dnd-kit/core ^6.3.1` (Stages board).
- Font: `@fontsource-variable/inter ^5.3.0` (self-hosted Inter Variable).
- Lint: `oxlint ^1.81.0` (config `.oxlintrc.json`).
- Installed but **not used** in `src/`: `@tanstack/react-table`, `date-fns`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Database: none (sample data in `src/data/seed.ts`, state in memory; a few preferences in `localStorage`).

**Commands.**
```bash
npm install                 # install dependencies
npm run dev                 # dev server at http://localhost:5173 (also "crewline-dev" in .claude/launch.json)
npm run build               # tsc -b && vite build → dist/ (must stay clean)
npm run preview             # serve dist/ at http://localhost:4173
npm run lint                # oxlint
npx tsc -p tsconfig.app.json --noEmit   # fast type-check used constantly during development
```
There are no automated tests. Verification was done by type-checking, building, and driving the app with Playwright screenshots (see §12).

---

## 2. Full Project History (from the beginning)

### Before this conversation (earlier sessions; rebuilt from git commit `977dc2e` and the docs)
1. The project was created as a Vite + React + TypeScript + Tailwind v4 + Radix app, replacing an older plain-JS prototype (kept in `docs/legacy/prototype-v2/` for reference).
2. Design tokens, the shared component library (`src/components/ui/*`), the app shell (top bar, sidebar with sub-navigation, theme menu, command palette), **Home**, **Max** (page, side panel, keyword engine), **Contacts** and the **Campaigns** tiles page were built. Other screens were placeholder "stub" pages (`src/features/stub.tsx`).
3. The owner switched the visual direction to the **Shopify admin / Polaris** look ("Round 5"). Tokens and components were restyled to verified Polaris values; the owner approved the shell and Home.
4. Docs were written: `PROJECT_BRIEF.md` (full handover), `CLAUDE.md`, `README.md`, `docs/POLARIS_MASTER_PROMPT.md` (owner's binding UI instruction), `docs/DESIGN_SYSTEM.md`, `docs/UPDATE_BRIEF.md`, `docs/ORIGINAL_DESCRIPTION.md`, 12 reference screenshots.
5. Commit `977dc2e` (28 Sep 2026, "Docs: Polaris master prompt and handover update for cloud sessions") contains all of that as the first commit on `main`.
6. A Vercel deploy via the v0 connector failed (`403 Cannot create tokens for this app`); a private claude.ai artifact preview was published instead.

### This conversation
The session started with "[Continuing from a previous session]". The owner then switched the model (`/model`) and said **"GO ahead and make a full software frontend now"**. Work was tracked as 10 tasks.

**Task 1 – Shared foundations** (summarized part; reconstructed from code):
- `src/data/types.ts`: added `Campaign.dir/budget/skipped`, `CampaignSetup`, `Stage.camps`, the `quote` convo item, `Service.extra`, `BookingSettings`, extra `Assigned` fields (`summary`, `tr`, `suggest`, `newPhone`, `outcome`), `Report.q`, `Products.pct`.
- `src/data/seed.ts`: more sample data (assigned items a3–a9, booking settings per campaign, campaign budgets, `setupFor()`).
- `src/store/index.ts`: new state `bookingSet`, `setups`, `prefs` (localStorage `prefs`), `recent`; actions `sendMessage`, `startConvo`, `setPref`, `addCampaign`, `saveSetup`, `setupOf`, `addAgent`, `upsertStage`, `removeStage`, `moveStage`, `copyStages`, `addReport`.
- New `src/components/app/ask.tsx` (`askText`, `askConfirm`, `AskHost`) to replace `window.prompt/confirm`.
- New `src/components/app/index-table.tsx` (Polaris index-table pieces).
- `PageTabs` in `page.tsx`, `ToggleChip` in `bits.tsx`, `CheckMark` in `controls.tsx`, `DialogContent` accepts a ReactNode title.
- `src/main.tsx`: every module became a lazy route; `shell.tsx` got full sidebar sub-navigation and `<AskHost/>`.

**Task 2 – Polaris pass on Contacts, Max and Campaigns tiles.** Contacts page rewritten with index-table pieces; new `contacts/views.tsx` (Folders, DNC, Health views); dialogs/profile switched to `askText`. Max fixes. Campaigns page rewritten (tiles + table, `TileMetricsDialog`).

**Task 3 – Get Started** (`features/getstarted/page.tsx`, also exports `InviteDialog`).

**Task 4 – Campaign wizard and detail** (`campaigns/steps.tsx`, `wizard.tsx`, `detail.tsx`). 10-step wizard with journey tracker; detail page with tabs, Ask AI, Analyze, Add leads.

**Task 5 – Stages** (`stages/page.tsx`, `stage-dialog.tsx`, `stage-list.tsx`): board with drag and drop, list, Review for me, follow-up stages, new-stage dialog.

**Task 6 – Inbox** (`inbox/page.tsx`, `chat.tsx`, `email.tsx`, `calls.tsx`, `panel.tsx`, `dialogs.tsx`): chat with WhatsApp-style ticks, email with composer, calls with a simulated AI call and live transcript.

Shared helpers added in this period: `features/shared/media.tsx` (Recording, Transcript), `shared/ai.tsx` (AskSheet, AnalyzeDialog), `shared/kb.tsx` (knowledge-base folders), `bookings/shared.tsx` (booking settings dialog, new-booking dialog, time helpers).

**Task 7 – AI Agents** (detailed part of this conversation):
- `agents/common.tsx`, `builder.tsx`, `page.tsx`, `sections.tsx` were written first (types tabs, tiles, leaderboard, AI builder chat, creating animation, 10 editor sections).
- New `src/data/review.ts`: the agent **review score** is now computed from the agent's setup (16 weighted checks = 100 points) minus 3 points per unresolved "finding from real conversations". Each item has a `fix()` that really changes the agent. `missingForLive()` drives the "Update your agent" gate.
- `store/index.ts`: agents get `score: reviewOf(a).score` at start, in `addAgent` and in `updateAgent`.
- `types.ts`: `Version.snap` (snapshot of settings) and `AgentSnap`.
- New `agents/side.tsx`: `TestPanel` (Text / Voice note / Call test modes with keyword replies and "Fix in …" hints), `ScoreRing`, `ReviewPanel` (score, Fix with AI, Optimize everything).
- New `agents/editor.tsx`: `AgentEditorPage` with local draft, unsaved indicator, left section nav with scroll-spy, versions menu (switch/rename/delete), "Update your agent" gate dialog, Save with a version label, leave-without-saving blocker (`useBlocker`), Edit with AI, Analyze with AI, phone "More" menu.
- Cleanups: removed manual score bumps in `sections.tsx`, `builder.tsx`, `common.tsx`; hand-over pickers moved out of `ChoiceRow` buttons (nested-button warning); receptionist hand-over goes to "Front desk" (seed `baseJob`); floating "Ask Max" pill hidden on Inbox and the agent editor (`max/panel.tsx`, `OWN_COMPOSER`).

**Task 8 – Bookings**: new `bookings/detail.tsx` (status changes that also move the contact's stage, booking dialog with history, double-booking demo), `calendar.tsx` (day per staff, week, month; click empty time to book), `dashboard.tsx` (range filters, KPIs, stacked chart, coming up, requests, index table), `queries.tsx`, `page.tsx` (campaign selector, Ask AI that opens the calendar, setup, export CSV). Date helpers added to `bookings/shared.tsx`. `contacts/profile.tsx` "Book" link now passes the contact id.

**Task 9 – Remaining modules**: `assigned/page.tsx`; `expenses/page.tsx`; `reports/page.tsx` + `reports/library.tsx`; `settings/ui.tsx`, `general.tsx`, `channels.tsx`, `defaults.tsx`, `page.tsx` (26 sections); `pricing/page.tsx`. Store got `resolveAssigned(id, outcome)` and `reopenAssigned(id)`. `Kpi` got a `good` prop. `CustomizeDialog` (home) and `CloneVoice` (agents) were exported for reuse in Settings. `src/features/stub.tsx` was deleted.

**Task 10 – Verification and fixes**: type-check and build clean; all 26 routes opened in Chromium with no console errors; phone width (375 px) and Dark / Dark blue / Mixed themes checked. Fixes made here are listed in §8. Max's "Save to Reports" now really adds a report; Assigned to me and Plans & pricing added to the command palette; `PROJECT_BRIEF.md` §3/§5/§6 and `CLAUDE.md` "Where things stand" were updated.

**Preview and saving.**
- Built `dist/` and republished the private artifact preview (version 6): https://claude.ai/artifact/QvBoe5zLTRvrZBd68X26rr (multi-file publish of `dist/assets/*` with a small HTML page).
- A stop hook asked to commit and push. Because the owner's rule says "push to `main` only after approval", the work was committed on a **new branch `full-frontend`** (commit `58730ef`, "Build the full front end on Polaris", authored as Bilal Nasir) and pushed to GitHub. `main` was left unchanged.
- The container restarted twice; the branch link was re-established with `git push -u origin full-frontend` (nothing was lost).

**Owner's latest instructions (end of conversation).**
1. "I like it", but changes will be made **module by module**.
2. Fonts, text sizes, colours and the overall design system must stay the same in every design; only layouts change, to make modules more beautiful.
3. For each module: Claude makes the changes and shows them (preview), the owner approves, then Claude saves to the code/GitHub, then the next module.
4. The owner has not yet named the first module, and has not answered whether to merge `full-frontend` into `main` first.
5. Finally the owner asked for this `PROGRESS.md`.

---

## 3. Complete Folder and File Structure

```
crewline/
├── .claude/launch.json          Dev-server launch config "crewline-dev" (npm run dev on port 5173)
├── .gitignore                   Ignores node_modules, dist, .vercel, *.log
├── .oxlintrc.json               oxlint rules (react hooks, only-export-components)
├── CLAUDE.md                    Short must-read instructions for Claude Code (rules, design values, git)
├── PROJECT_BRIEF.md             Full handover: decisions, every screen's spec (§3), design values (§4), status (§5), next steps (§6)
├── PROGRESS.md                  This file
├── README.md                    Overview and run commands (folder list is outdated: still mentions stub.tsx)
├── index.html                   Vite HTML entry (title Crewline, inline SVG favicon, #root)
├── package.json / package-lock.json
├── public/favicon.svg
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json   TypeScript configs (strict, noUnusedLocals/Parameters)
├── vite.config.ts               base './', React + Tailwind plugins, alias @ → src
├── docs/
│   ├── POLARIS_MASTER_PROMPT.md Owner's binding UI instruction (Shopify admin / Polaris)
│   ├── DESIGN_SYSTEM.md         Older design spec (mood/principles; pixel sizes superseded)
│   ├── UPDATE_BRIEF.md          Owner's feature brief, verbatim (most detailed requirements)
│   ├── ORIGINAL_DESCRIPTION.md  Original product description
│   ├── reference-screenshots/   12 Shopify admin screenshots at 125% scaling
│   └── legacy/prototype-v2/     Old plain-JS prototype (reference only)
└── src/
    ├── main.tsx                 ENTRY: hash router; AppShell layout; Home and Max eager, all other modules lazy
    ├── index.css                Design tokens (4 themes), Tailwind @theme, base styles, keyframes
    ├── lib/utils.ts             cn (tailwind-merge), nf, money, pct, initials, uid, clamp, plural
    ├── data/
    │   ├── types.ts             All TypeScript data types
    │   ├── seed.ts              All sample data and date helpers (TODAY = 27 Sep 2026)
    │   └── review.ts            Agent review score, checks, AI fixes, live-gate
    ├── store/index.ts           Zustand store: all state + actions + live simulation (liveTick)
    ├── components/
    │   ├── ui/                  Polaris-styled primitives (button, input, select, dialog/sheet, card/banner, table, tabs/segmented, controls, badge, avatar, combobox, command, dropdown-menu, popover, tooltip)
    │   └── app/                 shell (top bar, sidebar, theme), page (header/tabs/body), index-table, bits (chips, Kpi, ToggleChip, BarRow), icons, ask dialogs, command palette
    └── features/                One folder per module (see below)
        ├── home/page.tsx        Home dashboard + CustomizeDialog
        ├── max/                 Max assistant: engine.ts (keyword engine), store.ts (threads), chat.tsx, page.tsx, panel.tsx
        ├── getstarted/page.tsx  Onboarding steps + InviteDialog
        ├── inbox/               page, chat, email, calls, panel (contact side panel), dialogs (quote, sale, new message)
        ├── contacts/            page, views (folders/DNC/health), profile, dialogs, filters (natural-language filters)
        ├── campaigns/           page (tiles/table), wizard + steps (10-step wizard), detail
        ├── stages/              page (board/list/review/follow-up), stage-dialog, stage-list
        ├── bookings/            page, dashboard, calendar, queries, detail, shared
        ├── agents/              page (types/tiles/leaderboard), editor, sections, side (test/review), builder, common
        ├── assigned/page.tsx    Assigned to me
        ├── expenses/page.tsx    Expenses
        ├── reports/             page (dashboards), library (folders, viewer, generate)
        ├── settings/            page (nav + routing), ui (helpers), general, channels, defaults
        ├── pricing/page.tsx     Plans and pricing
        └── shared/              ai (AskSheet, AnalyzeDialog), followups, kb, led (LineList, OptionRow), media
```

**How the parts connect.** `main.tsx` mounts `RouterProvider` with a hash router. `AppShell` (`components/app/shell.tsx`) renders the top bar, sidebar (`NAV`), theme class on `<html>`, the 8-second `liveTick` interval, `MaxPanel`, the command palette and `<AskHost/>`, and an `<Outlet/>` for pages. Each page reads and writes data only through `useStore` (`src/store/index.ts`), which is initialised from `src/data/seed.ts`. Routes: `/home`, `/max`, `/get-started`, `/inbox`, `/contacts`, `/contacts/:id`, `/campaigns`, `/campaigns/new`, `/campaigns/:id`, `/stages`, `/bookings`, `/agents`, `/agents/:id`, `/expenses`, `/reports`, `/settings` (→ `/settings/business`), `/settings/:section`, `/pricing`, `/assigned`.

---

## 4. All Files Created or Modified

Files created or changed in this conversation (all included in commit `58730ef`):

**Data and state**
- `src/data/types.ts` (modified): added the types listed in §2 Task 1, plus `Version.snap` and `AgentSnap`.
- `src/data/seed.ts` (modified): extra sample data, `setupFor(c)`, booking settings, budgets; `baseJob()` sets `handTo` per agent type; suggestion `o2` text no longer quotes a fixed score.
- `src/data/review.ts` (new): `reviewOf(a)` → `{ score, level, items }`; `applyFixes(a, items)`; `missingForLive(a)` (goal, products, qual); `structuredInstr(a)`; `andList(xs)`; private `checks()` and `FINDINGS`.
- `src/store/index.ts` (modified): new state and actions (§2), `resolveAssigned(id, outcome?)`, `reopenAssigned(id)`, computed agent scores.

**Shared components**
- `src/components/app/ask.tsx` (new): `askText`, `askConfirm`, `AskHost` (promise-based dialogs).
- `src/components/app/index-table.tsx` (new): `IndexTabs`, `SearchRow`, `PillRow`, `FilterPill`, `CheckList`, `BulkBar`, `Pager`.
- `src/components/app/page.tsx`: `PageTabs`. `bits.tsx`: `ToggleChip`, `Kpi` gained `good`. `shell.tsx`: full `NAV`, `AskHost`. `command-palette.tsx`: Assigned and Pricing pages.
- `src/components/ui/controls.tsx`: `CheckMark`. `dialog.tsx`: ReactNode title.
- `src/index.css`: keyframes `ring-out`, `float-y`, `orbit`; dark/navy `--shadow-card` and `--shadow-btn-primary` changed from `none` to `0 0 #0000`.
- `src/main.tsx`: lazy routes via `page(load, name)` helper.

**Feature modules** (main exports):
- `features/getstarted/page.tsx`: `GetStartedPage`, `InviteDialog`.
- `features/contacts/*`: `ContactsPage`, `FoldersView`, `DncView`, `HealthView`, `ContactProfile`, dialogs (`AddContactDialog`, `ImportDialog`, `SaveFolderDialog`, `PhoneMenu`, `MissingDialog`, `DuplicatesDialog`, `EnrichDialog`, `ContactSettingsDialog`).
- `features/campaigns/*`: `CampaignsPage`, `TileMetricsDialog`, `metricOf`, `NewCampaignPage`, `CampaignWizard`, step components (`TypeStep` … `ReviewStep`), `CampaignDetailPage`.
- `features/stages/*`: `StagesPage`, `StageDialog`, `StageList`, `STAGE_ICONS`, `STAGE_COLORS`, `PIPES`, `aiCriteria`.
- `features/inbox/*`: `InboxPage`, `ChatView`, `Ticks`, `EmailView`, `Composer`, `CallsView`, `ContactPanel`, `QuoteDialog`, `RecordSaleDialog`, `NewMessageDialog`.
- `features/agents/common.tsx`: `TYPE_ICON`, `ACTIONS`, `RULES`, `PURPOSES`, `GOALS`, `TRIGGERS`, `makeAgent`, `CreatingAgent`, `NewAgentDialog`.
- `features/agents/builder.tsx`: `AgentBuilder`, `summaryOf`.
- `features/agents/page.tsx`: `AgentsPage` (TypeView, AgentTile, DetailsSheet, Leaderboard inside).
- `features/agents/sections.tsx`: `SECTIONS`, `ProfileSec`, `CloneVoice`, `StyleSec`, `InstructionsSec`, `JobSec`, `QaSec`, `KnowledgeSec`, `ActionsSec` (+ HttpDialog), `RulesSec`, `FollowSec`, `BookingSec`.
- `features/agents/side.tsx`: `TestPanel`, `ScoreRing`, `ReviewPanel` (private `replyFor`, `VoiceNote`, `TestInput`).
- `features/agents/editor.tsx`: `AgentEditorPage` (private `Editor`, `SidePanel`, `snapOf`, `settingsKey`).
- `features/bookings/shared.tsx`: `BookingSettingsDialog`, `NewBookingDialog`, `freeSlots`, `STATUS`, `StatusBadge`, `BOOKING_CAMPS`, `fmtMin`, `NOW_MIN`, `addDays`, `addMonths`, `daysBetween`, `dayKey`, `weekStart`, `WEEKDAYS`.
- `features/bookings/detail.tsx`: `setBookingStatus`, `BookingDialog`, `DoubleBookingSim`, `BookedBy`, `byLabel`.
- `features/bookings/calendar.tsx`: `Calendar` (private `TimeGrid`, `MonthGrid`, `lanes`, `Block`).
- `features/bookings/dashboard.tsx`: `Dashboard`, `BookingMenu`. `queries.tsx`: `Queries`, `QueryIcon`. `page.tsx`: `BookingsPage`.
- `features/assigned/page.tsx`: `AssignedPage` (private `Item`, `KIND`, `keyPhrase`).
- `features/expenses/page.tsx`: `ExpensesPage`.
- `features/reports/page.tsx`: `ReportsPage` (private `Dashboards`); `library.tsx`: `Library`, `ReportViewer`, `GenerateDialog`, `kindOf`, `dateTxt`.
- `features/settings/ui.tsx`: `usePref`, `SecHead`, `SetCard`, `SwitchRow`, `SelectRow`, `HoursEditor`, `defaultHours`, `t12`.
- `features/settings/general.tsx`: `GetStartedSec`, `BusinessSec`, `AppearanceSec`, `TeamSec`, `NotificationsSec`, `BillingSec`, `PlansSec`, `HomeSec`, `InboxSec`, `Unknown`.
- `features/settings/channels.tsx`: `ChannelsSec`, `AppsSec`, `VoicesSec`, `SourcesSec`, `FieldsSec`, `HygieneSec`, `DncSec`, `DataSec`.
- `features/settings/defaults.tsx`: `CampDefSec`, `StageDefSec`, `ProductsSec`, `BookDefSec`, `AgentDefSec`, `MaxSec`, `RepDefSec`, `ComplianceSec`, `IntegrationsSec`.
- `features/settings/page.tsx`: `SettingsPage` (`GROUPS` list of 26 sections with search keywords).
- `features/pricing/page.tsx`: `PricingPage`.
- `features/shared/ai.tsx`: `AskSheet` (fixed: computes the answer before calling `onAnswer`), `AnalyzeDialog`, type `Analysis`.
- `features/shared/media.tsx`, `kb.tsx` (new); `followups.tsx`, `led.tsx` (`OptionRow` now wraps on narrow screens).
- `features/max/chat.tsx`, `page.tsx`, `panel.tsx`; `features/home/page.tsx` (exported `CustomizeDialog`).

**Docs**: `CLAUDE.md` ("Where things stand"), `PROJECT_BRIEF.md` (§3 statuses, §5, §6), `PROGRESS.md` (this file).

**Deleted**: `src/features/stub.tsx`.

**Outside the repo** (scratchpad, lost on container restart): Playwright scripts `shot.mjs`, `flow.mjs`, `probe.mjs`, `overflow.mjs`, `sheet.mjs`, and the preview page `crewline.html`.

---

## 5. Features Completed

Every module is built and runs on sample data. Every button does something (toast, dialog or state change).

- **App shell** (`components/app/shell.tsx`): top bar (search → command palette, Live toggle, Assigned to me count, notifications, Max, account), sidebar with sub-navigation, 4 themes, live simulation every 8 s (`store.liveTick`), floating "Ask Max" pill.
- **Home** (`features/home/page.tsx`): Max hero, Needs your attention, filters, customizable KPIs and panels.
- **Max** (`features/max/*`): full page and side panel, keyword engine with guided flows, saves reports.
- **Get Started**: 8 onboarding steps with progress, invite teammates.
- **Inbox**: chat (ticks sent/delivered/read, take over/hand back, in-chat stage pop-ups), email (folders, composer, reply/forward), calls (dial pad, simulated AI call with live transcript), quotation and record-sale dialogs.
- **Contacts**: index table with tabs/search/filter pills, natural-language filters (`filters.ts`), folders, Do-Not-Contact, database health, profile with journey.
- **Campaigns**: tiles/table, 10-step wizard with journey tracker (type, people, channels, stages, agents, follow-ups, details, products, schedule, review), detail page with tabs.
- **Stages**: board with drag and drop, list, Review for me, follow-up stages, new/edit stage dialog, copy in↔out.
- **AI Agents**: 6 type tabs with tiles and type defaults, leaderboard, new-agent dialog with "Creating agent…" animation, guided AI builder, editor (10 sections, test panel, review panel with live score, versions, gate, leave blocker).
- **Bookings**: campaign selector, dashboard, day/week/month calendar with click-to-book and status colours, booking dialog with status actions (moves contact stage too), queries table, setup dialog, double-booking demo, Ask AI that opens the calendar, CSV export.
- **Assigned to me**: open/resolved tabs, kind filters, kind-specific actions (take over, assign to Rhea, set stage, credit/call back, update number), "Give to" teammate, reopen, "What the AI learned".
- **Expenses**: total spend hero with per-reply/per-booking/sales-per-$1/budget, donut by type, spend-per-day area chart, ways to save (saved in prefs), breakdown table with detail sheet, by-campaign budgets (editable), Ask AI saved to Reports, CSV download.
- **Reports**: dashboards with filters (period, in/out, business, campaign), funnel, inbound vs outbound, campaigns compared, top agents, bookings and expenses summaries, Analyze with AI, Save as report; library with folder tree, subfolder tiles, search, move/rename/copy/delete, report viewer, Generate with AI.
- **Settings**: 26 sections at `/settings/<section>` with grouped searchable nav (getstarted, business, team, notifications, appearance, channels, apps, voices, sources, fields, hygiene, dncset, data, campdef, stagedef, products, bookdef, agentdef, home, inbox, max, repdef, billing, plans, compliance, integrations).
- **Pricing**: four placeholder plans with monthly/yearly toggle and FAQ.

---

## 6. Key Decisions and Why

- **Polaris / Shopify admin look** is binding (owner, Round 5). `@shopify/polaris` must **not** be installed (licence only covers Shopify apps); the look is rebuilt with our own components and tokens.
- **Never declare or claim "ShopifyInter"**; use self-hosted Inter Variable.
- **No AI purple**: AI actions are neutral buttons marked with the Lucide `Sparkles` icon.
- **Data access only through store actions** (`src/store/index.ts`) so a backend can replace them later.
- **Lazy route per module** (`main.tsx`) to keep the first load smaller; Home and Max stay eager.
- **Promise-based `askText`/`askConfirm`** instead of `window.prompt/confirm` (owner forbids browser pop-ups; they also don't work in the artifact preview).
- **Agent review score is computed** (`data/review.ts`) rather than stored, so tiles, leaderboard and editor always agree, and "Fix with AI" changes real settings. Rejected: a stored score with manual +4/+5 bumps (inconsistent).
- **Agent editor works on a local draft**; saving creates a new version with a snapshot (`Version.snap`) so switching back restores settings. Campaign assignment applies immediately (not versioned).
- **Booking status changes also move the contact's stage** when the campaign has a matching stage ("database updates everywhere").
- **Sample "now"** is fixed at 27 Sep 2026, 12:00 PM (`seed.TODAY`, `bookings/shared.NOW_MIN = 180`) so the sample data always looks current.
- **Saving to GitHub**: the owner's rule is to push to `main` only after approval, so work was committed to branch `full-frontend` instead of `main`.
- **Preview**: published as a private claude.ai artifact (multi-file `dist/`) because Vercel via the v0 connector failed with a 403.
- **Hidden "Ask Max" pill** on screens with their own composer (Inbox, agent editor); Max remains reachable from the top bar and ⌘J.
- Rejected: a Test panel using the Max `Composer` (its mic/live buttons send Max-specific text) → a small `TestInput` was written instead.

---

## 7. Current Work (In Progress)

- **No code is half-finished.** The working tree was clean at commit `58730ef` before this file was added.
- The project is waiting for the owner to start the **module-by-module layout redesign**: the owner will name a module and provide designs/notes; Claude changes only layouts (never fonts, sizes or colours), refreshes the preview, waits for approval, then commits and pushes that module.
- **Open question for the owner:** which module to start with. (The owner already merged `full-frontend` into `main` via pull request #1.)
- **Promised but not done yet:** add the owner's new rule ("fonts, sizes, colours and the design system never change; only layouts change, module by module, with approval before saving") to `CLAUDE.md`, saved together with the first approved module.

---

## 8. Known Bugs and Issues

**Open**
- Home and Reports filters scale sample numbers with a multiplier; data is not truly filtered.
- Max engine and the agent Test panel are keyword-based simulations.
- Main JS chunk is about 705 kB (211 kB gzipped); Vite warns above 500 kB.
- `README.md` folder list is outdated (mentions `stub.tsx`, only lists early modules).
- Unused dependencies: `@tanstack/react-table`, `date-fns`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- `vite.config.ts` uses `__dirname` (harmless warning).
- Pricing plans are placeholders; "Delete all contacts" is disabled on sample data; payments, PDFs, real calls and emails are "(demo)" toasts.
- `money(n, cur)` simply prefixes the currency text (e.g. "Rs50", "AED50").
- Bookings sample data only exists for campaigns k3, k1, k2 (k4 has one booking).
- The artifact's comment/republish watch could not be registered (`mint_failed`); the session is not notified of comments on the preview.
- Unclear: whether the owner has merged anything on GitHub since 8 Oct; check `git fetch` first.

**Fixed (in case they come back)**
- Nested `<button>` warnings: use `CheckMark` (visual-only) inside clickable tiles; agent hand-over `Select`s moved outside `ChoiceRow`.
- Vite 500 errors on lazy routes when a module file was missing → every route file must exist and export the named component.
- `AskSheet` called `answer()` inside a state updater, so `onAnswer` ran before the answer existed → answer is computed first (`shared/ai.tsx`).
- "Cannot update a component while rendering" in `DoubleBookingSim` → store writes moved out of `setStep` updater.
- Tailwind `shadow-[var(--a),var(--b)]` produced no shadow (parsed as a colour) → use `shadow-bevel` or prefix `shadow-[0_0_#0000,var(--a),var(--b)]`.
- Dark/navy themes set `--shadow-card: none`, which made every combined shadow/ring invalid → now `0 0 #0000`.
- Phone overflow on Expenses hero → `grid-cols-1`; `OptionRow` labels squeezed → it wraps; agent editor Save off-screen on phones → Edit/Analyze moved into a "More" menu below `md`.
- Review fixes reused the original agent and overwrote each other → every `fix(x)` uses its argument.
- Product "from" price always $0 → computed from positive prices only.
- Inbox `dial`/`to`/`compose` URL params only worked on mount → reactive effects.
- Reply-all included own mailbox in Cc → filtered.
- Wrong starter-agent names on non-sales type tiles → uses that type's agents.

---

## 9. Next Steps

1. Ask the owner which module to redesign first and whether to merge `full-frontend` into `main` now.
2. For that module: implement the layout changes only (keep tokens, type scale, colours, components), run `npx tsc -p tsconfig.app.json --noEmit` and `npm run build`, screenshot it, rebuild `dist/` and republish the preview to the same artifact URL.
3. After the owner approves: add the "layouts only" rule to `CLAUDE.md` (first time), commit as the owner, push (to `main` if approved, otherwise `full-frontend`), then move to the next module.
4. Repeat for every module.
5. Later: update `README.md`, remove unused dependencies, consider splitting the main chunk, run a consistency audit.
6. Backend phase (out of scope now): replace store actions with API calls.

---

## 10. Rules and Preferences

**Owner's rules (always / never)**
- Fonts, text sizes, colours and the overall design system stay exactly the same; only layouts change, module by module. Show changes, wait for approval, then save to GitHub, then the next module.
- Follow the Shopify admin / Polaris look (`docs/POLARIS_MASTER_PROMPT.md`, `PROJECT_BRIEF.md` §4). Original branding only.
- Never install `@shopify/polaris`. Never declare or claim "ShopifyInter".
- Never use `window.prompt`, `alert` or `confirm`; use Dialogs/Sheets (`askText`, `askConfirm`).
- Every button, menu, tab and setting must do something (toast, dialog or state change).
- No AI purple; AI actions are neutral with the `Sparkles` icon.
- No full rebuilds; targeted changes, one screen at a time.
- Push to `main` only after the owner approves. Commit as the owner: `git -c user.name="Bilal Nasir" -c user.email="bilalnasirmir@gmail.com" commit`.
- Sample data only in `src/data/seed.ts`; state only in `src/store/index.ts`.
- Simple enough for a 15-year-old; explanations to the owner short and plain, non-technical.

**Design values (from CLAUDE.md)**: text #303030, secondary #616161, bg #F1F1F1, border #E3E3E3, link/focus #005BD3, primary button #303030; type h1 18/24 650, big numbers 20/24, h2 14/20, h3 13/20 650, body 13/20 450, buttons/badges/tabs 12/16 550; weights 450/550/650/700; radius 8 controls, 12 cards/menus, 16 modals; buttons 28 px (32 on phones), inputs 32, table header 36, rows 33, top bar 56, sidebar 240.

**Code style and patterns**
- Use component variants, don't restyle per page: `Button` (`primary | secondary | ghost | header | destructive | link`), `Select variant="button"` for toolbar filters, `Card`/`CardHeader`/`CardBody`/`Banner`, `PageHeader`/`PageTabs`/`PageBody`.
- Header actions: secondary ones use `variant="header"`, one primary at the end.
- Tables follow the Polaris index-table pattern: `IndexTabs` → `SearchRow` → `PillRow`/`FilterPill` → `Table` → `Pager`.
- Compact one-line JSX is the existing style; match the surrounding code's density and naming.
- Path alias `@/` for `src/`. `cn()` merges classes.
- TypeScript strict with `noUnusedLocals/Parameters`: do not import unused names, and never add dummy `export { X }` lines to silence errors (this habit was found and removed).
- Per-viewer settings in Settings use `usePref(key, default)` (stored in `prefs` in localStorage).

**Owner's environment (as stated by the owner)**: Windows, PowerShell, Claude Code desktop app (Local sessions), with Caveman, RTK and Graphify installed. Note: this particular session actually ran in a Claude Code cloud container (Linux), so command examples above use bash; adapt for PowerShell locally.

---

## 11. Configuration and Setup

- **Dependencies and why**: React/react-dom (UI), react-router-dom (hash routes), zustand (store), radix-ui (accessible primitives), tailwindcss + @tailwindcss/vite + tailwind-merge + clsx + class-variance-authority (styling and variants), lucide-react (icons), recharts (charts), cmdk (command palette), sonner (toasts), @dnd-kit/core (Stages drag and drop), @fontsource-variable/inter (font), oxlint (lint), TypeScript + @types/* (types), Vite + @vitejs/plugin-react (build/dev).
- **Environment variables**: none are needed.
- **External services**: none at runtime. GitHub repo `Bilalnasirmir/crewline` (branches `main`, `full-frontend`). Private preview: https://claude.ai/artifact/QvBoe5zLTRvrZBd68X26rr. Vercel deploy through the v0 connector was attempted earlier and failed (403); the owner can connect the repo to Vercel directly.
- **localStorage keys used**: `theme`, `sidebar`, `homePanels`, `homeKpis`, `prefs`.

---

## 12. Important Context and Gotchas

- **Branches**: the owner merged the full front end into `main` on GitHub through pull request #1 (merge commit `3ed6735`). `full-frontend` additionally holds the `PROGRESS.md` commit. This clone was made as a single-branch clone, so `git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'` was set to see all branches.
- **Sample date**: `seed.TODAY` is 27 Sep 2026, 12:00. Many screens ("today", calendar now-line at 12 PM, bookings) depend on it.
- **Lazy routes**: `main.tsx` uses `page(() => import(...), 'ExportName')`; the named export must exist or the route crashes.
- **Agent score**: never set `score` by hand; the store recomputes it with `reviewOf` on `addAgent`/`updateAgent`. Changing `checks()` or `FINDINGS` in `data/review.ts` changes every agent's score.
- **Agent editor dirty check** ignores `score`, `versions`, `ver`, `camps`, `edited`; manage versions through the store, not the draft.
- **`useBlocker`** is used once (agent editor); React Router allows only one active blocker.
- **Tailwind arbitrary shadows**: `shadow-[var(...)]` alone is treated as a colour; see §8. Theme tokens must never be `none` if they are combined in shadow lists.
- **Grid overflow on phones**: grids without explicit columns can grow wider than the screen; use `grid-cols-1` as the base.
- **Two buttons share `aria-label="Open Max"`** (top bar and floating pill); select the pill with `button.fixed[...]` in tests.
- **Verification method used**: Playwright from a scratch folder with `executablePath: '/opt/pw-browsers/chromium'`, viewport 1532×720 at device scale 1.25 (matches the reference screenshots), also 375×760 for phones and `localStorage.theme` for themes. Scripts were in the session scratchpad and are gone; recreate if needed.
- **Publishing the preview**: run `npm run build`, write a small HTML page (title, stylesheet link, `<div id="root">`, module script pointing to `assets/index-*.js`, without `<html>/<head>/<body>`), and publish it to the existing artifact URL with every `dist/assets/*` file in `files` (set old index files to `null`). Read the artifact first in a new session before republishing.
- **Stop hook** in this environment insists on pushing commits; push the feature branch, not `main`, unless the owner approved.
- **Remote rename**: GitHub says the repo moved to `Bilalnasirmir/Crewline`; pushes still work. Optionally run `git remote set-url origin https://github.com/Bilalnasirmir/Crewline.git`.
- **Pronouns**: the owner's pronouns were never stated; write neutrally.
