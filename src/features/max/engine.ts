/* Max: scripted, context-aware replies. Everything here is a front-end simulation. */
import { useStore } from '@/store'
import type { Contact } from '@/data/types'
import { money, nf, uid } from '@/lib/utils'

export type Block =
  | { t: 'text'; md: string }
  | { t: 'status'; text: string; done?: boolean }
  | { t: 'options'; id: string; label?: string; multi?: boolean; options: { v: string; l: string; d?: string; icon?: string }[]; picked?: string[] }
  | { t: 'people'; ids: string[]; title: string; query: string }
  | { t: 'kpis'; items: { l: string; v: string; d?: string }[] }
  | { t: 'plan'; id: string; title: string; changes: string[]; state?: 'pending' | 'approved' | 'declined'; onApprove?: 'campaign' | 'agent' | 'theme' | 'generic'; payload?: any }
  | { t: 'campaign'; id: string; name: string }
  | { t: 'link'; to: string; label: string; icon?: string }
  | { t: 'bars'; title: string; rows: { l: string; v: number; c?: string }[] }
  | { t: 'doc'; title: string; kind: 'report' | 'presentation' | 'pdf'; pages: string[] }
  | { t: 'steps'; title: string; steps: { l: string; to?: string }[] }

export interface MaxMessage { id: string; role: 'user' | 'max'; blocks: Block[]; time: string; attachments?: string[]; voice?: boolean }
export interface Flow { kind: 'campaign'; step: number; a: Record<string, any> }
export interface Thread { id: string; title: string; date: string; msgs: MaxMessage[]; flow?: Flow | null; mode?: 'manual' | 'guide' | 'auto' | null }

const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
export const userMsg = (text: string, o: Partial<MaxMessage> = {}): MaxMessage => ({ id: uid('mm'), role: 'user', blocks: [{ t: 'text', md: text }], time: now(), ...o })
export const maxMsg = (blocks: Block[]): MaxMessage => ({ id: uid('mm'), role: 'max', blocks, time: now() })

const has = (s: string, ...ws: string[]) => ws.some((w) => s.includes(w))
const S = () => useStore.getState()

