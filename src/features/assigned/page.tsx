import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UserCheck, Hand, CalendarPlus, ListChecks, Frown, HelpCircle, PhoneCall, ExternalLink, Check, Sparkles, RotateCcw, ChevronDown, Bot, Phone, BellRing, CircleCheck, ArrowRight, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { PageBody, PageHeader, PageTabs } from '@/components/app/page'
import { askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge, Count } from '@/components/ui/badge'
import { Card, CardHeader, CardBody, EmptyState } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CampaignChip, StageTag, ToggleChip } from '@/components/app/bits'
import { Recording, Transcript } from '@/features/shared/media'
import { BOOKING_CAMPS } from '@/features/bookings/shared'
import type { Assigned } from '@/data/types'

type Kind = Assigned['kind']
const KIND: Record<Kind, { l: string; Icon: React.ComponentType<{ className?: string }> }> = {
  hand: { l: 'Wants a person', Icon: Hand }, book: { l: 'Booking request', Icon: CalendarPlus }, stage: { l: 'Choose a stage', Icon: ListChecks },
  angry: { l: 'Upset customer', Icon: Frown }, qual: { l: 'Unclear qualification', Icon: HelpCircle }, number: { l: 'New number found', Icon: PhoneCall },
}

/** The words that made the case unclear (the last quote in the description). */
const keyPhrase = (a: Assigned) => [...a.desc.matchAll(/“([^”]+)”/g)].pop()?.[1] ?? a.title

/** Everything the AI couldn't decide by itself, with the actions that fit each case. */
export function AssignedPage() {
  const s = useStore(); const nav = useNavigate()
  const [tab, setTab] = React.useState<'open' | 'done'>('open'); const [kind, setKind] = React.useState<Kind | 'all'>('all')
  const open = s.assigned.filter((a) => !a.done); const done = s.assigned.filter((a) => a.done)
  const list = (tab === 'open' ? open : done).filter((a) => kind === 'all' || a.kind === kind)
  const learned = done.filter((a) => a.kind === 'stage' && a.outcome?.startsWith('Moved to'))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Assigned to me" icon={<UserCheck />} sub="What the AI couldn’t decide by itself"
        actions={<Button variant="header" onClick={() => nav('/settings/notifications')}><BellRing />Notification settings</Button>} />
      <PageTabs value={tab} onChange={setTab} tabs={[{ value: 'open', label: <>Open<Count n={open.length} tone="red" /></> }, { value: 'done', label: <>Resolved<Count n={done.length} /></> }]} />
      <PageBody>
        <div className="mx-auto grid max-w-[1200px] gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <ToggleChip on={kind === 'all'} onClick={() => setKind('all')}>All<span className="tabular opacity-70">{(tab === 'open' ? open : done).length}</span></ToggleChip>
              {(Object.keys(KIND) as Kind[]).map((k) => { const n = (tab === 'open' ? open : done).filter((a) => a.kind === k).length; if (!n) return null; const I = KIND[k].Icon; return <ToggleChip key={k} on={kind === k} onClick={() => setKind(k)}><I />{KIND[k].l}<span className="tabular opacity-70">{n}</span></ToggleChip> })}
            </div>
            {list.map((a) => <Item key={a.id} a={a} />)}
            {!list.length && <Card><EmptyState icon={<CircleCheck />} title={tab === 'open' ? 'You’re all caught up' : 'Nothing resolved yet'} description={tab === 'open' ? 'New hand-overs, stage questions and booking requests show up here, with a notification.' : 'Items you handle move here, so you can reopen them.'} /></Card>}
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader title="How this works" />
              <CardBody className="space-y-2 text-sm">
                <p>When an agent isn’t sure — someone asks for a person, gets upset, or wants a booking in a campaign that doesn’t book — it lands here and you get a notification.</p>
                <p className="text-muted">Your choices teach the AI, so it asks less over time.</p>
              </CardBody>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader title="What the AI learned from you" />
              {learned.length ? learned.map((a) => <div key={a.id} className="flex items-start gap-2 border-t border-border-2 px-4 py-2.5 text-sm"><Sparkles className="mt-0.5 size-4 shrink-0 text-icon" /><span>When a lead says “{keyPhrase(a)}” → <b className="font-semibold">{a.outcome!.replace('Moved to ', '')}</b></span></div>)
                : <p className="px-4 pb-4 text-sm text-muted">Nothing yet. Choose a stage for a lead and the AI will remember it.</p>}
            </Card>
          </div>
        </div>
      </PageBody>
    </div>
  )
}

