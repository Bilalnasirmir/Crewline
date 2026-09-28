import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Phone, Mail, CalendarDays, FileText, DollarSign, Kanban, HelpCircle, ShoppingBag, ExternalLink, X, Folder } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore, stagesFor, scoreOf } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { PropertyList, Property } from '@/components/ui/card'
import { DirIcon, PlatIcon, PLATFORMS } from '@/components/app/icons'
import { AgentChip, CampaignChip } from '@/components/app/bits'
import { PhoneMenu } from '@/features/contacts/dialogs'
import { dNice } from '@/data/seed'
import type { Contact } from '@/data/types'

type HK = 'chat' | 'call' | 'email' | 'stage' | 'sale' | 'book' | 'query'
const HI: Record<HK, { I: React.ComponentType<{ className?: string }>; c: string; l: string; d: string }> = {
  chat: { I: MessageSquare, c: 'bg-info-soft text-info', l: 'Chat', d: 'Text, WhatsApp or social messages' }, call: { I: Phone, c: 'bg-success-soft text-success', l: 'Call', d: 'Phone call with recording and summary' },
  email: { I: Mail, c: 'bg-warning-soft text-warning', l: 'Email', d: 'Email sent or received' }, stage: { I: Kanban, c: 'bg-subtle text-icon', l: 'Stage', d: 'Moved between stages' },
  sale: { I: DollarSign, c: 'bg-success-soft text-success', l: 'Sale', d: 'Purchase recorded' }, book: { I: CalendarDays, c: 'bg-primary-soft text-primary', l: 'Booking', d: 'Appointment booked or changed' },
  query: { I: HelpCircle, c: 'bg-subtle text-icon', l: 'Query', d: 'Information-only question to the receptionist' },
}
const dayOf = (t: string) => (/yesterday/i.test(t) ? 'Yesterday' : /today/i.test(t) || /^\d{1,2}:\d{2}/.test(t) ? 'Today' : 'Earlier')