/* --- campaign builder in chat --- */
const CAMP_STEPS = ['dir', 'folder', 'ch', 'pipe', 'agents', 'booking', 'when', 'review'] as const
export function campaignQuestion(flow: Flow): Block[] {
  const st = S(); const a = flow.a
  const step = CAMP_STEPS[flow.step]
  const known = Object.keys(a).length
  const pre = known && flow.step === 0 ? [] : []
  switch (step) {
    case 'dir': return [...pre, { t: 'text', md: 'Let’s build it. First, **what kind of campaign** is this?' }, { t: 'options', id: 'dir', options: [{ v: 'out', l: 'Outbound', d: 'You reach out to people', icon: 'send' }, { v: 'in', l: 'Inbound', d: 'People contact you (ads, landing pages, calls)', icon: 'inbox' }] }]
    case 'folder': return [{ t: 'text', md: '**Who should it reach?** Pick a lead folder, or I can open Contacts so you filter your own list.' }, { t: 'options', id: 'folder', options: st.folders.filter((f) => !f.group).map((f) => ({ v: f.id, l: f.name, d: `${nf(f.count ?? 0)} people` })).concat([{ v: 'filter', l: 'Let me filter in Contacts', d: 'Opens the database with filters' }]) }]
    case 'ch': return [{ t: 'text', md: '**How should we reach them?** Pick one or several.' }, { t: 'options', id: 'ch', multi: true, options: [{ v: 'sms', l: 'Text', icon: 'sms' }, { v: 'call', l: 'Call', icon: 'call' }, { v: 'email', l: 'Email', icon: 'email' }, { v: 'wa', l: 'WhatsApp', icon: 'wa' }, { v: 'msg', l: 'Messenger', icon: 'msg' }] }]
    case 'pipe': return [{ t: 'text', md: '**Which stages should leads move through?** You can change them later in Stages.' }, { t: 'options', id: 'pipe', options: [{ v: 'telecom', l: 'Telecom', d: 'New → Contacted → Interested → Order Booked → Installed' }, { v: 'realestate', l: 'Real estate', d: 'New → Qualified → Viewing Booked → Closed' }, { v: 'dental', l: 'Dental', d: 'Requested → Booked → Arrived → Completed' }, { v: 'ai', l: 'Let AI build them from my business', icon: 'ai' }] }]
    case 'agents': { const dir = a.dir === 'in' ? 'in' : 'out'; return [{ t: 'text', md: '**Which agents do the work?** I recommend the ones with the best numbers for this kind of campaign.' }, { t: 'options', id: 'agents', multi: true, options: st.agents.filter((x) => x.type === 'sales' || x.type === 'marketing' || (dir === 'in' && x.type === 'reception')).map((x) => ({ v: x.id, l: x.name, d: `${x.type} · ${x.ws.conv}% conversion`, icon: 'agent' })).concat([{ v: 'ai', l: 'Let AI decide', d: 'Best agents by performance', icon: 'ai' }]) }] }
    case 'booking': return [{ t: 'text', md: '**Does this campaign book appointments?** If yes, the receptionist steps in whenever someone asks for a time.' }, { t: 'options', id: 'booking', options: [{ v: 'yes', l: 'Yes, book appointments' }, { v: 'no', l: 'No bookings' }] }]
    case 'when': return [{ t: 'text', md: '**When should it start?**' }, { t: 'options', id: 'when', options: [{ v: 'now', l: 'Go live now' }, { v: 'tomorrow', l: 'Tomorrow 9:00 AM' }, { v: 'schedule', l: 'Pick a date' }] }]
    case 'review': {
      const f = st.folders.find((x) => x.id === a.folder); const CHL: Record<string, string> = { sms: 'Text', call: 'Call', email: 'Email', wa: 'WhatsApp', msg: 'Messenger' }
      const chs = (a.ch as string[] | undefined)?.map((c) => CHL[c] ?? c).join(', ') || 'Text'
      const PIPEL: Record<string, string> = { telecom: 'Telecom (New → Contacted → Interested → Order Booked → Installed)', realestate: 'Real estate (New → Qualified → Viewing Booked → Closed)', dental: 'Dental (Requested → Booked → Arrived → Completed)', ai: 'built by AI from your business' }
      const ags = ((a.agents as string[]) || []).map((id) => id === 'ai' ? 'AI-picked agents' : st.agents.find((x) => x.id === id)?.name).filter(Boolean).join(', ') || 'AI-picked agents'
      const name = `${a.dir === 'in' ? 'Inbound' : 'Outbound'} — ${f?.name ?? 'Filtered list'}`
      return [
        { t: 'text', md: 'Here’s everything I’ll set up. **Nothing goes live until you approve.**' },
        { t: 'plan', id: uid('pl'), title: `Create campaign “${name}”`, onApprove: 'campaign', payload: { ...a, name }, changes: [
          `Type: ${a.dir === 'in' ? 'Inbound' : 'Outbound'}`, `People: ${f ? `${f.name} (${nf(f.count ?? 0)} people)` : 'your filtered list'}`, `Channels: ${chs}`,
          `Stages: ${PIPEL[a.pipe] ?? 'Telecom (default)'}`, `Agents: ${ags}`, `Appointment booking: ${a.booking === 'yes' ? 'on (Rhea takes over booking requests)' : 'off'}`,
          `Follow-ups: let AI handle (text → call after 4 h → email after 1 day)`, `Start: ${a.when === 'now' ? 'right away' : a.when === 'tomorrow' ? 'tomorrow 9:00 AM' : 'on the date you pick'}`,
          'Do-Not-Contact numbers are skipped automatically',
        ] },
      ]
    }
  }
}
export function campaignPrefill(text: string): Record<string, any> {
  const s = text.toLowerCase(); const a: Record<string, any> = {}
  if (/\b(outbound|broadcast|reach out|win-?back)\b/.test(s)) a.dir = 'out'
  if (/\b(inbound|ads|landing page|landing)\b/.test(s)) a.dir = 'in'
  const f = S().folders.find((x) => !x.group && s.includes(x.name.toLowerCase().split(' ')[0]))
  if (f) a.folder = f.id
  const ch = ['sms', 'call', 'email', 'wa'].filter((c) => ({ sms: ['text', 'sms'], call: ['call'], email: ['email'], wa: ['whatsapp'] } as any)[c].some((w: string) => s.includes(w)))
  if (ch.length) a.ch = ch
  if (has(s, 'dental', 'recall', 'patient')) a.pipe = 'dental'; else if (has(s, 'real estate', 'buyer', 'brooklyn')) a.pipe = 'realestate'; else if (has(s, 'telecom', 'fiber', 'mobility', 'internet')) a.pipe = 'telecom'
  return a
}
export function nextCampaignStep(flow: Flow): Flow {
  let step = flow.step + 1
  while (step < CAMP_STEPS.length - 1 && flow.a[CAMP_STEPS[step]] !== undefined) step++
  return { ...flow, step }
}
export const flowConfirm = (a: Record<string, any>): string | null => {
  const st = S(); const parts: string[] = []
  if (a.dir) parts.push(a.dir === 'in' ? 'Inbound' : 'Outbound')
  if (a.folder) parts.push(st.folders.find((f) => f.id === a.folder)?.name ?? '')
  if (a.ch) parts.push((a.ch as string[]).map((c) => ({ sms: 'Text', call: 'Call', email: 'Email', wa: 'WhatsApp' } as any)[c]).join(' + '))
  if (a.pipe) parts.push(`${a.pipe} stages`)
  return parts.length ? `Got it. From your message I already have: **${parts.join(' · ')}**. I won’t ask for those again.` : null
}

