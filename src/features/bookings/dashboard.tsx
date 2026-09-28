import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { MoreHorizontal, Check, UserCheck, CircleCheck, UserX, CalendarClock, X, CalendarDays, ShieldCheck, ChevronRight } from 'lucide-react'
import { cn, money, nf } from '@/lib/utils'
import { useStore } from '@/store'
import { askConfirm } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody, EmptyState } from '@/components/ui/card'
import { Input, Field } from '@/components/ui/input'
import { Segmented } from '@/components/ui/tabs'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Kpi } from '@/components/app/bits'
import { IndexTabs, SearchRow, PillRow, FilterPill, CheckList, Pager } from '@/components/app/index-table'
import { dISO, dNice, dShort } from '@/data/seed'
import { STATUS, StatusBadge, NOW_MIN, addDays, daysBetween, fmtMin, type BookingPreset } from './shared'
import { BookedBy, byLabel, setBookingStatus } from './detail'
import type { Booking, BookingStatus } from '@/data/types'

type RangeKey = 'today' | 'yesterday' | '30' | 'custom'
const ORDER: BookingStatus[] = ['completed', 'arrived', 'booked', 'requested', 'noshow', 'cancelled']
const SOURCES = ['AI agents', 'Online booking page', 'Front desk', 'You']
const sourceOf = (b: Booking) => (byLabel(b.by) === null ? 'AI agents' : b.by)
const PAGE = 25

