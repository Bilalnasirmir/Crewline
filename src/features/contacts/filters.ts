import type { Contact } from '@/data/types'
import { useStore } from '@/store'

export type FilterDef = {
  k: string; group: string; label: string
  type: 'multi' | 'one' | 'yn' | 'range' | 'text' | 'recency'
  opts?: () => { v: string; l: string }[]
  def: any
  test: (c: Contact, v: any) => boolean
  say: (v: any) => string
}

const S = () => useStore.getState()
const within = (iso: string | undefined, days: number) => { if (!iso) return false; const d = (Date.now() - new Date(iso).getTime()) / 864e5; return d <= days }

export const FILTERS: FilterDef[] = [
  { k: 'city', group: 'Location', label: 'City', type: 'multi', opts: () => uniq(S().contacts.map((c) => c.city)), def: [], test: (c, v) => !v.length || v.includes(c.city), say: (v) => `City is ${list(v)}` },
  { k: 'zip', group: 'Location', label: 'Postal / zip code', type: 'text', def: '', test: (c, v) => !v || v.split(/[,\s]+/).filter(Boolean).some((z: string) => c.zip.toLowerCase().startsWith(z.toLowerCase())), say: (v) => `Zip starts with ${v}` },
  { k: 'country', group: 'Location', label: 'Country', type: 'multi', opts: () => uniq(S().contacts.map((c) => c.country)), def: [], test: (c, v) => !v.length || v.includes(c.country), say: (v) => `Country is ${list(v)}` },
  { k: 'address', group: 'Location', label: 'Address contains', type: 'text', def: '', test: (c, v) => !v || c.address.toLowerCase().includes(v.toLowerCase()), say: (v) => `Address contains “${v}”` },
  { k: 'gender', group: 'Profile', label: 'Gender', type: 'one', opts: () => [{ v: 'F', l: 'Female' }, { v: 'M', l: 'Male' }], def: 'F', test: (c, v) => c.gender === v, say: (v) => (v === 'F' ? 'Women' : 'Men') },
  { k: 'age', group: 'Profile', label: 'Age', type: 'range', def: [25, 45], test: (c, v) => c.age >= v[0] && c.age <= v[1], say: (v) => `Age ${v[0]}–${v[1]}` },
  { k: 'lang', group: 'Profile', label: 'Language', type: 'multi', opts: () => uniq(S().contacts.map((c) => c.lang)), def: [], test: (c, v) => !v.length || v.includes(c.lang), say: (v) => `Speaks ${list(v)}` },
  { k: 'hasEmail', group: 'Profile', label: 'Has an email', type: 'yn', def: 'yes', test: (c, v) => !!c.email === (v === 'yes'), say: (v) => (v === 'yes' ? 'Has an email' : 'Missing email') },
  { k: 'hasName', group: 'Profile', label: 'Has a name', type: 'yn', def: 'no', test: (c, v) => !!c.name === (v === 'yes'), say: (v) => (v === 'yes' ? 'Has a name' : 'Missing name') },
  { k: 'hasAddress', group: 'Profile', label: 'Has an address', type: 'yn', def: 'no', test: (c, v) => !!c.address === (v === 'yes'), say: (v) => (v === 'yes' ? 'Has an address' : 'Missing address') },
  { k: 'tag', group: 'Profile', label: 'Tag', type: 'text', def: '', test: (c, v) => !v || c.tags.some((t) => t.toLowerCase().includes(v.toLowerCase())), say: (v) => `Tagged “${v}”` },
  { k: 'stage', group: 'Activity', label: 'Stage', type: 'multi', opts: () => uniq(S().contacts.map((c) => c.stage).filter((x) => x !== '—')), def: [], test: (c, v) => !v.length || v.includes(c.stage), say: (v) => `Stage is ${list(v)}` },
  { k: 'camp', group: 'Activity', label: 'Campaign', type: 'multi', opts: () => S().campaigns.map((k) => ({ v: k.id, l: k.name })), def: [], test: (c, v) => !v.length || (!!c.camp && v.includes(c.camp)), say: (v) => `In ${v.map((id: string) => S().campaigns.find((k) => k.id === id)?.name).join(' or ')}` },
  { k: 'folder', group: 'Activity', label: 'Lead folder', type: 'multi', opts: () => S().folders.filter((f) => !f.group).map((f) => ({ v: f.id, l: f.name })), def: [], test: (c, v) => !v.length || v.includes(c.folder), say: (v) => `Folder: ${v.map((id: string) => S().folders.find((f) => f.id === id)?.name).join(', ')}` },
  { k: 'dir', group: 'Activity', label: 'Inbound / outbound', type: 'one', opts: () => [{ v: 'in', l: 'Inbound' }, { v: 'out', l: 'Outbound' }], def: 'in', test: (c, v) => c.dir === v, say: (v) => (v === 'in' ? 'Inbound leads' : 'Outbound leads') },
  { k: 'source', group: 'Activity', label: 'Lead source', type: 'multi', opts: () => S().sources.map((s) => ({ v: s.n, l: s.n })), def: [], test: (c, v) => !v.length || v.includes(c.source), say: (v) => `Source: ${list(v)}` },
  { k: 'agent', group: 'Activity', label: 'Handled by agent', type: 'multi', opts: () => S().agents.map((a) => ({ v: a.id, l: a.name })), def: [], test: (c, v) => !v.length || (!!c.agent && v.includes(c.agent)), say: (v) => `Agent: ${v.map((id: string) => S().agents.find((a) => a.id === id)?.name).join(', ')}` },
  { k: 'contacted', group: 'Activity', label: 'Last contacted', type: 'recency', def: { m: 'in', d: 30 }, test: (c, v) => (v.m === 'in' ? c.lastDays <= v.d : c.lastDays > v.d), say: (v) => `${v.m === 'in' ? 'Contacted' : 'Not contacted'} in the last ${v.d} days` },
  { k: 'attempts', group: 'Activity', label: 'Attempts', type: 'range', def: [3, 10], test: (c, v) => c.attempts >= v[0] && c.attempts <= v[1], say: (v) => `${v[0]}–${v[1]} attempts` },
  { k: 'bought', group: 'Purchases', label: 'Bought a product', type: 'yn', def: 'yes', test: (c, v) => !!c.purchase === (v === 'yes'), say: (v) => (v === 'yes' ? 'Bought something' : 'Never bought') },
  { k: 'boughtWithin', group: 'Purchases', label: 'Bought within', type: 'one', opts: () => [{ v: '30', l: '30 days' }, { v: '90', l: '3 months' }, { v: '180', l: '6 months' }, { v: '365', l: '12 months' }], def: '90', test: (c, v) => within(c.purchase?.date, +v), say: (v) => `Bought in the last ${v} days` },
  { k: 'product', group: 'Purchases', label: 'Product', type: 'multi', opts: () => uniq(S().contacts.map((c) => c.purchase?.product).filter(Boolean) as string[]), def: [], test: (c, v) => !v.length || (!!c.purchase && v.includes(c.purchase.product)), say: (v) => `Bought ${list(v)}` },
  { k: 'score', group: 'Data quality', label: 'Lead score', type: 'multi', opts: () => ['Hot', 'Warm', 'Cold', 'Not responding', 'Dead'].map((x) => ({ v: x, l: x })), def: [], test: (c, v) => !v.length || v.includes(score(c)), say: (v) => `Score: ${list(v)}` },
  { k: 'dnc', group: 'Data quality', label: 'On Do-Not-Contact', type: 'yn', def: 'no', test: (c, v) => c.dnc === (v === 'yes'), say: (v) => (v === 'yes' ? 'On Do-Not-Contact' : 'Not on Do-Not-Contact') },
  { k: 'consent', group: 'Data quality', label: 'Agreed to', type: 'multi', opts: () => [{ v: 'sms', l: 'Texts' }, { v: 'call', l: 'Calls' }, { v: 'email', l: 'Emails' }, { v: 'wa', l: 'WhatsApp' }], def: [], test: (c, v) => v.every((k: string) => (c.consent as any)[k]), say: (v) => `Agreed to ${list(v)}` },
]
export const FD = Object.fromEntries(FILTERS.map((f) => [f.k, f]))
export type Filter = { k: string; v: any }

