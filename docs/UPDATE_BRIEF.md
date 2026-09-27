# BUILD BRIEF — Full Update of the Existing AI CRM Prototype

## 0. READ THIS FIRST

You already built a working prototype of this product in an earlier session. **Do not start from scratch.** Update the existing prototype so that 100% of it (the interface, the workflows, the settings, how everything works) matches this brief.

- Where this brief says something in the current prototype is "fine" or "good", **keep it** and improve it only where asked.
- Where this brief describes something new, **add it**.
- Where this brief describes a change, **replace** the current behaviour.
- Every detail below matters. Do not skip, simplify away or silently drop any item. If something is impossible in a prototype, still build the UI for it with realistic mock data and mark it clearly.
- Where the brief says "research similar software", look at leading global products in that category and add the options they have that are missing here, while keeping everything simple.

### What the product is
An AI-agent CRM that **replaces a business's whole sales team, receptionist team and booking team** with AI agents that call, text and email. It is sold as SaaS to thousands of businesses. Each business has its own workspace/account.

### The number-one rule: user-friendly above everything
- About 90% of users are non-technical. They know their business, not workflows or prompts.
- **Even a 15-year-old must be able to understand the whole interface and run campaigns.**
- Setting up an agent or a campaign should take one to two minutes: plug and play.
- At the same time the system must work **100% accurately**. Nothing can be missing. Simple on the surface, complete underneath.
- Keep everything organised and categorised. Never messy.

---

## 1. GLOBAL PRINCIPLES (apply across the whole product)

### 1.1 AI everywhere
- Almost every screen, section and field has an AI option: **"Let AI handle this"**, **"Let AI decide"**, **"Do with AI"**, **"Improve with AI"**, **"Ask AI"**, **"Talk to AI"**, **"Help with AI"**, **"Get a report with AI"**, **"Analyze with AI"**. The goal is that no user ever feels stuck.
- Wherever AI does the work, show a consistent **AI icon** so users know that action is done by AI.
- AI input is always **text, voice message, or attachments (files, pictures, screenshots)**. Voice is preferred and must be available everywhere.
- The AI assistant for the whole product is called **Max** (see Section 4).
- The system should proactively pop up **optimization suggestions** anywhere something is wrong, missing, not optimized or incorrect: in agents, campaigns, and across the whole software.

### 1.2 Everything is live and real-time
- Any change, conversation, stage move, booking or update must reflect **everywhere in the software in real time**.
- Every AI agent action must always end by **updating the database**. The core asset is an **enriched, history-based database**.

### 1.3 Everything is linked and clickable
- A user can click anything and get to its detail: a contact name opens the contact profile; an agent name opens the agent; a channel opens the conversation; a DNC count opens the DNC list; and so on. Hovering over icons shows a tooltip with a name and short description.

### 1.4 Inbound vs outbound everywhere
- There are **two campaign types**:
  - **Outbound**: we broadcast and reach out to customers.
  - **Inbound**: we run marketing/ads/landing pages and people call, message or email us.
- Inbound/outbound must be selectable, visible and filterable wherever it matters: campaigns, agents, stages, follow-ups, inbox, contacts, home, reports. **Reports and statistics must be separable** (e.g. outbound campaign report vs inbound campaign report).
- Use a **distinct inbound icon and outbound icon**. These must NOT look like the normal incoming/outgoing call or message arrows.

### 1.5 "Assigned to me" / Review / notifications
- Anything the AI cannot decide, or that needs a human (unclear stage, unclear qualification, human handoff, angry customer, appointment request in a non-booking campaign, etc.), goes to a **review / "Assigned to me"** area with a clear description, and triggers a **notification** (including inside the relevant chat).

### 1.6 Multi-tenant agents
- Core agent prompts are written by us (the product owner) in the backend and are **hidden** from users.
- Each agent type has default agents that are identical for every account.
- When a user edits an agent, the edit applies **only inside their own account**. Other users still see the default agent.
- What users change is the campaign-level layer: campaign information, script, criteria, dos and don'ts, how to respond and speak, and follow-up communication. The core agent stays the same.

---

## 2. NAVIGATION & MAIN MENU

### 2.1 Sidebar
- **Retractable**: expanded shows icons + names; collapsed shows icons only, and **hovering an icon pops up its name**. The user chooses. Make it interactive.

### 2.2 Main menu items
- **Get Started** (first thing for new accounts; see Section 3)
- **Home** (opens on Max chat; see Section 5)
- **Max** (AI assistant, full-screen chat; see Section 4)
- **Inbox**
- **Contacts** (includes the Do-Not-Contact list inside it, not as a separate menu item)
- **Campaigns**
- **Stages** (renamed from "Pipeline")
- **Bookings** (renamed from "Calendar")
- **AI Agents**
- **Expenses** (new)
- **Reports** (new, placed directly **above Settings**)
- **Settings**
- **Pricing / Packages** page (new; see Section 15)

---

## 3. GET STARTED (first experience for a new account)

- When a new user logs in, the first thing they see is an AI-guided onboarding: **"Hello, let's get started."** It is also the first option in the dashboard and the first option in settings.
- Steps (add any other necessary ones):
  1. **Recommended: install the web app.**
  2. **Add contact data** (add leads).
  3. **Make a campaign.**
  4. **Connect channels** to unify messaging and calls (WhatsApp, Messenger, etc.).
  5. **Learn how stages work, then set your stages** to your needs. *(The transcript says "steps"; this is read as "stages".)*
  6. **Set up AI agents.**
  7. **Invite teammates.**
- **Resources**: watch intro, contact support, and similar.
- Every step has a **"Get it done with AI"** option: the user describes their business and the AI proposes the steps, or the system builds them itself.

---

## 4. MAX — THE AI ASSISTANT (the brain / "father of all agents")

### 4.1 What Max is
- Max is not just a chatbot. It is an **AI agent that effectively owns and operates the software** for the user. Everything means everything: it can read, analyze, create, change, add and delete anything in the software.
- Works like ChatGPT / Claude in conversation style, but more useful and interactive.
- Input: voice messages, live voice conversation, text, attached files, photos, screenshots.
- Output: detailed answers **with visuals**, and when useful full **presentations, PDFs, documents** or text, whichever the user prefers.
- Can also go **outside the software**, e.g. "What's the best campaign I could run? Look at what competitors are doing" → researches and returns a full presentation.

### 4.2 Where Max appears
- **Main menu item "Max"**: full ChatGPT-style interface, but in the product's light theme (white), not dark like ChatGPT. Chat history, conversations and results are saved.
- **Home page opens with the Max chat** (see Section 5).
- **Side-panel pop-up** available on every screen.

### 4.3 What Max can do (examples, not a limit)
- Change the whole software theme to dark or light.
- "Find me the people in Brooklyn" → returns them from the database with the count.
- **Build a complete campaign in chat.** Instead of the user going through the campaign screens, Max asks the questions and **shows the same setting options, buttons and choices inline in the chat** (the way Claude presents options). It does all settings in the backend. If the user already gave a piece of information, Max does not ask again; it just confirms it. When done: "The campaign is done. It's live." The campaign then appears in Campaigns.
- Add knowledge bases, edit agents, set stages, anything that exists in settings.
- Analyze a report: user gives Max a report and says "this is the problem, what do you suggest?" Max suggests fixes. **Before making any change, Max lists exactly what it will change and waits for approval.** On "OK, go ahead" it applies the changes and the campaign goes live.

