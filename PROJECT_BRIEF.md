# Crewline: Project Brief and Handover

Handover date: 28 September 2026 (Asia/Karachi). Owner: Bilal Nasir (bilalnasirmir@gmail.com). Repo: https://github.com/Bilalnasirmir/Crewline (branch `main`).
Last updated: 28 September 2026, Round 5 (Polaris restyle of tokens, components, shell and Home; approved by the owner).

This document is the single source of truth for continuing the project in Claude Code. When it conflicts with anything older, this document wins. The owner's own words are kept verbatim in `docs/`:

| File | What it is | Authority |
| --- | --- | --- |
| `docs/POLARIS_MASTER_PROMPT.md` | The owner's latest UI instruction (28 Sep 2026): follow the current Shopify admin / Polaris system, typography first, official Polaris tokens over screenshot guesses | **Highest** for anything visual. The verified values it led to are in §4 and `src/index.css` |
| `docs/DESIGN_SYSTEM.md` | The owner's earlier master design-system prompt (Shopify-style) | Mood, principles and component list still apply. **Its pixel sizes are superseded** (they were measured from screenshots taken at 125% zoom) |
| `docs/reference-screenshots/*.png` | 12 Shopify admin screenshots the owner supplied, **captured at 125% display scaling** | Use for visual validation. Colours are exact; divide any measured size by 1.25 |
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
16. ~~Latest open complaint:~~ "You are not able to put **same font size, font color, font style**, it doesn't look good, please make it according to that [DESIGN_SYSTEM.md]." **Resolved in Round 5** (items 20–21).
17. The owner decided to move the project to **Claude Code** and asked for this handover.

### Round 5: Claude Code, Polaris restyle (28 Sep 2026)
18. "We're just building the front end… it has to be the 100% completed front end because we're not gonna redevelop front end, we're just gonna redevelop the back end." **Final:** the front end is the production front end, not a throwaway demo. Keep all data access behind the store actions so a backend can replace the simulated results later.
19. The owner supplied the **Polaris master prompt** (`docs/POLARIS_MASTER_PROMPT.md`): follow the current Shopify admin / Polaris system as closely as possible, typography first, official Polaris tokens over screenshot estimates, never fake "ShopifyInter", no generic AI UI, original branding only.
20. Findings, all verified:
    - The reference screenshots were captured at **125% display scaling**. The older specs (64px top bar, 268px sidebar, 14px body, 36px buttons, 40px inputs, 16px card radius) were measured from them and were 20–25% too big. That was the root cause of the font complaints.
    - The app enabled Inter stylistic sets (`cv11`, `ss01`, `ss03`) that change letter shapes. Removed. Polaris' own global style is `font-feature-settings: "calt" 0`.
    - **ShopifyInter is not public.** Polaris' public font stack is Inter + system fonts, so Crewline uses Inter, honestly named.
    - **Polaris React cannot be installed:** its licence limits it to apps that integrate with Shopify and requires standalone apps to look visually distinct. So Crewline keeps its own components and matches the public Polaris token values.
