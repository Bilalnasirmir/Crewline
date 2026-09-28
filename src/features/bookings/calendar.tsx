import * as React from 'react'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Tip } from '@/components/ui/tooltip'
import { ToggleChip } from '@/components/app/bits'
import { dISO } from '@/data/seed'
import { DAY_LEN, NOW_MIN, STATUS, WEEKDAYS, addDays, addMonths, dayKey, fmtMin, fromHHMM, weekStart, type BookingPreset } from './shared'
import type { Booking, BookingStatus } from '@/data/types'

export type CalMode = 'day' | 'week' | 'month'
const PX = 1.3 // pixels per minute
const HOURS = Array.from({ length: DAY_LEN / 60 + 1 }, (_, i) => i)
const hourLabel = (h: number) => { const t = 9 + h; return `${((t + 11) % 12) + 1} ${t >= 12 ? 'PM' : 'AM'}` }
const longDate = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', o)

function titleFor(mode: CalMode, iso: string) {
  if (mode === 'day') return longDate(iso, { weekday: 'long', month: 'long', day: 'numeric' })
  if (mode === 'month') return longDate(iso, { month: 'long', year: 'numeric' })
  const a = weekStart(iso), b = addDays(a, 6)
  return a.slice(0, 7) === b.slice(0, 7) ? `${longDate(a, { month: 'short', day: 'numeric' })} – ${+b.slice(8)}, ${b.slice(0, 4)}` : `${longDate(a, { month: 'short', day: 'numeric' })} – ${longDate(b, { month: 'short', day: 'numeric' })}, ${b.slice(0, 4)}`
}

/** Side-by-side lanes for overlapping bookings (the usual calendar layout). */
function lanes(list: Booking[]) {
  const out: { b: Booking; lane: number; of: number }[] = []
  let cluster: { b: Booking; lane: number }[] = []; let ends: number[] = []; let clusterEnd = -1
  const flush = () => { cluster.forEach((c) => out.push({ ...c, of: Math.max(1, ends.length) })); cluster = []; ends = []; clusterEnd = -1 }
  for (const b of [...list].sort((x, y) => x.start - y.start || y.dur - x.dur)) {
    if (cluster.length && b.start >= clusterEnd) flush()
    let lane = ends.findIndex((e) => e <= b.start)
    if (lane < 0) { lane = ends.length; ends.push(b.start + b.dur) } else ends[lane] = b.start + b.dur
    cluster.push({ b, lane }); clusterEnd = Math.max(clusterEnd, b.start + b.dur)
  }
  flush()
  return out
}

const tint = (c: string) => `color-mix(in srgb, ${c} 14%, var(--surface))`

function Block({ b, style, compact, onOpen, showStaff }: { b: Booking; style: React.CSSProperties; compact: boolean; onOpen: (b: Booking) => void; showStaff?: boolean }) {
  const c = STATUS[b.status].c
  return (
    <Tip content={<span><b className="font-semibold">{b.who}</b> · {b.svc}<br />{fmtMin(b.start)}–{fmtMin(b.start + b.dur)} · {b.staff} · {STATUS[b.status].l}</span>}>
      <button onClick={(e) => { e.stopPropagation(); onOpen(b) }} style={{ ...style, background: tint(c), borderLeftColor: c }}
        className={cn('absolute z-[1] overflow-hidden rounded-[6px] border-l-[3px] px-1.5 py-0.5 text-left text-xs leading-4 text-text shadow-[0_0_0_1px_var(--surface)] transition-[filter] hover:z-[2] hover:brightness-95', b.status === 'cancelled' && 'opacity-60 [&>span:first-child]:line-through')}>
        <span className="block truncate font-semibold">{b.who}</span>
        {!compact && <span className="block truncate text-muted">{fmtMin(b.start)} · {showStaff ? b.staff : b.svc}</span>}
      </button>
    </Tip>
  )
}

type Col = { key: string; label: React.ReactNode; items: Booking[]; preset: BookingPreset; closed: string | null; open: [number, number]; today: boolean }