### 4.4 Guidance modes
When the user wants to do something (e.g. make a campaign), Max asks:
- "Would you like to do it **manually**, should I **guide you**, or should I **do it for you**?"
- **Guided mode**: the user goes through the real screens and Max stays open in a side pop-up, telling them step by step ("toggle this off", "toggle this on").

---

## 5. HOME

- **Home opens with the Max chat interface** instead of the current "do it manually" start. Max greets the user and asks their objective ("What do you want to do?"). The home dashboard sits **below** the chat.
- **Finish setup / needs attention panel** up front: anything missing, anything needing an update, anything the AI thinks should be optimized, any step the user must take. It keeps popping up until resolved, because the backend continuously analyzes the campaigns. Include a **"Let AI finish it with me"** action.
- **Current metrics are fine** (conversations today, calls made, answered, text messages, appointments and orders booked, sales closed). Keep them and add more panels and details.
- **Filters** (multiple at the same time; default = all): campaign, inbound/outbound, **data files / lead folders** (e.g. see how a 20,000-lead folder is performing).
- **Hover** on any number or element shows details (e.g. booking details).
- **Fully customizable**: the user chooses what to show and what to hide. Research dashboards from global software.
- The feel: the owner oversees the AI team from here the same way they would oversee a human team.

---

## 6. AI AGENTS

### 6.1 Agent types
Six agent types, each shown as a button/tab:
1. **Sales agent**
2. **Marketing agent**
3. **Support agent**
4. **Tech support agent**
5. **Receptionist agent**
6. **Finance agent** (invoicing, billing)

- **All agents can call, text and email.** The old split into separate "text agents" and "calling agents" is replaced by this.
- Each type has **3 default agents** (e.g. Sales: **Sarah, Ellie, Robert**; Tech: three agents; and so on). Defaults can be edited, optimized, restyled and re-prompted, or the user can create a new agent.
- Each default agent has its own default voice and style (e.g. Sarah female voice, Robert male voice, Ellie a fun/funky voice).

### 6.2 Roles and how agents work together
- **Marketing agent**: broadcasting. It can be assigned to a campaign, chats or specific people to send messages and calls for promotions, deals, offers, review requests and broadcasts. It approaches customers first ("everything is started by the marketing agent") and, at the end of any conversation, collects the person's name and details. After the sales agent closes a sale, the marketing agent follows up for **referrals** ("if you have any references…") and follows its instructions (e.g. "thanks, stay connected, follow our channel").
- **Sales agent**: qualifies and closes sales.
- **Support agent**: handles any problem, including after-sales service, and **routes** it: billing → Finance agent; technical → Tech support agent; sales → Sales agent.
- **Receptionist agent**: calls, texts, queries and appointment booking. It **automatically takes over** booking requests (see 6.12).
- **Tech support agent**: resolves technical queries, and can make HTTP requests (see 6.6).
- **Finance agent**: invoicing, billing.
- **All agents are aware of every conversation in the ecosystem.** They leave comments and footprints about what happened, so the user can track every single conversation and action.
- All agents share the same base settings, toggles and buttons. Some (especially **Tech support** and **Finance**) need **extra settings**. Research comparable software for what these agents require and add those options.

### 6.3 Agent list screen
- Clicking an agent type shows its agents as **tiles**. Settings and fields sit below the tiles (similar to respond.io).
- Each tile shows performance so the user can pick the best agent:
  - Conversion rate, success rate, number of messages, replies, calls, and sales closed (sales agent).
  - Tech support: queries resolved, success rate.
  - Receptionist: calls handled, texts responded, appointments booked.
  - Add any other metric a user needs to compare agents.
- **"More details"** shows the agent's history: campaign types it worked on (e.g. telecom campaigns), calling, texting, conversion rate, etc.
- **Data privacy**: a user sees the detailed campaign data only for **their own workspace**. Everyone, including brand-new users, also sees the agent's **overall global score** (success rate, conversion rate) across the platform.
- **"Assign to"** on each agent: assign to a campaign, specific chats, ad campaigns, or anything else, and it deploys there.
- **Agent performance / leaderboard**: a separate view with a leaderboard of overall performance and filters to check every aspect.