function Item({ a }: { a: Assigned }) {
  const s = useStore(); const nav = useNavigate()
  const c = s.contacts.find((x) => x.id === a.cid); const camp = s.campaigns.find((k) => k.id === a.camp); const stages = stagesFor(camp, s.stages)
  const [stage, setStage] = React.useState(a.suggest ?? c?.stage ?? stages[0]?.name ?? '')
  const K = KIND[a.kind]
  const resolve = (outcome: string, msg?: string) => { s.resolveAssigned(a.id, outcome); toast.success(msg ?? outcome) }
  const openChat = () => nav(a.convo ? `/inbox?kind=chat&id=${a.convo}` : c ? `/inbox?to=${c.id}` : '/inbox')
  const setStageNow = () => {
    if (c) s.moveLead(c.id, stage, 'you', 'chosen in Assigned to me')
    resolve(`Moved to ${stage}`, `${c?.name ?? 'Lead'} moved to ${stage} · the AI will handle cases like this by itself`)
  }
  const giveTo = (name: string) => resolve(`Given to ${name}`, `${name} got it, with a notification and the full conversation`)
  const stagePicker = stages.length > 0 && (
    <><Select variant="button" value={stage} onValueChange={setStage} options={stages.map((st) => ({ value: st.name, label: st.name, icon: <span className="size-2 rounded-full" style={{ background: st.color }} /> }))} />
      <Button variant="primary" onClick={setStageNow}><Check />Set stage</Button></>
  )
  const actions: Record<Kind, React.ReactNode> = {
    hand: <><Button variant="primary" onClick={() => { if (a.convo) s.updateConvo(a.convo, { human: true, needs: false }); resolve('You took over', 'You’re in the conversation now — the agent stepped back'); openChat() }}><Hand />Take over</Button></>,
    book: <>
      <Button onClick={() => { resolve('You booked it yourself', 'Opening a new booking for them'); nav(`/bookings?new=1&camp=${a.camp && BOOKING_CAMPS.includes(a.camp) ? a.camp : 'k3'}&who=${a.cid ?? ''}`) }}><CalendarPlus />Book it myself</Button>
      <Button variant="primary" onClick={() => { if (a.convo) s.pushConvoItem(a.convo, { t: 'ev', k: 'book', text: 'Rhea (receptionist) took over the booking request', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }); resolve('Rhea is booking it', 'Rhea is booking it and will confirm by text') }}><Bot />Assign to Rhea</Button>
    </>,
    stage: stagePicker,
    qual: stagePicker,
    angry: <>
      <Button onClick={async () => { const v = await askText({ title: 'Offer a credit', label: 'Amount', value: '$25', ok: 'Send offer', hint: 'The customer gets it by text, with an apology.' }); if (v) resolve(`Offered a ${v} credit`, `${v} credit offered by text`) }}><Gift />Offer a credit</Button>
      <Button variant="primary" onClick={() => { toast(`Calling ${c?.name ?? 'the customer'}… (demo)`); resolve('You called back') }}><Phone />Call back now</Button>
    </>,
    number: <>
      <Button onClick={() => { if (c) s.updateContact(c.id, { custom: { ...c.custom, 'Other phone': a.newPhone ?? '' } }); resolve('Kept both numbers', 'Saved as a second number') }}>Keep both</Button>
      <Button variant="primary" onClick={() => { if (c && a.newPhone) s.updateContact(c.id, { phone: a.newPhone, noReply: 0 }); resolve('Number updated', `${c?.name ?? 'Contact'}’s number updated · agents will use the new one`) }}><Check />Update number</Button>
    </>,
  }
  return (
    <Card className={cn(a.done && 'opacity-90')}>
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-subtle text-icon"><K.Icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0">{a.title}</h3>
            <Badge tone={a.kind === 'angry' ? 'red' : a.kind === 'hand' || a.kind === 'book' ? 'amber' : 'neutral'}>{K.l}</Badge>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            {c && <button onClick={() => nav(`/contacts/${c.id}`)} className="flex items-center gap-1 hover:text-primary"><Avatar name={c.name || '?'} size={14} />{c.name || 'Name missing'}</button>}
            {camp && <><span>·</span><CampaignChip id={camp.id} className="text-xs text-muted" /></>}
            <span>· {a.time}</span>
          </div>
          <p className="mt-2 text-sm">{a.desc}</p>
        </div>
        {c && (a.kind === 'stage' || a.kind === 'qual') && <span className="hidden shrink-0 items-center gap-1.5 text-sm text-muted sm:flex">Now <StageTag name={c.stage} stages={stages} /></span>}
      </div>
      {a.kind === 'number' && !a.done && c && a.newPhone && (
        <div className="mx-4 mb-3 flex flex-wrap items-center gap-3 rounded-control bg-subtle-2 px-3 py-2 text-sm">
          <span><span className="block text-xs text-muted">On file</span><span className="tabular line-through decoration-border-strong">{c.phone}</span></span>
          <ArrowRight className="size-4 text-icon" />
          <span><span className="block text-xs text-muted">Found by AI search</span><span className="font-medium tabular">{a.newPhone}</span></span>
        </div>
      )}
      {(a.summary || a.rec) && (
        <div className="space-y-2 border-t border-border-2 px-4 py-3">
          {a.rec && <Recording dur="2:41" className="max-w-[420px]" />}
          {a.summary && <p className="text-sm"><span className="font-semibold">Summary: </span>{a.summary}</p>}
          {a.tr && <Transcript lines={a.tr} />}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-border-2 px-4 py-3">
        {a.done ? <>
          <span className="flex items-center gap-1.5 text-sm"><CircleCheck className="size-4 text-success" />{a.outcome ?? 'Resolved'}</span>
          <span className="flex-1" />
          <Button onClick={() => { s.reopenAssigned(a.id); toast('Moved back to Open') }}><RotateCcw />Reopen</Button>
        </> : <>
          {a.suggest && (a.kind === 'stage' || a.kind === 'qual') && <span className="flex items-center gap-1.5 text-sm text-muted"><Sparkles className="size-4" />AI’s best guess: <StageTag name={a.suggest} stages={stages} /></span>}
          <span className="flex-1" />
          <Button variant="ghost" onClick={openChat}><ExternalLink />Open conversation</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost">Give to<ChevronDown /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Teammates</DropdownMenuLabel>
              {s.team.filter((t) => t.role !== 'Owner').map((t) => <DropdownMenuItem key={t.email} onSelect={() => giveTo(t.name)}><Avatar name={t.name} size={18} />{t.name}<span className="ml-auto text-xs text-muted">{t.role}</span></DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" onClick={() => resolve('Marked as done', 'Marked as done')}>Mark done</Button>
          {actions[a.kind]}
        </>}
      </div>
    </Card>
  )
}