/* --- people search --- */
function findPeople(text: string): { ids: string[]; title: string } {
  const s = text.toLowerCase(); const c = S().contacts
  let L = c
  const city = ['brooklyn', 'mississauga', 'toronto', 'karachi', 'manhattan', 'brampton'].find((x) => s.includes(x))
  if (city) L = L.filter((x) => x.city.toLowerCase() === city)
  if (has(s, 'women', 'female')) L = L.filter((x) => x.gender === 'F')
  if (has(s, 'men ', 'male')) L = L.filter((x) => x.gender === 'M')
  if (has(s, 'email')) L = L.filter((x) => (has(s, 'no email', 'without') ? !x.email : !!x.email))
  if (has(s, 'bought', 'purchased', 'customer')) L = L.filter((x) => !!x.purchase)
  if (has(s, 'dead', 'not responding')) L = L.filter((x) => x.noReply >= 3)
  const title = `${nf(L.length)} ${L.length === 1 ? 'person' : 'people'}${city ? ` in ${city[0].toUpperCase() + city.slice(1)}` : ''}${has(s, 'women') ? ' · women' : ''}${has(s, 'email') ? (has(s, 'no email') ? ' · missing email' : ' · with email') : ''}`
  return { ids: L.slice(0, 200).map((x) => x.id), title }
}

