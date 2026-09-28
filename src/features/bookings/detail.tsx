import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, CalendarClock, MessageSquare, UserCheck, CircleCheck, UserX, X, RotateCcw, Phone, Lock, Bell, Send, CalendarPlus } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { askConfirm } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { PropertyList, Property } from '@/components/ui/card'
import { AgentAvatar } from '@/components/ui/avatar'
import { AgentChip, ContactChip } from '@/components/app/bits'
import { dISO, dNice, dShort } from '@/data/seed'
import { StatusBadge, fmtMin, freeSlots, campLabel, type BookingPreset } from './shared'
import { andList } from '@/data/review'
import type { Booking, BookingStatus } from '@/data/types'

const CONF_NAME: Record<string, string> = { sms: 'text', email: 'email', wa: 'WhatsApp' }

/** Contact stage that matches each booking status (used when the campaign's stages have it). */
const STAGE_FOR: Record<BookingStatus, string> = { requested: 'Requested', booked: 'Appointment Booked', arrived: 'Arrived', completed: 'Completed', noshow: 'No-show', cancelled: 'Cancelled' }
const DONE: Record<BookingStatus, string> = { requested: 'moved back to requested', booked: 'confirmed', arrived: 'marked arrived', completed: 'marked completed', noshow: 'marked as a no-show', cancelled: 'cancelled' }

/** Change a booking's status everywhere: the calendar, the contact's stage and the activity feed. */
export function setBookingStatus(b: Booking, status: BookingStatus) {
  const s = useStore.getState()
  s.updateBooking(b.id, { status })
  const c = b.cid ? s.contacts.find((x) => x.id === b.cid) : undefined
  const camp = s.campaigns.find((k) => k.id === (c?.camp ?? b.camp))
  if (c && stagesFor(camp, s.stages).some((x) => x.name === STAGE_FOR[status])) s.moveLead(c.id, STAGE_FOR[status], 'you', 'from Bookings')
  s.addActivity({ icon: 'calendar', text: `<b>You</b> ${DONE[status]} <b>${b.who}</b> · ${b.svc.toLowerCase()} ${dShort(b.date)}`, time: 'just now', k: 'book' })
  toast.success(`${b.who} ${DONE[status]}${status === 'cancelled' ? ' · they were told by text and the time is free again' : ''}`)
}

export const byLabel = (by: string) => (/^[a-z]\d$/.test(by) ? null : by)

/** Who made the booking: an agent chip, or the source in words. */
export function BookedBy({ by, className }: { by: string; className?: string }) {
  return byLabel(by) === null ? <AgentChip id={by} size={18} className={className} /> : <span className={cn('text-muted', className)}>{by}</span>
}

