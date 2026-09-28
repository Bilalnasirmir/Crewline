import * as React from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Copy, Check, Lock, Sparkles, Mic, CalendarDays, Sheet as SheetIcon, FileSpreadsheet, Mail, ExternalLink, AlertTriangle } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch, Checkbox } from '@/components/ui/controls'
import { Segmented } from '@/components/ui/tabs'
import { Combobox } from '@/components/ui/combobox'
import { Banner } from '@/components/ui/card'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { askText } from '@/components/app/ask'
import { PlatIcon } from '@/components/app/icons'
import { dISO, dNice } from '@/data/seed'
import type { Booking, BookingSettings, BookingStatus, Service } from '@/data/types'

/* Booking times are minutes after the day starts at 9:00 AM (the calendar shows 9 AM – 7 PM). */
export const DAY0 = 540, DAY_LEN = 600
export const fmtMin = (m: number) => { const t = DAY0 + m, h = Math.floor(t / 60), mm = t % 60; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
export const hhmm = (m: number) => { const t = DAY0 + m; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` }
export const fromHHMM = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m - DAY0 }
/** The sample "now": 12:00 PM on the sample today. */
export const NOW_MIN = 180

/* Date helpers on ISO dates (yyyy-mm-dd), worked out at noon so time zones never shift the day. */
export const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
export const addMonths = (iso: string, n: number) => { const d = new Date(iso.slice(0, 8) + '01T12:00:00'); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10) }
export const daysBetween = (a: string, b: string) => Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 864e5)
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const dayKey = (iso: string) => WEEKDAYS[(new Date(iso + 'T12:00:00').getDay() + 6) % 7]
export const weekStart = (iso: string) => addDays(iso, -WEEKDAYS.indexOf(dayKey(iso)))

export const STATUS: Record<BookingStatus, { l: string; c: string }> = {
  requested: { l: 'Requested', c: '#C68A12' }, booked: { l: 'Booked', c: '#005BD3' }, arrived: { l: 'Arrived', c: '#0891B2' },
  completed: { l: 'Completed', c: '#047B5D' }, noshow: { l: 'No-show', c: '#C70A24' }, cancelled: { l: 'Cancelled', c: '#8A8A8A' },
}
export function StatusBadge({ s, className }: { s: BookingStatus; className?: string }) {
  const d = STATUS[s]
  return <span className={cn('inline-flex h-5 shrink-0 items-center gap-1.5 rounded-tag px-2 text-xs font-medium text-text', className)} style={{ background: d.c + '24' }}><span className="size-1.5 rounded-full" style={{ background: d.c }} />{d.l}</span>
}
export const BOOKING_CAMPS = ['k3', 'k1', 'k2', 'k4']
export const campLabel = (id: string) => useStore.getState().campaigns.find((c) => c.id === id)?.name ?? 'New campaign'
const CONF = [['sms', 'Text'], ['email', 'Email'], ['wa', 'WhatsApp']] as const
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIMES = Array.from({ length: 33 }, (_, i) => { const t = 360 + i * 30; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` })
const t12 = (s: string) => { const [h, m] = s.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }

const defaultSet = (): BookingSettings => ({ cap: 1, capLabel: 'people', interval: 30, notice: '2 hours', ahead: '30 days', reminders: [{ when: '24 hours before', via: 'Text' }], confirm: ['sms'], page: false, slug: 'my-business', sync: { gcal: false, sheets: false, excel: false, outlook: false }, closures: [], cols: [] })
const defaultHours = (): Record<string, [string, string, boolean]> => Object.fromEntries(DAYS.map((d) => [d, ['09:00', '17:00', d !== 'Sun']])) as Record<string, [string, string, boolean]>

type Tab = 'services' | 'capacity' | 'hours' | 'reminders' | 'page' | 'sync' | 'ai'