const uniq = (a: string[]) => Array.from(new Set(a)).filter(Boolean).sort().map((x) => ({ v: x, l: x }))
const list = (v: string[]) => (v.length ? v.join(' or ') : 'anything')
export const score = (c: Contact) => (c.noReply >= 5 ? 'Dead' : c.noReply >= 3 ? 'Not responding' : /Booked|Installed|Completed|Closed|Qualified|Interested|Arrived/.test(c.stage) ? 'Hot' : c.lastDays < 14 ? 'Warm' : 'Cold')

export function runFilters(list: Contact[], fs: Filter[], match: 'all' | 'any' = 'all') {
  if (!fs.length) return list
  return list.filter((c) => { const r = fs.map((f) => FD[f.k]?.test(c, f.v) ?? true); return match === 'any' ? r.some(Boolean) : r.every(Boolean) })
}
export const sayFilter = (f: Filter) => FD[f.k]?.say(f.v) ?? f.k

/** Turn plain English into filters. Returns filters plus a note about what was understood / missing. */
export function parseNL(text: string): { filters: Filter[]; note: string } {
  const t = text.toLowerCase(); const fs: Filter[] = []; const notes: string[] = []
  const cities = ['mississauga', 'toronto', 'brampton', 'brooklyn', 'manhattan', 'karachi'].filter((c) => t.includes(c))
  if (cities.length) fs.push({ k: 'city', v: cities.map((c) => c[0].toUpperCase() + c.slice(1)) })
  if (/\b(women|woman|female|ladies)\b/.test(t)) fs.push({ k: 'gender', v: 'F' }); else if (/\b(men|man|male)\b/.test(t)) fs.push({ k: 'gender', v: 'M' })
  if (/(no|without|missing) email/.test(t)) fs.push({ k: 'hasEmail', v: 'no' }); else if (/(with|have|has|got) (an )?email/.test(t)) fs.push({ k: 'hasEmail', v: 'yes' })
  if (/(no|without|missing) (a )?name/.test(t)) fs.push({ k: 'hasName', v: 'no' })
  const m = t.match(/(?:last|past)\s+(\d+|few|couple of)?\s*(day|week|month|year)s?/)
  if (/never (bought|purchased)|haven.?t bought/.test(t)) fs.push({ k: 'bought', v: 'no' })
  else if (/bought|purchased|customer/.test(t)) { if (m) { const n = m[1] && /\d/.test(m[1]) ? +m[1] : m[1] ? 3 : 1; const d = n * ({ day: 1, week: 7, month: 30, year: 365 } as any)[m[2]]; fs.push({ k: 'boughtWithin', v: String(d <= 30 ? 30 : d <= 90 ? 90 : d <= 180 ? 180 : 365) }) } else fs.push({ k: 'bought', v: 'yes' }) }
  else if (m && /contact/.test(t)) { const n = m[1] && /\d/.test(m[1]) ? +m[1] : 1; fs.push({ k: 'contacted', v: { m: /not|haven/.test(t) ? 'out' : 'in', d: n * ({ day: 1, week: 7, month: 30, year: 365 } as any)[m[2]] } }) }
  const a = t.match(/(?:aged?|between)\s*(\d{2})\s*(?:-|to|and)\s*(\d{2})/); if (a) fs.push({ k: 'age', v: [+a[1], +a[2]] })
  else { const o = t.match(/(?:over|above|older than)\s*(\d{2})/); if (o) fs.push({ k: 'age', v: [+o[1], 99] }); const u = t.match(/(?:under|below|younger than)\s*(\d{2})/); if (u) fs.push({ k: 'age', v: [18, +u[1]] }) }
  if (/spanish/.test(t)) fs.push({ k: 'lang', v: ['Spanish'] }); if (/urdu/.test(t)) fs.push({ k: 'lang', v: ['Urdu'] })
  if (/inbound/.test(t)) fs.push({ k: 'dir', v: 'in' }); else if (/outbound/.test(t)) fs.push({ k: 'dir', v: 'out' })
  if (/dead/.test(t)) fs.push({ k: 'score', v: ['Dead'] }); else if (/not responding/.test(t)) fs.push({ k: 'score', v: ['Not responding'] }); else if (/\bhot\b/.test(t)) fs.push({ k: 'score', v: ['Hot'] })
  const st = S().contacts.map((c) => c.stage).find((s) => s !== '—' && t.includes(s.toLowerCase())); if (st) fs.push({ k: 'stage', v: [st] })
  const z = t.match(/\b([lm]\d[a-z]|\d{5})\b/i); if (z) fs.push({ k: 'zip', v: z[1].toUpperCase() })
  if (!fs.length) notes.push('I couldn’t turn that into filters. Try a city, gender, “with email”, “bought in the last 3 months”, a stage or a zip code.')
  else if (!cities.length && !z && !/all|everyone/.test(t)) notes.push('No location given, so this covers every city. Add one if you want to narrow it.')
  return { filters: fs, note: notes.join(' ') }
}
