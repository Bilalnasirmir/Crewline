# Crewline: Project Brief and Handover

Handover date: 28 September 2026 (Asia/Karachi). Owner: Bilal Nasir (bilalnasirmir@gmail.com). Repo: https://github.com/Bilalnasirmir/Crewline (branch `main`).

This document is the single source of truth for continuing the project in Claude Code. When it conflicts with anything older, this document wins. The owner's own words are kept verbatim in `docs/`:

| File | What it is | Authority |
| --- | --- | --- |
| `docs/DESIGN_SYSTEM.md` | The owner's master UI design-system prompt (Shopify-style) | **Highest** for anything visual |
| `docs/reference-screenshots/*.png` | 12 Shopify admin screenshots the owner supplied | Visual source of truth, next to DESIGN_SYSTEM.md |
| `docs/UPDATE_BRIEF.md` | The owner's full feature brief (sections 1–15 = features, 17 = open questions) | **Highest** for features and behaviour. Its section 16 (Attio design) is **superseded** by DESIGN_SYSTEM.md |
| `docs/ORIGINAL_DESCRIPTION.md` | The owner's first description of the product | Product intent |
| `docs/legacy/prototype-v2/` | The previous, rejected vanilla-JS prototype | Reference only for feature behaviour and sample data. Never reuse its look, CSS or layout |

> **Note on history.** The chat ran across three context windows. The very first part (the first developer-briefing round and the v1 prototype build) is only available as a summary, not word for word. The owner's two long written briefs from that period are preserved verbatim in `docs/`, so no feature detail is lost. If you remember something from the early days that is not in this document or in `docs/`, it was never written down. Tell Claude Code directly.

---

## 1. What we are building

**Crewline** (placeholder name, may change) is a SaaS CRM in which **AI agents replace a business's entire sales team, marketing team and receptionist/booking team**. Agents call, text (SMS, WhatsApp, Messenger, Instagram, TikTok, web chat) and email customers. They qualify leads, book orders and appointments, send quotations and move leads through stages. They log everything back into an enriched, history-based contact database.

- **Who it is for:** any business worldwide, from telecom resellers and real estate to dental clinics, restaurants, doctors and insurance. It is sold as SaaS to thousands of businesses, each with its own workspace.
- **Who uses it:** business owners and their small teams. About 90% are **non-technical**.
- **Main goal:** as flexible as GoHighLevel, but so easy that **a 15-year-old can set up an agent or launch a campaign in 1–2 minutes** without experts. Simple on the surface, complete and 100% accurate underneath. Organised and categorised, never messy.
- **Current phase:** **front end only.** The deliverable is a fully clickable, interactive prototype on realistic sample data. There is no backend, no real API calls, no real AI and no real telephony. Every button, menu, setting and flow must be clickable and respond, with results simulated in the browser.

### The five pillars (from the original description)
1. **Database with history.** Tens of thousands of contacts per business with a huge set of combinable filters (zip, gender, name, phone, email, purchases and when, and so on). Enrichment from several external data providers plus AI web scraping fills missing emails and names. Bulk updates. A record of what was sold to whom and when.
2. **One-click broadcasting.** Filter people, then text, call and/or email them in one click. AI writes templates, with several variants and A/B tests. All replies land in one omnichannel inbox, like Meta Business Suite.
3. **AI agents.** Several agents can share one campaign. Every message shows which agent sent it, and agents are compared on performance.
4. **Stages.** Each business names its own stages (telecom: Lead, Booked, Shipped, Installed; real estate: different). Agents move leads as they talk, and changes appear everywhere live. Some stages trigger APIs.
5. **Inbound reception and bookings.** Receptionist agents answer calls and messages 24/7 and book on one interlinked calendar, so two agents never double-book a slot.

**Campaigns are separate views of the data.** The main database holds everyone. A campaign has its own people, stages, agents and dashboard, and one click switches between campaigns.

---

## 2. Every instruction, in order, with final decisions

Superseded decisions are marked ~~struck~~ and followed by the final decision.

### Round 1: developer briefing (early, summary only)
1. Owner shared the full product description (`docs/ORIGINAL_DESCRIPTION.md`). He asked for research on Respond.io, Clay and GoHighLevel, and a module-by-module structure (backend, front end, prototype) for a developer meeting. **Delivered** as a Claude Doc: https://claude.ai/code/artifact/24f5348e-4b86-490b-b15d-482216f9795b (backend and module structure; still useful for the later backend phase).
2. "Make one clickable prototype including all these features and modules, don't miss any, make sure the interface is user friendly… every setting." **Delivered v1**, a single HTML file.