/* --- main reply --- */
export function reply(text: string, thread: Thread, _ctx?: { page?: string }): { blocks: Block[]; flow?: Flow | null; mode?: Thread['mode'] } {
  const s = text.toLowerCase(); const st = S()

  // mode choice
  if (thread.flow && thread.mode == null && has(s, 'manually', 'guide me', 'do it for you', 'do it for me')) {
    if (has(s, 'manual')) return { blocks: [{ t: 'text', md: 'Sure. I’ve opened the campaign wizard for you. Come back here if you want me to take over.' }, { t: 'link', to: '/campaigns/new', label: 'Open the campaign wizard', icon: 'megaphone' }], flow: null, mode: 'manual' }
    if (has(s, 'guide')) return { blocks: [{ t: 'text', md: 'I’ll stay open on the side and walk you through each screen. Start with **Campaigns → New campaign**, then I’ll tell you what to toggle.' }, { t: 'steps', title: 'Guided setup', steps: [{ l: 'Open Campaigns and click New campaign', to: '/campaigns/new' }, { l: 'Choose Outbound' }, { l: 'Pick the Mississauga Leads folder' }, { l: 'Tick Text and Call' }, { l: 'Keep the Telecom stages' }, { l: 'Choose Sarah and Robert' }, { l: 'Review and launch' }] }], flow: null, mode: 'guide' }
    const flow = nextCampaignStep({ ...thread.flow, step: -1 })
    return { blocks: [{ t: 'text', md: 'Great, I’ll do it here. I’ll ask only what I don’t know yet.' }, ...campaignQuestion(flow)], flow, mode: 'auto' }
  }
  if (thread.flow) {
    // free-text answer during flow → treat as skip/continue
    const flow = nextCampaignStep(thread.flow)
    return { blocks: [{ t: 'text', md: 'Noted.' }, ...campaignQuestion(flow)], flow }
  }

  if (has(s, 'campaign') && has(s, 'build', 'create', 'make', 'start', 'run', 'launch', 'new')) {
    const a = campaignPrefill(text); const flow: Flow = { kind: 'campaign', step: -1, a }
    const conf = flowConfirm(a)
    return { blocks: [...(conf ? [{ t: 'text', md: conf } as Block] : []), { t: 'text', md: 'Would you like to do it **manually**, should I **guide you** through the screens, or should I **do it for you** right here?' }, { t: 'options', id: 'mode', options: [{ v: 'Manually', l: 'Manually', icon: 'edit' }, { v: 'Guide me', l: 'Guide me', icon: 'compass' }, { v: 'Do it for you', l: 'Do it for you', icon: 'ai' }] }], flow, mode: null }
  }
  if (has(s, 'find', 'show', 'people', 'who', 'leads', 'contacts') && has(s, 'brooklyn', 'mississauga', 'toronto', 'karachi', 'women', 'email', 'bought', 'dead', 'in ')) {
    const r = findPeople(text)
    return { blocks: [{ t: 'status', text: 'Searching your database', done: true }, { t: 'text', md: `I found **${r.title}**. Here they are — you can save them as a folder or start a campaign with them.` }, { t: 'people', ids: r.ids, title: r.title, query: text }] }
  }
  if (has(s, 'theme', 'dark mode', 'light mode')) {
    const to = has(s, 'dark blue', 'navy') ? 'navy' : has(s, 'dark') ? 'dark' : has(s, 'mixed') ? 'mixed' : 'light'
    return { blocks: [{ t: 'plan', id: uid('pl'), title: `Switch the theme to ${to === 'navy' ? 'Dark blue' : to[0].toUpperCase() + to.slice(1)}`, changes: ['Applies to the whole app for your account', 'You can change it back from the sidebar'], onApprove: 'theme', payload: to }] }
  }
  if (has(s, 'cost', 'expense', 'spend', 'reduce', 'cheaper')) {
    const total = st.expenses.reduce((a, e) => a + e.cost, 0)
    return { blocks: [{ t: 'status', text: 'Reading this month’s expenses', done: true }, { t: 'text', md: `You’ve spent **${money(total)}** this month. AI calling is the biggest line (${money(428)}). Three changes would cut about **18%**:` }, { t: 'bars', title: 'Spend by category', rows: [{ l: 'AI & voice', v: 1120 }, { l: 'Messaging', v: 520 }, { l: 'Telephony', v: 62 }, { l: 'Data', v: 58 }, { l: 'Platform', v: 299 }] }, { t: 'text', md: '1. Let **Ellie (chat)** handle the first touch on Win-back before any calls.\n2. Send WhatsApp instead of SMS to the 2,180 people who have it.\n3. Drop the 212 dead numbers so no credits go to them.' }, { t: 'plan', id: uid('pl'), title: 'Apply the 3 cost changes', changes: ['Win-back: first touch by Ellie (chat) instead of Robert (call)', 'Prefer WhatsApp over SMS where available', 'Move 212 dead numbers out of active campaigns'], onApprove: 'generic' }, { t: 'link', to: '/reports', label: 'Saved to Reports › Expenses', icon: 'report' }] }
  }
  if (has(s, 'why', 'drop', 'reply rate', 'analy', 'what should i fix', 'fix today')) {
    return { blocks: [{ t: 'status', text: 'Analyzing 1,240 conversations', done: true }, { t: 'text', md: 'Here’s what I found on **Fiber — Win-back**:' }, { t: 'kpis', items: [{ l: 'Reply rate', v: '7%', d: '−40% this week' }, { l: 'Best message', v: 'B', d: '34% replies' }, { l: 'Best agent', v: 'Ellie', d: '2.1× Robert' }] }, { t: 'text', md: 'The drop started when the campaign was **paused on Sep 20** with 228 people never contacted, and the remaining sends went out **after 7 PM**, when replies are lowest.\n\nMy suggestions:' }, { t: 'plan', id: uid('pl'), title: 'Fix Fiber — Win-back', changes: ['Resume the campaign with Ellie as the first-touch agent', 'Send between 10 AM and 6 PM in each person’s time zone', 'Use message B (“Customers in your area are switching…”) for everyone left'], onApprove: 'generic' }, { t: 'link', to: '/campaigns/k5', label: 'Open Fiber — Win-back', icon: 'megaphone' }] }
  }
  if (has(s, 'booking', 'appointment')) {
    const n = st.bookings.filter((b) => b.date === '2026-09-23').length
    return { blocks: [{ t: 'text', md: `There were **${n} bookings on Sep 23**: ${st.bookings.filter((b) => b.date === '2026-09-23' && b.status === 'completed').length} completed, ${st.bookings.filter((b) => b.date === '2026-09-23' && b.status === 'noshow').length} no-shows. Rhea booked most of them.` }, { t: 'link', to: '/bookings?date=2026-09-23', label: 'Show Sep 23 on the calendar', icon: 'calendar' }] }
  }
  if (has(s, 'competitor', 'research', 'best campaign', 'presentation')) {
    return { blocks: [{ t: 'status', text: 'Researching competitors and your past campaigns', done: true }, { t: 'text', md: 'Based on what similar telecom resellers ran this quarter and your own numbers, the strongest play is a **“Switch and save” inbound ad campaign** with a text-first follow-up. I put the full reasoning in a presentation.' }, { t: 'doc', title: 'Q4 campaign ideas — competitor research', kind: 'presentation', pages: ['What competitors ran in Q3', 'Your best-performing messages', 'Recommended campaign: Switch and save', 'Budget and expected bookings', 'Next steps'] }, { t: 'options', id: 'after-research', options: [{ v: 'Build this campaign', l: 'Build this campaign', icon: 'ai' }, { v: 'Save to Reports', l: 'Save to Reports' }] }] }
  }
  if (has(s, 'agent') && has(s, 'edit', 'change', 'update', 'improve', 'optimi')) {
    return { blocks: [{ t: 'text', md: 'I reviewed **Robert**. His qualifying criteria are vague (“customer seems interested”), which is why 14% of his leads land in Pending.' }, { t: 'plan', id: uid('pl'), title: 'Update Robert (v3 → v4)', changes: ['Add required criterion: “Customer confirms the service address”', 'Add required criterion: “Customer is the account holder”', 'Soften the closing line on calls', 'Save as version 4 and keep v3 available'], onApprove: 'agent', payload: { id: 's3' } }] }
  }
  if (has(s, 'hello', 'hi', 'hey')) return { blocks: [{ t: 'text', md: 'Hi Bilal! I can build campaigns, find people, fix agents, explain any number, or change settings. What do you want to do?' }, { t: 'options', id: 'quick', options: [{ v: 'Build a campaign', l: 'Build a campaign', icon: 'megaphone' }, { v: 'Find people in Brooklyn', l: 'Find people in Brooklyn', icon: 'users' }, { v: 'What should I fix today?', l: 'What should I fix today?', icon: 'ai' }, { v: 'How can I reduce my costs?', l: 'Reduce my costs', icon: 'receipt' }] }] }
  if (has(s, 'save') && has(s, 'folder')) return { blocks: [{ t: 'text', md: 'Saved. You’ll find the folder in **Contacts › Folders**.' }, { t: 'link', to: '/contacts?view=folders', label: 'Open Folders', icon: 'folder' }] }
  return { blocks: [{ t: 'text', md: `I can help with that. Here’s what I can do with “${text}”:` }, { t: 'options', id: 'clarify', options: [{ v: `Build a campaign: ${text}`, l: 'Build it as a campaign', icon: 'megaphone' }, { v: `Find people: ${text}`, l: 'Find matching people', icon: 'users' }, { v: `Analyze: ${text}`, l: 'Analyze and report', icon: 'report' }] }] }
}