/** The booking settings pop-up. Same one for a campaign, an agent or the Bookings page. Keyed by campaign (or agent) id. */
export function BookingSettingsDialog({ open, onOpenChange, camp, title, startTab = 'services' }: { open: boolean; onOpenChange: (o: boolean) => void; camp: string; title?: string; startTab?: Tab }) {
  const st = useStore()
  const [tab, setTab] = React.useState<Tab>(startTab)
  const [svcs, setSvcs] = React.useState<Service[]>([]); const [hrs, setHrs] = React.useState<Record<string, [string, string, boolean]>>({})
  const [set, setSet] = React.useState<BookingSettings>(defaultSet()); const [team, setTeam] = React.useState<string[]>([])
  const [desc, setDesc] = React.useState(''); const [plan, setPlan] = React.useState<string[] | null>(null)
  React.useEffect(() => {
    if (!open) return
    setTab(startTab); setPlan(null); setDesc('')
    setSvcs(structuredClone(st.services[camp] ?? st.services.k3.slice(0, 2)))
    setHrs(structuredClone(st.hours[camp] ?? defaultHours()))
    setSet(structuredClone(st.bookingSet[camp] ?? defaultSet()))
    setTeam([...(st.staff[camp] ?? ['Front desk'])])
  }, [open, camp]) // reads the latest store values when the dialog opens
  const save = () => {
    st.patch('services', (x) => ({ ...x, [camp]: svcs })); st.patch('hours', (x) => ({ ...x, [camp]: hrs }))
    st.patch('bookingSet', (x) => ({ ...x, [camp]: set })); st.patch('staff', (x) => ({ ...x, [camp]: team }))
    onOpenChange(false); toast.success('Booking settings saved · agents use them right away')
  }
  const upd = (i: number, p: Partial<Service>) => setSvcs(svcs.map((s, j) => (j === i ? { ...s, ...p } : s)))
  const embed = `<script src="https://book.crewline.app/embed.js" data-page="${set.slug}" async></script>`
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" title={title ?? 'Booking settings'} description={campLabel(camp)} bodyClassName="p-0"
        footer={<><span className="mr-auto hidden items-center gap-1.5 text-sm text-muted sm:flex"><Lock className="size-3.5" />Double bookings are always prevented</span><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" onClick={save}>Save</Button></>}>
        <div className="sticky top-0 z-[2] overflow-x-auto border-b border-border bg-surface px-4 py-2 [scrollbar-width:none]">
          <Segmented value={tab} onChange={setTab} options={[{ value: 'services', label: 'Services' }, { value: 'capacity', label: 'Capacity & team' }, { value: 'hours', label: 'Hours' }, { value: 'reminders', label: 'Reminders' }, { value: 'page', label: 'Booking page' }, { value: 'sync', label: 'Sync' }, { value: 'ai', label: 'Explain with AI', icon: <Sparkles /> }]} />
        </div>
        <div className="p-4">
          {tab === 'services' && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Anything your business books: treatments, viewings, installs, tables. Add your own columns for details only you need.</p>
              <div className="overflow-x-auto rounded-card border border-border">
                <Table>
                  <thead><tr><Th>Service</Th><Th>Length</Th><Th>Staff</Th><Th>Gap after</Th><Th>Price</Th><Th>At once</Th>{set.cols.map((c) => <Th key={c}>{c}</Th>)}<Th className="w-8" /></tr></thead>
                  <tbody>{svcs.map((s, i) => (
                    <Tr key={i}>
                      <Td><Input className="h-7 min-w-[150px] md:h-7" value={s.n} onChange={(e) => upd(i, { n: e.target.value })} /></Td>
                      <Td><Select size="sm" className="w-[104px]" value={String(s.dur)} onValueChange={(v) => upd(i, { dur: +v })} options={[15, 30, 45, 60, 90, 120, 180].map((m) => ({ value: String(m), label: m < 60 ? `${m} min` : `${m / 60} h${m % 60 ? ' 30' : ''}` }))} /></Td>
                      <Td><Select size="sm" className="w-[150px]" value={s.staff} onValueChange={(v) => upd(i, { staff: v })} options={[...new Set(['Anyone', s.staff, ...team.map((t) => `${t} only`)])].map((x) => ({ value: x, label: x }))} /></Td>
                      <Td><Select size="sm" className="w-[92px]" value={String(s.buf)} onValueChange={(v) => upd(i, { buf: +v })} options={[0, 5, 10, 15, 30].map((m) => ({ value: String(m), label: m ? `${m} min` : 'None' }))} /></Td>
                      <Td><Input className="h-7 w-20 md:h-7" inputMode="decimal" value={s.price} onChange={(e) => upd(i, { price: +e.target.value || 0 })} /></Td>
                      <Td><Input className="h-7 w-14 md:h-7" inputMode="numeric" value={s.cap} onChange={(e) => upd(i, { cap: +e.target.value || 1 })} /></Td>
                      {set.cols.map((c) => <Td key={c}><Input className="h-7 w-28 md:h-7" value={s.extra?.[c] ?? ''} onChange={(e) => upd(i, { extra: { ...s.extra, [c]: e.target.value } })} /></Td>)}
                      <Td><Button variant="ghost" size="icon-xs" onClick={() => setSvcs(svcs.filter((_, j) => j !== i))} aria-label="Remove service"><Trash2 /></Button></Td>
                    </Tr>
                  ))}</tbody>
                </Table>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setSvcs([...svcs, { n: 'New service', dur: 30, staff: 'Anyone', buf: 0, price: 0, cap: 1 }])}><Plus />Add service</Button>
                <Button variant="ghost" onClick={async () => { const c = await askText({ title: 'Add a column', label: 'Column name', placeholder: 'e.g. Room, Insurance, Table size' }); if (c) setSet({ ...set, cols: [...set.cols, c] }) }}><Plus />Add a column</Button>
              </div>
            </div>
          )}
          {tab === 'capacity' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-card border border-border p-3">
                <h3>How many at the same time?</h3>
                <div className="flex items-center gap-2"><Input className="w-20" inputMode="numeric" value={set.cap} onChange={(e) => setSet({ ...set, cap: +e.target.value || 1 })} /><Input className="w-40" value={set.capLabel} onChange={(e) => setSet({ ...set, capLabel: e.target.value })} placeholder="tables, chairs, rooms" /></div>
                <p className="text-sm text-muted">e.g. a restaurant with 10 tables. As they fill up, agents see what’s left and only offer free times.</p>
                <Field label="Offer times every"><Select value={String(set.interval)} onValueChange={(v) => setSet({ ...set, interval: +v })} options={[10, 15, 20, 30, 60].map((m) => ({ value: String(m), label: `${m} minutes` }))} /></Field>
                <Field label="Earliest booking"><Select value={set.notice} onValueChange={(notice) => setSet({ ...set, notice })} options={['Right away', '1 hour', '2 hours', '3 hours', '1 day', '2 days'].map((x) => ({ value: x, label: x === 'Right away' ? x : `${x} from now` }))} /></Field>
                <Field label="How far ahead"><Select value={set.ahead} onValueChange={(ahead) => setSet({ ...set, ahead })} options={['7 days', '14 days', '21 days', '30 days', '60 days', '90 days'].map((x) => ({ value: x, label: `Up to ${x}` }))} /></Field>
              </div>
              <div className="space-y-3 rounded-card border border-border p-3">
                <h3>Team who can be booked</h3>
                <div className="space-y-1">{team.map((t, i) => <div key={i} className="flex items-center gap-2"><Input className="h-7 md:h-7" value={t} onChange={(e) => setTeam(team.map((x, j) => (j === i ? e.target.value : x)))} /><Button variant="ghost" size="icon-xs" onClick={() => setTeam(team.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 /></Button></div>)}</div>
                <Button onClick={() => setTeam([...team, 'New person'])}><Plus />Add person or resource</Button>
                <div className="flex items-start gap-2 rounded-control bg-subtle-2 p-2 text-sm"><Lock className="mt-0.5 size-4 shrink-0 text-icon" />Every booking locks its time for all agents at once, so two callers can never get the same slot.</div>
              </div>
            </div>
          )}
          {tab === 'hours' && (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="rounded-card border border-border">
                {DAYS.map((d) => { const [a, b, on] = hrs[d] ?? ['09:00', '17:00', false]; return (
                  <div key={d} className="flex flex-wrap items-center gap-3 border-b border-border-2 px-3 py-2 last:border-0">
                    <Switch checked={on} onCheckedChange={(v) => setHrs({ ...hrs, [d]: [a, b, v] })} aria-label={`Open on ${d}`} />
                    <span className="w-10 text-sm font-medium">{d}</span>
                    {on ? <><Select size="sm" className="w-[112px]" value={a} onValueChange={(v) => setHrs({ ...hrs, [d]: [v, b, on] })} options={TIMES.map((t) => ({ value: t, label: t12(t) }))} /><span className="text-sm text-muted">to</span><Select size="sm" className="w-[112px]" value={b} onValueChange={(v) => setHrs({ ...hrs, [d]: [a, v, on] })} options={TIMES.map((t) => ({ value: t, label: t12(t) }))} /></> : <span className="text-sm text-muted">Closed</span>}
                  </div>
                ) })}
              </div>
              <div className="space-y-2 rounded-card border border-border p-3">
                <h3>Closed days</h3>
                {set.closures.map((c, i) => <div key={i} className="flex items-center gap-2 text-sm"><CalendarDays className="size-4 text-icon" /><span className="w-24 tabular">{dNice(c.date)}</span><span className="min-w-0 flex-1 truncate text-muted">{c.note}</span><Button variant="ghost" size="icon-xs" onClick={() => setSet({ ...set, closures: set.closures.filter((_, j) => j !== i) })} aria-label="Remove"><Trash2 /></Button></div>)}
                {!set.closures.length && <p className="text-sm text-muted">No closed days.</p>}
                <Button onClick={async () => { const n = await askText({ title: 'Add a closed day', label: 'Reason', placeholder: 'e.g. Staff training', value: 'Holiday' }); if (n) setSet({ ...set, closures: [...set.closures, { date: dISO(14), note: n }] }) }}><Plus />Add a closed day</Button>
              </div>
            </div>
          )}
          {tab === 'reminders' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-card border border-border p-3">
                <h3>Reminders</h3>
                {set.reminders.map((r, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Select size="sm" className="w-[160px]" value={r.when} onValueChange={(when) => setSet({ ...set, reminders: set.reminders.map((x, j) => (j === i ? { ...x, when } : x)) })} options={['1 week before', '2 days before', '1 day before', '24 hours before', 'Morning of', '2 hours before', '1 hour before'].map((x) => ({ value: x, label: x }))} />
                    <span className="text-sm text-muted">by</span>
                    <Select size="sm" className="w-[120px]" value={r.via} onValueChange={(via) => setSet({ ...set, reminders: set.reminders.map((x, j) => (j === i ? { ...x, via } : x)) })} options={['Text', 'Email', 'WhatsApp', 'Call'].map((x) => ({ value: x, label: x }))} />
                    <Button variant="ghost" size="icon-xs" onClick={() => setSet({ ...set, reminders: set.reminders.filter((_, j) => j !== i) })} aria-label="Remove reminder"><Trash2 /></Button>
                  </div>
                ))}
                <Button onClick={() => setSet({ ...set, reminders: [...set.reminders, { when: '2 hours before', via: 'Text' }] })}><Plus />Add reminder</Button>
              </div>
              <div className="space-y-2 rounded-card border border-border p-3">
                <h3>Confirmation after booking</h3>
                <p className="text-sm text-muted">Pick one, several or all.</p>
                {CONF.map(([k, l]) => <label key={k} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 text-sm hover:bg-subtle-2"><Checkbox checked={set.confirm.includes(k)} onCheckedChange={(v) => setSet({ ...set, confirm: v ? [...set.confirm, k] : set.confirm.filter((x) => x !== k) })} /><PlatIcon p={k} size={14} tip={false} />{l}</label>)}
              </div>
            </div>
          )}
          {tab === 'page' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 rounded-card border border-border p-3"><span><span className="block text-sm font-medium">Self-booking page</span><span className="block text-sm text-muted">Customers pick a service and a free time themselves. It follows the same hours and capacity.</span></span><Switch checked={set.page} onCheckedChange={(page) => setSet({ ...set, page })} /></label>
              <div className={cn('space-y-3', !set.page && 'pointer-events-none opacity-50')}>
                <Field label="Page address"><div className="flex items-center gap-2"><span className="shrink-0 text-sm text-muted">book.crewline.app/</span><Input value={set.slug} onChange={(e) => setSet({ ...set, slug: e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase() })} /><Button onClick={() => { navigator.clipboard?.writeText(`https://book.crewline.app/${set.slug}`); toast('Link copied') }}><Copy />Copy link</Button><Button variant="ghost" onClick={() => toast('Opening the booking page preview (demo)')}><ExternalLink />Preview</Button></div></Field>
                <Field label="Put it on your website" hint="Paste this where the booking button should appear. Works on any website builder or profile link.">
                  <div className="flex items-start gap-2"><Textarea readOnly value={embed} className="min-h-16 font-mono text-xs" /><Button onClick={() => { navigator.clipboard?.writeText(embed); toast('Embed code copied') }}><Copy />Copy code</Button></div>
                </Field>
              </div>
            </div>
          )}
          {tab === 'sync' && (
            <div className="divide-y divide-border-2 rounded-card border border-border">
              {([['gcal', 'Google Calendar', 'Two-way: bookings appear there, busy times block slots here', CalendarDays], ['outlook', 'Outlook calendar', 'Two-way calendar sync', Mail], ['sheets', 'Google Sheets', 'Every booking is added as a row', SheetIcon], ['excel', 'Excel / OneDrive', 'Export bookings to a workbook, updated hourly', FileSpreadsheet]] as const).map(([k, l, d, I]) => (
                <div key={k} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex size-8 items-center justify-center rounded-control bg-subtle text-icon"><I className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{l}</span><span className="block text-sm text-muted">{d}</span></span>
                  {set.sync[k] ? <Badge tone="green"><Check />Connected</Badge> : null}
                  <Button variant={set.sync[k] ? 'ghost' : 'secondary'} onClick={() => { setSet({ ...set, sync: { ...set.sync, [k]: !set.sync[k] } }); toast(set.sync[k] ? `${l} disconnected` : `${l} connected (demo)`) }}>{set.sync[k] ? 'Disconnect' : 'Connect'}</Button>
                </div>
              ))}
            </div>
          )}
          {tab === 'ai' && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Explain your whole setup in one message — typed or spoken. AI fills every tab and asks you to confirm.</p>
              <div className="flex items-start gap-2"><Textarea autoFocus value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. We have 4 chairs. Cleanings take 45 minutes with a hygienist, check-ups 30 with a dentist. Open Mon–Sat 8 to 6, Sundays 10 to 4. Text people a day before and 2 hours before." className="min-h-24" /><Button variant="ghost" size="icon" aria-label="Say it instead" onClick={() => setDesc('We have 10 tables. Dinner slots every 30 minutes from 5 to 10 PM, closed Mondays. Parties up to 8. Text a reminder 2 hours before.')}><Mic /></Button></div>
              <Button disabled={!desc.trim()} onClick={() => setPlan(/table/i.test(desc) ? ['Capacity: 10 tables at the same time', 'Service: Dinner reservation — 90 min, up to 8 people', 'Open Tue–Sun 5:00 PM – 10:00 PM, closed Mondays', 'Offer times every 30 minutes', 'Reminder: text 2 hours before'] : ['Capacity: 4 chairs at the same time', 'Cleaning — 45 min, any hygienist · Check-up — 30 min, any dentist', 'Open Mon–Sat 8:00 AM – 6:00 PM, Sun 10:00 AM – 4:00 PM', 'Reminders: text 24 hours and 2 hours before'])}><Sparkles />Set it up</Button>
              {plan && (
                <div className="rounded-card border border-border anim-fade">
                  <div className="border-b border-border-2 px-3 py-2 text-sm font-medium">Here’s what I understood — is this correct?</div>
                  <ul className="space-y-1 px-3 py-2 text-sm">{plan.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{p}</li>)}</ul>
                  <div className="flex gap-2 border-t border-border-2 px-3 py-2">
                    <Button variant="primary" onClick={() => {
                      if (/table/i.test(desc)) { setSet({ ...set, cap: 10, capLabel: 'tables', interval: 30, reminders: [{ when: '2 hours before', via: 'Text' }] }); setSvcs([{ n: 'Dinner reservation', dur: 90, staff: 'Anyone', buf: 0, price: 0, cap: 8 }]); setHrs(Object.fromEntries(DAYS.map((d) => [d, ['17:00', '22:00', d !== 'Mon']])) as Record<string, [string, string, boolean]>) }
                      else setSet({ ...set, cap: 4, capLabel: 'chairs', reminders: [{ when: '24 hours before', via: 'Text' }, { when: '2 hours before', via: 'Text' }] })
                      setPlan(null); setTab('services'); toast.success('Applied — check the tabs, then Save')
                    }}><Check />Yes, set it up</Button>
                    <Button onClick={() => setPlan(null)}>Change something</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Free slots for a staff member on a date, respecting length and existing bookings. */
export function freeSlots(bookings: Booking[], camp: string, staff: string, date: string, dur: number, step = 30, skipId?: string) {
  const taken = bookings.filter((b) => b.camp === camp && b.staff === staff && b.date === date && b.status !== 'cancelled' && b.id !== skipId)
  const out: number[] = []
  for (let m = 0; m + dur <= DAY_LEN; m += step) if (!taken.some((b) => m < b.start + b.dur && b.start < m + dur)) out.push(m)
  return out
}

export type BookingPreset = { camp?: string; who?: string; cid?: string; date?: string; start?: number; staff?: string; svc?: string; reschedule?: string }

/** New booking (or reschedule) with conflict detection and confirmations by text, email and/or WhatsApp. */
export function NewBookingDialog({ open, onOpenChange, preset }: { open: boolean; onOpenChange: (o: boolean) => void; preset?: BookingPreset }) {
  const st = useStore()
  const re = preset?.reschedule ? st.bookings.find((b) => b.id === preset.reschedule) : undefined
  const [camp, setCamp] = React.useState('k3'); const [who, setWho] = React.useState(''); const [svc, setSvc] = React.useState(''); const [staff, setStaff] = React.useState('any')
  const [date, setDate] = React.useState(dISO(0)); const [start, setStart] = React.useState(300); const [notes, setNotes] = React.useState(''); const [conf, setConf] = React.useState<string[]>(['sms'])
  React.useEffect(() => {
    if (!open) return
    const k = re?.camp ?? preset?.camp ?? 'k3'; const c = st.services[k] ? k : 'k3'
    setCamp(c); setWho(re?.cid ?? re?.who ?? preset?.cid ?? preset?.who ?? ''); setSvc(re?.svc ?? preset?.svc ?? st.services[c][0].n); setStaff(re?.staff ?? preset?.staff ?? 'any')
    setDate(re?.date ?? preset?.date ?? dISO(1)); setStart(re?.start ?? preset?.start ?? 300); setNotes(''); setConf(st.bookingSet[c]?.confirm ?? ['sms'])
  }, [open])
  const services = st.services[camp] ?? []; const service = services.find((s) => s.n === svc) ?? services[0]
  const team = st.staff[camp] ?? []
  const dur = service?.dur ?? 30
  const person = st.contacts.find((c) => c.id === who)
  const dayKey = DAYS[(new Date(date + 'T12:00:00').getDay() + 6) % 7]
  const openDay = st.hours[camp]?.[dayKey]?.[2] ?? true
  const clash = (s: string) => st.bookings.find((b) => b.camp === camp && b.staff === s && b.date === date && b.status !== 'cancelled' && b.id !== re?.id && start < b.start + b.dur && b.start < start + dur)
  const pick = staff === 'any' ? team.find((s) => !clash(s)) : staff
  const conflict = staff === 'any' ? (pick ? undefined : clash(team[0])) : clash(staff)
  const concurrent = st.bookings.filter((b) => b.camp === camp && b.date === date && b.status !== 'cancelled' && b.id !== re?.id && start < b.start + b.dur && b.start < start + dur).length
  const full = concurrent >= (st.bookingSet[camp]?.cap ?? 99)
  const alts = pick || staff !== 'any' ? freeSlots(st.bookings, camp, staff === 'any' ? team[0] : staff, date, dur, 30, re?.id).filter((m) => Math.abs(m - start) <= 180).slice(0, 4) : []
  const blocked = !!conflict || full || !openDay || !who || !pick
  const save = () => {
    const name = person?.name ?? who
    if (re) { st.updateBooking(re.id, { date, start, staff: pick!, svc: service.n, dur }); toast.success(`Moved to ${dNice(date)} at ${fmtMin(start)} · ${name} was told by ${conf.map((c) => CONF.find((x) => x[0] === c)?.[1]).join(' and ')}`) }
    else {
      st.addBooking({ camp, staff: pick!, svc: service.n, who: name, cid: person?.id, date, start, dur, status: 'booked', by: 'You', created: 'Today', price: service.price, conf })
      st.addActivity({ icon: 'calendar', text: `<b>You</b> booked ${service.n.toLowerCase()} for <b>${name}</b> · ${dNice(date)} ${fmtMin(start)}`, time: 'just now', k: 'book' })
      toast.success(`Booked · confirmation sent by ${conf.map((c) => CONF.find((x) => x[0] === c)?.[1]).join(', ') || 'no message'}`)
    }
    onOpenChange(false)
  }
  const slots = Array.from({ length: DAY_LEN / 30 }, (_, i) => i * 30)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" title={re ? `Reschedule · ${re.who}` : 'New booking'} description={re ? `${re.svc} · now ${dNice(re.date)} at ${fmtMin(re.start)}` : 'Everything is checked against hours, capacity and other bookings'}
        footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={blocked} onClick={save}>{re ? 'Move booking' : 'Book'}</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Campaign" className="sm:col-span-2"><Select value={camp} onValueChange={(v) => { setCamp(v); setSvc(st.services[v][0].n); setStaff('any') }} options={Object.keys(st.services).map((k) => ({ value: k, label: campLabel(k) }))} /></Field>
          <Field label="Person" className="sm:col-span-2" hint={person ? `${person.phone}${person.email ? ' · ' + person.email : ''}` : who ? 'New person — they’ll be added to Contacts' : undefined}>
            <Combobox value={who} onChange={setWho} creatable placeholder="Search people or type a new name" options={st.contacts.filter((c) => c.name).map((c) => ({ value: c.id, label: c.name, hint: c.phone }))} />
          </Field>
          <Field label="Service"><Select value={service?.n} onValueChange={setSvc} options={services.map((s) => ({ value: s.n, label: `${s.n} · ${s.dur} min${s.price ? ' · ' + money(s.price) : ''}` }))} /></Field>
          <Field label="With"><Select value={staff} onValueChange={setStaff} options={[{ value: 'any', label: 'Anyone available' }, ...team.map((t) => ({ value: t, label: t }))]} /></Field>
          <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Time"><Select value={String(start)} onValueChange={(v) => setStart(+v)} options={slots.map((m) => ({ value: String(m), label: fmtMin(m) }))} /></Field>
          <div className="sm:col-span-2 space-y-2">
            {!openDay && <Banner tone="warning" title={`Closed on ${dayKey}s`}>Pick another day, or change the hours in booking settings.</Banner>}
            {conflict && <Banner tone="critical" title="That time is taken">{conflict.staff} already has {conflict.who} at {fmtMin(conflict.start)}–{fmtMin(conflict.start + conflict.dur)}. Double bookings aren’t allowed.</Banner>}
            {!conflict && full && <Banner tone="critical" title="Fully booked at that time">All {st.bookingSet[camp]?.cap} {st.bookingSet[camp]?.capLabel} are taken.</Banner>}
            {(conflict || full) && alts.length > 0 && <div className="flex flex-wrap items-center gap-1.5 text-sm"><span className="text-muted">Free nearby:</span>{alts.map((m) => <Button key={m} size="sm" onClick={() => setStart(m)}>{fmtMin(m)}</Button>)}</div>}
            {!blocked && <div className="flex items-center gap-2 rounded-control bg-success-soft px-3 py-2 text-sm text-success-text"><Check className="size-4" />{pick} is free {dNice(date)} · {fmtMin(start)}–{fmtMin(start + dur)}</div>}
            {!who && <div className="flex items-center gap-2 text-sm text-muted"><AlertTriangle className="size-4" />Pick who the booking is for.</div>}
          </div>
          <Field label="Notes" className="sm:col-span-2"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the team should know" className="min-h-16" /></Field>
          <div className="sm:col-span-2">
            <div className="mb-1 text-sm">Send a confirmation by</div>
            <div className="flex flex-wrap gap-1.5">{CONF.map(([k, l]) => <label key={k} className={cn('flex h-8 cursor-pointer items-center gap-2 rounded-control border px-2.5 text-sm transition-colors', conf.includes(k) ? 'border-btn bg-subtle-2' : 'border-border hover:bg-subtle-2')}><Checkbox checked={conf.includes(k)} onCheckedChange={(v) => setConf(v ? [...conf, k] : conf.filter((x) => x !== k))} /><PlatIcon p={k} size={14} tip={false} />{l}</label>)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