21. The restyle was applied to the tokens, every shared component, the shell (with nested sidebar sub-navigation) and Home. It was verified by pixel-comparing renders at 1.25× with the screenshots; for example, the sidebar "Settings" label is 63×15 px in both. **The owner approved Home and the overall look:** "Yes i am happy with home". Pushed to GitHub.
22. The owner will continue building in a **Claude Code cloud session**, starting from this repo.

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
- **Top bar** (56px, #0A0A0A): brand mark + "Crewline" on the left. Centered global search, 36px tall and up to 544px wide, on #282828 with a #3C3C3C border, 8px radius and a CTRL K badge. It opens a command palette (people, campaigns, agents, pages, quick actions, "Ask Max: …"). On the right: Live/Paused toggle for the simulation, **Assigned to me** with a red count, notifications popover with a count badge, Max side-panel toggle, and account menu (green 28px avatar with 8px radius, "Bilal's Group").
- **Sidebar** (240px, #EBEBEB; Polaris navigation): items 28px tall, 8px radius, a 20px icon slot (18px Lucide icon) and the label at 36px. Top-level labels are 13px/550; the selected item is 13px/650 on #FAFAFA; hover is #F1F1F1. Group headings are 12px/650 #303030. Groups: (no label) Get Started, Home, Max; **Work**: Inbox, Contacts, Campaigns, Stages, Bookings, AI Agents; **Business**: Expenses, Reports (directly above Settings), Settings. At the bottom: Plans & pricing, Theme menu, Collapse.
  - **Sub-navigation:** a section's children appear under it while you are in that section, in 13px/450 #616161. The selected child is 13px/650 on #FAFAFA with an L-shaped connector from the parent icon, and the parent then loses its highlight, as in Shopify's "Customers → Segments". Current children: Contacts → Folders / Do-Not-Contact / Database health (`/contacts?view=folders|dnc|health`), Campaigns → New campaign. Add more in `NAV` in `src/components/app/shell.tsx`.
  - **Retractable:** collapsed shows icons only, with the name on hover (tooltip).
  - Mobile: it becomes a drawer.
  - Counts: Inbox unread (red), Get Started remaining steps.
- **Themes:** Light (default), Dark, Dark blue, Mixed. Tokens switch through a class on `<html>`.
- **Max side panel** on every page except /max, opened by the compact "Ask Max" floating button (bottom right) or the top-bar icon. It has **Guided mode**, a step checklist per screen ("Do this now"). Pages keep 64px of bottom padding so content can scroll clear of the button.
- **Toasts** appear bottom-right with Undo where relevant. Every icon-only button has a tooltip.
- **Live simulation:** every 8 seconds an agent moves a lead one stage (the first tick moves Umar Ali New → Contacted), a new inbound lead arrives, the receptionist books a slot, or Mia sends messages. The activity feed updates everywhere.

### 3.2 Get Started ⬜
AI-guided onboarding, "Hello, let's get started." Steps: install the web app (recommended), add contacts, make a campaign, connect channels, learn stages and set them, set up AI agents, invite teammates. Plus resources (intro video, support). Every step has "Get it done with AI", and there is a "describe your business and AI builds it" option. It is also the first item in Settings. Sample data: `gs` in `src/data/seed.ts`.

### 3.3 Home ✅ (Polaris restyle approved by the owner, 28 Sep 2026)
- A **Max chat hero at the top** ("Good evening, Bilal. What do you want to do?") with a composer (attach, voice note, live voice) and quick chips. Sending opens /max with the message.
- **Needs your attention** list, each with Open and "Fix with AI", plus "Let AI finish it with me".
- **Filters** (several at once, default all): campaign, All/Outbound/Inbound, lead folder. They use `Select variant="button"`, Shopify's "Today ⌄" filter style.
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

### 3.5 Contacts ✅ (works; picks up the new components, but its page layout is not yet tuned to Polaris; that is the next step)
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

## 4. Design rules (CURRENT: Shopify admin / Polaris, verified 28 Sep 2026)

**Read `docs/POLARIS_MASTER_PROMPT.md` (binding) and `docs/DESIGN_SYSTEM.md` (mood and principles).** Every value below is a token in `src/index.css` or lives in `src/components/ui/*`. Change those, never hard-code a style on one page.

**Where the values come from:** the public Polaris token set (`@shopify/polaris-tokens`) and Polaris component CSS, both read from the source. Each value was then checked against the reference screenshots by pixel measurement. **The screenshots are at 125% display scaling, so divide any size you measure in them by 1.25.** Colours in them are exact.

- **Mood:** calm, precise, restrained, dense like the Shopify admin. Mostly grayscale; colour only for meaning or status. No gradients, glassmorphism, neon, AI purple, hero sections, giant headings, pill buttons, heavy shadows or decorative animation.
- **Font:** Inter, self-hosted as "Inter Variable", then the Polaris system stack (-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue). It is never labelled "ShopifyInter". The body uses `font-feature-settings: "calt" 0` with antialiasing; no other stylistic sets.
- **Weights:** 450 regular, 550 medium, 650 semibold, 700 bold. Tailwind's `font-normal/medium/semibold/bold` are remapped to these.
- **Type roles:**

  | Role | Class / element | Size / line height | Weight |
  | --- | --- | --- | --- |
  | Page title | `h1`, `text-xl` | 18/24, −0.2px (measured on 4 Shopify screenshots) | 650 |
  | Big number (metric value) | `text-2xl` | 20/24, −0.2px | 650 |
  | Section title (outside cards) | `h2`, `text-lg` | 14/20 | 650 |
  | Card title | `h3` | 13/20 | 650 |
  | Body, table cells, inputs, nav | `text-sm` = `text-base` | 13/20 | 450 (nav 550) |
  | Buttons, badges, tabs, table headers, captions | `text-xs` | 12/16 | 550 (captions 450) |
  | Tiny counts | `text-2xs` | 11/12 | 650 |

- **Colours:**

  | Token | Value | Token | Value |
  | --- | --- | --- | --- |
  | text | #303030 | bg | #F1F1F1 |
  | text-2 / muted | #616161 | surface | #FFFFFF |
  | faint (icon-secondary) | #8A8A8A | subtle-2 (hover, table header) | #F7F7F7 |
  | disabled | #B5B5B5 | subtle (selected) | #F1F1F1 |
  | icon | #4A4A4A | subtle-3 (modal header) | #F3F3F3 |
  | primary (link, focus) | #005BD3 | border / row divider | #E3E3E3 / #EBEBEB |
  | btn (primary button) | #303030, hover #1A1A1A | input-border | #8A8A8A, hover #616161 |
  | fill-tertiary (header buttons) | #E3E3E3, hover #D4D4D4 | sidebar / hover / selected | #EBEBEB / #F1F1F1 / #FAFAFA |
  | topbar / search / border | #0A0A0A / #282828 / #3C3C3C | overlay | rgba(0,0,0,.5) |

  Status colours: success #047B5D (badge #AFFEBF with #014B40 text); warning text #5E4200 (badge #FFD6A4); critical #C70A24 (badge #FED1D7 with #8E0B21); info text #003A5A (badge #D5EBFF). AI actions stay neutral and are marked only by the Lucide `Sparkles` icon.
- **Sizes:**
  - Top bar 56px; sidebar 240px (60px collapsed); nav items 28px.
  - Buttons: 28px on desktop and 32px on phones; micro 24px, large 32px. Padding 6px 12px.
  - Inputs and form selects: 32px (36px on phones, with 16px text so iOS doesn't zoom).
  - Table header 36px; rows 33px. Badges 20px.
- **Radius:** 8px for buttons, inputs, nav items, tabs and badges; 12px for cards, menus, popovers and banners; 16px for modals. Round (full) only for count bubbles and the Ask Max button.
- **Shadows (Polaris tokens):**
  - Card: the bevel edge (inset, drawn above the content like Polaris ShadowBevel) plus `0 1px 0 rgba(26,26,26,.07)`.
  - Menus: shadow-300. Tooltips: shadow-400. Modals: shadow-600.
  - Buttons use Polaris' button bevels, with no gradients.
- **Buttons** (`Button`):
  - `primary`: #303030.
  - `secondary`: white with a bevel. This is the default.
  - `ghost`: Polaris tertiary, transparent.
  - `header`: flat #E3E3E3, for secondary actions in a page header, as in Shopify's "More actions ⌄".
  - Also `destructive`, `destructive-solid`, `link`.
  - `ai` looks like `secondary`.
- **Filters in toolbars:** `Select variant="button"`, which looks like a secondary button and sizes to its label. Use the `field` variant only inside forms.
- **Tabs / Segmented:** 28px, 12px/550, #303030 text; the selected tab gets a `rgba(0,0,0,.08)` fill. No underlines, no pills.
- **Checkbox, radio, switch:** the selected state is #303030.
- **Tooltips:** white with shadow-400, 13px text.
- **Modals:** a grey header bar (#F3F3F3) with a 14px/650 title, a 16px body, and the footer actions on the right.
- **Banner:** a white card with a coloured icon tile (info #91D0FF).
- **Page pattern:**
  - `PageHeader`: 16px from the top bar, then an optional icon, the title, and actions on the right 8px apart. It sits 12px above the content.
  - Content has 16px side padding.
  - `PageBody wide` = max 1200px (dashboards), `narrow` = 662px (forms); tables run full width.
  - Card gap 16px; metric grid gap 12px.
  - Lists inside cards use top dividers (#EBEBEB).
  - Charts: #EBEBEB horizontal grid, 12px #616161 axis labels.
- **Motion:** 120 / 180 / 240ms, no bounce and no scale on hover. Respect reduced motion.
- **Responsive:** 4 → 2 → 1 columns. Grid children need `min-w-0` or charts force sideways scrolling. The sidebar becomes a drawer; rows and card-header actions wrap on phones.
- **Originality:** never copy Shopify's logo, name, illustrations or assets. Only the visual language.

### What the owner liked and disliked
- **Disliked:**
  - v1/v2: messy layout, controls of different sizes, native browser dropdowns, wrong font.
  - The Attio-style rebuild: "I don't like the design and fonts and layouts."
  - Early Shopify restyles: font size, colour and style still not matching.
- **Liked:** the v1 feature set ("I like it") and the Shopify admin look in the screenshots. **Approved:** the Polaris restyle of the shell and Home (28 Sep 2026), shown side by side with the Shopify screenshot at the same scale.
- Wants **real dropdowns and menus** (Radix, done), **consistent control sizes** and **big-CRM organisation**.
- **Max must look and answer like Claude or ChatGPT.**

---

## 5. Status: finished, half-done and known bugs

### Finished (React app in this repo)
- Project setup: Vite, React, TypeScript, Tailwind v4 and Radix UI (via the `radix-ui` package), plus lucide-react, Zustand, React Router (hash routes), Recharts, cmdk, sonner and self-hosted Inter.
- The design-token system in `src/index.css`, with 4 themes, now on verified Polaris values (§4).
- Component library (`src/components/ui/*`), all restyled to Polaris: Button, Input/Textarea/Field, Select (field and button variants), Combobox, DropdownMenu, Popover, Dialog/Sheet, Tabs/Segmented, Switch/Checkbox/Radio/ChoiceRow/Progress/Slider/Kbd/Skeleton, Badge/Count, Avatar/AgentAvatar, Command, Table, Card/CardHeader/CardBody/EmptyState/**Banner**/PropertyList, Tooltip.
- `cn()` in `src/lib/utils.ts` knows the custom Tailwind names (`text-2xs`, `rounded-card`, `shadow-btn`…), so tailwind-merge doesn't drop them.
- App components: AppShell, TopBar, Sidebar, ThemeMenu, CommandPalette, PageHeader/Toolbar/PageBody/Section, StageTag, AgentChip, ContactChip, CampaignChip, Kpi, BarRow, and the AiMark/DirIcon/DirTag/PlatIcon/PlatBadge icons.
- The typed sample data (`src/data/seed.ts`, `types.ts`) and the store with the live simulation (`src/store/index.ts`).
- Modules: **Home, Max (page, panel and engine), Contacts (all tabs, dialogs, profile), Campaigns tiles.**

- **Typography and visual fidelity: resolved and approved** for the shell and Home (Round 5). The sidebar has nested sub-navigation.

### Half-done
- **Contacts, Max and Campaigns** use the new shared components, so they already look much closer. Their page-level layouts still carry older local styles, and each still needs its own Polaris pass. Examples: Contacts' own view tabs and toolbars, the search box, the table's sticky name column (it sets `bg-surface`, which hides row hover), `Toolbar` padding inside tabs, and the Max side-panel header.
- Campaigns: tiles only. The wizard and detail pages are stubs. The follow-up editor and LineList are written but unused.

### Not built (stub pages)
Get Started, Inbox, Campaign wizard, Campaign detail, Stages, Bookings, AI Agents (list and editor), Expenses, Reports, Settings, Pricing, Assigned to me.

### Known bugs and gaps
- Several rename/tag/new-folder actions use `window.prompt`. Replace them with proper dialogs.
- The Dark, Dark blue and Mixed themes have values for every new token, but have not been reviewed visually since the Polaris restyle.
- The Home filters scale numbers with a multiplier. The data isn't truly filtered.
- The Max engine is keyword-based. Unmatched text shows a "Build / Find / Analyze" clarifier.
- The bundle is about 1.1MB (a Vite warning). Consider route code-splitting.
- The "Fill missing" button on the contact profile only shows a toast.
- Mobile: Home was checked at 375px (no sideways scroll, rows wrap). Other screens are not checked yet.
- `vite.config.ts` uses `__dirname`; Vite warns that it should become `import.meta.dirname`. Harmless for now.
- Vercel deploy through the v0 connector failed with `403 Cannot create tokens for this app`. Previews were published as a claude.ai artifact instead: https://claude.ai/artifact/QvBoe5zLTRvrZBd68X26rr (private; the latest version is v3.2 plus the fixes in this handover). The owner can connect the repo to Vercel himself for automatic deploys.

---

## 6. What to build next (in order)

1. **Polaris pass on Contacts** (next): view tabs and search/filter row inside the table card, as in `03-segments-table.png` / `12-reports-table.png`; filter pills; toolbar selects as `variant="button"`; header secondary actions as `variant="header"`; the index table with the row hover fixed on the sticky column; the folders view; the profile page. Show the owner, get approval, commit.
2. **Polaris pass on Max** (page and side panel), then the **Campaigns** tiles page.
3. **Get Started** (onboarding cards grid, like `02-onboarding-cards.png`).
4. **Campaigns:** the wizard (0–9 with the journey tracker) and the detail page (all tabs and banners).
5. **Stages** (board, list, review, new-stage dialog, in/out tabs, follow-up stages).
6. **Inbox** (chat, email, calls, dial pad, composer, quotation).
7. **AI Agents** (types, tiles, leaderboard, editor, test and review panels, guided builder, creating animation).
8. **Bookings** (calendar views, dashboard, queries, setup and booking-settings pop-up).
9. **Assigned to me**, **Expenses**, **Reports**, **Settings**, **Pricing**.
10. Run the `consistent-ui` skill for a drift audit, review the dark themes, check mobile, split the bundle.

### Ideas discussed but not built
- Put the finished screens into **Figma** for the owner's team (the Figma connector and skills are available).
- A **backend phase** later: the first developer briefing doc has the module and backend structure. It is out of scope for now.
- Deploy to Vercel from the GitHub repo.
- Voice cloning, a live voice conversation with Max, a PDF/presentation export from Max, competitor research by Max. These are simulated only for now.

---

## 7. Everything else Claude Code must know

- **How to run:** `npm install`, then `npm run dev` (local preview on port 5173; `.claude/launch.json` has a `crewline-dev` entry) and `npm run build` (static output in `dist/`, hash routing, `base: './'`, so it works from any static host).
- **How to verify a screen visually (use this for every restyle):**
  1. Check the computed styles in the browser first (font family, size, weight, line height, letter spacing). Font first, spacing second.
  2. Capture the page at **device scale factor 1.25** and a 1532×720 viewport, so it matches the reference screenshots pixel for pixel. Headless Chrome/Edge: `--window-size=1532,720 --force-device-scale-factor=1.25 --screenshot`. Playwright: `deviceScaleFactor: 1.25`.
  3. Compare identical elements. Measuring the width and height of the same word ("Home", "Settings", "Search") is the most reliable test of font size and weight.
  4. Show the owner the reference and Crewline stacked in one image.
- **Owner's machine** (Windows 11, 125% scaling): Node.js 24 LTS and Git were installed on 28 Sep 2026. The local copy lives in `Downloads\crewline-handover\crewline`.
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