/** Booking details with the actions that fit its status. */
export function BookingDialog({ id, onClose, onReschedule }: { id: string | null; onClose: () => void; onReschedule: (p: BookingPreset) => void }) {
  const nav = useNavigate()
  const b = useStore((s) => s.bookings.find((x) => x.id === id))
  const set = useStore((s) => (b ? s.bookingSet[b.camp] : undefined))
  if (!b) return null
  const past = b.date < dISO(0); const today = b.date === dISO(0)
  const go = (st: BookingStatus) => { setBookingStatus(b, st); if (st === 'completed' || st === 'cancelled') onClose() }
  const cancel = async () => { if (await askConfirm({ title: `Cancel ${b.who}’s booking?`, description: `${b.svc} · ${dNice(b.date)} at ${fmtMin(b.start)}. They get a message, and the time opens up for other bookings.`, ok: 'Cancel booking', danger: true })) go('cancelled') }
  const steps: { icon: React.ReactNode; text: React.ReactNode; when: string }[] = [
    { icon: <CalendarPlus />, text: <>Booked by {byLabel(b.by) === null ? <AgentChip id={b.by} size={16} /> : b.by}</>, when: b.created },
    { icon: <Send />, text: `Confirmation sent by ${andList(b.conf.map((c) => CONF_NAME[c] ?? c))}`, when: b.created },
    ...((past || today || b.date === dISO(1)) && b.status !== 'cancelled' ? (set?.reminders ?? []).map((r) => ({ icon: <Bell />, text: <>Reminder sent by {r.via.toLowerCase()} · {r.when}</>, when: dShort(b.date) })) : []),
    ...(b.status === 'arrived' || b.status === 'completed' ? [{ icon: <UserCheck />, text: 'Arrived', when: `${dShort(b.date)} · ${fmtMin(b.start - 5)}` }] : []),
    ...(b.status === 'completed' ? [{ icon: <CircleCheck />, text: `Completed${b.price ? ` · ${money(b.price)} paid` : ''}`, when: `${dShort(b.date)} · ${fmtMin(b.start + b.dur)}` }] : []),
    ...(b.status === 'noshow' ? [{ icon: <UserX />, text: 'Didn’t show up', when: dShort(b.date) }] : []),
    ...(b.status === 'cancelled' ? [{ icon: <X />, text: 'Cancelled', when: dShort(b.date) }] : []),
  ]
  const primary = b.status === 'requested' ? <Button variant="primary" onClick={() => go('booked')}><Check />Confirm</Button>
    : b.status === 'booked' ? <Button variant="primary" onClick={() => go('arrived')}><UserCheck />Mark arrived</Button>
    : b.status === 'arrived' ? <Button variant="primary" onClick={() => go('completed')}><CircleCheck />Mark completed</Button>
    : <Button variant="primary" onClick={() => { onClose(); onReschedule({ camp: b.camp, who: b.cid ?? b.who, svc: b.svc, staff: b.staff }) }}><RotateCcw />Book again</Button>
  return (
    <Dialog open={!!b} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="md" title={<span className="flex items-center gap-2">{b.svc} · {b.who}</span>} description={`${dNice(b.date)} · ${fmtMin(b.start)}–${fmtMin(b.start + b.dur)} · ${b.staff}`}
        footer={<>
          {(b.status === 'booked' || b.status === 'requested') && <Button variant="destructive" className="mr-auto" onClick={cancel}>{b.status === 'requested' ? 'Decline' : 'Cancel booking'}</Button>}
          {b.status === 'booked' && (past || today) && <Button onClick={() => go('noshow')}><UserX />No-show</Button>}
          {(b.status === 'booked' || b.status === 'requested') && <Button onClick={() => { onClose(); onReschedule({ reschedule: b.id }) }}><CalendarClock />Reschedule</Button>}
          {primary}
        </>}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge s={b.status} /><span className="text-sm text-muted">{campLabel(b.camp)}</span></div>
          <PropertyList labelWidth={112}>
            <Property label="Person">{b.cid ? <ContactChip id={b.cid} /> : <span>{b.who}</span>}</Property>
            <Property label="Service">{b.svc} · {b.dur} min{b.price ? ` · ${money(b.price)}` : ''}</Property>
            <Property label="With">{b.staff}</Property>
            <Property label="When">{dNice(b.date)}, {fmtMin(b.start)}–{fmtMin(b.start + b.dur)}</Property>
            <Property label="Booked by"><BookedBy by={b.by} /></Property>
          </PropertyList>
          <div>
            <h4 className="mb-2 text-muted">History</h4>
            <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-border">
              {steps.map((st, i) => (
                <li key={i} className="relative flex items-center gap-3 text-sm">
                  <span className="z-[1] flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-icon [&_svg]:size-3.5">{st.icon}</span>
                  <span className="min-w-0 flex-1">{st.text}</span><span className="shrink-0 text-xs text-muted">{st.when}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { onClose(); nav(b.cid ? `/inbox?to=${b.cid}` : '/inbox') }}><MessageSquare />Message {b.who.split(' ')[0]}</Button>
            <Button size="sm" onClick={() => toast.success(`Reminder sent to ${b.who} by text`)}><Bell />Send a reminder</Button>
            <Button size="sm" onClick={() => toast(`Calling ${b.who}… (demo)`)}><Phone />Call</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** "Two callers, one time slot": shows that the slot locks for the first caller and the second is offered the next free time. */
export function DoubleBookingSim({ open, onOpenChange, camp, onShow }: { open: boolean; onOpenChange: (o: boolean) => void; camp: string; onShow: (date: string) => void }) {
  const s = useStore()
  const [step, setStep] = React.useState(0)
  const staffName = (s.staff[camp] ?? ['Front desk'])[0]; const svc = (s.services[camp] ?? [])[0] ?? { n: 'Appointment', dur: 30, price: 0 }
  const date = dISO(1)
  const plan = React.useRef<{ a: number; b: number } | null>(null)
  React.useEffect(() => {
    if (!open) return
    setStep(0)
    const free = freeSlots(useStore.getState().bookings, camp, staffName, date, svc.dur, 15)
    const a = free.find((m) => m >= 60) ?? free[0] ?? 60
    const b = free.find((m) => m >= a + svc.dur) ?? a + svc.dur
    plan.current = { a, b }
    let n = 0
    const t = setInterval(() => {
      n++
      if (n === 3) useStore.getState().addBooking({ camp, staff: staffName, svc: svc.n, who: 'Nadia Hussain', date, start: a, dur: svc.dur, status: 'booked', by: 'r1', created: 'Today', price: svc.price, conf: ['sms'] })
      if (n === 4) { useStore.getState().addBooking({ camp, staff: staffName, svc: svc.n, who: 'Tom Becker', date, start: b, dur: svc.dur, status: 'booked', by: 'r2', created: 'Today', price: svc.price, conf: ['sms'] }); clearInterval(t) }
      setStep(n)
    }, 1100)
    return () => clearInterval(t)
  }, [open]) // runs once each time the dialog opens
  const p = plan.current ?? { a: 60, b: 60 + svc.dur }
  const Line = ({ agent, who, state }: { agent: string; who: string; state: React.ReactNode }) => (
    <div className="flex-1 space-y-2 rounded-card border border-border p-3">
      <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-full bg-subtle text-icon"><Phone className="size-3.5" /></span><span className="min-w-0"><span className="block text-sm font-medium">{who}</span><span className="flex items-center gap-1 text-xs text-muted"><AgentAvatar name={agent} size={14} />talking to {agent}</span></span></div>
      <div className="rounded-control bg-subtle-2 px-2.5 py-2 text-sm">“Can I get a {svc.n.toLowerCase()} tomorrow at {fmtMin(p.a)}?”</div>
      <div className="min-h-9 text-sm">{state}</div>
    </div>
  )
  const lines = ['Two people call at the same moment and ask for the same time', `Rhea locks ${fmtMin(p.a)} for Nadia — nobody else can take it now`, `Sam checks ${fmtMin(p.a)}: already taken, so he offers ${fmtMin(p.b)}`, `Nadia is booked for ${fmtMin(p.a)} with ${staffName}`, `Tom takes ${fmtMin(p.b)} — no double booking`]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" title="Two callers, one time slot" description={`${campLabel(camp)} · ${svc.n} with ${staffName}, tomorrow`}
        footer={step >= 4 ? <><Button onClick={() => onOpenChange(false)}>Close</Button><Button variant="primary" onClick={() => { onOpenChange(false); onShow(date) }}>See it on the calendar</Button></> : <Button onClick={() => onOpenChange(false)}>Close</Button>}>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Line agent="Rhea" who="Nadia Hussain" state={step >= 3 ? <span className="flex items-center gap-1.5 text-success-text"><CircleCheck className="size-4" />Booked · {fmtMin(p.a)}</span> : step >= 1 ? <span className="flex items-center gap-1.5"><Lock className="size-4 text-icon" />Holding {fmtMin(p.a)}…</span> : <span className="text-muted">Checking the calendar…</span>} />
            <Line agent="Sam" who="Tom Becker" state={step >= 4 ? <span className="flex items-center gap-1.5 text-success-text"><CircleCheck className="size-4" />Booked · {fmtMin(p.b)}</span> : step >= 2 ? <span>“Sorry, {fmtMin(p.a)} was just taken. I have {fmtMin(p.b)} — does that work?”</span> : <span className="text-muted">Checking the calendar…</span>} />
          </div>
          <ol className="space-y-1.5">
            {lines.map((l, i) => <li key={l} className={cn('flex items-center gap-2 text-sm transition-colors', i > step && 'text-muted')}><span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full', i <= step ? 'bg-success text-white' : 'border border-border-strong')}>{i <= step && <Check className="size-2.5" strokeWidth={3} />}</span>{l}</li>)}
          </ol>
          <p className="text-xs text-muted" style={{ color: step >= 4 ? undefined : 'transparent' }}>Every agent checks the same live calendar, and a time is locked the moment it’s offered.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

