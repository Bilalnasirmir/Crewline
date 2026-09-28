export type Dir = 'in' | 'out' | 'both'
export type Platform = 'sms' | 'wa' | 'ig' | 'msg' | 'tt' | 'fb' | 'chat' | 'email' | 'call'
export type AgentType = 'sales' | 'marketing' | 'support' | 'tech' | 'reception' | 'finance'
export type Pipe = 'telecom' | 'realestate' | 'dental'

export interface Business { id: string; name: string; industry: string }

export interface Folder {
  id: string; name: string; parent: string | null; group?: boolean
  count?: number; saved: string; src?: string
}

export type MetricKey = 'people' | 'reached' | 'replied' | 'interested' | 'booked' | 'installed' | 'revenue' | 'cost' | 'cpb' | string

export interface Campaign {
  id: string; name: string; dir: Dir; sub: string; biz: string; pipe: Pipe; folder: string
  ch: Platform[]; status: 'running' | 'paused' | 'scheduled' | 'draft' | 'ended'; started: string
  people: number; reached: number; replied: number; interested: number; booked: number; installed: number
  revenue: number; cost: number; agents: string[]; weights: Record<string, number>; booking: boolean
  metrics: MetricKey[]; budget?: number; skipped?: number
}

/** Everything the campaign wizard sets. Saved per campaign so Settings reopens the same screens. */
export interface CampaignSetup {
  name: string; biz: string; dir: Dir; sub: string
  audience: 'folder' | 'filter' | 'selected'; folder: string | null; filter: string; selected: number; contact: string | null
  ch: Platform[]; pipe: Pipe
  agents: string[]; weights: Record<string, number>; aiAgents: boolean
  follow: { ai: boolean; out: FollowStep[]; in: FollowStep[]; drop: { on: boolean; n: number; cond: string } }
  booking: boolean; takeover: boolean
  qual: QualItem[]; disq: QualItem[]; script: string; kb: string[]; dos: string[]; donts: string[]
  opening: Partial<Record<Platform, string>>; callInfo: string; emailSubject: string; ab: boolean
  products: Products
  when: 'now' | 'later'; date: string; time: string; hours: [string, string]; days: string[]; localTz: boolean; limit: number
  skip?: string[]; budget?: number; holidays?: boolean
}

export interface ProductCat { name: string; items: { name: string; value: number }[] }
export interface Products { cur: string; rev: string; cancel: 'full' | 'partial'; cats: ProductCat[]; pct?: number }

export interface Stage {
  id: string; name: string; color: string; icon: string; criteria: string[]
  rev: boolean; type: 'open' | 'pending' | 'won' | 'lost'
  /** Campaigns this stage applies to. Empty or missing = every campaign that uses this stage set. */
  camps?: string[]
}

export type StageSet = Record<Pipe, { out: Stage[]; in: Stage[] }>

export interface Purchase { product: string; amount: number; date: string }

export interface Contact {
  id: string; first: string; last: string; name: string; gender: 'F' | 'M'; age: number
  phone: string; email: string; address: string; city: string; region: string; country: string; zip: string
  folder: string; camp: string | null; stage: string; dir: 'in' | 'out'; source: string; agent: string | null
  purchase: Purchase | null; sold?: string; lastDays: number; attempts: number; noReply: number
  consent: { sms: boolean; call: boolean; email: boolean; wa: boolean }; dnc: boolean; tags: string[]
  lang: string; notes: string; unknownName: boolean; custom: Record<string, string>
}

export interface DncEntry { id: string; name: string; phone: string; reason: string; added: string; by: string; comment: string }
export interface Dup { a: DupSide; b: DupSide; why: string }
export interface DupSide { name: string; phone: string; email: string; src: string }

export interface AgentMetricDef { key: string; label: string; unit: string }
export interface AgentTypeDef { label: string; icon: string; desc: string; metrics: AgentMetricDef[] }

export interface QualItem { text: string; imp: 'Required' | 'Preferred' | 'Optional' }
export interface Question { q: string; req: 'Required' | 'Optional' | 'Not required'; att: string; cond: string }
export interface Job {
  purposes: string[]; goal: string; target: string; exclude: { on: boolean; who: string }
  products: string; pricing: string; billing: string; eligible: string[]; notEligible: string[]; important: string[]
  qual: QualItem[]; disq: QualItem[]; questions: Question[]; collect: string[]; rec: string[]
  whenQual: string; whenDisq: string[]; cantDecide: string; triggers: string[]; handTo: string
  restrict: string[]; follow: string[]; tone: string; style: string; posture: string; compliance: string[]; script: string
}
export interface KbItem { k: 'file' | 'link' | 'text' | 'video' | 'image'; n: string; s: string }
export interface KbFolder { id: string; name: string; date: string; items: KbItem[] }
export interface FollowStep { if: string; after: string; then: string; by: string; tpl: string }
export interface HttpAction { name: string; prompt: string; method: string; url: string; params: [string, string][]; headers: [string, string][]; fields: string[] }
/** A saved version. `snap` holds its settings when it was saved in this workspace, so switching back restores them. */
export interface Version { v: number; label: string; date: string; snap?: AgentSnap }
/** The versioned part of an agent (not its stats, campaigns or on/off status). */
export type AgentSnap = Omit<Agent, 'id' | 'versions' | 'ver' | 'ws' | 'history' | 'global' | 'camps' | 'status' | 'score' | 'edited'>

