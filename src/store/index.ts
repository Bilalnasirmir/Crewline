import { create } from 'zustand'
import * as seed from '@/data/seed'
import type * as T from '@/data/types'
import { uid } from '@/lib/utils'
import { reviewOf } from '@/data/review'

export type Theme = 'light' | 'dark' | 'navy' | 'mixed'

const readLS = <X,>(k: string, d: X): X => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as X) : d } catch { return d } }
const writeLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }

export interface State {
  // preferences
  theme: Theme; sidebarCollapsed: boolean; live: boolean; maxPanelOpen: boolean; guide: string | null
  homePanels: string[]; homeKpis: string[]
  // data
  biz: T.Business[]; folders: T.Folder[]; campaigns: T.Campaign[]; products: Record<string, T.Products>; stages: T.StageSet
  contacts: T.Contact[]; dnc: T.DncEntry[]; dups: T.Dup[]; deadRules: { on: boolean; t: string }[]; sources: { n: string; dir: string; on: boolean }[]
  customFields: { name: string; type: string }[]; agents: T.Agent[]; convos: T.Convo[]; emails: T.Email[]; calls: T.Call[]
  staff: Record<string, string[]>; services: Record<string, T.Service[]>; hours: Record<string, Record<string, [string, string, boolean]>>
  bookings: T.Booking[]; queries: T.Query[]; activity: T.Activity[]; assigned: T.Assigned[]; notifs: T.Notif[]; suggestions: T.Suggestion[]
  gs: T.GsStep[]; expenses: T.Expense[]; expDaily: number[]; reportFolders: T.ReportFolder[]; reports: T.Report[]
  team: T.TeamMember[]; numbers: T.PhoneNumber[]; voices: [string, string][]; maxThreads: T.MaxThread[]
  bookingSet: Record<string, T.BookingSettings>; setups: Record<string, T.CampaignSetup>
  /** Settings and small preferences, keyed by name (persisted in this browser). */
  prefs: Record<string, any>
  /** Contact id → when an agent last moved them (drives the live highlight on the board). */
  recent: Record<string, number>
  tick: number
  // actions
  setTheme: (t: Theme) => void; toggleSidebar: () => void; setLive: (v: boolean) => void; setMaxPanel: (v: boolean) => void; setGuide: (g: string | null) => void
  setHomePanels: (p: string[]) => void; setHomeKpis: (k: string[]) => void
  patch: <K extends keyof State>(key: K, fn: (v: State[K]) => State[K]) => void
  updateContact: (id: string, p: Partial<T.Contact>) => void
  moveLead: (cid: string, stage: string, by: string, note?: string) => void
  addActivity: (a: Omit<T.Activity, 'id'>) => void
  /** Close an item in Assigned to me, with a short note of what was done. */
  resolveAssigned: (id: string, outcome?: string) => void
  reopenAssigned: (id: string) => void
  markNotifsRead: () => void
  updateAgent: (id: string, p: Partial<T.Agent>) => void
  updateCampaign: (id: string, p: Partial<T.Campaign>) => void
  addBooking: (b: Omit<T.Booking, 'id'>) => T.Booking
  updateBooking: (id: string, p: Partial<T.Booking>) => void
  pushConvoItem: (vid: string, item: T.ConvoItem) => void
  updateConvo: (vid: string, p: Partial<T.Convo>) => void
  /** A person sends a message: ticks go sent → delivered → read. */
  sendMessage: (vid: string, text: string, who?: string) => void
  startConvo: (cid: string, plat: T.Platform, o?: { agent?: string; camp?: string | null; text?: string; human?: boolean }) => string
  setPref: (k: string, v: unknown) => void
  addCampaign: (c: T.Campaign, setup: T.CampaignSetup) => void
  saveSetup: (id: string, setup: T.CampaignSetup) => void
  setupOf: (id: string) => T.CampaignSetup | undefined
  addAgent: (a: T.Agent) => void
  upsertStage: (pipe: T.Pipe, dir: 'in' | 'out', stage: T.Stage) => void
  removeStage: (pipe: T.Pipe, dir: 'in' | 'out', id: string) => void
  moveStage: (pipe: T.Pipe, dir: 'in' | 'out', id: string, by: -1 | 1) => void
  copyStages: (pipe: T.Pipe, from: 'in' | 'out') => void
  addReport: (r: Omit<T.Report, 'id'>) => T.Report
  liveTick: () => void
}