/** Everything about the person you’re talking to, next to the conversation. */
export function ContactPanel({ contact: c, onClose, onQuote, onSale, onBook, onText, onEmail, onCall, className }: {
  contact: Contact; onClose?: () => void; onQuote: () => void; onSale: () => void; onBook: () => void; onText: () => void; onEmail: () => void; onCall: () => void; className?: string
}) {
  const nav = useNavigate(); const s = useStore()
  const camp = s.campaigns.find((k) => k.id === c.camp); const stages = stagesFor(camp, s.stages); const folder = s.folders.find((f) => f.id === c.folder)
  const hist: { k: HK; text: React.ReactNode; time: string; open?: string; sub?: React.ReactNode }[] = []
  s.convos.filter((v) => v.cid === c.id).forEach((v) => {
    const msgs = v.items.filter((i) => i.t === 'm').length
    hist.push({ k: 'chat', text: <>{PLATFORMS[v.plat].label} chat · {msgs} messages</>, time: v.time, open: `/inbox?kind=chat&id=${v.id}`, sub: <PlatIcon p={v.plat} size={12} /> })
    v.items.forEach((it) => { if (it.t === 'ev' && it.k === 'stage') hist.push({ k: 'stage', text: it.text, time: it.time }); if (it.t === 'ev' && it.k === 'book') hist.push({ k: 'book', text: it.text, time: it.time }) })
  })
  s.calls.filter((l) => l.cid === c.id).forEach((l) => hist.push({ k: 'call', text: <>{l.dir === 'in' ? 'Incoming' : 'Outgoing'} call · {l.dur} — {l.summary}</>, time: l.time, open: `/inbox?kind=calls&id=${l.id}` }))
  s.emails.filter((e) => e.cid === c.id).forEach((e) => hist.push({ k: 'email', text: <>{e.box === 'sent' ? 'Sent' : 'Received'}: “{e.subj}”</>, time: e.time, open: `/inbox?kind=email&id=${e.id}` }))
  s.bookings.filter((b) => b.cid === c.id).forEach((b) => hist.push({ k: 'book', text: <>{b.svc} with {b.staff} · {b.status}</>, time: dNice(b.date) }))
  s.queries.filter((q) => q.cid === c.id).forEach((q) => hist.push({ k: 'query', text: <>Asked: “{q.q}”</>, time: q.time }))
  if (c.purchase) hist.push({ k: 'sale', text: <>Bought {c.purchase.product} · {money(c.purchase.amount)}</>, time: dNice(c.purchase.date) })
  const groups = (['Today', 'Yesterday', 'Earlier'] as const).map((d) => [d, hist.filter((h) => dayOf(h.time) === d)] as const).filter(([, l]) => l.length)
  const sc = scoreOf(c)
  return (
    <aside className={cn('flex min-h-0 w-[300px] shrink-0 flex-col overflow-y-auto border-l border-border bg-surface', className)}>
      <div className="flex items-start gap-3 p-4">
        <Avatar name={c.name || '?'} size={44} />
        <div className="min-w-0 flex-1">
          <button onClick={() => nav(`/contacts/${c.id}`)} className="block max-w-full truncate text-left text-lg font-semibold hover:text-primary">{c.name || 'Name missing'}</button>
          <PhoneMenu contact={c}><button className="block text-sm tabular text-muted hover:text-primary">{c.phone}</button></PhoneMenu>
          {c.email && <div className="truncate text-sm text-muted">{c.email}</div>}
          <div className="mt-1.5 flex flex-wrap gap-1"><Badge tone={sc === 'Hot' ? 'green' : sc === 'Dead' ? 'red' : sc === 'Warm' || sc === 'Not responding' ? 'amber' : 'neutral'}>{sc}</Badge>{c.tags.map((t) => <Badge key={t} tone="outline">{t}</Badge>)}{c.dnc && <Badge tone="red">Do-Not-Contact</Badge>}</div>
        </div>
        {onClose && <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Hide details"><X /></Button>}
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
        {([['Text', MessageSquare, onText], ['Call', Phone, onCall], ['Email', Mail, onEmail], ['Book', CalendarDays, onBook], ['Quote', FileText, onQuote], ['Sale', DollarSign, onSale]] as const).map(([l, I, fn]) => (
          <Button key={l} className="h-auto flex-col gap-0.5 py-1.5 md:h-auto" onClick={fn}><I />{l}</Button>
        ))}
      </div>
      <div className="border-t border-border-2 px-4 py-3">
        <PropertyList labelWidth={84}>
          <Property label="Campaign">{camp ? <span className="flex min-w-0 items-center gap-1.5"><DirIcon dir={camp.dir} size={12} /><CampaignChip id={camp.id} className="truncate" /></span> : <span className="text-muted">None</span>}</Property>
          <Property label="Stage">{stages.length ? <Select size="sm" value={c.stage} onValueChange={(v) => s.moveLead(c.id, v, 'you')} options={stages.map((st) => ({ value: st.name, label: st.name, icon: <span className="size-2 rounded-full" style={{ background: st.color }} /> }))} /> : <span className="text-muted">—</span>}</Property>
          <Property label="Lead folder">{folder ? <button onClick={() => nav(`/contacts?folder=${folder.id}`)} className="flex min-w-0 items-center gap-1.5 hover:text-primary"><Folder className="size-3.5 shrink-0 text-icon" /><span className="truncate">{folder.name}</span></button> : '—'}</Property>
          <Property label="Source"><span className="flex items-center gap-1.5"><DirIcon dir={c.dir} size={12} />{c.source}</span></Property>
          <Property label="Agent"><AgentChip id={c.agent} size={18} /></Property>
          {c.purchase && <Property label="Bought"><span className="flex min-w-0 items-center gap-1.5"><ShoppingBag className="size-3.5 shrink-0 text-icon" /><span className="truncate">{c.purchase.product}</span></span></Property>}
        </PropertyList>
      </div>
      <div className="border-t border-border-2 px-4 py-3">
        <div className="mb-1 flex items-center justify-between"><h3>History</h3><Button variant="link" onClick={() => nav(`/contacts/${c.id}`)}>Full profile</Button></div>
        {groups.map(([day, items]) => (
          <div key={day} className="py-1">
            <h4 className="mb-1 text-muted">{day}</h4>
            {items.map((h, i) => { const d = HI[h.k]; return (
              <div key={i} className="group flex gap-2.5 py-1">
                <Tip content={<span><b className="font-semibold">{d.l}</b> — {d.d}</span>}><span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-control', d.c)}><d.I className="size-3.5" /></span></Tip>
                <div className="min-w-0 flex-1"><div className="text-sm leading-5">{h.text}</div><div className="flex items-center gap-1.5 text-xs text-muted">{h.sub}{h.time}{h.open && <button onClick={() => nav(h.open!)} className="ml-auto opacity-0 hover:text-primary group-hover:opacity-100" aria-label="Open"><ExternalLink className="size-3.5" /></button>}</div></div>
              </div>
            ) })}
          </div>
        ))}
        {!groups.length && <p className="text-sm text-muted">Nothing yet.</p>}
      </div>
      <div className="border-t border-border-2 px-4 py-3">
        <h3 className="mb-1.5">Notes</h3>
        <Textarea value={c.notes} onChange={(e) => s.updateContact(c.id, { notes: e.target.value })} placeholder="Notes for your team and agents" className="min-h-16" />
      </div>
    </aside>
  )
}