### 6.4 Agent detail / edit screen
The current screen (e.g. "Sara — voice agent") is a good base. Keep it and add everything below.
- **Header**: name, type, active campaign(s), and **version** (e.g. "Voice agent · Metro Mobile · v3").
- **Type**: e.g. voice agent vs chat agent. The user can switch Sara from voice to chat, but must rename the agent so there is no confusion about what Sara is.
- **Campaigns**: show which campaigns the agent is active on. An agent can be used on any campaign; do not lock it to one.
- **Inbound / outbound applicability**: outbound only, inbound only, or both.
- **Languages**: any language.
- **Voices**: choose any voice; **clone voices** (including the user's own); powered by ElevenLabs or another external voice API.
- **Style**: how the agent talks and its conversation style, set separately **per channel** (call, text, email).
- **Instructions / prompt**: name, instructions, **templates** (pre-written prompts from our backend that the user can use as they are, edit, or replace with their own), **"Take help from AI" / "Optimize with AI"** (voice or text → AI writes the prompt in our standard structure), and default prompts and voices per type (e.g. receptionist defaults).
- **Job section**: include everything in 6.8. The current fields (main goal, how to do it, what they know) are good; keep them.
- **Q&A**: add question-and-answer pairs with conditions ("if the customer asks this → answer this"). Keep it simple.
- **What they know (knowledge)**: website links, folders, files, pictures and **videos**.
- **What they can do**: many actions, **grouped into categories** (e.g. calling, messaging). Add more options based on your understanding.
- **Rules and handover**: add more options, **categorized**.
- **Knowledge base** (at the end of every agent; separate per agent): one **"Add knowledge base"** button. Upload files, paste text, and add website links, all at once. It works like saving everything into one folder and **displays as folders**.
- **Always-available "Improve with AI / Do with AI"** so the bot is built to standard.
- **Versioning**: every saved change creates a new version (v1, v2, v3, v4 …). A **version dropdown sits right before "Save changes"**. The user can switch between versions and delete old ones. Versions are labelled.

### 6.5 Right-side panels: Test and Review
Side by side on the right of the agent screen:
- **Test / Preview**: test the agent live by texting, sending a voice message, or calling it (all types: sales, tech, receptionist, etc.). The agent responds like it would to a real customer.
- **Review**: AI reviews the agent's prompt and instructions and gives a **score / percentage** showing how optimized and "good to go" it is, with suggestions. The user can optimize further themselves.
- During testing, the AI also tells the user **what is wrong and where to fix it**, e.g. "your qualifying criteria are not clear", "the agent sounds too aggressive in sales", "tone problem". It analyzes the backend prompt (which is filled from the user's answers), the test conversations and the real conversations.

### 6.6 Agent settings (toggles and actions)
Each setting is a simple **on/off toggle** the user can activate or deactivate:
- **Update lead stages** based on the conversation.
- **Update contact fields** when new information comes up.
- **Update tags** based on the conversation.
- **Add comments** on conversations or anywhere, for other agents or for the team.
- **Handle calls** (yes/no).
- **Make HTTP request** (mainly for the Tech agent). The AI agent can trigger external actions or fetch data via API. Full configuration: **action name, prompt** (when to use it), **add fields, request configuration**: method, URL, parameters, headers, key–value parameters, and everything else standard.
- **Knowledge base** at the end.
- **Inbound / outbound** applicability.
- **Appointment booking** capability (see 6.12).
- **Human / agent handoff at a stage**: toggle on, then choose the stage (e.g. submitted, booked, any stage). At that stage, choose one of three: **continue with the same agent**, **assign to another agent**, or **assign to a human**.
- Add any other settings needed so nothing is missed.

### 6.7 Follow-up settings (in every agent)
- A **"Follow-up settings"** button in every agent. Fully customizable sequence, e.g.: no reply to text → when to call; no answer to call → when to email; no reply to email → when to call; and so on.
- Choose **which agent** calls, texts or emails at each step.
- Choose **templates** at each step (templates can be used in the prompt, or here).
- Set **timing, structure and behaviour**.
- **Drop-lead rule**: if the customer does not reply or respond under a condition the user sets, the agent drops the lead and stops following up with that customer.
- **"Let AI handle this"** as the default option for users who don't know what to choose.
- **Priority rule**: the same follow-up settings exist in the **Campaign** section. **Campaign follow-up settings override agent follow-up settings** for that campaign.
- Follow-up settings are set **separately for inbound and outbound** (see Stages 7.6).

### 6.8 Creating / editing an agent with AI (guided agent builder)
Writing prompts is too hard for users, so:
- Core prompts are written by us, hidden and default (see 1.6).
- The user picks a default agent (e.g. Sarah) and adds their business information: what they sell, the script, qualifying criteria, etc.
- The **first option** is **"Create / edit your agent with AI"**. It opens a ChatGPT/Claude-style chat (pop-up or right-side panel, whichever fits standards). Voice is preferred; text also works. This conversation is powered directly by the Claude (or OpenAI) API, so it is fully interactive. The customer can say anything, and the AI presents **multiple options** the way Claude does.
- The AI asks questions **one by one**. After each answer, especially long spoken ones, it **writes back what it understood and asks "Am I correct?"**. The user confirms or modifies. **Verification is very important.**
- Not every question is needed for every business (e.g. billing type). The AI decides which ones apply. Anything extra the customer says that is not in our backend prompt structure is **still added**.

**Question set** (also available as normal form options for users who prefer to answer one by one):
1. **Primary purpose** (single or multiple choice): generate leads, qualify leads, sell products, book appointments, schedule installation, follow up with leads, reactivate old leads, upsell existing customers, cross-sell products, collect customer information, transfer qualified leads to a human agent, other. Short clarifying questions are allowed.
2. **Main goal**: qualify the lead, make the sale, book an appointment, generate a callback, transfer to a human, other.
3. **Target customer**: individual, business, both.
4. **Anyone you don't want to target?** Yes/no; if yes, who.
5. **What products are you selling?** (voice/text)
6. **Pricing**: voice, text, or **a picture**. The AI evaluates the picture, states what it understood ("this is the pricing…"), and asks the user to verify.
7. **Billing type**: one-time, monthly, annual (only if relevant).
8. **Who is eligible** for the product; **who is not eligible**; **important product information**.
9. **Knowledge base**: the user can attach files; the AI evaluates them too.
10. **Qualifying criteria**: the user speaks freely → the AI writes it back → verify/modify. **Importance** of each criterion: required, preferred, optional. **Qualifying question logic.**
11. **Disqualifying criteria** (same format).
12. **Qualifying questions**, and **what information to collect** (phone number, etc.). Each question can be marked **required, optional or not required**.
13. **Maximum attempts** (how many times to ask): once, twice, three times, until answered, custom.
14. **Question order.**
15. **Conditional questions** (e.g. "Do you have internet?" yes → ask X / no → ask Y).
16. **Product recommendation rules.**
17. **What happens when qualified.** This is mostly handled by **stages**, which are set while creating the agent. The prompt also states the conditions for qualified, cancelled and every other stage.
18. **What happens when disqualified**: send notification, add tag, add reason, send follow-up, end conversation, update. The agent always updates the database at the end.
19. **What if the agent can't determine qualification**: ask another qualifying question, continue the conversation, **mark as "Needs review"** (goes to the Needs Review section), transfer to a human, disqualify, stop qualification.
20. **Human handoff triggers**: customer asks for a human, customer is angry, customer requests a manager, the agent doesn't know the answer, required information can't be obtained, qualification is unclear. These go to the **"Assigned to you" / review** section for the user to handle manually. **Who receives the transfer**: sales team, specific user, department.
21. **Restrictions** (what the agent must never do): change pricing, offer discounts, promise availability, and more.
22. **Follow-up rules** (e.g. first follow-up by email) and follow-up stages.
23. **Conversational behaviour**: professional, friendly, casual. **Response style** (defaulted but changeable). **Sales posture**: salesperson, consultative, direct, neutral.
24. **Knowledge and information.**
25. **Compliance and sensitive information.**
26. **Agent behaviour summary**: a final summary of how the agent will behave.

**Build order** when creating an agent:
1. **Stages** (first, before the prompt)
2. **Script** (optional)
3. **Knowledge base**: upload files, or "Create your knowledge base with AI" by voice or text.
4. Remaining information (the questions above)

- **Gating**: the user cannot move forward without the required information. A pop-up ("Update your agent") explains this. Clicking it opens the questions; the user either chats with the AI or answers them one by one.
- **Viewing later**: every answer is stored and viewable/editable anytime. E.g. clicking "Qualifying criteria" shows all criteria as a list where each entry was added line by line (type a sentence, press Enter → item 1; type the next → item 2). The same pattern applies to every section.

### 6.9 Analyze with AI
- An **"Analyze with AI"** button on a campaign, a chat, or an agent. The AI reads all campaign messages and agent responses and produces a **brief report**: what is happening, what the mistakes are, what happens most often, shown as a full dashboard / flowchart with the report and **optimization suggestions**.

### 6.10 Visual inspiration for agent creation ONLY
- For the **agent creation / agent setup flow only**, take visual and animation inspiration from **Monday.com (Monday CRM)**'s agent creation: elegant graphics and a "Creating agent…" animation when an agent is being created.
- This applies only to the look and animation of agent creation. The structure in this brief stays the same, and the rest of the product follows the design system in Section 16.
- If this isn't achievable, leave it.

### 6.11 Research
- Look at international products for the best, easiest, most accurate and most efficient way to create agents, and add those options, always keeping it user-friendly.

### 6.12 Appointment booking capability (agents AND campaigns)
- A toggle: **this agent / this campaign books appointments**. When enabled, a **settings pop-up** opens:
  - **Services**: typed by the user; each service can have length/duration, staff/doctor name, gap/buffer between bookings, pricing, and any other detail needed for that business (doctor, restaurant, any business). The services section must be **fully customizable** because it differs for every business.
  - **Capacity / availability**: e.g. a restaurant with 10 tables; as tables are taken, the AI agent sees remaining availability and books accordingly.
  - **Opening hours and opening days; availability.**
  - **Reminders.**
  - **Self-booking page** with **copy code / embeddable widget** for the user's website or any profile.
  - **Sync** with Google Calendar, Google Sheets, Excel, etc.
  - The user can explain their whole setup in **one voice or text message** and the AI configures it.
  - Research what else booking software includes and add it.
- Every booking, cancellation or change updates the **database and calendar in real time**.
- **Receptionist auto-takeover**: in any campaign (e.g. an outbound sales campaign), if a customer wants an appointment or consultation, the **receptionist agent steps in automatically, even if it wasn't assigned**. A notification appears ("Customer X wants an appointment. Handle manually or assign to receptionist?") in **Assigned to me** and inside the chat. The receptionist books the appointment and updates the calendar.
- This setting must exist in **both the agent section and the campaign section**.

---

## 7. STAGES (renamed from "Pipeline")

### 7.1 Keep what works
- The **board view** is good: a user can drag any customer to any stage manually.
- The **campaign switcher** (telecom, dental, …) is good.
- The **list view** is good.
- The **edit** option is good.

### 7.2 Live movement
- The user sees stages change **in real time** as AI agents work (e.g. Umar Ali moves from **New** to **Contacted** the moment the agent messages him), plus a live activity feed.

### 7.3 "New stage" button (currently missing)
- Same style as "New campaign". Set: **name, color, and/or icon** (either one, both editable).
- **Stage criteria**: when does a lead enter this stage? Not a single sentence or dropdown. Criteria are written as **multiple sentence entries**, added like tags (type a sentence, press Enter, add the next), but as full sentences, not hashtags. E.g. for "Qualified" in real estate: "customer is interested", "customer says OK, go ahead", "customer says yes, I need this", "customer meets all qualifying questions", and so on.
- **Mapping logic**: the AI maps stages from the conversation across email, call and chat, and **always follows the latest conversation**. E.g. at 4:30 the customer says "Yes, I'm interested" → Booked/Qualified; five minutes later they say "No, I need time to think" → moves to **Pending**.
- **Human conversations**: the same mapping runs when a human is chatting. When a lead meets a stage's criteria, a **pop-up appears in the human's chat**: "This lead qualifies for stage X. Move it?" Yes → moved. Otherwise it stays **Pending** (visible in Pending).
- **"Assign to"** after creating stages: assign them to one campaign, multiple campaigns, or all. That campaign then follows those stages. Stages are also editable inside each campaign.

### 7.4 List view columns
- **Name, Stage, Channel(s)** contacted from (text / call / email, show all that apply), **Agent, Last update**.
- **Value / Revenue**: shown **only** at the revenue-generating stage (e.g. Installed / Done). Otherwise blank. It can be labelled "Revenue".
- **Hover a channel** → shows which agents talked to the contact on it. **Click the channel** → opens that conversation.
- **Click the agent** → opens the agent page. **Click the name** → opens contact details.

### 7.5 Review section ("Review for me" / "Assigned to me"), within Stages
- When the AI can't confidently assign a stage, it sends the lead here with a **description** ("We talked to this customer; they said X, Y, Z. Please choose the stage.").
- Shows name and all details, **campaign**, conversation (click to open), **call recording** (listen), **call summary and transcript**.
- The user picks the stage from a **dropdown** → the stage updates, the item leaves the list, and **the AI learns** from the decision so it doesn't ask again for similar cases.
- Place it wherever it fits well.

### 7.6 Inbound vs outbound stages
- Two tabs at the top: **Outbound stages** / **Inbound stages**, each viewable separately.
- **One click to copy** the same stages from one to the other, so users don't rebuild them.
- The same inbound/outbound split applies to **follow-up stages, follow-up conditions and follow-up instructions**.

---

## 8. CONTACTS (the database with history)

### 8.1 What it holds
- Every detail about every customer: name, phone, email, address, last contacted, last purchase, campaign, stage, and many more fields.
- **Rows view** with a **compact row height** so many details are visible at once.
- Show **Stage and Campaign** columns. E.g. Priya Chen: Interested / Booked / Installed, and **in which campaign**, plus the **date sold**.
- **Hover a stage** (e.g. "Order booked") → a small pop-up shows the **campaign** and the **lead source / origin**: imported file, web form, referral, landing page, ad campaign, inbound, other.

### 8.2 Data-quality tiles
- **Missing details** (replace the current "missing an email" tile): covers all fields. Click → breakdown, e.g. "23 names missing, 88 emails missing, 42 addresses missing". Actions: **add manually** or **"Fill missing data with AI"** (a backend scraping tool finds and matches the information; if it can't find it, the field stays missing).
- **Duplicates**, e.g. "1,202 duplicates detected". Click → full list. Options: **overwrite, merge, skip**, plus other smart options. Nothing may be lost.
- Add more tiles like these for the user's convenience.

### 8.3 Contact profile
- **Click a name** → the full profile and **complete journey**: every time they were contacted, every sale, every conversation, previous chats, **call recordings**, everything.
- **Click a number** → dial it yourself, or **assign an AI agent to call right away**. The database updates immediately (e.g. "Contacted").
- **History**: easy to read, colour-coded, grouped (Today, Yesterday, …), with icons. **Hovering an icon** shows its name and a short description (e.g. chat icon → "Chat" + summary; purchase/sale icon → purchase details). Purchases and sales appear in history here, in the database and in the inbox contact panel.

### 8.4 Add, import, custom fields
- **Add contact**: fill in any known details. **Create custom fields** on the fly (text or dropdown), e.g. address, stage, anything.
- **Import**: files and lists in any format.

### 8.5 Folders (Windows-style)
- Toggle between **Rows view** and **Folders view** in one click.
- Imported files become folders (e.g. "Mississauga Leads"), and their leads also appear in the rows view.
- **Filter → save as folder**: e.g. 50,000 leads → apply several filters → 20,000 remain → **right-click → save to folder**, name/rename it.
- **Folders and subfolders**, like Windows. **Groups**, e.g. by country: Canada, US, Pakistan → inside Canada: Mississauga Leads, Telecom Leads, Toronto Leads. Structure is the user's choice.
- Folders store **date and time saved**; sort folders by name, date, etc.
- **Right-click a folder → "Start campaign"** → goes to Campaigns with that folder pre-selected.
- **Double-click a folder** → opens only those leads in the rows view → apply more filters (add/remove) → **Save** → choose **"Save as new folder"** (new name) or **"Save to existing folder"**.
- The rows view header shows **which folder or campaign is open**. Clicking the **×** clears it and shows the whole database.
- **Recommended workflow**: import → build the folder → go to Campaigns → pick the folder. Campaigns can also jump straight into Contacts to filter.

### 8.6 Search and filters
- A **large search bar** that searches by anything.
- **Filters** by field: name, phone, email, zip, neighbourhood, last purchase, stage, lead source, **inbound / outbound / source**, and more. Improve the existing ones.
- Filters are fully editable: type **multiple zip codes**, **multiple addresses**, multi-select, add several filters at once, add and delete easily.
- **"Build filters with AI"** (AI icon): type or speak, e.g. "all women in Mississauga who have emails" or "…who bought in the past 3 months". The AI confirms or pushes back if something is missing, applies the filters, shows the matches, and offers to **save them as a folder**.

### 8.7 Do-Not-Contact (DNC) list, inside Contacts
- A DNC / Do-Not-Contact list (litigators, opt-outs, etc.) **inside the Contacts section**, not a separate main-menu item.
- Works like Contacts: import files, add contacts one by one, with details and comments.
- **In campaigns**: DNC numbers in a campaign list are **skipped automatically**. The campaign shows which numbers were skipped, with a one-click **"Proceed anyway / Send anyway"** option. Clicking the list opens the DNC list in Contacts.

### 8.8 Inbound leads and lead source
- Many leads arrive from **inbound** (landing pages, ads, etc.). Show them with their **lead source**.
- Lead sources are configurable in settings.
- It must always be clear whether a lead came from inbound or was uploaded. Filterable, and visible in the dashboard and everywhere relevant.

### 8.9 Intelligent database hygiene
- **Dead-number rules**, set in Contacts settings the same way stages and follow-ups are set. E.g. "not replied 5 times", "never answered in 3 outbound attempts". Multiple conditions allowed. Matching contacts move to **Dead numbers / Dead customers**.
- **Lead scoring**: responsive vs non-responsive. The database flags "not good", "dead" and "not responding" and organizes them in tiles or folders (your choice, but organized, not messy).
- **Dead list actions**: **remove** (with confirmation → deleted) or **keep**, to keep the database fresh.
- **Find updated info with AI**: one click scrapes for alternatives. E.g. Ahmed Umar is dead; the scraper finds the same name and address with a new number → "New number found. Update?" → yes → database updated.
- The database should be so intelligent that no human is needed. Add any other smart features.

---

## 9. CAMPAIGNS

### 9.1 Campaign tiles
- Current tiles (people, replied, booked, revenue) are fine. Add more details if useful.
- The user can **customize tile metrics** (add or remove, and swap any metric for any stage).
- Every tile shows **Inbound / Outbound** clearly.

### 9.2 New campaign wizard
A step-by-step flow with a **journey tracker on the right** (steps tick off with a completion %). Very easy, but nothing from the agent section may be missing.

0. **Campaign type**: **Outbound**, **Inbound**, or **both**.
   - Inbound shows subtypes, e.g. **Appointment booking campaign**, **Inbound ad campaign**, etc.
1. **Contacts**: choose a **saved folder/list** from Contacts, **or** go to the database and select/filter manually.
2. **How to reach them**: channel choices only (no message typing here; remove the current text box): **Text, Call, Email, WhatsApp, other channels (Messenger, etc.)**. Pick one, several, or all.
3. **Stages**: set or build stages here (the stage builder from Section 7). Then Next.
4. **Agents**: the agent screen appears. Pick agents per type from tiles showing their stats. Assign **multiple agents** (texting, calling, etc.).
5. **Timing / follow-up**: follow-up settings (how and when to follow up, what to do). These **override** the agents' own follow-up settings.
6. **Campaign details / knowledge** (name it whatever fits):
   - Toggle up front: **"This campaign does appointment booking"** → the booking settings from 6.12.
   - Qualification criteria, disqualification criteria, script, knowledge base, dos and don'ts, and everything from the agent builder (6.8).
   - **Opening templates per channel** (e.g. the first text message), with an **AI button** to write them. Call information, email information, WhatsApp information.
   - Mediums are **call, text and email**; "text" can go out on any channel (phone/SMS, WhatsApp, Messenger, …).
7. **Products & revenue**: see 9.5.
8. **Schedule**: **go live now**, or schedule; set agent **working hours** (start and stop); pick **days from a calendar**. Add more options.
9. **Review & launch**: then it's live.

### 9.3 Campaign detail view
The current tabs (Dashboard, People, Conversations, Agents, Steps/Stages, Settings) are fine. Make it much more detailed, because **per-campaign reporting and comparison live here**.
- **Metrics row** (people, reached, replied, interested, booked, revenue): **customizable**. Replace any metric with any stage.
- **Stage breakdown** below: fine.
- **Open board**: good; make it more polished and user-friendly.
- **Bookings per day**: fine. **Hover** shows exact numbers.
- **By channel**: fine (booked and cost per channel).
- **A/B testing**: which message, call script and agent is winning.
- **Ask AI in the header**, e.g. "In the telecom campaign, which message is winning? Which call script? Which agent? Which day had the most bookings?" The AI acts as the campaign manager and answers in chat for users who don't want dashboards. It can also build campaigns.
- **People**: fine.
- **Conversations**: filter **live / past / both**.
- **Agents**: clickable, full details.
- **Stages/Steps**: modify anytime.
- **Settings**: opens the **same wizard screens**. Click any step (stages, agents, campaign details, database, anything) to edit it. Every setting must be editable after launch.
- **Add more leads** to a running campaign (e.g. 100 leads, then add another 100) instead of creating a new campaign.
- **Analyze with AI** (see 6.9).
- **DNC skipped list** with "Proceed anyway" (see 8.7).
- **Receptionist auto-takeover** for booking requests (see 6.12).

### 9.4 Inbound / outbound
- Selectable when creating, shown on tiles, and used wherever differentiation is needed (settings, reports, stats).

### 9.5 Products, value and revenue
- In the wizard, a **product value** step: create products and categories/sub-products, give each a **value**, and choose the **currency** (dollars, rupees, etc.). Save.
- Example (telecom): 20 installs don't all have the same value. Phone line = $20, internet = $50, TV = $10.
- Products are **linked to stages**. The user chooses **which stage triggers revenue**. It can be any stage (e.g. "Installed", or "Booked" if the business earns at booking), not necessarily the last one.
- **Cancellation rules**: if an order is cancelled, revenue is subtracted **partially** or **fully** (terminated). The user chooses.
- Must be simple enough for a child. Add it anywhere else it's needed.

---

## 10. INBOX

### 10.1 Overall model
- Like **Meta Business Suite**: every conversation from every platform in one place (TikTok, Instagram, Messenger, Facebook, WhatsApp, SMS, …), each showing the **platform icon**.
- Each conversation also shows: **agent name**, **campaign name**, **lead folder name** (short), and the **inbound/outbound icon**.

### 10.2 Structure and filters
- **Top-level buttons above the search box: Chat · Email · Calls.** Each opens its own screen.
- Inside each: **All / Inbound / Outbound**.
- Then **platform filters**: replace the current "All, Needs a person, Unread, SMS" tabs with **platform icons** (WhatsApp, TikTok, Instagram, SMS, …) as **checkboxes**. Check = include, uncheck = exclude, "All" = everything.
- Example: Chat → Outbound → WhatsApp + SMS + Instagram.
- Search anything.

### 10.3 Chat screen (WhatsApp-style)
- **Bug fix**: only the **chat pane scrolls**, not the whole page.
- Looks and works like WhatsApp: **one tick** = sent, **two ticks** = delivered, **blue ticks** = read, on both sides.
- **In-chat system events** like WhatsApp's notices, e.g. "Stage moved to Interested by Sarah · 4:32 PM". This is good; make it more visual and interactive. **Stage changes appear in the chat in real time.**
- **Calls inside the chat thread**: listen to the recording, read the AI summary, open the transcript.
- **Take over / assign**: good; keep it, fully interactive.
- **Human stage pop-up**: when a human-handled lead meets a stage's criteria, prompt to move it (see 7.3).
- Receptionist / booking notifications appear in the chat (see 6.12).
- *(The transcript's sentence "and at the right side I would say…" was cut off. Keep the current right panel and improve it per 10.6.)*

### 10.4 Calls screen
- Call log (who called, etc.) and a **full calling screen with a dial pad**, like **8x8 / OpenPhone**. Dial manually, or **assign the call to an AI agent**.

### 10.5 Email screen
- As easy as **Gmail**: inbox/outbox, click to open full details.
- **Full composer** (not the current small pop-up): From, To, CC, Subject, body, attachments. It must have everything a standard email client has.

### 10.6 Manual outreach from the inbox
- **Start a chat / send an SMS**, or send on the current channel (e.g. a WhatsApp message from the WhatsApp view), with a proper full screen like OpenPhone / 8x8.
- Each outreach can be **sent manually** or **assigned to an AI agent + a campaign**, and the agent then follows that campaign's instructions. The same applies to email and calls.
- Sending from the contact details panel can stay, but: **text → full interactive chat screen**, **call → full calling screen with dial pad**, **email → full Gmail-style composer**.
- **Book an appointment** from here, with full booking details.
- **Send a quotation** in full detail: customize anything, attach pictures, choose to send by email or text.
- **Record as sale / purchase**; it appears in history.

### 10.7 Right panel: contact details
- Current contact details are fine. Also show the **campaign** and **lead folder** of the contact I'm talking to.
- **History** redesigned as in 8.3 (colours, Today/Yesterday grouping, icons with hover labels, purchases/sales included).
- Receptionist **queries** are marked with a distinct **query icon** (see 11.4).

### 10.8 AI
- "Handle with AI" and the other AI options everywhere they're needed.

---

## 11. BOOKINGS (renamed from "Calendar")

### 11.1 Calendar
- **Day / Week / Month** views, a **date filter**, and other filters.
- Shows past data: when it was booked, when it was delivered, when the customer arrived.
- Mark **Arrived** and **Completed** (e.g. "Consultation completed / Booking completed"). The colour changes, it stays in history, and the database updates everywhere.
- Very interactive and attractive, with all the features of **Google Calendar and Calendly** and other major booking software, but simpler, so users don't hunt around.

### 11.2 Campaign selector
- A **campaign selector at the top**. Bookings, **services, hours** and all settings shown are for that campaign (e.g. telecom has its own services and hours; another campaign has different ones).

### 11.3 New booking (manual)
- Everything needed: campaign, business, person, service, time, and any other required detail. User-friendly but complete.
- **Confirmation messages** (setting): send by **text, email and/or WhatsApp**. Pick one, several, or all.

### 11.4 Bookings dashboard
- A full dashboard/table: bookings **today**, **requests** (want to book), **booked**, **cancelled**, etc.
- Filters: today, yesterday, last 30 days, custom.
- **Queries**: when someone calls or texts the receptionist just for information, it is logged as a **query**. It appears in the inbox with a **distinct query icon** and is categorized into its own **receptionist queries table/tile**, so users can tell queries apart from bookings.

### 11.5 Ask AI
- E.g. "How many bookings did we have on September 23?" or "How many bookings were cancelled in October?" → answered in text **and** shown on the calendar.

### 11.6 Why this matters
- Most businesses (dental clinics, restaurants, doctors, other businesses, inbound receptionist use) will rely on this. Research booking software and add whatever is missing.

---

## 12. EXPENSES (new main-menu item)

- Based on the current **Settings → Billing & Usage** screen, expanded into its own main section.
- **Total spend at the top**, then a **breakdown table**. E.g. $200 total → WhatsApp API $20, AI calling (per minute/second), text-to-speech voice API (e.g. ElevenLabs; the transcript said "Lambda Labs") with token/character usage, AI texting tokens, AI email tokens, and every other API or platform cost.
- **Filters** by API / platform / channel / campaign.
- Very easy to understand.
- **Ask AI**: "How can I reduce my costs?", "Analyze my performance / campaign" → full report, **saved to Reports**.
- The design must feel **elegant, professional and high-end**.

---

## 13. REPORTS (new main-menu item, directly above Settings)

- **Reports dashboard** with performance dashboards, **infographics** and numbers for AI agents/bots, campaigns, settings and everything else, with **filters**.
- **Report library**: Windows-style **folders and subfolders**, named and **dated**.
- Report types: any campaign, any running campaign ("how is it going?"), any database, any lead folder, agents, monthly expenses, and anything else.
- **Generate with AI** (voice or text), e.g. "How many bookings did we make, which agents were involved, and how can we optimize?" The AI searches the whole software (campaign, expenses, everything), analyzes it, and produces a **report document**. **Save as a folder** / save into a folder. The user can then **analyze the report with AI again**.
- AI reports generated anywhere else (Expenses, Campaigns, Max, etc.) are saved here.
- Add any other reporting features the product needs.
- Relationship to Campaigns: per-campaign dashboards stay inside each campaign (9.3). Reports is the central library plus cross-product dashboards.

---

## 14. SETTINGS

- Keep the current settings and **add everything discussed in this brief**: Home, Inbox, Contacts, Campaigns, Stages, Bookings, AI Agents, Expenses, Reports, Max, and all of it.
- **Categorized** and **user-friendly**. The user can see, set, add and manage anything anytime, but it must **not be too technical** and should not keep the user busy in settings. It must be **accurate, with nothing missing**.
- Includes, among others: lead sources, dead-number conditions, DNC, inbound/outbound defaults, notification channels, booking defaults, theme (light / dark / dark blue), teammates, connected channels, voices, currency.
- Research settings in comparable global software and add what's missing.

---

## 15. PRICING / PACKAGES PAGE

- Add a **Pricing** page with **3–4 packages**. It is a placeholder for now; details will be defined at the end of development.

---

## 16. DESIGN SYSTEM

### 16.1 Owner's notes
- The design language is inspired by **Attio CRM**. Follow its principles (as described below), professional and elegant. Do not copy it.
- **Themes**: the system below is **light**. Also build a **dark theme** and a **dark blue theme**. *(The transcript also mentions "dark and light both", which is read as a mixed option, e.g. dark sidebar with light content. Confirm with the owner.)*
- **Sidebar**: retractable (see 2.1).
- **Exception**: agent creation visuals and animation take inspiration from Monday.com (see 6.10). Everything else follows this system.
- Max's full-screen chat follows the current theme (light/white by default).

### 16.2 MASTER UI DESIGN SYSTEM — ORIGINAL PRODUCT UI (provided by the owner, verbatim)

You are designing a completely original web application/product UI based on the design language described below.

The references I provide are inspiration only. **Do not copy, reproduce, trace, or imitate any source brand, logo, proprietary identity, illustrations, text, or distinctive branded elements.** Extract the underlying visual principles and create an original product interface that feels like it belongs to the same design family.

The goal is not to reproduce any individual reference page. The goal is to establish **one consistent, reusable design system** that can be applied across an entire application.

#### 1. CORE DESIGN DIRECTION

Overall personality:

* Vibrant
* Modern
* Clean
* Minimal
* Highly usable
* Professional but energetic
* Crisp and technical
* Spacious without feeling wasteful
* Flat UI rather than heavily layered UI
* Subtle rounding
* Strong typography hierarchy
* High contrast
* Compact, efficient controls
* Clear information hierarchy

The interface should feel **polished, lightweight, fast, and contemporary**.

Avoid:

* Excessive gradients
* Glassmorphism
* Heavy shadows
* Excessive rounded/pill-shaped UI
* Decorative clutter
* Overly large empty areas
* Generic template/dashboard aesthetics
* Excessive animations
* Excessive borders
* Visually noisy cards
* Inconsistent spacing
* Random colors

The default visual language should be **flat, crisp, and structured**.

#### 2. DESIGN SYSTEM PRINCIPLE

Treat the entire application as one product.

Every page must use the same:

* Design tokens
* Typography
* Color system
* Spacing system
* Border treatment
* Radius vocabulary
* Button language
* Form controls
* Navigation patterns
* Card treatment
* Table patterns
* Modal/dialog patterns
* Dropdowns
* Tabs
* Badges
* Alerts
* Empty states
* Loading states
* Interaction states

Do not independently redesign components on every page.

If a component already exists elsewhere in the application, reuse the same component rather than creating a visually different version.

Create reusable design tokens and components first, then build pages from those components.

#### 3. VISUAL FOUNDATION

Design rhythm:

**4px base grid**

Primary spacing vocabulary:

* 4px
* 8px
* 12px
* 16px
* 20px
* 24px
* 28px
* 32px
* 40px

Use these values consistently.

Do not introduce arbitrary spacing values unless there is a strong layout reason.

The interface should have a noticeable rhythmic consistency between:

* headings
* labels
* controls
* cards
* sections
* tables
* navigation
* page margins

#### 4. COLOR SYSTEM

Use a vivid blue as the primary product accent.

Recommended primary: **#266DF0**
Primary dark/accent: **#1E57C0**
Alternative blue reference: **#0000EE**
Dark blue reference: **#0000BE**

Do not blindly use every blue simultaneously.

Establish one primary brand-neutral blue for the product and use darker/lighter variants derived from it.

**Core colors**

* Primary: #266DF0
* Primary hover: #1E57C0
* Background: #FFFFFF
* Surface: #FFFFFF
* Elevated/subtle surface: #F2F2F2
* Alternative elevated surface: #FBFBFB
* Primary text: #000000
* Muted text: #6B6B6B

Borders should remain extremely subtle.

Reference border colors include:

* #D6E5FF
* #E8DDFE

Use a neutral or very subtle cool-toned border appropriate to the surrounding surface. Do not make borders visually dominant.

**Color philosophy**

Blue should be used intentionally for:

* Primary actions
* Important links
* Active navigation
* Selected states
* Key indicators
* Focus states where appropriate
* Important interactive elements

Do not flood the entire interface with blue.

Most of the interface should remain white, black, gray, and subtle border tones, with blue providing controlled visual emphasis.

#### 5. TYPOGRAPHY

Primary typeface: **Inter**

Use a clean modern sans-serif fallback if Inter is unavailable.

Typography should be highly legible and compact.

Font weights:

* Headings: **700**
* Body: **400**
* Buttons: generally **400–500**, depending on hierarchy.

Base hierarchy (approximately):

* Large heading: 24px
* Secondary heading: 20px
* Body: 14px
* Small/meta text: 10px

Some references use very compact typography. Preserve that compactness where appropriate, but **never sacrifice readability**.

Do not force 10px text for important body content merely because one reference used it.

Line height: default body line height **1.5**. Headings may use tighter line heights where appropriate.

Typography hierarchy should come primarily from:

1. Size
2. Weight
3. Color
4. Spacing

—not decorative effects.

#### 6. BORDER RADIUS

Use subtle rounding.

* Primary button radius: **8–9px**
* Standard control radius: **6–8px**
* Cards: **12px**
* Dialogs/modals: **12px**

Do not make everything excessively rounded.

Avoid pill-shaped controls unless the component genuinely benefits from a pill treatment.

The overall impression should be **subtly rounded rather than bubbly**.

#### 7. CARDS

Cards should remain lightweight.

Default:

* Background: #FFFFFF
* Border: 1px subtle border
* Radius: 12px
* Padding: 24px

Avoid heavy shadows.

The references favor a **flat card architecture**.

Use spacing, borders, typography, and surface contrast to create hierarchy rather than large drop shadows.

If elevation is necessary, use extremely subtle surface differentiation before introducing shadows.

#### 8. BUTTONS

Buttons should be compact and modern.

Primary button:

* Blue background
* High-contrast text
* 8–9px radius
* Compact horizontal padding
* Approximately 6–10px vertical/horizontal padding depending on size
* Font weight 400–500

Secondary button:

* White or subtle surface background
* Black text
* Subtle border
* Same radius vocabulary

Tertiary/text button:

* Minimal or no background
* Blue or black text

Maintain consistent button heights across the application.

Do not create a different button style for every page.

Button hierarchy should immediately communicate:

* Primary action
* Secondary action
* Tertiary action
* Destructive action

#### 9. INPUTS AND FORMS

Inputs should be clean and understated.

Default characteristics:

* White background
* Subtle border
* Approximately 6–8px radius
* Compact but comfortable padding
* Clear label hierarchy
* Strong focus state
* Consistent height across controls

Use Label, Input, Helper text and Error text with predictable vertical spacing.

Avoid unnecessarily large form fields.

On mobile, ensure native-friendly controls remain at least **16px font size** where appropriate to prevent browser zoom behavior.

#### 10. LINKS

Default link color: **#0000EE** or the product's primary blue.

Links should be recognizable without becoming visually aggressive.

Use underlines selectively depending on context.

#### 11. NAVIGATION

Navigation should be extremely clear and efficient.

Use:

* Strong active state
* Compact spacing
* Clear hierarchy
* Consistent icon sizing
* Minimal decoration
* Strong alignment

The navigation should feel like part of the application rather than a separate visual system.

Do not use excessive shadows or oversized navigation elements.

Maintain a very high navigation stacking level so navigation remains accessible above normal content.

#### 12. LAYOUT

Maximum content width reference: **1261px**

Use a centered layout where appropriate.

Desktop pages should have:

* Clear page margins
* Consistent content width
* Strong horizontal alignment
* Predictable section spacing

Use approximately **4–6px grid gutter reference**, but prioritize actual usability and visual balance over blindly reproducing the extracted number.

Layouts should feel dense enough for a productivity application while still remaining comfortable to scan.

#### 13. RESPONSIVE DESIGN

Primary breakpoint: **768px**

Below 768px:

* Collapse desktop navigation where appropriate
* Stack multi-column layouts
* Reduce horizontal padding
* Allow tables to scroll or transform into mobile-friendly layouts
* Make controls touch-friendly
* Maintain visual hierarchy
* Preserve the 4px spacing rhythm
* Increase form control text to approximately 16px where needed

Do not simply shrink the desktop UI.

The mobile layout should be intentionally designed.

#### 14. INTERACTION DESIGN

Interactions should feel quick and controlled.

Reference motion durations: 0.10s, 0.14s, 0.16s, 0.20s

Default easing: **ease-in-out**

Use animation sparingly.

Prioritize:

* Immediate feedback
* Clear state changes
* Subtle transitions
* No distracting movement

Do not animate every element.

#### 15. HOVER STATES

The extracted references contain an unusual hover treatment involving scale, opacity, and a yellow shadow.

Do **not** blindly reproduce that behavior across the entire application.

Instead, interpret it as evidence that interactive elements should have a noticeable but controlled hover response.

Preferred behavior:

* Slight color change
* Slight background change
* Optional subtle scale around 1.01–1.02
* Optional subtle border change
* Fast 0.14–0.20s transition

Avoid aggressive `scale(1.2)` behavior for standard buttons, navigation, cards, or controls because it can damage layout stability.

Use stronger hover feedback only for specific decorative or interactive elements where appropriate.

#### 16. FOCUS STATES

Every interactive element must have a clear accessible focus state.

Use:

* Visible focus ring
* Approximately 1px border/ring
* Approximately 1px offset
* High contrast against the surrounding surface

Do not remove browser accessibility indicators without replacing them with an equally visible custom state.

#### 17. COMPONENT STATES

Every reusable component should account for: Default, Hover, Focus, Active, Selected, Disabled, Loading, Error, Success, Empty, and Read-only where applicable.

Do not design only the "perfect data" state.

#### 18. TABLES

For application/product interfaces, tables should follow the same flat, compact design language.

Use:

* Clear column hierarchy
* Compact row height
* Subtle dividers
* Strong header hierarchy
* Consistent alignment
* Minimal decoration
* Blue for important interactive elements
* Clear hover state

Avoid heavy boxed tables where every cell has a border.

#### 19. DASHBOARD / DATA DENSITY

The UI should support information-dense applications.

Use whitespace strategically.

Do not create huge cards with excessive empty space.

A dashboard should feel **compact → organized → readable → actionable** rather than **large → decorative → empty**.

Information hierarchy should make the most important numbers and actions immediately visible.

#### 20. ICONOGRAPHY

Use one consistent icon family throughout the product.

Icons should generally be:

* Simple
* Minimal
* Geometric
* Consistent in stroke weight
* Approximately 16–20px for normal controls

Never mix unrelated icon styles.

Icons should support the interface rather than dominate it.

#### 21. RADIX-STYLE COMPONENT PHILOSOPHY

The references indicate a Radix UI-style component architecture.

Follow that philosophy:

* Accessible primitives
* Keyboard navigation
* Predictable focus behavior
* Consistent state management
* Reusable components
* Controlled overlays
* Consistent dialogs
* Dropdown menus
* Tooltips
* Popovers
* Tabs
* Selects
* Checkboxes
* Radio groups
* Switches

The implementation should feel like a coherent component system rather than individually styled HTML elements.

#### 22. Z-INDEX

Use a sensible hierarchy. Suggested:

* Base content: 0
* Floating elements: 10+
* Dropdowns/popovers: 100+
* Modals: 1000+
* Navigation/system overlays: 10000+

Do not reproduce the extremely large extracted navigation value such as `2147483647` unless technically necessary.

The important principle is a predictable stacking hierarchy.

#### 23. ACCESSIBILITY

The UI must remain accessible.

Maintain:

* Strong color contrast
* Visible focus states
* Keyboard navigation
* Semantic HTML
* Accessible labels
* Proper ARIA behavior where required
* Touch-friendly controls
* Readable text sizes
* Clear error states

Never sacrifice accessibility simply to reproduce a visual reference.

#### 24. DESIGN TOKENS

Create a centralized token system. Example structure:

```css
:root {
  --color-primary: #266DF0;
  --color-primary-hover: #1E57C0;

  --color-background: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #F2F2F2;

  --color-text: #000000;
  --color-text-muted: #6B6B6B;

  --color-border: #D6E5FF;

  --radius-control: 8px;
  --radius-button: 8px;
  --radius-card: 12px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-9: 40px;

  --duration-fast: 100ms;
  --duration-standard: 160ms;
  --duration-slow: 200ms;

  --ease-standard: ease-in-out;
}
```

Adapt these tokens when the actual product requirements require it, but keep the system internally consistent.

#### 25. IMPORTANT: RESOLVE REFERENCE CONFLICTS INTELLIGENTLY

The six references contain small variations. For example:

* Primary blue varies between #0000EE and #266DF0.
* Spacing varies slightly.
* Button radius varies between 8px and 9px.
* Grid gutters vary between 4px and 6px.
* Type scales vary between 20px and 24px headings.
* Border colors vary.
* Z-index values vary.
* Button padding varies.

Do NOT create six competing design systems. Instead:

1. Identify the recurring pattern.
2. Choose one coherent value.
3. Establish it as the product token.
4. Use that value consistently everywhere.
5. Deviate only when there is a clear UX reason.

The final UI should look like **one intentionally designed product**, not six references merged together.

#### 26. VISUAL REFERENCE INTERPRETATION

If screenshots are supplied alongside this prompt, use them as visual references.

Analyze: overall hierarchy, density, relative sizing, alignment, white space, component proportions, navigation structure, card proportions, button proportions, typography hierarchy, visual emphasis, information grouping, responsive behavior.

Do not focus only on individual CSS values.

When the screenshot and extracted token conflict, prioritize the **overall visual language and consistency**.

#### 27. ORIGINALITY REQUIREMENT

The resulting UI must be original.

You may take inspiration from: color relationships, spacing rhythm, typography principles, component hierarchy, flat visual treatment, interaction philosophy, layout density, general design patterns.

Do NOT reproduce: logos, brand names, brand marks, proprietary illustrations, exact branded graphics, distinctive source-specific content, source-specific identity, or exact page composition when it would amount to copying.

The goal is: **"Inspired by the design language, independently designed for this product."**

#### 28. WHEN CREATING A NEW PAGE

Before generating a new page, determine:

1. Which existing components can be reused?
2. What is the page's primary task?
3. What is the information hierarchy?
4. What should be visually prominent?
5. What should remain secondary?
6. Which existing design tokens apply?
7. How does the page behave at 768px and below?
8. What are the empty/loading/error states?
9. How does the page connect to the application's navigation?

Then construct the page using the established design system.

Do not invent a new visual style for the page.

#### 29. FINAL QUALITY CHECK

Before considering a UI complete, verify:

* Does it look like one coherent product?
* Is the 4px rhythm respected?
* Are colors consistent?
* Is Inter used consistently?
* Are button styles consistent?
* Are card styles consistent?
* Are border treatments consistent?
* Are radii consistent?
* Is spacing predictable?
* Is the information hierarchy obvious?
* Is the interface compact but readable?
* Are interactions subtle and fast?
* Are focus states accessible?
* Does mobile behavior make sense?
* Are all components reusable?
* Is the interface original rather than a copy of the reference?

If any answer is no, fix the design before completing the UI.

#### DESIGN NORTH STAR

The final result should feel:

**Vibrant + Minimal + Crisp + Modern + Flat + Compact + Highly Usable**

Think:

**clean white canvas + vivid blue interaction language + black typography + subtle borders + restrained rounding + precise spacing + strong hierarchy + fast interactions.**

Do not copy the reference product.

Build a new product that follows the same underlying design principles.

---

## 17. POINTS INTERPRETED OR TO CONFIRM WITH THE OWNER

Build using the interpretation shown, but list these back to the owner when you finish:

1. **Home vs Get Started**: a new account first sees **Get Started**; after onboarding, **Home opens on the Max chat** with the dashboard below it.
2. **Agent types**: the final list of six is used (Sales, Marketing, Support, Tech support, Receptionist, Finance). An earlier mention of a separate "call agent" is dropped, because every agent can call, text and email.
3. **"Voice agent / chat agent" type** on the agent screen is kept as a label, even though all agents can use all channels. Confirm what the type should control.
4. **After-sales**: the owner corrected himself. After-sales problems belong to the **Support agent**; **referral requests** stay with the **Marketing agent**.
5. **"Three mediums: call, text message and phone"** is read as **call, text, email**.
6. **Reports**: an early note said there would be no separate Reports option; the later instruction adds **Reports** to the main menu. Both apply: per-campaign dashboards in Campaigns, plus the central Reports section.
7. **"Lambda Labs"** in Expenses is read as the voice/TTS provider (e.g. ElevenLabs).
8. **"Steps"** in Get Started is read as **Stages**.
9. **Themes**: light, dark, dark blue; "dark and light both" is read as a mixed theme.
10. **Inbox right panel**: the transcript sentence "at the right side I would say…" was cut off.