/** Time grid shared by the day view (a column per person) and the week view (a column per day). */
function TimeGrid({ columns, minCol, onOpen, onSlot, showStaff }: { columns: Col[]; minCol: number; onOpen: (b: Booking) => void; onSlot: (p: BookingPreset) => void; showStaff?: boolean }) {
  const [hover, setHover] = React.useState<{ c: number; m: number } | null>(null)
  const slotAt = (e: React.MouseEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); return Math.max(0, Math.min(DAY_LEN - 30, Math.floor((e.clientY - r.top) / PX / 30) * 30)) }
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div style={{ minWidth: 56 + columns.length * minCol }}>
        <div className="sticky top-0 z-[4] flex border-b border-border bg-surface">
          <div className="w-14 shrink-0" />
          {columns.map((c) => <div key={c.key} className="min-w-0 flex-1 border-l border-border-2 px-2 py-1.5" style={{ minWidth: minCol }}>{c.label}</div>)}
        </div>
        <div className="relative flex" style={{ height: DAY_LEN * PX + 12 }}>
          <div className="relative w-14 shrink-0">{HOURS.map((h) => <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-muted tabular" style={{ top: h * 60 * PX + 6 }}>{hourLabel(h)}</span>)}</div>
          {columns.map((c, ci) => (
            <div key={c.key} className={cn('relative mt-1.5 min-w-0 flex-1 border-l border-border-2', !c.closed && 'cursor-pointer')} style={{ minWidth: minCol, height: DAY_LEN * PX }}
              onMouseMove={(e) => { if (!c.closed) { const m = slotAt(e); if (hover?.c !== ci || hover.m !== m) setHover({ c: ci, m }) } }}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => { if (!c.closed) onSlot({ ...c.preset, start: slotAt(e) }) }}>
              {HOURS.map((h) => <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-border-2" style={{ top: h * 60 * PX }} />)}
              {HOURS.slice(0, -1).map((h) => <div key={`h${h}`} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border-2 opacity-60" style={{ top: (h * 60 + 30) * PX }} />)}
              {c.closed ? (
                <div className="absolute inset-0 flex justify-center bg-[repeating-linear-gradient(135deg,var(--subtle-3)_0_6px,transparent_6px_12px)] pt-6 text-xs text-muted">{c.closed}</div>
              ) : <>
                {c.open[0] > 0 && <div className="pointer-events-none absolute inset-x-0 top-0 bg-[repeating-linear-gradient(135deg,var(--subtle-3)_0_6px,transparent_6px_12px)]" style={{ height: c.open[0] * PX }} />}
                {c.open[1] < DAY_LEN && <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[repeating-linear-gradient(135deg,var(--subtle-3)_0_6px,transparent_6px_12px)]" style={{ top: c.open[1] * PX }} />}
              </>}
              {hover?.c === ci && <div className="pointer-events-none absolute inset-x-1 z-[1] rounded-[6px] border border-dashed border-primary bg-primary-soft px-1.5 text-xs font-medium leading-5 text-primary" style={{ top: hover.m * PX + 1, height: 30 * PX - 2 }}>+ {fmtMin(hover.m)}</div>}
              {lanes(c.items).map(({ b, lane, of }) => (
                <Block key={b.id} b={b} onOpen={onOpen} showStaff={showStaff} compact={b.dur * PX < 36 || of > 2}
                  style={{ top: b.start * PX + 1, height: Math.max(18, b.dur * PX - 2), left: `calc(${(lane / of) * 100}% + 2px)`, width: `calc(${100 / of}% - 4px)` }} />
              ))}
              {c.today && <div className="pointer-events-none absolute inset-x-0 z-[3] border-t-2 border-danger" style={{ top: NOW_MIN * PX }}><span className="absolute -left-1 -top-[5px] size-2 rounded-full bg-danger" /></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthGrid({ date, list, closedNote, onDay, onOpen }: { date: string; list: Booking[]; closedNote: (d: string) => string | null; onDay: (d: string) => void; onOpen: (b: Booking) => void }) {
  const start = weekStart(date.slice(0, 8) + '01'); const month = date.slice(0, 7); const today = dISO(0)
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const byDate = React.useMemo(() => { const m: Record<string, Booking[]> = {}; list.forEach((b) => { (m[b.date] ??= []).push(b) }); Object.values(m).forEach((L) => L.sort((x, y) => x.start - y.start)); return m }, [list])
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="sticky top-0 z-[2] grid min-w-[700px] grid-cols-7 border-b border-border bg-surface">{WEEKDAYS.map((d) => <div key={d} className="px-2 py-1.5 text-xs font-medium text-muted">{d}</div>)}</div>
      <div className="grid min-w-[700px] grid-cols-7">
        {days.map((d) => {
          const items = byDate[d] ?? []; const other = !d.startsWith(month); const closed = closedNote(d)
          return (
            <div key={d} role="button" tabIndex={0} onClick={() => onDay(d)} onKeyDown={(e) => e.key === 'Enter' && onDay(d)}
              className={cn('min-h-[112px] cursor-pointer border-b border-l border-border-2 p-1 transition-colors first:border-l-0 hover:bg-subtle-2 [&:nth-child(7n+1)]:border-l-0', other && 'bg-subtle-2', closed && 'bg-[repeating-linear-gradient(135deg,var(--subtle-3)_0_6px,transparent_6px_12px)]')}>
              <div className="mb-0.5 flex items-center justify-between px-0.5">
                <span className={cn('flex size-6 items-center justify-center rounded-full text-xs font-medium tabular', d === today ? 'bg-primary text-white' : other && 'text-muted')}>{+d.slice(8)}</span>
                {items.length > 0 ? <span className="text-2xs text-muted tabular">{items.length}</span> : closed && <span className="truncate text-2xs text-muted">{closed}</span>}
              </div>
              {items.slice(0, 3).map((b) => (
                <button key={b.id} onClick={(e) => { e.stopPropagation(); onOpen(b) }} className={cn('flex w-full items-center gap-1 rounded-[4px] px-1 text-left text-2xs leading-5 hover:bg-fill-hover', b.status === 'cancelled' && 'text-muted line-through')}>
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: STATUS[b.status].c }} />
                  <span className="shrink-0 text-muted tabular">{fmtMin(b.start).replace(':00', '').replace(' ', '').toLowerCase()}</span>
                  <span className="truncate">{b.who}</span>
                </button>
              ))}
              {items.length > 3 && <div className="px-1 text-2xs font-medium text-muted">+{items.length - 3} more</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Bookings calendar: day (one column per person), week and month. Click an empty time to book it. */
export function Calendar({ camp, mode, setMode, date, setDate, status, setStatus, focus, clearFocus, onOpen, onSlot }: {
  camp: string; mode: CalMode; setMode: (m: CalMode) => void; date: string; setDate: (d: string) => void
  status: BookingStatus | 'all'; setStatus: (s: BookingStatus | 'all') => void; focus: string | null; clearFocus: () => void
  onOpen: (b: Booking) => void; onSlot: (p: BookingPreset) => void
}) {
  const bookings = useStore((s) => s.bookings); const staff = useStore((s) => s.staff[camp]); const hours = useStore((s) => s.hours[camp]); const set = useStore((s) => s.bookingSet[camp])
  const team = staff?.length ? staff : ['Front desk']
  const [who, setWho] = React.useState('all'); const [showCancelled, setShowCancelled] = React.useState(false)
  React.useEffect(() => setWho('all'), [camp])
  const list = React.useMemo(() => bookings.filter((b) => b.camp === camp && (who === 'all' || b.staff === who) && (status === 'all' ? showCancelled || b.status !== 'cancelled' : b.status === status)), [bookings, camp, who, status, showCancelled])
  const closedNote = (iso: string) => { const cl = set?.closures.find((c) => c.date === iso); if (cl) return `Closed · ${cl.note}`; const h = hours?.[dayKey(iso)]; return h && !h[2] ? 'Closed' : null }
  const openRange = (iso: string): [number, number] => { const h = hours?.[dayKey(iso)]; return h ? [Math.max(0, fromHHMM(h[0])), Math.min(DAY_LEN, fromHHMM(h[1]))] : [0, DAY_LEN] }
  const move = (dir: number) => setDate(mode === 'month' ? addMonths(date, dir) : addDays(date, dir * (mode === 'week' ? 7 : 1)))
  const today = dISO(0)

  const dayCols: Col[] = (who === 'all' ? team : [who]).map((st) => {
    const items = list.filter((b) => b.date === date && b.staff === st)
    return { key: st, items, preset: { camp, staff: st, date }, closed: closedNote(date), open: openRange(date), today: date === today,
      label: <><div className="truncate text-sm font-medium">{st}</div><div className="text-xs text-muted">{items.filter((b) => b.status !== 'cancelled').length} booked</div></> }
  })
  const weekCols: Col[] = Array.from({ length: 7 }, (_, i) => addDays(weekStart(date), i)).map((d) => ({
    key: d, items: list.filter((b) => b.date === d), preset: { camp, date: d }, closed: closedNote(d), open: openRange(d), today: d === today,
    label: <button onClick={() => { setMode('day'); setDate(d) }} className="flex w-full items-center gap-1.5 rounded-control text-left hover:text-primary">
      <span className="text-xs text-muted">{dayKey(d)}</span><span className={cn('flex size-6 items-center justify-center rounded-full text-sm font-semibold tabular', d === today && 'bg-primary text-white')}>{+d.slice(8)}</span>
      <span className="ml-auto text-xs text-muted tabular">{list.filter((b) => b.date === d && b.status !== 'cancelled').length || ''}</span>
    </button>,
  }))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-2 p-2">
        <Button onClick={() => setDate(today)}>Today</Button>
        <span className="flex"><Button variant="ghost" size="icon-sm" onClick={() => move(-1)} aria-label="Previous"><ChevronLeft /></Button><Button variant="ghost" size="icon-sm" onClick={() => move(1)} aria-label="Next"><ChevronRight /></Button></span>
        <h2 className="mr-auto min-w-0 truncate">{titleFor(mode, date)}</h2>
        <Input type="date" aria-label="Go to date" className="h-7 w-[142px] text-xs md:h-7" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <Select variant="button" value={who} onValueChange={setWho} options={[{ value: 'all', label: 'Everyone' }, ...team.map((t) => ({ value: t, label: t }))]} />
        <Select variant="button" value={status} onValueChange={(v) => setStatus(v as BookingStatus | 'all')} options={[{ value: 'all', label: 'All statuses' }, ...Object.entries(STATUS).map(([k, v]) => ({ value: k, label: v.l, icon: <span className="size-2 rounded-full" style={{ background: v.c }} /> }))]} />
        {status === 'all' && <ToggleChip on={showCancelled} onClick={() => setShowCancelled(!showCancelled)}>Show cancelled</ToggleChip>}
        <Segmented value={mode} onChange={setMode} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
      </div>
      {focus && (
        <div className="flex items-center gap-2 border-b border-border-2 bg-subtle-2 px-3 py-1.5 text-sm anim-fade">
          <Sparkles className="size-4 text-icon" /><span className="min-w-0 flex-1 truncate">{focus}</span>
          <Button variant="ghost" size="icon-xs" onClick={clearFocus} aria-label="Clear"><X /></Button>
        </div>
      )}
      {mode === 'day' && <TimeGrid key={`d-${camp}`} columns={dayCols} minCol={150} onOpen={onOpen} onSlot={onSlot} />}
      {mode === 'week' && <TimeGrid key={`w-${camp}`} columns={weekCols} minCol={120} onOpen={onOpen} onSlot={onSlot} showStaff />}
      {mode === 'month' && <MonthGrid date={date} list={list} closedNote={closedNote} onOpen={onOpen} onDay={(d) => { setMode('day'); setDate(d) }} />}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-2 px-3 py-2 text-xs text-muted sm:pr-32">
        {Object.entries(STATUS).map(([k, v]) => <span key={k} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: v.c }} />{v.l}</span>)}
        <span className="ml-auto hidden sm:inline">{mode === 'month' ? 'Click a day to open it' : 'Click an empty time to book it'}</span>
      </div>
    </div>
  )
}