### Round 2: the update brief
3. "I like it but I would like to update it according to [AI_CRM_Update_Brief.md]… make a complete clickable design so I can visit and check every option every setting." **Delivered v2** (vanilla JS + CSS, 12 files), now in `docs/legacy/prototype-v2/`. All features of the update brief were built there.
4. Interpretations made in v2 (brief section 17), all accepted by default because the owner never contradicted them:
   - A new account first sees **Get Started**. After onboarding, **Home opens on the Max chat** with the dashboard below it.
   - Six agent types: Sales, Marketing, Support, Tech support, Receptionist, Finance. There is no separate "call agent"; every agent can call, text and email.
   - "Voice agent / Chat agent" stays as a **label**. Switching it asks the user to rename the agent.
   - After-sales problems go to the **Support** agent. **Referral** requests stay with the **Marketing** agent.
   - "Three mediums" means **call, text, email**.
   - **Reports** is both a main-menu page and the place where AI reports from anywhere are saved. Per-campaign dashboards stay inside each campaign.
   - "Lambda Labs" means **ElevenLabs** (voice/TTS provider) in Expenses.
   - "Steps" in Get Started means **Stages**.
   - Themes: Light, Dark, Dark blue and **Mixed** (dark sidebar, light content).
   - Inbox right panel: the owner's sentence was cut off. Keep contact details and add campaign, lead folder and history.

