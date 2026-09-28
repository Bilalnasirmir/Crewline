import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarDays, Plus, Sparkles, Settings2, MoreHorizontal, Users, Link2, Download, RefreshCw, LayoutDashboard, MessageCircleQuestion } from 'lucide-react'
import { plural } from '@/lib/utils'
import { useStore } from '@/store'
import { PageBody, PageHeader, PageTabs } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Count } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AskSheet } from '@/features/shared/ai'
import { dISO, dNice } from '@/data/seed'
import { BOOKING_CAMPS, BookingSettingsDialog, NewBookingDialog, NOW_MIN, STATUS, addDays, dayKey, fmtMin, freeSlots, type BookingPreset } from './shared'
import { Dashboard } from './dashboard'
import { Calendar, type CalMode } from './calendar'
import { Queries } from './queries'
import { BookingDialog, DoubleBookingSim } from './detail'
import type { BookingStatus } from '@/data/types'

type View = 'dashboard' | 'calendar' | 'queries'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/** Bookings: dashboard, calendar and receptionist queries — all for the campaign picked at the top. */
export function BookingsPage() {
  const [sp, setSp] = useSearchParams(); const s = useStore()
  const set = (p: Record<string, string | null>) => { const n = new URLSearchParams(sp); Object.entries(p).forEach(([k, v]) => (v === null ? n.delete(k) : n.set(k, v))); setSp(n, { replace: true }) }
  const camps = s.campaigns.filter((c) => BOOKING_CAMPS.includes(c.id) || c.booking)
  const camp = camps.some((c) => c.id === sp.get('camp')) ? sp.get('camp')! : 'k3'
  const view = (['calendar', 'queries'].includes(sp.get('view') ?? '') ? sp.get('view') : 'dashboard') as View
  const mode = (['day', 'week', 'month'].includes(sp.get('cal') ?? '') ? sp.get('cal') : 'day') as CalMode
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.get('date') ?? '') ? sp.get('date')! : dISO(0)
  const status = (sp.get('status') ?? 'all') as BookingStatus | 'all'
  const [focus, setFocus] = React.useState<string | null>(null)

  const [open, setOpen] = React.useState<string | null>(null)
  const [book, setBook] = React.useState<BookingPreset | null>(null)
  const [setup, setSetup] = React.useState(false); const [ask, setAsk] = React.useState(false); const [sim, setSim] = React.useState(false)
  const pending = React.useRef<{ date: string; mode: CalMode; status?: BookingStatus; note: string } | null>(null)

  // Deep links: ?new=1&who=<contact id or name>, ?date=yyyy-mm-dd
  React.useEffect(() => {
    if (!sp.get('new')) return
    const who = sp.get('who') ?? undefined
    const c = who ? s.contacts.find((x) => x.id === who || x.name === who) : undefined
    setBook({ camp, who: c?.id ?? who })
    set({ new: null, who: null })
  }, [sp.get('new')]) // opens once per link
  React.useEffect(() => { if (sp.get('date') && !sp.get('view')) set({ view: 'calendar' }) }, [])

  const showCal = (d: string, st?: BookingStatus, m: CalMode = 'day') => set({ view: 'calendar', cal: m, date: d, status: st ?? null })
  const mine = s.bookings.filter((b) => b.camp === camp)
  const queries = s.queries.filter((q) => q.camp === camp).length

  /** Answers about this campaign's bookings, and remembers what to show on the calendar. */
  const answer = (q: string) => {
    const t = q.toLowerCase(); pending.current = null
    const md = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/)
    const mo = t.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/)
    if (md && !/cancel/.test(t)) {
      const iso = `2026-${String(MONTHS.findIndex((m) => m.startsWith(md[1])) + 1).padStart(2, '0')}-${md[2].padStart(2, '0')}`
      const day = mine.filter((b) => b.date === iso); const live = day.filter((b) => b.status !== 'cancelled')
      pending.current = { date: iso, mode: 'day', note: `${dNice(iso)} · ${plural(live.length, 'booking')} — from your question` }
      if (!day.length) return `There were **no bookings** on ${dNice(iso)}. I’ve opened that day on the calendar.`
      const parts = (Object.keys(STATUS) as BookingStatus[]).map((k) => [k, day.filter((b) => b.status === k).length] as const).filter(([, n]) => n).map(([k, n]) => `${n} ${STATUS[k].l.toLowerCase()}`)
      return `**${plural(live.length, 'booking')}** on ${dNice(iso)}: ${parts.join(', ')}.\n\nBusiest person: **${[...new Set(live.map((b) => b.staff))].sort((a, b) => live.filter((x) => x.staff === b).length - live.filter((x) => x.staff === a).length)[0]}**. I’ve opened that day on the calendar.`
    }
    if (/cancel/.test(t)) {
      const m = mo ? MONTHS.indexOf(mo[1]) : md ? MONTHS.findIndex((x) => x.startsWith(md[1])) : 8
      const key = `2026-${String(m + 1).padStart(2, '0')}`; const list = mine.filter((b) => b.date.startsWith(key) && b.status === 'cancelled')
      const name = MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1)
      pending.current = { date: `${key}-01`, mode: 'month', status: 'cancelled', note: `Cancelled bookings in ${name} — from your question` }
      return `**${plural(list.length, 'booking')} cancelled** in ${name}${list.length ? `, out of ${mine.filter((b) => b.date.startsWith(key)).length}` : ''}.${list.length ? ` Most were ${[...new Set(list.map((b) => b.svc))].slice(0, 2).join(' and ').toLowerCase()} bookings.` : ''} They’re shown on the calendar now.`
    }
    if (/free|available|slot|opening|space/.test(t)) {
      const d = addDays(dISO(0), 1); const svc = s.services[camp]?.[0]
      const lines = (s.staff[camp] ?? []).map((st) => `- **${st}**: ${freeSlots(s.bookings, camp, st, d, svc?.dur ?? 30).slice(0, 3).map(fmtMin).join(', ') || 'fully booked'}`)
      pending.current = { date: d, mode: 'day', note: `Free times tomorrow for ${svc?.n.toLowerCase() ?? 'a booking'} — from your question` }
      return `Free times tomorrow (${dNice(d)}) for a ${svc?.n.toLowerCase() ?? 'booking'}:\n\n${lines.join('\n')}\n\nClick any empty time on the calendar to book it.`
    }
    if (/busiest|busy|popular/.test(t)) {
      const counts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => [d, mine.filter((b) => b.date < dISO(0) && b.date >= dISO(-28) && b.status !== 'cancelled' && dayKey(b.date) === d).length] as const).sort((a, b) => b[1] - a[1])
      return `Over the last 4 weeks the busiest day was **${counts[0][0]}** (${counts[0][1]} bookings), then ${counts[1][0]} (${counts[1][1]}). The quietest was ${counts[6][0]} (${counts[6][1]}).`
    }
    if (/no.?show/.test(t)) {
      const past = mine.filter((b) => b.date < dISO(0) && b.date >= dISO(-30)); const ns = past.filter((b) => b.status === 'noshow').length
      return `**${ns} no-shows** in the last 30 days — ${Math.round((ns / Math.max(1, past.length)) * 100)}% of bookings. A second reminder 2 hours before usually cuts that by a third; you can add it in **Setup → Reminders**.`
    }
    const today = mine.filter((b) => b.date === dISO(0) && b.status !== 'cancelled')
    pending.current = { date: dISO(0), mode: 'day', note: 'Today — from your question' }
    return `**${plural(today.length, 'booking')} today**: ${today.filter((b) => b.start < NOW_MIN).length} this morning and ${today.filter((b) => b.start >= NOW_MIN).length} still to come. ${mine.filter((b) => b.status === 'requested' && b.date >= dISO(0)).length} requests are waiting for a yes or no.`
  }
  const afterAnswer = () => { const p = pending.current; if (!p) return; set({ view: 'calendar', cal: p.mode, date: p.date, status: p.status ?? null }); setFocus(p.note) }

  const exportCsv = () => {
    const head = ['Date', 'Time', 'Person', 'Service', 'With', 'Status', 'Booked by', 'Price']
    const rows = mine.map((b) => [b.date, fmtMin(b.start), b.who, b.svc, b.staff, STATUS[b.status].l, s.agents.find((a) => a.id === b.by)?.name ?? b.by, String(b.price)])
    const csv = [head, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `bookings-${camp}.csv`; a.click(); URL.revokeObjectURL(a.href)
    toast.success(`${plural(rows.length, 'booking')} exported`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Bookings" icon={<CalendarDays />}
        actions={<>
          <Button variant="header" onClick={() => setAsk(true)}><Sparkles />Ask AI</Button>
          <Button variant="header" onClick={() => setSetup(true)}><Settings2 />Setup</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="header" size="icon" aria-label="More actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onSelect={() => setSim(true)}><Users />Test: two callers, one time</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { navigator.clipboard?.writeText(`https://book.crewline.app/${s.bookingSet[camp]?.slug ?? 'my-business'}`); toast('Booking page link copied') }}><Link2 />Copy booking page link</DropdownMenuItem>
              <DropdownMenuItem onSelect={exportCsv}><Download />Export bookings (CSV)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast.success('Calendars synced · everything is up to date')}><RefreshCw />Sync calendars now</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="primary" onClick={() => setBook({ camp })}><Plus />New booking</Button>
        </>}>
        <Select variant="button" className="ml-2 max-w-[260px]" value={camp} onValueChange={(v) => { set({ camp: v, status: null }); setFocus(null) }} options={camps.map((c) => ({ value: c.id, label: c.name }))} />
      </PageHeader>
      <PageTabs value={view} onChange={(v) => set({ view: v === 'dashboard' ? null : v })} tabs={[
        { value: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { value: 'calendar', label: 'Calendar', icon: <CalendarDays /> },
        { value: 'queries', label: <>Queries<Count n={queries} /></>, icon: <MessageCircleQuestion /> },
      ]} />
      {view === 'calendar' ? (
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Calendar camp={camp} mode={mode} setMode={(m) => set({ cal: m })} date={date} setDate={(d) => set({ date: d })} status={status} setStatus={(st) => set({ status: st === 'all' ? null : st })}
              focus={focus} clearFocus={() => { setFocus(null); set({ status: null }) }} onOpen={(b) => setOpen(b.id)} onSlot={(p) => setBook(p)} />
          </Card>
        </div>
      ) : (
        <PageBody wide>
          {view === 'dashboard' ? <Dashboard camp={camp} onOpen={(b) => setOpen(b.id)} onBook={setBook} onSim={() => setSim(true)} onCalendar={(d, st) => showCal(d, st)} /> : <Queries camp={camp} onBook={setBook} />}
        </PageBody>
      )}

      <BookingDialog id={open} onClose={() => setOpen(null)} onReschedule={setBook} />
      <NewBookingDialog open={!!book} onOpenChange={(o) => !o && setBook(null)} preset={book ?? undefined} />
      <BookingSettingsDialog open={setup} onOpenChange={setSetup} camp={camp} title="Booking setup" />
      <DoubleBookingSim open={sim} onOpenChange={setSim} camp={camp} onShow={(d) => { showCal(d); setFocus('Tomorrow — Nadia and Tom, booked at the same moment without a clash') }} />
      <AskSheet open={ask} onOpenChange={setAsk} title="Ask about bookings" description={s.campaigns.find((c) => c.id === camp)?.name}
        suggestions={['How many bookings on September 23?', 'How many bookings were cancelled in September?', 'When is the next free time tomorrow?', 'Which day is busiest?', 'How many no-shows did we have?']}
        answer={answer} onAnswer={afterAnswer} />
    </div>
  )
}