/* --- approvals --- */
export function applyPlan(block: Extract<Block, { t: 'plan' }>): Block[] {
  const st = S()
  if (block.onApprove === 'theme') { st.setTheme(block.payload); return [{ t: 'text', md: 'Done — the theme is switched.' }] }
  if (block.onApprove === 'campaign') {
    const a = block.payload; const f = st.folders.find((x) => x.id === a.folder)
    const id = uid('k')
    const pipe = (a.pipe === 'ai' || !a.pipe ? 'telecom' : a.pipe) as any
    st.patch('campaigns', (cs) => [{ id, name: a.name, dir: a.dir === 'in' ? 'in' : 'out', sub: a.dir === 'in' ? 'Inbound ad campaign' : 'Sales outreach', biz: 'Metro Mobile', pipe, folder: a.folder || 'f1', ch: a.ch?.length ? a.ch : ['sms'], status: a.when === 'now' ? 'running' : 'scheduled', started: a.when === 'now' ? 'Today' : 'Tomorrow 9:00 AM', people: f?.count ?? 480, reached: 0, replied: 0, interested: 0, booked: 0, installed: 0, revenue: 0, cost: 0, agents: (a.agents || []).filter((x: string) => x !== 'ai').length ? a.agents.filter((x: string) => x !== 'ai') : ['s1', 's2', 'm1'], weights: { s1: 50, s2: 50 }, booking: a.booking === 'yes', metrics: ['people', 'reached', 'replied', 'booked', 'revenue'] }, ...cs])
    st.addActivity({ icon: 'megaphone', text: `<b>Max</b> created the campaign <b>${a.name}</b>`, time: 'just now', k: 'sys' })
    return [{ t: 'text', md: `**The campaign is done. It’s ${a.when === 'now' ? 'live' : 'scheduled'}.** Replies will land in your Inbox and I’ll flag anything that needs you.` }, { t: 'campaign', id, name: a.name }]
  }
  if (block.onApprove === 'agent') {
    const a = st.agents.find((x) => x.id === block.payload.id)
    if (a) st.updateAgent(a.id, { ver: a.ver + 1, versions: [...a.versions, { v: a.ver + 1, label: 'Clearer qualifying criteria (Max)', date: 'Today' }], score: Math.min(97, a.score + 10), job: { ...a.job, qual: [...a.job.qual, { text: 'Customer confirms the service address', imp: 'Required' }, { text: 'Customer is the account holder', imp: 'Required' }] } })
    return [{ t: 'text', md: 'Applied. Robert is now on **version 4** and his review score went from 78 to 88.' }, { t: 'link', to: '/agents/s3', label: 'Open Robert', icon: 'bot' }]
  }
  return [{ t: 'text', md: 'Done. I applied all the changes and they’re live now. I’ll watch the numbers and tell you if anything else needs attention.' }]
}

/* Guided-mode hints per route */
export function guideFor(path: string): { title: string; steps: string[] } | null {
  if (path.startsWith('/campaigns/new')) return { title: 'Building your campaign', steps: ['Choose Outbound', 'Pick the Mississauga Leads folder', 'Tick Text and Call', 'Keep the Telecom stages', 'Choose Sarah and Robert', 'Leave follow-ups on “Let AI handle this”', 'Review and press Launch'] }
  if (path.startsWith('/agents/')) return { title: 'Editing this agent', steps: ['Check the main goal at the top', 'Open Job → add your qualifying criteria', 'Add a knowledge base with your price list', 'Test it in the panel on the right', 'Press Save changes'] }
  if (path.startsWith('/contacts')) return { title: 'Finding people', steps: ['Type what you want in the AI filter box', 'Check the count on the right', 'Right-click → Save to folder', 'Start a campaign from the folder'] }
  return null
}

export const titleFor = (text: string) => (text.length > 44 ? text.slice(0, 42) + '…' : text)
export const seedThread = (): Thread => ({ id: uid('th'), title: 'New chat', date: 'Today', msgs: [], flow: null, mode: null })
export const isEmptyThread = (t: Thread) => t.msgs.length === 0
export type { Contact }