### Round 3: rejection and rebuild
5. ~~v2 design~~. The owner rejected v2: "You didn't follow the design base, the font, even the overall layout structure… so messy… fields are something is big, something is small… there is no drop down… everything is overwritten." **Final:** rebuild on a proper component library with consistent sizes and real dropdowns.
6. The owner asked which connectors and skills to add. He connected **Figma, Vercel (v0), Magic Patterns, GitHub and Mobbin**, and installed skills **frontend-design, consistent-ui, Figma**. Mobbin needs a paid yearly plan, so the owner won't buy it. **Final:** don't use Mobbin; use the owner's screenshots.
7. "Start rebuilding… make it organised like the big CRMs… ~~the UI should be the exact same as Attio~~, the layout you can manage yourself, user friendly, a 15-year-old can run campaigns… Max should look and answer like Claude or ChatGPT… just focus on the design, UI, layouts right now."
8. "I need only interactable clickable frontend, **not backend**." **Final and still current.**
9. The owner asked for a handoff doc, then said "don't make doc, I will continue in this chat". The half-written Claude Doc (https://claude.ai/code/artifact/fef7c605-a467-48ae-8e7d-a8d96b2286a3, sections 1–6) still exists but is **outdated**: it describes the Attio look. This file replaces it.
10. GitHub repo provided: `Bilalnasirmir/Crewline`. **Final:** all code lives there.
11. Model switched to Fable 5.1. "Get the UI from the screenshots, **not the layout**. Layout you decide yourself. Read the instructions from the beginning." **Final:** visual language comes from the references; information architecture and layout come from the feature brief plus good CRM practice.
12. The rebuild milestone 1 (shell, Max, Home, Contacts) was delivered in the Attio style. The owner: "**I don't like the design and fonts and layouts.**"
13. The owner raised the token cost he had spent. We agreed: **no more full rebuilds; make targeted changes** on the existing code.

### Round 4: the Shopify design system (current direction)
14. ~~Attio-inspired design (Inter, #266DF0 blue primary, white canvas, flat)~~. **Final:** "I need this kind of design system and UI, **same fonts, this is from Shopify**." The owner supplied 6 Shopify admin screenshots.
15. The restyle was applied. The owner: "you are still not following it", and supplied 6 more screenshots plus the **master design-system prompt** (`docs/DESIGN_SYSTEM.md`). The exact values were applied (v3.2).
16. **Latest open complaint, not yet resolved:** "You are not able to put **same font size, font color, font style**, it doesn't look good, please make it according to that [DESIGN_SYSTEM.md]." Then: "go ahead". No further changes were made after this message. **This is the first thing to fix** (see section 5).
17. The owner decided to move the project to **Claude Code** and asked for this handover.

### Standing preferences and rules from the owner
- User-friendliness above everything. It must be organised and categorised, never messy.
- Every option and setting must exist and be clickable. "Don't miss any."
- Look like an internationally standard, premium enterprise product.
- The owner is cost-sensitive. Don't do large rewrites without agreement. Show one screen, get approval, then continue.
- The owner is non-technical. Explain in plain words, briefly.

---

## 3. Every screen and feature

Status legend: ✅ built in the new React app · 🟡 partly built · ⬜ not built yet (stub page). For ⬜ items, the full behaviour is in `docs/UPDATE_BRIEF.md`, with a working reference in `docs/legacy/prototype-v2/js/`.

### 3.1 App shell ✅
- **Top bar** (64px, #0A0A0A): brand mark + "Crewline" on the left. Centered global search, 40px tall and about 620px wide, on #202020 with a #363636 border, 12px radius and a CTRL K badge. It opens a command palette (people, campaigns, agents, pages, quick actions, "Ask Max: …"). On the right: Live/Paused toggle for the simulation, **Assigned to me** with a red count, notifications popover with a count badge, Max side-panel toggle, and account menu (green 36px avatar with 10px radius, "Bilal's Group").
- **Sidebar** (268px, #EBEBEB): items 36px tall, 9px radius, 18px icons. The active item is a white surface; hover is white at 55%. Groups: (no label) Get Started, Home, Max; **Work**: Inbox, Contacts, Campaigns, Stages, Bookings, AI Agents; **Business**: Expenses, Reports (directly above Settings), Settings. At the bottom: Plans & pricing, Theme menu, Collapse.
  - **Retractable:** collapsed shows icons only, with the name on hover (tooltip).
  - Mobile: it becomes a drawer.
  - Counts: Inbox unread (red), Get Started remaining steps.
- **Themes:** Light (default), Dark, Dark blue, Mixed. Tokens switch through a class on `<html>`.
- **Max side panel** on every page except /max, opened by the "Ask Max" floating button or the top-bar icon. It has **Guided mode**, a step checklist per screen ("Do this now").
- **Toasts** appear bottom-right with Undo where relevant. Every icon-only button has a tooltip.
- **Live simulation:** every 8 seconds an agent moves a lead one stage (the first tick moves Umar Ali New → Contacted), a new inbound lead arrives, the receptionist books a slot, or Mia sends messages. The activity feed updates everywhere.

### 3.2 Get Started ⬜
AI-guided onboarding, "Hello, let's get started." Steps: install the web app (recommended), add contacts, make a campaign, connect channels, learn stages and set them, set up AI agents, invite teammates. Plus resources (intro video, support). Every step has "Get it done with AI", and there is a "describe your business and AI builds it" option. It is also the first item in Settings. Sample data: `gs` in `src/data/seed.ts`.

### 3.3 Home ✅ (needs restyle review)
- A **Max chat hero at the top** ("Good evening, Bilal. What do you want to do?") with a composer (attach, voice note, live voice) and quick chips. Sending opens /max with the message.
- **Needs your attention** list, each with Open and "Fix with AI", plus "Let AI finish it with me".
- **Filters** (several at once, default all): campaign, All/Outbound/Inbound, lead folder.
- **Customizable KPIs:** conversations today, calls made, calls answered, texts & emails, appointments & orders, sales closed, revenue, AI cost, handed to you, reply rate. Each KPI has a hover tooltip and links through.
- **Panels:** bookings per day (chart), stage funnel, live agent activity, Assigned to me, coming up today, inbound vs outbound, your AI team. A **Customize dialog** shows or hides panels and KPIs (saved in localStorage).

### 3.4 Max, the AI assistant ✅
- **Full page (/max):** ChatGPT/Claude-style layout. The chat history rail on the left has search, rename and delete, and 4 seeded threads. The empty state shows 6 suggestion cards. The composer handles text, attachments, voice messages and live voice (all simulated). Replies stream word by word, with copy, thumbs and retry on hover.
- **Scripted engine** (`src/features/max/engine.ts`), keyword-based:
  - **Build a campaign in chat.** It pre-fills what the user already said and confirms it ("I won't ask again"). It asks "Manually / Guide me / Do it for you". Then it shows inline option chips step by step: direction → folder → channels (multi) → stages → agents (multi) → booking → start. Then a **plan card that lists every change and waits for approval** ("OK, go ahead" / Not now / Edit). On approval the campaign is created in the store and linked.
  - Find people (city, gender, email, bought, dead) shows an inline table with "Save as folder" and "Start a campaign".
  - Theme change goes through an approval card.
  - Cost analysis shows a bar block, suggestions and a plan card.
  - "Why did replies drop / what should I fix" shows KPIs, an explanation and a plan card.
  - "Bookings on Sep 23" shows counts and a calendar link.
  - Competitor research shows a presentation card (Open, Save to Reports, Download PDF).
  - Improve agent shows a plan card that bumps Robert's version and score.
- **Guided mode** runs in the side panel with a per-route step list.

### 3.5 Contacts ✅ (needs restyle review)
- Tabs: **All people · Folders · Do-Not-Contact · Database health**.
- **Tiles:** Missing details (opens a breakdown dialog with "Fill missing data with AI"), Duplicates (list with Merge / Overwrite / Skip, plus Merge all), Not responding, Dead numbers, Do-Not-Contact.
- **Build filters with AI** box (text or voice). It turns plain English into filter chips and shows a note on what it understood or what is missing, plus "Save as folder".
- **Large search box.**
- **Filter chips:** 25 filter types in groups (Location, Profile, Activity, Purchases, Data quality). Each chip opens an editor (multi-select, several zip codes, ranges, recency). Match all/any. Clear.
- **Compact table** with a pinned name and a checkbox. Configurable columns: phone, email, stage, campaign, lead source with an in/out icon, agent, last contacted, last purchase, score, city, tags.
  - **Hover a stage** to see the campaign and lead source.
  - **Click a phone number** for a menu: call myself, text, **assign an AI agent to call now** (the database updates to Contacted), copy.
  - **Right-click a row** for: open, save to folder, start campaign, set stage, add tag, add to DNC, delete with Undo.
  - **Bulk bar:** start campaign, save to folder, set stage, tag, fill missing, delete.
  - Footer counts show who can get texts, calls and email.
- **Folders (Windows-style):** a tree of groups and subfolders (Canada / US / Pakistan…) and a grid of folder cards with count, date saved and source.
  - **Double-click** a folder to open its people in the rows view. A header shows which folder is open, with "Start campaign" and **×** to show the whole database.
  - **Right-click menu:** open, start campaign, rename in place, move to, new subfolder, delete.
  - Sort by date, name or count, and search.
- **Save to folder dialog:** new folder (with a parent) or add to an existing one.
- **Do-Not-Contact:** a table (reason badges such as Litigator or Opted out), add a number, import a DNC list, remove.
- **Database health:** score tiles (Hot, Warm, Cold, Not responding, Dead, Complete), dead-number rules, and a dead/not-responding list with **"Find updated info with AI"** (finds a new number, then offers "Update number"), Keep and Remove.
- **Dialogs:**
  - Add contact: all fields plus **custom fields created on the fly** (text or dropdown), consent, AI fill.
  - Import: 4 steps (upload any format → AI column matching with confidence → duplicates plus consent plus save as folder → done). The same dialog handles DNC import.
  - Contact settings: custom fields, lead sources in/out, dead-number rules written as sentences, lead scoring.
  - Enrichment progress (a provider waterfall).
- **Contact profile (/contacts/:id):**
  - Header with badges (score, tags, DNC, stage, in/out). Actions: Text, Call (the phone menu), Email, Book, Send quotation, Record sale, Analyze with AI.
  - **Details card:** click-to-edit fields, custom fields, per-channel consent switches.
  - **Journey:** tabs All / Chats / Calls / Emails / Sales / Stages / Bookings, grouped Today / Yesterday / This week / Earlier. Coloured icons have hover labels. Call recordings, and "Open" jumps to the conversation.
  - **Right column:** campaign and stage (a stage select that updates everywhere), folder, lead source, agent, tries, last contact, purchases, notes, recent conversations.

### 3.6 Campaigns 🟡
- **Built:** the tiles page (`src/features/campaigns/page.tsx`, routed at /campaigns).
  - Each tile shows the In/Out tag, status, name, business, sub-type and start date.
  - **Customizable metrics:** up to 6 of people, reached, replied, interested, booked, won, revenue, cost, cost per booking, reply rate, or **any stage**, each with a tooltip.
  - Progress bar, channel icons, agent avatars, Pause/Resume/Start now, and a menu (customize metrics, duplicate, delete).
  - Filters: All / Out / In, status, search.
  - "Build with Max" and "New campaign" actions.
- **Not built:**
  - **New campaign wizard** (/campaigns/new, currently a stub). It needs a **journey tracker on the right** with a completion %. Steps:
    0. Type: Outbound, Inbound (subtypes: appointment booking, inbound ad campaign…) or both.
    1. Contacts: a saved folder or filter in the database.
    2. Channels only: Text, Call, Email, WhatsApp, Messenger…
    3. Stages: the builder.
    4. Agents: tiles by type with stats; several agents.
    5. Follow-ups: these override the agents' own.
    6. Details: "This campaign does appointment booking" toggle with the booking settings pop-up, qualification and disqualification criteria, script, knowledge base, dos and don'ts, opening templates per channel with AI.
    7. Products & revenue: products and categories with values, currency, the stage that triggers revenue, and a partial or full cancellation rule.
    8. Schedule: now or later, working hours, days picked from a calendar.
    9. Review & launch.
  - The wizard must accept `?folder=`, `?contact=` and `?selected=` query params, which Contacts already sends.
  - **Campaign detail** (/campaigns/:id, stub). Tabs: Dashboard, People, Conversations (live/past), Agents, Stages, Settings (reopens the wizard steps). It needs:
    - Customizable metrics row
    - Stage breakdown and Open board
    - Bookings per day with hover values
    - By channel (booked and cost)
    - A/B test (message, script, agent)
    - **Ask AI in the header**
    - **Add more leads**
    - **Analyze with AI** (a report dashboard or flowchart with suggestions)
    - **DNC skipped banner** with "View list" and "Send anyway"
    - **Receptionist auto-takeover** banner
- Shared components already written for these, but **not yet used**:
  - `src/features/shared/followups.tsx`: the follow-up editor. It has "Let AI handle this" (default on), separate Outbound/Inbound tabs with "Copy to", steps (If / after / then / by agent / using template), and a drop-lead rule.
  - `src/features/shared/led.tsx`: `LineList` (type a sentence, press Enter to add an item, with an optional Required/Preferred/Optional importance and AI/voice buttons) and `OptionRow`.

### 3.7 Stages ⬜
Renamed from "Pipeline".
- **Board** with drag and drop, **list view** and a **campaign switcher**.
- **Outbound / Inbound tabs** with one-click copy between them.
- **Live movement** with an activity feed.
- **New stage** button: name, colour and/or icon, **criteria written as sentences** (LineList), and assign to one, several or all campaigns.
- List columns: Name, Stage, Channels (hover shows the agents; click opens the conversation), Agent (click opens the agent), Last update, and **Revenue only at the revenue stage**.
- **Review tab ("Review for me"):** the AI's description, recording, transcript and summary, and a stage dropdown. Choosing a stage removes the item and "AI learns".
- **Follow-up stages** (also in/out).
- The AI follows the **latest** message (for example "Yes" at 4:30, then "I need time" at 4:35 moves the lead to Pending).
- In a **human chat**, a pop-up asks "This lead qualifies for X. Move it?"

### 3.8 Bookings ⬜
Renamed from "Calendar".
- **Day / Week / Month** views, date filter and other filters.
- **Campaign selector at the top**: services, hours and settings are per campaign.
- Statuses Requested / Booked / **Arrived / Completed** / No-show / Cancelled, with a colour per status.
- **New booking** dialog with **conflict detection** and **confirmations by text, email and/or WhatsApp**.
- **Dashboard:** today, requests, booked, cancelled, with filters (today, yesterday, 30 days, custom).
- A **Queries** table with a distinct query icon (information-only receptionist conversations).
- **Ask AI** ("How many bookings on Sep 23?"), answered in text and shown on the calendar.
- **Setup**, also the booking-settings pop-up used by agents and campaigns:
  - Fully custom services (duration, staff, buffer, price, custom columns)
  - Capacity (for example 10 tables)
  - Opening hours, days and closures
  - Reminders
  - Self-booking page with an embed code
  - Sync with Google Calendar, Sheets or Excel
  - "Explain your setup in one message and AI configures it"
- Simulation of two callers asking for the same slot at once (no double booking).
- Sample data: `bookings`, `services`, `staff`, `hours`, `queries`.

### 3.9 AI Agents ⬜
- **Six type tabs** with **3 default agents each:**

  | Type | Default agents |
  | --- | --- |
  | Sales | Sarah, Ellie, Robert |
  | Marketing | Mia, Jay, Nora |
  | Support | Grace, Leo, Hana |
  | Tech support | Theo, Ava, Dev |
  | Receptionist | Rhea, Sam, Lily |
  | Finance | Quinn, Maya, Victor |

- **Tiles** show per-type metrics, the global platform score, "More details" (history), "Assign to" and status. There is a **leaderboard** view.
- **Editor sections:**
  - **Header:** name, type, campaigns, version ("Voice agent · Metro Mobile · v3").
  - Voice/chat label, which asks the user to rename on switch.
  - Inbound/outbound applicability.
  - Languages.
  - Voices, including cloning your own (ElevenLabs).
  - **Style per channel** (call, text, email).
  - Instructions with templates and "Optimize with AI".
  - **Job:** the 26-question set in brief §6.8, each answer stored as a line list.
  - Q&A pairs.
  - Knowledge shown as **folders** (files, links, text, videos, images) with a single "Add knowledge base" button.
  - **Actions grouped in categories:** calling, messaging, data, booking, sales, finance, tech. **HTTP request** has full configuration: name, prompt, fields, method, URL, params, headers.
  - **Rules & handover in categories**, including **stage handoff** with 3 options (continue with the same agent, another agent, or a human).
  - **Follow-ups** (the shared editor) with the drop rule and "Let AI handle".
  - **Booking toggle**, which opens the settings pop-up.
  - A **version dropdown right before "Save changes"** (switch versions and delete old ones).
- **Right-side Test panel:** chat, voice note or call simulation, with hints about what is wrong.
- **Review panel:** a score % and suggestions.
- **"Create / edit your agent with AI"**, a guided chat. It asks one question at a time and writes back "Am I correct?". Build order: stages → script → knowledge → questions. A **gating pop-up**, "Update your agent", blocks moving on without the required information.
- A **Monday.com-style "Creating agent…" animation** when an agent is created. This is the only place with expressive animation.
- **Analyze with AI.** Multi-tenant note: edits apply only inside the user's own workspace.

### 3.10 Inbox ⬜
- Top buttons **Chat · Email · Calls**, then **All / Inbound / Outbound**, then **platform checkboxes** (WhatsApp, SMS, Instagram, Messenger, TikTok, Facebook, web chat), then search.
- **Chat:**
  - WhatsApp-style ticks: one tick sent, two ticks delivered, **blue** ticks read.
  - In-chat system events (stage moved, handed over, booking).
  - Calls inside the thread (recording, summary, transcript).
  - Take over / Hand back / Assign.
  - Human stage pop-up.
  - Receptionist booking notice ("handle yourself or assign to Rhea").
  - **Only the chat pane scrolls.**
- **Email:** Gmail-like folders (inbox, sent, drafts, scheduled), a reader, and a **full composer** (From, To, Cc, Bcc, subject, toolbar, attachments, templates, AI write, schedule, assign to an agent).
- **Calls:** a call log plus a **dial pad like OpenPhone/8x8**, "assign the call to an AI agent", and an in-call screen.
- **Manual outreach:** send it yourself, or **assign an AI agent plus a campaign**.
- Book an appointment, **full quotation** (line items, pictures, send by email or text) and **record sale** from the conversation.
- **Right panel:** contact details, **campaign**, **lead folder**, colour-coded history, and the query icon for receptionist queries.
- Sample data: `convos`, `emails`, `calls`.

### 3.11 Expenses ⬜
- Total spend at the top.
- **Breakdown table:** WhatsApp API, AI calling per minute, ElevenLabs characters, AI text and email tokens, SMS, telephony, data lookups, plan.
- Filters by API, platform, channel and campaign. Per-day chart, by campaign and budget.
- **Ask AI** ("How can I reduce costs?"), with the report saved to Reports.
- It must feel elegant and high-end. Sample data: `expenses`, `expDaily`.

### 3.12 Reports ⬜
- Dashboards with infographics and filters (campaigns, agents, bookings, expenses, inbound vs outbound separable).
- **Report library** with Windows-style folders and subfolders, named and dated.
- **Generate with AI** (voice or text), which produces a report document you can save into a folder and analyze again.
- AI reports from Max, Expenses and Campaigns land here. Sample data: `reportFolders`, `reports`.

### 3.13 Settings ⬜
Categorised and non-technical. It covers:
- Business, Appearance (themes), Team and roles, Notifications matrix
- Channels (numbers, SMS registration, email DNS, WhatsApp, social)
- Connected apps, Voices
- Lead sources, Custom fields, Database hygiene/dead rules, DNC settings, Data providers
- Campaign defaults, Stage defaults, Products and currency, Booking defaults, Agent defaults
- Max, Billing and usage, Report defaults, Compliance and privacy, Integrations/API
- Get Started as the first entry

Routes are `/settings/<section>` (for example `/settings/channels` and `/settings/business`, already linked from notifications).

### 3.14 Assigned to me ⬜
Route `/assigned`, linked from the top bar and Home. It lists items the AI can't decide:
- Human handoff
- Booking request in a non-booking campaign
- Unclear stage
- Angry customer
- Unclear qualification
- New number found

Each item has kind-specific actions: open chat, assign to receptionist, choose a stage (AI learns), update the number, resolve. Sample data: `assigned`.

### 3.15 Pricing ⬜
3–4 placeholder packages with a monthly/yearly toggle (details come at the end of development).

### 3.16 Global behaviours (apply everywhere)
- An **AI option everywhere** ("Do with AI", "Improve with AI", "Ask AI", "Analyze with AI"…) with one consistent AI mark: the Lucide `Sparkles` icon.
- Input is always **text, voice or attachments**. Voice is preferred.
- **Everything is linked and clickable:** a name opens the contact, an agent opens the agent page, a channel opens the conversation, a DNC count opens the DNC list.
- **Tooltips** on hover explain every icon.
- **Inbound/outbound** is selectable, visible and filterable everywhere, with distinct icons that are not call arrows: Inbound = Lucide `Inbox`, Outbound = `Send`.
- **Real-time:** every change shows everywhere at once. This comes from the single Zustand store.
- **Proactive optimisation suggestions** wherever something is wrong or missing.
- **Notifications** plus **Assigned to me** for anything needing a human.

---

## 4. Design rules (CURRENT: Shopify admin style)

**Read `docs/DESIGN_SYSTEM.md` in full and study `docs/reference-screenshots/`.** They override everything else visual. Summary:

- **Mood:** calm, precise, polished, predictable, expensive, like a mature enterprise operating system. Mostly grayscale; colour only for meaning or status. No gradients, glassmorphism, neon, giant headings, giant buttons, pill buttons, heavy shadows or decorative animation.
- **Colours:**

  | Token | Value |
  | --- | --- |
  | bg | #F1F1F1 |
  | surface | #FFFFFF |
  | surface-subdued | #F6F6F6 |
  | sidebar | #EBEBEB |
  | topbar | #0A0A0A |
  | dark surface / search | #202020 (search border #363636) |
  | text | #303030 |
  | text secondary | #616161 |
  | text subdued | #707070 |
  | text disabled | #8C8C8C |
  | border | #E1E3E5 |
  | border subtle | #E6E6E6 |
  | input border | #C9CCCF |
  | info | #2C6ECB |
  | success | #008060 |
  | warning | #B98900 |
  | critical | #D72C0D |

- **Font:** "ShopifyInter", then Inter, then system fonts. Inter is self-hosted via `@fontsource-variable/inter`.
  - Scale: 12/16, 13/18, **14/20 body**, 16/22, 18/24 section, 20/26, **24/30 page title at 600**.
  - Weights: 400 / 500 / 600 / 700.
- **Spacing:** 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Main content padding 24px.
- **Radius:** 6 small, **8 buttons and inputs**, 12 dropdowns, **14–16 cards**, 999 **badges only**. Nav items and tabs use 9px.
- **Layout:** 64px top bar, 268px sidebar with 36px items, 14px/500 text and 18px icons. The active item is a white surface; hover is rgba(255,255,255,.55). Nested nav is indented 36–40px.
- **Buttons:** 36px tall, 14px padding, 8px radius, 14px/600.
  - Primary: #303030 with white text, hover #1A1A1A.
  - Secondary: white with a #C9CCCF border.
  - Tertiary: transparent.
- **Inputs:** 40px tall, white, #C9CCCF border, 8px radius, 12px padding, 14px text, 2px subtle blue focus.
- **Cards:** white, 1px #E1E3E5 border, 16px radius, 16–24px padding, shadow at most 0 1px 2px rgba(0,0,0,.04).
- **Metric cards:** 4-column grid with a 16px gap. Title 14/500, value 20–24/600, support text 12–14 #616161, 16px info icon.
- **Tables:** header 13–14/500 #616161, rows 42–48px, 1px #E1E3E5 dividers, no zebra striping, no heavy grid.
- **Badges:** pill, 3px 9px padding, 12/500. Neutral is #E8E8E8 with #616161 text; semantic colours use soft backgrounds.
- **Dropdowns:** white, #E1E3E5 border, 12px radius, shadow 0 4px 12px rgba(0,0,0,.1). Items 36–40px with 7px radius and hover #F6F6F6. Motion is 150–200ms opacity plus translateY(-4px).
- **Toggles** are 36×20 with a 16px knob. **Banners** are soft (for example light blue) with a 10px radius and 12px 16px padding.
- **Empty states:** illustration, heading, explanation and a primary action, centred. **Onboarding cards:** a 3-column grid with heading, description, illustration and CTA.
- **Icons:** Lucide only, outline, stroke 1.8–2, sizes 16 / 18 / 20 / 24. **Avatars:** 34–36px with a 10px radius.
- **Tabs:** 36–40px tall; the selected tab has an #F1F1F1 background and 9px radius.
- **Charts:** subtle, #E6E6E6 grid, 12px #707070 axis labels, thin lines.
- **Motion:** 120 / 180 / 240ms, `cubic-bezier(.2,0,.2,1)`. Respect prefers-reduced-motion.
- **Responsive:** 4 columns → 2 on tablet → 1 on mobile. The sidebar becomes a drawer, tables scroll horizontally and actions stack.
- **Originality:** never copy Shopify's logo, name, illustrations or assets. Only the visual language.

### What the owner liked and disliked
- **Disliked:**
  - v1/v2: messy layout, controls of different sizes, native browser dropdowns, wrong font.
  - The Attio-style rebuild: "I don't like the design and fonts and layouts."
  - Early Shopify restyles: font size, colour and style still not matching.
- **Liked:** the v1 feature set ("I like it") and the Shopify admin look in the screenshots.
- Wants **real dropdowns and menus** (Radix, done), **consistent control sizes** and **big-CRM organisation**.
- **Max must look and answer like Claude or ChatGPT.**

---

## 5. Status: finished, half-done and known bugs

### Finished (React app in this repo)
- Project setup: Vite, React, TypeScript, Tailwind v4 and Radix UI (via the `radix-ui` package), plus lucide-react, Zustand, React Router (hash routes), Recharts, cmdk, sonner and self-hosted Inter.
- The design-token system in `src/index.css`, with 4 themes.
- Component library (`src/components/ui/*`): Button, Input/Textarea/Field, Select, Combobox, DropdownMenu, Popover, Dialog/Sheet, Tabs/Segmented, Switch/Checkbox/Radio/ChoiceRow/Progress/Slider/Kbd/Skeleton, Badge/Count, Avatar/AgentAvatar, Command, Table, Card/CardHeader/EmptyState/PropertyList, Tooltip.
- App components: AppShell, TopBar, Sidebar, ThemeMenu, CommandPalette, PageHeader/Toolbar/PageBody/Section, StageTag, AgentChip, ContactChip, CampaignChip, Kpi, BarRow, and the AiMark/DirIcon/DirTag/PlatIcon/PlatBadge icons.
- The typed sample data (`src/data/seed.ts`, `types.ts`) and the store with the live simulation (`src/store/index.ts`).
- Modules: **Home, Max (page, panel and engine), Contacts (all tabs, dialogs, profile), Campaigns tiles.**

### Half-done
- **Typography and visual match to the Shopify screenshots.** Tokens follow DESIGN_SYSTEM.md, but the owner says font size, colour and style still don't match. **Fix this first**, before any new module. Compare side by side with `docs/reference-screenshots` at 100% zoom. Things to check:
  - Page titles: the screenshots look about 20–24px, weight about 650, colour #303030.
  - Sidebar labels: about 14–15px, weight 550–600. Shopify's nav reads slightly bolder than regular.
  - Body: 14px, weight about 450 in the screenshots. Use variable Inter at 450/550/650 to match ShopifyInter.
  - Letter-spacing, and card title weight (Shopify card titles are 14px/650).
  - Muted text colour #616161.
  - Remove any leftover places using a 12–13px size or `text-muted` where Shopify uses #303030. Several Home and Contacts elements still use the older small sizes.
  - Kpi values currently render bold at 24px; the spec is 20–24/600.
- Campaigns: tiles only. The wizard and detail pages are stubs. The follow-up editor and LineList are written but unused.
- The Home and Contacts layouts were built before the Shopify switch. They were restyled with tokens, but not re-laid-out to Shopify's page pattern: page header, a centred content column of about 1000–1200px for non-table pages, and card sections with a heading outside the card, as in `05-growth-page.png`. The **sidebar has no nested sub-navigation yet**; the spec shows children under a parent, like Contacts → Folders / Do-Not-Contact / Database health, or Campaigns → New campaign.

### Not built (stub pages)
Get Started, Inbox, Campaign wizard, Campaign detail, Stages, Bookings, AI Agents (list and editor), Expenses, Reports, Settings, Pricing, Assigned to me.

### Known bugs and gaps
- Several rename/tag/new-folder actions use `window.prompt`. Replace them with proper dialogs.
- The Dark, Dark blue and Mixed themes were designed for the older look. Check contrast and surfaces after the Shopify switch. The primary-button text colour was fixed with a `--btn-fg` token.
- The Home filters scale numbers with a multiplier. The data isn't truly filtered.
- The Max engine is keyword-based. Unmatched text shows a "Build / Find / Analyze" clarifier.
- The bundle is about 1.1MB (a Vite warning). Consider route code-splitting.
- The "Fill missing" button on the contact profile only shows a toast.
- Mobile was checked only lightly.
- Vercel deploy through the v0 connector failed with `403 Cannot create tokens for this app`. Previews were published as a claude.ai artifact instead: https://claude.ai/artifact/QvBoe5zLTRvrZBd68X26rr (private; the latest version is v3.2 plus the fixes in this handover). The owner can connect the repo to Vercel himself for automatic deploys.

---

## 6. What to build next (in order)

1. **Fix typography and visual fidelity** on the shell, Home, Max and Contacts until the owner approves. Screen by screen, compared with the screenshots. Add nested sidebar sub-navigation. Adopt Shopify's page pattern (card sections with headings outside, centred columns, onboarding cards, empty states with simple original SVG illustrations).
2. **Get Started** (onboarding cards grid, like `02-onboarding-cards.png`).
3. **Campaigns:** the wizard (0–9 with the journey tracker) and the detail page (all tabs and banners).
4. **Stages** (board, list, review, new-stage dialog, in/out tabs, follow-up stages).
5. **Inbox** (chat, email, calls, dial pad, composer, quotation).
6. **AI Agents** (types, tiles, leaderboard, editor, test and review panels, guided builder, creating animation).
7. **Bookings** (calendar views, dashboard, queries, setup and booking-settings pop-up).
8. **Assigned to me**, **Expenses**, **Reports**, **Settings**, **Pricing**.
9. Run the `consistent-ui` skill for a drift audit, check mobile, split the bundle.

### Ideas discussed but not built
- Put the finished screens into **Figma** for the owner's team (the Figma connector and skills are available).
- A **backend phase** later: the first developer briefing doc has the module and backend structure. It is out of scope for now.
- Deploy to Vercel from the GitHub repo.
- Voice cloning, a live voice conversation with Max, a PDF/presentation export from Max, competitor research by Max. These are simulated only for now.

---

## 7. Everything else Claude Code must know

- **How to run:** `npm install`, then `npm run dev` (local preview) and `npm run build` (static output in `dist/`, hash routing, `base: './'`, so it works from any static host).
- **Architecture:**
  - `src/main.tsx`: routes.
  - `src/components/app/shell.tsx`: the layout.
  - `src/store/index.ts`: one Zustand store holding all data, actions and the simulation timer.
  - `src/features/<module>/`: the screens.
  - `src/features/max/`: Max, with its own store for threads.
  - `src/data/seed.ts`: the sample workspace. It uses a seeded random generator, so data is stable between reloads. "Today" is fixed at **27 Sep 2026**.
- **Sample workspace** ("Bilal's Group"):
  - Businesses: **Metro Mobile** (telecom), **Keystone Realty** (real estate), **BrightSmile Dental**.
  - Campaigns: **k1 Telecom — Mobility Q4** (out), **k2 Real Estate — Brooklyn Buyers** (out), **k3 Dental — Appointment Booking** (in), **k4 Fiber — Facebook & Google Ads** (in), **k5 Telecom — Fiber Win-back** (out, paused).
  - Folders are grouped Canada / United States / Pakistan: Mississauga Leads 20,000, Toronto, Telecom Leads, Brooklyn Buyers, NYC Fiber Customers › Fiber · no Mobility, Karachi, plus the Inbound folder and Dental patients 2025.
  - 90 contacts. Fixed story people: Maria Rivera c1, Kevin Brown c2, Ahmed Umar c3 (dead number), Umar Ali c4 (the first live move), Priya Patel c5, James Okafor c31, Sofia Rossi c32, Daniel Nguyen c33, Grace Kim c45, Emily Park c46, Leila Cohen c47, Priya Chen c59, Hassan Ali c60, Omar Siddiqui c61, Carlos Garcia c73.
  - 18 agents (ids s1–s3, m1–m3, p1–p3, t1–t3, r1–r3, f1–f3), 12 conversations, 11 emails, 9 calls, about 700 bookings and 7 queries.
- **Rules for working with the owner:**
  - Plain, short explanations; he's non-technical.
  - Show one screen, get approval, then continue.
  - No large rewrites without asking.
  - Commit and push to `main` after each approved step.
  - Keep everything clickable. Never leave a button that does nothing: at minimum a toast or a dialog.
- **Front end only.** Simulate every AI, call, send and enrichment result. Mark demos subtly where helpful.
- The owner's timezone is Asia/Karachi. The currency in the sample data is $, but settings must allow any currency (for example PKR).