/** Status actions for one booking, used by the table rows. */
export function BookingMenu({ b, onReschedule }: { b: Booking; onReschedule: (p: BookingPreset) => void }) {
  const past = b.date <= dISO(0)
  const cancel = async () => { if (await askConfirm({ title: `Cancel ${b.who}’s booking?`, description: `${b.svc} · ${dNice(b.date)} at ${fmtMin(b.start)}. They get a message, and the time opens up again.`, ok: 'Cancel booking', danger: true })) setBookingStatus(b, 'cancelled') }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${b.who}`} onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        {b.status === 'requested' && <DropdownMenuItem onSelect={() => setBookingStatus(b, 'booked')}><Check />Confirm</DropdownMenuItem>}
        {b.status === 'booked' && <DropdownMenuItem onSelect={() => setBookingStatus(b, 'arrived')}><UserCheck />Mark arrived</DropdownMenuItem>}
        {(b.status === 'arrived' || (b.status === 'booked' && past)) && <DropdownMenuItem onSelect={() => setBookingStatus(b, 'completed')}><CircleCheck />Mark completed</DropdownMenuItem>}
        {b.status === 'booked' && past && <DropdownMenuItem onSelect={() => setBookingStatus(b, 'noshow')}><UserX />No-show</DropdownMenuItem>}
        {(b.status === 'booked' || b.status === 'requested') && <DropdownMenuItem onSelect={() => onReschedule({ reschedule: b.id })}><CalendarClock />Reschedule</DropdownMenuItem>}
        {(b.status === 'cancelled' || b.status === 'noshow' || b.status === 'completed') && <DropdownMenuItem onSelect={() => onReschedule({ camp: b.camp, who: b.cid ?? b.who, svc: b.svc, staff: b.staff })}><CalendarDays />Book again</DropdownMenuItem>}
        {(b.status === 'booked' || b.status === 'requested') && <><DropdownMenuSeparator /><DropdownMenuItem danger onSelect={cancel}><X />{b.status === 'requested' ? 'Decline' : 'Cancel booking'}</DropdownMenuItem></>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Bookings dashboard: today at a glance, requests waiting, a chart, and every booking in one table. */
export function Dashboard({ camp, onOpen, onBook, onSim, onCalendar }: { camp: string; onOpen: (b: Booking) => void; onBook: (p: BookingPreset) => void; onSim: () => void; onCalendar: (date: string, status?: BookingStatus) => void }) {
  const bookings = useStore((s) => s.bookings); const team = useStore((s) => s.staff[camp]) ?? []; const services = useStore((s) => s.services[camp]) ?? []
  const [rk, setRk] = React.useState<RangeKey>('today'); const [custom, setCustom] = React.useState({ from: dISO(-6), to: dISO(0) }); const [cOpen, setCOpen] = React.useState(false)
  const [tab, setTab] = React.useState<BookingStatus | 'all'>('all'); const [q, setQ] = React.useState('')
  const [fStaff, setFStaff] = React.useState<string[]>([]); const [fSvc, setFSvc] = React.useState<string[]>([]); const [fSrc, setFSrc] = React.useState<string[]>([]); const [page, setPage] = React.useState(0)
  React.useEffect(() => { setFStaff([]); setFSvc([]); setPage(0) }, [camp])
  React.useEffect(() => setPage(0), [rk, custom, tab, q, fStaff, fSvc, fSrc])

  const [from, to] = rk === 'custom' ? [custom.from, custom.to] : rk === 'today' ? [dISO(0), dISO(0)] : rk === 'yesterday' ? [dISO(-1), dISO(-1)] : [dISO(-29), dISO(0)]
  const span = daysBetween(from, to) + 1
  const all = React.useMemo(() => bookings.filter((b) => b.camp === camp), [bookings, camp])
  const inR = all.filter((b) => b.date >= from && b.date <= to)
  const prev = all.filter((b) => b.date >= addDays(from, -span) && b.date <= addDays(from, -1))
  const n = (L: Booking[], ...st: BookingStatus[]) => L.filter((b) => st.includes(b.status)).length
  const live = (L: Booking[]) => L.filter((b) => b.status !== 'cancelled').length
  const delta = (a: number, b: number) => (!b ? undefined : a === b ? 'Same as before' : `${a > b ? '+' : ''}${Math.round(((a - b) / b) * 100)}%`)
  const requests = all.filter((b) => b.status === 'requested' && b.date >= dISO(0)).sort((x, y) => x.date.localeCompare(y.date) || x.start - y.start)
  const revenue = inR.filter((b) => b.status === 'completed').reduce((t, b) => t + b.price, 0)
  const upcoming = all.filter((b) => (b.date > dISO(0) || (b.date === dISO(0) && b.start >= NOW_MIN)) && b.status === 'booked').sort((x, y) => x.date.localeCompare(y.date) || x.start - y.start).slice(0, 6)
  const rangeLabel = rk === 'today' ? 'Today' : rk === 'yesterday' ? 'Yesterday' : rk === '30' ? 'Last 30 days' : `${dShort(from)} – ${dShort(to)}`

  // Chart: by hour for a single day, by day otherwise. Hover shows exact numbers.
  const chart = span === 1
    ? Array.from({ length: 10 }, (_, h) => { const L = inR.filter((b) => Math.floor(b.start / 60) === h); return { d: fmtMin(h * 60).replace(':00', ''), ...Object.fromEntries(ORDER.map((st) => [st, n(L, st)])) } })
    : Array.from({ length: span }, (_, i) => { const d = addDays(from, i); const L = inR.filter((b) => b.date === d); return { d: dShort(d), ...Object.fromEntries(ORDER.map((st) => [st, n(L, st)])) } })

  const rows = inR.filter((b) => (tab === 'all' || b.status === tab) && (!fStaff.length || fStaff.includes(b.staff)) && (!fSvc.length || fSvc.includes(b.svc)) && (!fSrc.length || fSrc.includes(sourceOf(b))) && (!q || `${b.who} ${b.svc} ${b.staff}`.toLowerCase().includes(q.toLowerCase())))
    .sort((x, y) => (span === 1 ? 0 : y.date.localeCompare(x.date)) || x.start - y.start)
  const tabs = [{ value: 'all' as const, label: 'All', count: inR.length }, ...(['requested', 'booked', 'arrived', 'completed', 'noshow', 'cancelled'] as BookingStatus[]).map((st) => ({ value: st, label: STATUS[st].l, count: n(inR, st) }))]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={cOpen} onOpenChange={setCOpen}>
          <PopoverAnchor asChild><div><Segmented value={rk} onChange={(v) => { if (v === 'custom') setCOpen(true); else setRk(v) }} options={[{ value: 'today', label: 'Today' }, { value: 'yesterday', label: 'Yesterday' }, { value: '30', label: 'Last 30 days' }, { value: 'custom', label: rk === 'custom' ? rangeLabel : 'Custom' }]} /></div></PopoverAnchor>
          <PopoverContent align="end" className="w-72 space-y-3">
            <div className="grid grid-cols-2 gap-2"><Field label="From"><Input type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} /></Field><Field label="To"><Input type="date" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} /></Field></div>
            <div className="flex justify-end gap-2"><Button onClick={() => setCOpen(false)}>Cancel</Button><Button variant="primary" disabled={!custom.from || !custom.to || custom.from > custom.to} onClick={() => { setRk('custom'); setCOpen(false) }}>Apply</Button></div>
          </PopoverContent>
        </Popover>
        <span className="text-sm text-muted">{span === 1 ? dNice(from) : `${dShort(from)} – ${dShort(to)} · ${span} days`}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Bookings" value={nf(live(inR))} delta={delta(live(inR), live(prev))} up={live(prev) && live(inR) !== live(prev) ? live(inR) > live(prev) : undefined} tip="Everything booked in this range, except cancellations" onClick={() => setTab('all')} />
        <Kpi label="Open requests" value={nf(requests.length)} sub="need a yes or no" onClick={() => document.getElementById('bk-requests')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />
        <Kpi label="Booked" value={nf(n(inR, 'booked'))} sub="confirmed" onClick={() => setTab('booked')} />
        <Kpi label="Arrived & completed" value={nf(n(inR, 'arrived', 'completed'))} onClick={() => setTab('completed')} />
        <Kpi label="Cancelled" value={nf(n(inR, 'cancelled'))} onClick={() => setTab('cancelled')} />
        <Kpi label="No-shows" value={nf(n(inR, 'noshow'))} sub={inR.length ? `${Math.round((n(inR, 'noshow') / Math.max(1, n(inR, 'noshow', 'completed', 'arrived'))) * 100)}% of visits` : undefined} onClick={() => setTab('noshow')} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title={span === 1 ? 'Bookings by hour' : 'Bookings per day'} description={`${rangeLabel} · ${money(revenue)} from completed bookings`}
            action={<Button variant="ghost" onClick={() => onCalendar(from)}>Open calendar<ChevronRight /></Button>} />
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-xs text-muted">{ORDER.map((st) => <span key={st} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: STATUS[st].c }} />{STATUS[st].l}</span>)}</div>
          <CardBody className="h-[240px] pt-2">
            <ResponsiveContainer>
              <BarChart data={chart} margin={{ left: -24, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border-2)" />
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={span > 14 ? Math.ceil(span / 10) - 1 : 0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <RTip cursor={{ fill: 'var(--fill-hover)' }} contentStyle={{ borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13, color: 'var(--text)' }} />
                {ORDER.map((st, i) => <Bar key={st} dataKey={st} name={STATUS[st].l} stackId="s" fill={STATUS[st].c} radius={i === ORDER.length - 1 ? [4, 4, 0, 0] : undefined} maxBarSize={36} />)}
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader title="Coming up" description="Next confirmed bookings" />
            {upcoming.length ? upcoming.map((b) => (
              <button key={b.id} onClick={() => onOpen(b)} className="flex w-full items-center gap-3 border-t border-border-2 px-4 py-2 text-left hover:bg-subtle-2">
                <span className="w-[68px] shrink-0 text-xs text-muted tabular">{b.date === dISO(0) ? 'Today' : dShort(b.date)}<br />{fmtMin(b.start)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{b.who}</span><span className="block truncate text-xs text-muted">{b.svc} · {b.staff}</span></span>
              </button>
            )) : <p className="px-4 pb-4 text-sm text-muted">Nothing booked yet.</p>}
          </Card>
          <Card>
            <CardBody className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              <div className="min-w-0 text-sm"><div className="font-medium">No double bookings</div><p className="text-muted">Agents share one live calendar, so two callers never get the same time.</p><Button variant="link" onClick={onSim}>See how it works</Button></div>
            </CardBody>
          </Card>
        </div>
      </div>

      {requests.length > 0 && (
        <Card id="bk-requests" className="overflow-hidden">
          <CardHeader title={`Requests waiting · ${requests.length}`} description="People who asked for a time. Confirm, move or decline." />
          {requests.slice(0, 5).map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 border-t border-border-2 px-4 py-2">
              <button onClick={() => onOpen(b)} className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-medium">{b.who}</span><span className="block truncate text-xs text-muted">{b.svc} · {dNice(b.date)} at {fmtMin(b.start)} · {b.staff}</span></button>
              <BookedBy by={b.by} className="hidden text-sm sm:inline-flex" />
              <span className="flex gap-2"><Button size="sm" onClick={() => onBook({ reschedule: b.id })}><CalendarClock />Move</Button><Button size="sm" variant="primary" onClick={() => setBookingStatus(b, 'booked')}><Check />Confirm</Button></span>
            </div>
          ))}
          {requests.length > 5 && <div className="border-t border-border-2 px-4 py-2"><Button variant="ghost" onClick={() => onCalendar(requests[0].date, 'requested')}>See all {requests.length} on the calendar<ChevronRight /></Button></div>}
        </Card>
      )}

      <Card className="overflow-hidden">
        <IndexTabs tabs={tabs} value={tab} onChange={setTab} />
        <SearchRow value={q} onChange={setQ} placeholder="Search people, services or staff" />
        <PillRow>
          <FilterPill label="With" value={fStaff.length ? fStaff.join(', ') : undefined} onClear={() => setFStaff([])}><CheckList options={team.map((t) => ({ v: t, l: t }))} value={fStaff} onChange={setFStaff} /></FilterPill>
          <FilterPill label="Service" value={fSvc.length ? fSvc.join(', ') : undefined} onClear={() => setFSvc([])}><CheckList options={services.map((sv) => ({ v: sv.n, l: sv.n }))} value={fSvc} onChange={setFSvc} /></FilterPill>
          <FilterPill label="Booked by" value={fSrc.length ? fSrc.join(', ') : undefined} onClear={() => setFSrc([])}><CheckList options={SOURCES.map((x) => ({ v: x, l: x }))} value={fSrc} onChange={setFSrc} /></FilterPill>
        </PillRow>
        {rows.length ? (
          <div className="overflow-x-auto">
            <Table>
              <thead><tr><Th>When</Th><Th>Person</Th><Th>Service</Th><Th>With</Th><Th>Status</Th><Th>Booked by</Th><Th align="right">Price</Th><Th className="w-10" /></tr></thead>
              <tbody>{rows.slice(page * PAGE, (page + 1) * PAGE).map((b) => (
                <Tr key={b.id} clickable onClick={() => onOpen(b)}>
                  <Td className="tabular">{span > 1 && <span className="text-muted">{dShort(b.date)} · </span>}{fmtMin(b.start)}</Td>
                  <Td className={cn('font-medium', b.status === 'cancelled' && 'text-muted line-through')}>{b.who}</Td>
                  <Td>{b.svc}<span className="text-muted"> · {b.dur} min</span></Td>
                  <Td>{b.staff}</Td>
                  <Td><StatusBadge s={b.status} /></Td>
                  <Td><BookedBy by={b.by} /></Td>
                  <Td align="right">{b.price ? money(b.price) : '—'}</Td>
                  <Td className="py-0" onClick={(e) => e.stopPropagation()}><BookingMenu b={b} onReschedule={onBook} /></Td>
                </Tr>
              ))}</tbody>
            </Table>
          </div>
        ) : <EmptyState compact icon={<CalendarDays />} title="No bookings here" description="Try another date range or clear the filters." />}
        <Pager page={page} size={PAGE} total={rows.length} onChange={setPage} />
      </Card>
    </div>
  )
}