export const useStore = create<State>((set, get) => ({
  theme: readLS('theme', 'light'), sidebarCollapsed: readLS('sidebar', false), live: true, maxPanelOpen: false, guide: null,
  homePanels: readLS('homePanels', ['attention', 'kpis', 'bookings', 'split', 'activity', 'assigned', 'upcoming', 'agents']),
  homeKpis: readLS('homeKpis', ['convos', 'calls', 'answered', 'texts', 'booked', 'sales', 'revenue', 'cost']),
  biz: seed.biz, folders: seed.folders, campaigns: seed.campaigns, products: seed.products, stages: seed.stages,
  contacts: seed.contacts, dnc: seed.dnc, dups: seed.dups, deadRules: seed.deadRules, sources: seed.sources, customFields: seed.customFields,
  agents: seed.agents.map((a) => ({ ...a, score: reviewOf(a).score })), convos: seed.convos, emails: seed.emails, calls: seed.calls, staff: seed.staff, services: seed.services, hours: seed.hours,
  bookings: seed.bookings, queries: seed.queries, activity: seed.activity, assigned: seed.assigned, notifs: seed.notifs, suggestions: seed.suggestions,
  gs: seed.gs, expenses: seed.expenses, expDaily: seed.expDaily, reportFolders: seed.reportFolders, reports: seed.reports,
  team: seed.team, numbers: seed.numbers, voices: seed.voices, maxThreads: seed.maxThreads,
  bookingSet: seed.bookingSet, setups: {}, prefs: readLS('prefs', {}), recent: {}, tick: 0,

  setTheme: (theme) => { writeLS('theme', theme); set({ theme }) },
  toggleSidebar: () => set((s) => { writeLS('sidebar', !s.sidebarCollapsed); return { sidebarCollapsed: !s.sidebarCollapsed } }),
  setLive: (live) => set({ live }),
  setMaxPanel: (maxPanelOpen) => set({ maxPanelOpen }),
  setGuide: (guide) => set({ guide, maxPanelOpen: guide ? true : get().maxPanelOpen }),
  setHomePanels: (homePanels) => { writeLS('homePanels', homePanels); set({ homePanels }) },
  setHomeKpis: (homeKpis) => { writeLS('homeKpis', homeKpis); set({ homeKpis }) },
  patch: (key, fn) => set((s) => ({ [key]: fn(s[key]) }) as Partial<State>),

  updateContact: (id, p) => set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...p } : c)) })),
  moveLead: (cid, stage, by, note) => {
    const s = get(); const c = s.contacts.find((x) => x.id === cid); if (!c || c.stage === stage) return
    const agentName = s.agents.find((a) => a.id === by)?.name ?? (by === 'you' ? 'You' : by)
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const camp = s.campaigns.find((k) => k.id === c.camp)
    const stg = camp ? seed.stagesOf(camp, s.stages).find((x) => x.name === stage) : undefined
    let patchC: Partial<T.Contact> = { stage, lastDays: 0 }
    if (stg?.rev && !c.sold) patchC = { ...patchC, sold: seed.dISO(0) }
    set({
      recent: { ...s.recent, [cid]: Date.now() },
      contacts: s.contacts.map((x) => (x.id === cid ? { ...x, ...patchC } : x)),
      convos: s.convos.map((v) => (v.cid === cid ? { ...v, items: [...v.items, { t: 'ev', k: 'stage', text: `Stage moved to ${stage} by ${agentName}${note ? ' · ' + note : ''}`, time, stage }] } : v)),
      activity: [{ id: uid('ac'), icon: 'kanban', text: `<b>${agentName}</b> moved <b>${c.name || 'Unknown'}</b> to <b>${stage}</b>`, time: 'just now', k: 'stage', fresh: true }, ...s.activity.map((a) => ({ ...a, fresh: false }))].slice(0, 40),
    })
  },
  addActivity: (a) => set((s) => ({ activity: [{ ...a, id: uid('ac'), fresh: true }, ...s.activity.map((x) => ({ ...x, fresh: false }))].slice(0, 40) })),
  resolveAssigned: (id, outcome) => set((s) => ({ assigned: s.assigned.map((a) => (a.id === id ? { ...a, done: true, outcome: outcome ?? a.outcome } : a)) })),
  reopenAssigned: (id) => set((s) => ({ assigned: s.assigned.map((a) => (a.id === id ? { ...a, done: false, outcome: undefined } : a)) })),
  markNotifsRead: () => set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, read: true })) })),
  updateAgent: (id, p) => set((s) => ({ agents: s.agents.map((a) => { if (a.id !== id) return a; const n = { ...a, ...p }; return { ...n, score: reviewOf(n).score } }) })),
  updateCampaign: (id, p) => set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...p } : c)) })),
  addBooking: (b) => { const nb = { ...b, id: uid('b') }; set((s) => ({ bookings: [...s.bookings, nb] })); return nb },
  updateBooking: (id, p) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...p } : b)) })),
  pushConvoItem: (vid, item) => set((s) => ({ convos: s.convos.map((v) => (v.id === vid ? { ...v, items: [...v.items, item] } : v)) })),
  updateConvo: (vid, p) => set((s) => ({ convos: s.convos.map((v) => (v.id === vid ? { ...v, ...p } : v)) })),
  sendMessage: (vid, text, who = 'you') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const n = get().convos.find((v) => v.id === vid)?.items.length ?? 0
    set((s) => ({ convos: s.convos.map((v) => (v.id === vid ? { ...v, time, unread: false, items: [...v.items, { t: 'm', d: 'o', who, text, time, st: 'sent' }] } : v)) }))
    const tickTo = (st: T.MsgStatus) => set((s) => ({ convos: s.convos.map((v) => (v.id === vid ? { ...v, items: v.items.map((it, i) => (i === n && it.t === 'm' ? { ...it, st } : it)) } : v)) }))
    setTimeout(() => tickTo('delivered'), 900)
    setTimeout(() => tickTo('read'), 2600)
  },
  startConvo: (cid, plat, o = {}) => {
    const s = get(); const c = s.contacts.find((x) => x.id === cid)
    const have = s.convos.find((v) => v.cid === cid && v.plat === plat)
    if (have) { if (o.text) get().sendMessage(have.id, o.text, o.human === false ? o.agent : 'you'); return have.id }
    const id = uid('v'); const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const agent = o.agent ?? c?.agent ?? 's1'
    set({ convos: [{ id, cid, plat, dir: 'out', camp: o.camp ?? c?.camp ?? null, agent, unread: false, needs: false, human: o.human ?? true, time, items: [{ t: 'day', text: 'Today' }, ...(o.human === false ? [{ t: 'ev', k: 'sys', text: `${s.agents.find((a) => a.id === agent)?.name ?? 'The agent'} started this conversation for you${o.camp ? ` using the ${s.campaigns.find((k) => k.id === o.camp)?.name} instructions` : ''}`, time } as T.ConvoItem] : [])] }, ...s.convos] })
    if (o.text) get().sendMessage(id, o.text, o.human === false ? agent : 'you')
    return id
  },
  setPref: (k, v) => set((s) => { const prefs = { ...s.prefs, [k]: v }; writeLS('prefs', prefs); return { prefs } }),
  addCampaign: (c, setup) => set((s) => ({ campaigns: [c, ...s.campaigns], setups: { ...s.setups, [c.id]: setup } })),
  saveSetup: (id, setup) => set((s) => ({ setups: { ...s.setups, [id]: setup }, campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, name: setup.name, dir: setup.dir, sub: setup.sub, biz: setup.biz, pipe: setup.pipe, ch: setup.ch, agents: setup.agents, weights: setup.weights, booking: setup.booking, folder: setup.folder ?? c.folder } : c)) })),
  setupOf: (id) => { const s = get(); const c = s.campaigns.find((x) => x.id === id); return s.setups[id] ?? (c ? seed.setupFor(c) : undefined) },
  addAgent: (a) => set((s) => ({ agents: [...s.agents, { ...a, score: reviewOf(a).score }] })),
  upsertStage: (pipe, dir, stage) => set((s) => {
    const L = s.stages[pipe][dir]; const i = L.findIndex((x) => x.id === stage.id)
    // Keep won/lost stages at the end, so a new open stage lands before them.
    const next = i >= 0 ? L.map((x) => (x.id === stage.id ? stage : x)) : (() => { const at = stage.type === 'open' || stage.type === 'pending' ? L.findIndex((x) => x.type === 'won' || x.type === 'lost') : -1; return at < 0 ? [...L, stage] : [...L.slice(0, at), stage, ...L.slice(at)] })()
    return { stages: { ...s.stages, [pipe]: { ...s.stages[pipe], [dir]: next } } }
  }),
  removeStage: (pipe, dir, id) => set((s) => ({ stages: { ...s.stages, [pipe]: { ...s.stages[pipe], [dir]: s.stages[pipe][dir].filter((x) => x.id !== id) } } })),
  moveStage: (pipe, dir, id, by) => set((s) => {
    const L = [...s.stages[pipe][dir]]; const i = L.findIndex((x) => x.id === id); const j = i + by
    if (i < 0 || j < 0 || j >= L.length) return {}
    ;[L[i], L[j]] = [L[j], L[i]]
    return { stages: { ...s.stages, [pipe]: { ...s.stages[pipe], [dir]: L } } }
  }),
  copyStages: (pipe, from) => set((s) => ({ stages: { ...s.stages, [pipe]: { ...s.stages[pipe], [from === 'out' ? 'in' : 'out']: s.stages[pipe][from].map((x) => ({ ...x, id: uid('st'), criteria: [...x.criteria] })) } } })),
  addReport: (r) => { const nr = { ...r, id: uid('rp') }; set((s) => ({ reports: [nr, ...s.reports] })); return nr },

  liveTick: () => {
    const s = get(); if (!s.live) return
    const n = s.tick + 1
    const k = n % 4
    if (k === 1) {
      // an agent moves a lead one stage forward
      const pool = s.contacts.filter((c) => {
        const cp = s.campaigns.find((x) => x.id === c.camp); if (!cp || cp.status !== 'running') return false
        const L = seed.stagesOf(cp, s.stages); const i = L.findIndex((x) => x.name === c.stage); return i >= 0 && i < L.length - 3 && L[i].type === 'open'
      })
      const c = n === 1 ? s.contacts.find((x) => x.id === 'c4') : pool[Math.floor(Math.random() * pool.length)]
      if (c) {
        const cp = s.campaigns.find((x) => x.id === c.camp)!; const L = seed.stagesOf(cp, s.stages); const i = L.findIndex((x) => x.name === c.stage)
        let nx = L[i + 1]; if (nx && nx.type === 'pending') nx = L[i + 2] || nx
        const by = c.agent || cp.agents.find((a) => /^s/.test(a)) || 's1'
        if (!c.agent) get().updateContact(c.id, { agent: by })
        get().moveLead(c.id, nx.name, by)
      }
    } else if (k === 2) {
      const f = seed.FIRST_NAMES[Math.floor(Math.random() * seed.FIRST_NAMES.length)], l = seed.LAST_NAMES[Math.floor(Math.random() * seed.LAST_NAMES.length)]
      const src = ['Ad campaign', 'Landing page', 'Inbound call'][Math.floor(Math.random() * 3)]
      const c: T.Contact = { id: uid('c'), first: f, last: l, name: `${f} ${l}`, gender: 'F', age: 30, phone: `(905) 555-${1000 + Math.floor(Math.random() * 8999)}`, email: '', address: '', city: 'Mississauga', region: 'ON', country: 'Canada', zip: 'L5A 2K4', folder: 'f7', camp: 'k4', stage: 'New inquiry', dir: 'in', source: src, agent: 's2', purchase: null, lastDays: 0, attempts: 0, noReply: 0, consent: { sms: true, call: true, email: true, wa: true }, dnc: false, tags: [], lang: 'English', notes: '', unknownName: false, custom: {} }
      set({ contacts: [...s.contacts, c], campaigns: s.campaigns.map((x) => (x.id === 'k4' ? { ...x, people: x.people + 1, reached: x.reached + 1 } : x)) })
      get().addActivity({ icon: 'inbox', text: `New inbound lead <b>${c.name}</b> from ${src.toLowerCase()} — Ellie replied in 4 seconds`, time: 'just now', k: 'in' })
    } else if (k === 3) {
      const who = seed.FIRST_NAMES[Math.floor(Math.random() * seed.FIRST_NAMES.length)] + ' ' + seed.LAST_NAMES[Math.floor(Math.random() * seed.LAST_NAMES.length)]
      const b = get().addBooking({ camp: 'k3', staff: ['Hygienist Maya', 'Hygienist Tom', 'Dr. Lee'][Math.floor(Math.random() * 3)], svc: Math.random() < 0.5 ? 'Cleaning' : 'Check-up', who, date: seed.dISO(1), start: (2 + Math.floor(Math.random() * 14)) * 30, dur: 45, status: 'booked', by: Math.random() < 0.5 ? 'r1' : 'r2', created: 'Today', price: 120, conf: ['sms'] })
      const agentName = s.agents.find((a) => a.id === b.by)?.name
      get().addActivity({ icon: 'calendar', text: `<b>${agentName}</b> booked ${b.svc.toLowerCase()} for <b>${b.who}</b> tomorrow`, time: 'just now', k: 'book' })
    } else {
      set({ campaigns: s.campaigns.map((x) => (x.id === 'k1' ? { ...x, reached: x.reached + 3, replied: x.replied + 1 } : x)) })
      get().addActivity({ icon: 'message-square', text: `<b>Mia</b> sent the first message to ${3 + Math.floor(Math.random() * 6)} people in <b>Mississauga Leads</b>`, time: 'just now', k: 'sys' })
    }
    set({ tick: n })
  },
}))

/* Selectors and helpers */
export const useCampaign = (id?: string | null) => useStore((s) => s.campaigns.find((c) => c.id === id))
export const useContact = (id?: string | null) => useStore((s) => s.contacts.find((c) => c.id === id))
export const useAgent = (id?: string | null) => useStore((s) => s.agents.find((a) => a.id === id))
export const agentName = (agents: T.Agent[], id: string | null | undefined) => (id === 'you' ? 'You' : agents.find((a) => a.id === id)?.name ?? '—')
export const contactName = (c?: T.Contact | null) => (c && c.name ? c.name : 'Name missing')
export const scoreOf = (c: T.Contact) => (c.noReply >= 5 ? 'Dead' : c.noReply >= 3 ? 'Not responding' : /Booked|Installed|Completed|Closed|Qualified|Interested|Arrived/.test(c.stage) ? 'Hot' : c.lastDays < 14 ? 'Warm' : 'Cold')
export const stagesFor = (camp: T.Campaign | undefined, stages: T.StageSet) => (camp ? seed.stagesOf(camp, stages) : [])