export interface Agent {
  id: string; type: AgentType; name: string; g: 'F' | 'M'; voice: string; mode: 'Voice agent' | 'Chat agent'
  dir: Dir; langs: string[]; camps: string[]; status: 'live' | 'ready' | 'paused' | 'draft'
  style: { call: string; text: string; email: string }; edited: boolean; ver: number; versions: Version[]
  global: { success: number; conv: number; accounts: string }; ws: Record<string, number>
  history: { camp: string; ind: string; calls: number; texts: number; conv: number }[]
  instr: string; template: string; job: Job; qa: { q: string; a: string }[]; kb: KbFolder[]
  act: Record<string, boolean>; rules: Record<string, boolean>; discount: number
  handoff: { on: boolean; stage: string; mode: 'same' | 'another' | 'human'; to: string }
  follow: { ai: boolean; out: FollowStep[]; in: FollowStep[]; drop: { on: boolean; n: number; cond: string } }
  booking: boolean; http: HttpAction[]; score: number
}

export type MsgStatus = 'sent' | 'delivered' | 'read'
export type ConvoItem =
  | { t: 'day'; text: string }
  | { t: 'm'; d: 'i' | 'o'; who: string | null; text: string; time: string; st: MsgStatus }
  | { t: 'ev'; k: 'stage' | 'hand' | 'sys' | 'book'; text: string; time: string; stage?: string; query?: boolean }
  | { t: 'call'; d: 'i' | 'o'; who: string; dur: string; time: string; summary: string; tr: [string, string][] }
  | { t: 'inchat'; k: 'book' | 'stage'; text: string; time: string; stage?: string; resolved?: boolean }
  | { t: 'quote'; no: string; lines: [string, number][]; total: number; cur: string; time: string; via: string[] }

export interface Convo {
  id: string; cid: string; plat: Platform; dir: 'in' | 'out'; camp: string | null; agent: string
  unread: boolean; needs: boolean; reason?: string; human: boolean; query?: boolean; time: string; items: ConvoItem[]
}

export interface Email {
  id: string; box: 'inbox' | 'sent' | 'drafts' | 'scheduled' | 'archive' | 'trash'; cid: string | null; from: string; addr: string; to: string
  subj: string; body: string; time: string; unread: boolean; camp: string | null; agent: string | null; dir: 'in' | 'out'; att?: string[]; starred?: boolean
}
export interface Call {
  id: string; cid: string | null; num?: string; dir: 'in' | 'out'; status: 'answered' | 'missed' | 'failed' | 'voicemail'
  by: string | null; camp: string | null; dur: string; time: string; summary: string
}

export interface Service { n: string; dur: number; staff: string; buf: number; price: number; cap: number; extra?: Record<string, string> }
export interface BookingSettings {
  cap: number; capLabel: string; interval: number; notice: string; ahead: string
  reminders: { when: string; via: string }[]; confirm: string[]; page: boolean; slug: string
  sync: Record<string, boolean>; closures: { date: string; note: string }[]; cols: string[]
}
export type BookingStatus = 'requested' | 'booked' | 'arrived' | 'completed' | 'cancelled' | 'noshow'
export interface Booking {
  id: string; camp: string; staff: string; svc: string; who: string; cid?: string; date: string; start: number; dur: number
  status: BookingStatus; by: string; created: string; price: number; conf: string[]
}
export interface Query { id: string; cid: string | null; who: string; ch: Platform; q: string; a: string; agent: string; camp: string; time: string; out: string }

export interface Activity { id: string; icon: string; text: string; time: string; k: string; fresh?: boolean }
export interface Assigned {
  id: string; kind: 'hand' | 'book' | 'stage' | 'angry' | 'qual' | 'number'; title: string; desc: string; cid: string | null; camp: string | null; convo: string | null; time: string; rec?: boolean; done?: boolean
  /** Call summary, transcript and the AI's best guess, shown in Review for me. */
  summary?: string; tr?: [string, string][]; suggest?: string; newPhone?: string; outcome?: string
}
export interface Notif { id: string; text: string; time: string; read: boolean; go: string }
export interface Suggestion { id: string; area: string; title: string; fix: string; go: string }
export interface GsStep { k: string; l: string; d: string; done: boolean }

export interface Expense { n: string; prov: string; cat: string; ch: string; unit: string; qty: number; rate: number; cost: number; by: Record<string, number> }
export interface ReportFolder { id: string; name: string; parent: string | null }
export interface Report { id: string; name: string; folder: string; date: string; by: string; kind: string; q?: string }
export interface TeamMember { name: string; role: string; scope: string; email: string }
export interface PhoneNumber { n: string; l: string; agent: string; ty: string }
export interface MaxThread { id: string; title: string; date: string; msgs: MaxMsg[] }
export interface MaxMsg { id: string; role: 'user' | 'max'; text?: string; blocks?: any[]; time: string; streaming?: boolean }
