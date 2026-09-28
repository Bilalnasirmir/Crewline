import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, CheckCheck, Search, Hand, UserRoundCog, Sparkles, MoreHorizontal, PanelRight, Phone, CalendarDays, FileText, DollarSign, MailOpen, Kanban, ShieldBan, Paperclip, Mic, Send, ArrowLeft, Bot, AlertTriangle, MessageSquareText, ChevronDown, HelpCircle, Inbox as InboxIcon } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Avatar, AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DirIcon, PlatIcon, PLATFORMS } from '@/components/app/icons'
import { StageTag } from '@/components/app/bits'
import { Recording, Transcript } from '@/features/shared/media'
import { NewBookingDialog } from '@/features/bookings/shared'
import { QuoteDialog, RecordSaleDialog, NewMessageDialog } from './dialogs'
import { ContactPanel } from './panel'
import type { Convo, ConvoItem, Platform } from '@/data/types'

const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const CHAT_PLATS: Platform[] = ['wa', 'sms', 'ig', 'msg', 'tt', 'fb', 'chat']
const REPLIES = ['Thanks!', 'Sounds good 👍', 'Perfect, thank you', 'Great — what happens next?', 'Can you call me after 5?']
const TEMPLATES = [['Friendly check-in', 'Hi {first_name}, just checking in — any questions I can answer?'], ['Price recap', 'Quick recap: Internet 1 Gig is $50/month with free installation this month.'], ['Book a time', 'Would tomorrow morning or afternoon work better for you?'], ['Thank you', 'Thanks so much, {first_name}! We’ll be in touch shortly.']]
export const lastMsg = (v: Convo) => [...v.items].reverse().find((i): i is Extract<ConvoItem, { t: 'm' }> => i.t === 'm')

export function Ticks({ st, className }: { st: 'sent' | 'delivered' | 'read'; className?: string }) {
  return <Tip content={st === 'sent' ? 'Sent' : st === 'delivered' ? 'Delivered' : 'Read'}>{st === 'sent' ? <Check className={cn('size-3.5 shrink-0 text-muted', className)} /> : <CheckCheck className={cn('size-3.5 shrink-0', st === 'read' ? 'text-[#53BDEB]' : 'text-muted', className)} />}</Tip>
}

/** Chat: list with in/out and platform filters, the thread, and the contact panel. */
export function ChatView({ kindTabs }: { kindTabs: React.ReactNode }) {
  const [sp, setSp] = useSearchParams(); const s = useStore()
  const [dir, setDir] = React.useState<'all' | 'in' | 'out'>('all'); const [plats, setPlats] = React.useState<Platform[]>([]); const [q, setQ] = React.useState(''); const [needs, setNeeds] = React.useState(false)
  const [newMsg, setNewMsg] = React.useState<{ cid?: string } | null>(null)
  const list = s.convos.filter((v) => {
    const c = s.contacts.find((x) => x.id === v.cid); const camp = s.campaigns.find((k) => k.id === v.camp)
    return (dir === 'all' || v.dir === dir) && (!plats.length || plats.includes(v.plat)) && (!needs || v.needs || v.unread) && (!q || `${c?.name} ${c?.phone} ${camp?.name} ${v.items.map((i) => (i.t === 'm' ? i.text : '')).join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  })
  const id = sp.get('id')
  const cur = s.convos.find((v) => v.id === id)
  const open = (vid: string) => { sp.set('id', vid); sp.set('kind', 'chat'); setSp(sp, { replace: true }); const v = s.convos.find((x) => x.id === vid); if (v?.unread) s.updateConvo(vid, { unread: false }) }
  const to = sp.get('to')
  React.useEffect(() => {
    if (to) { const v = s.convos.find((x) => x.cid === to); sp.delete('to'); if (v) { sp.set('id', v.id); setSp(sp, { replace: true }) } else { setSp(sp, { replace: true }); setNewMsg({ cid: to }) } }
    else if (!id && list[0] && window.innerWidth >= 768) open(list[0].id)
  }, [to])
  const togglePlat = (p: Platform) => setPlats(plats.includes(p) ? plats.filter((x) => x !== p) : [...plats, p])
  return (
    <>
      <div className={cn('flex w-full shrink-0 flex-col border-r border-border md:w-[340px]', cur ? 'max-md:hidden' : 'flex')}>
        <div className="space-y-2 border-b border-border-2 p-3">
          {kindTabs}
          <div className="flex items-center justify-between gap-2"><Segmented value={dir} onChange={setDir} options={[{ value: 'all', label: 'All' }, { value: 'in', label: 'Inbound', icon: <DirIcon dir="in" size={12} withTip={false} /> }, { value: 'out', label: 'Outbound', icon: <DirIcon dir="out" size={12} withTip={false} /> }]} /><Tip content="Only unread and needs-you"><Button variant={needs ? 'primary' : 'ghost'} size="icon-sm" onClick={() => setNeeds(!needs)} aria-label="Only unread"><MailOpen /></Button></Tip></div>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Platforms">
            <button onClick={() => setPlats([])} className={cn('flex h-7 items-center rounded-control border px-2 text-xs font-medium transition-colors', !plats.length ? 'border-btn bg-btn text-btn-fg' : 'border-border-strong hover:bg-subtle-2')}>All</button>
            {CHAT_PLATS.map((p) => { const on = plats.includes(p); return (
              <Tip key={p} content={`${on ? 'Hide' : 'Show only'} ${PLATFORMS[p].label}`}>
                <button onClick={() => togglePlat(p)} aria-pressed={on} aria-label={PLATFORMS[p].label} className={cn('relative flex size-7 items-center justify-center rounded-control border transition-colors', on ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border-strong hover:bg-subtle-2')}>
                  <PlatIcon p={p} size={14} tip={false} />{on && <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-btn text-btn-fg"><Check className="size-2.5" strokeWidth={3} /></span>}
                </button>
              </Tip>
            ) })}
          </div>
          <label className="flex h-8 items-center gap-2 rounded-control bg-subtle-2 px-2.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary"><Search className="size-4 text-icon" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search people, messages, campaigns" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.map((v) => <ChatRow key={v.id} v={v} on={v.id === id} onClick={() => open(v.id)} />)}
          {!list.length && <EmptyState compact icon={<InboxIcon />} title="No conversations" description="Try other platforms or clear the search." />}
        </div>
      </div>
      {cur ? <Thread key={cur.id} v={cur} onBack={() => { sp.delete('id'); setSp(sp, { replace: true }) }} /> : <div className="hidden flex-1 items-center justify-center md:flex"><EmptyState icon={<MessageSquareText />} title="Pick a conversation" description="Or start one — text, WhatsApp or any connected channel." action={<Button variant="primary" onClick={() => setNewMsg({})}>New message</Button>} /></div>}
      <NewMessageDialog open={!!newMsg} onOpenChange={(o) => !o && setNewMsg(null)} preset={newMsg ?? undefined} />
    </>
  )
}

function ChatRow({ v, on, onClick }: { v: Convo; on: boolean; onClick: () => void }) {
  const s = useStore(); const c = s.contacts.find((x) => x.id === v.cid); const camp = s.campaigns.find((k) => k.id === v.camp); const folder = s.folders.find((f) => f.id === c?.folder); const agent = s.agents.find((a) => a.id === v.agent)
  const last = lastMsg(v)
  return (
    <button onClick={onClick} className={cn('flex w-full gap-3 border-b border-border-2 px-3 py-2.5 text-left transition-colors', on ? 'bg-fill-selected' : 'hover:bg-subtle-2')}>
      <span className="relative h-fit shrink-0"><Avatar name={c?.name || '?'} size={36} /><span className="absolute -bottom-0.5 -right-0.5 flex rounded-full bg-surface p-0.5 shadow-card"><PlatIcon p={v.plat} size={12} tip={false} /></span></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5"><span className={cn('truncate text-sm', v.unread ? 'font-semibold' : 'font-medium')}>{c?.name || 'Name missing'}</span>{v.query && <Tip content="Receptionist query — information only"><HelpCircle className="size-3.5 shrink-0 text-icon" /></Tip>}<span className={cn('ml-auto shrink-0 text-xs', v.unread ? 'font-semibold text-primary' : 'text-muted')}>{v.time}</span></span>
        <span className="flex items-center gap-1 text-sm text-muted">{last?.d === 'o' && <Ticks st={last.st} />}<span className={cn('truncate', v.unread && 'text-text')}>{last?.text}</span>{v.unread && <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" />}</span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted"><DirIcon dir={v.dir} size={11} withTip={false} />{v.human ? <span className="font-medium text-text">You</span> : <><AgentAvatar name={agent?.name ?? '?'} size={14} />{agent?.name}</>}{camp && <span className="truncate">· {camp.name.split('—')[1]?.trim() ?? camp.name}</span>}{folder && <span className="hidden truncate xl:inline">· {folder.name.split(' ')[0]}</span>}</span>
        {(v.needs || v.human) && <span className="mt-1 flex gap-1">{v.needs && <Badge tone="red">Needs you</Badge>}{v.human && <Badge>You’re handling</Badge>}</span>}
      </span>
    </button>
  )
}

/* ---------- Thread ---------- */
function Thread({ v, onBack }: { v: Convo; onBack: () => void }) {
  const nav = useNavigate(); const [sp, setSp] = useSearchParams(); const s = useStore()
  const c = s.contacts.find((x) => x.id === v.cid); const camp = s.campaigns.find((k) => k.id === v.camp); const agent = s.agents.find((a) => a.id === v.agent); const stages = stagesFor(camp, s.stages)
  const [panel, setPanel] = React.useState(true); const [dlg, setDlg] = React.useState<'quote' | 'sale' | 'book' | 'analyze' | null>(sp.get('quote') ? 'quote' : null)
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [v.items.length])
  React.useEffect(() => { if (sp.get('quote')) { sp.delete('quote'); setSp(sp, { replace: true }) } }, [])
  const ev = (text: string, k: 'sys' | 'hand' | 'stage' | 'book' = 'sys') => s.pushConvoItem(v.id, { t: 'ev', k, text, time: now() })
  const takeOver = () => { s.updateConvo(v.id, { human: true, needs: false }); ev(`You took over this conversation · ${agent?.name ?? 'the agent'} is paused for ${c?.first || 'this person'}`, 'hand'); toast(`You’re handling this now · ${agent?.name} is paused`) }
  const handBack = () => { s.updateConvo(v.id, { human: false }); ev(`Handed back to ${agent?.name} · the agent picks up from the latest message`, 'hand'); toast(`${agent?.name} is handling it again`) }
  const assign = (to: string, who: string, isAgent: boolean) => { s.updateConvo(v.id, isAgent ? { agent: to, human: false, needs: false } : { human: true }); ev(`Assigned to ${who}`, 'hand'); toast.success(`Assigned to ${who}`) }
  const resolveInchat = (idx: number) => s.updateConvo(v.id, { items: v.items.map((it, i) => (i === idx && it.t === 'inchat' ? { ...it, resolved: true } : it)) })
  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border px-3 py-2">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onBack} aria-label="Back to conversations"><ArrowLeft /></Button>
          <Avatar name={c?.name || '?'} size={32} />
          <div className="min-w-0 flex-1">
            <button onClick={() => c && nav(`/contacts/${c.id}`)} className="block max-w-full truncate text-left text-sm font-semibold hover:text-primary">{c?.name || 'Name missing'}</button>
            <div className="flex items-center gap-1.5 truncate text-xs text-muted"><PlatIcon p={v.plat} size={12} tip={false} />{PLATFORMS[v.plat].label}<span>·</span><DirIcon dir={v.dir} size={11} withTip={false} />{v.dir === 'in' ? 'Inbound' : 'Outbound'}{camp && <><span>·</span><button className="truncate hover:text-primary" onClick={() => nav(`/campaigns/${camp.id}`)}>{camp.name}</button></>}</div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {v.human ? <Tip content="You’re handling this conversation"><Button onClick={handBack}><Bot />Hand back to {agent?.name}</Button></Tip>
              : <><span className="hidden items-center gap-1.5 text-xs text-muted 2xl:flex"><AgentAvatar name={agent?.name ?? '?'} size={18} />{agent?.name} is handling</span><Button onClick={takeOver}><Hand />Take over</Button></>}
            <DropdownMenu><DropdownMenuTrigger asChild><Button aria-label="Assign"><UserRoundCog /><span className="hidden 2xl:inline">Assign</span><ChevronDown /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>AI agents</DropdownMenuLabel>
                {s.agents.filter((a) => ['sales', 'reception', 'support', 'marketing'].includes(a.type)).slice(0, 8).map((a) => <DropdownMenuItem key={a.id} onSelect={() => assign(a.id, a.name, true)}><AgentAvatar name={a.name} size={18} />{a.name}<span className="ml-auto text-xs text-muted">{a.type}</span></DropdownMenuItem>)}
                <DropdownMenuSeparator /><DropdownMenuLabel>Your team</DropdownMenuLabel>
                {s.team.slice(0, 4).map((t) => <DropdownMenuItem key={t.email} onSelect={() => assign(t.email, t.name, false)}><Avatar name={t.name} size={18} />{t.name}</DropdownMenuItem>)}
              </DropdownMenuContent></DropdownMenu>
            <Tip content="Analyze this chat with AI"><Button size="icon" onClick={() => setDlg('analyze')} aria-label="Analyze with AI"><Sparkles /></Button></Tip>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => setDlg('book')}><CalendarDays />Book an appointment</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDlg('quote')}><FileText />Send a quotation</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDlg('sale')}><DollarSign />Record a sale</DropdownMenuItem>
                {stages.length > 0 && c && <DropdownMenuSub><DropdownMenuSubTrigger><Kanban />Move stage</DropdownMenuSubTrigger><DropdownMenuSubContent>{stages.map((st) => <DropdownMenuItem key={st.id} onSelect={() => { s.moveLead(c.id, st.name, 'you'); toast.success(`Moved to ${st.name}`) }}><StageTag name={st.name} stages={stages} size="sm" /></DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub>}
                <DropdownMenuItem onSelect={() => { s.updateConvo(v.id, { unread: true }); toast('Marked as unread') }}><MailOpen />Mark as unread</DropdownMenuItem>
                <DropdownMenuSeparator />
                {c && <DropdownMenuItem danger onSelect={() => { s.patch('dnc', (d) => [{ id: 'd' + Date.now(), name: c.name, phone: c.phone, reason: 'Manual', added: 'Today', by: 'Bilal Nasir', comment: 'Added from the Inbox' }, ...d]); s.updateContact(c.id, { dnc: true }); ev('Added to Do-Not-Contact · no agent will message this person again'); toast.success('Added to Do-Not-Contact') }}><ShieldBan />Add to Do-Not-Contact</DropdownMenuItem>}
              </DropdownMenuContent></DropdownMenu>
            <Tip content={panel ? 'Hide details' : 'Show details'}><Button variant="ghost" size="icon" className="hidden xl:inline-flex" onClick={() => setPanel(!panel)} aria-label="Toggle details"><PanelRight /></Button></Tip>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-subtle-2 px-3 py-4 md:px-6">
          <div className="mx-auto max-w-[760px] space-y-2">
            {v.items.map((it, i) => <Item key={i} it={it} v={v} onResolve={() => resolveInchat(i)} />)}
            <div ref={end} />
          </div>
        </div>
        <Composer v={v} onTakeOver={takeOver} />
      </div>
      {panel && c && <ContactPanel className="hidden xl:flex" contact={c} onClose={() => setPanel(false)} onQuote={() => setDlg('quote')} onSale={() => setDlg('sale')} onBook={() => setDlg('book')} onText={() => document.getElementById('chat-composer')?.focus()} onEmail={() => nav(`/inbox?kind=email&compose=${c.id}`)} onCall={() => nav(`/inbox?kind=calls&dial=${encodeURIComponent(c.phone)}`)} />}
      <QuoteDialog open={dlg === 'quote'} onOpenChange={(o) => !o && setDlg(null)} contact={c} convo={v.id} />
      <RecordSaleDialog open={dlg === 'sale'} onOpenChange={(o) => !o && setDlg(null)} contact={c} convo={v.id} />
      <NewBookingDialog open={dlg === 'book'} onOpenChange={(o) => !o && setDlg(null)} preset={{ cid: c?.id, who: c?.name, camp: camp?.booking ? camp.id : 'k3' }} />
      <AnalyzeChat open={dlg === 'analyze'} onOpenChange={(o) => !o && setDlg(null)} v={v} />
    </div>
  )
}

function Item({ it, v, onResolve }: { it: ConvoItem; v: Convo; onResolve: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const c = s.contacts.find((x) => x.id === v.cid); const camp = s.campaigns.find((k) => k.id === v.camp); const stages = stagesFor(camp, s.stages)
  const agentName = (id: string | null) => (id === 'you' ? 'You' : s.agents.find((a) => a.id === id)?.name ?? 'Agent')
  switch (it.t) {
    case 'day': return <div className="flex justify-center py-1"><span className="rounded-tag bg-surface px-2 py-0.5 text-xs font-medium text-muted shadow-card">{it.text}</span></div>
    case 'm': {
      const out = it.d === 'o'
      return (
        <div className={cn('flex', out ? 'justify-end' : 'justify-start')}>
          <div className={cn('max-w-[78%] rounded-[12px] px-3 py-1.5 shadow-card', out ? 'rounded-tr-[4px] bg-primary-soft' : 'rounded-tl-[4px] bg-surface')}>
            {out && <div className="mb-0.5 flex items-center gap-1 text-xs font-medium text-muted">{it.who === 'you' ? 'You' : <><AgentAvatar name={agentName(it.who)} size={14} />{agentName(it.who)} · AI</>}</div>}
            <div className="whitespace-pre-wrap text-sm">{it.text}</div>
            <div className="mt-0.5 flex items-center justify-end gap-1 text-2xs text-muted">{it.time}{out && <Ticks st={it.st} />}</div>
          </div>
        </div>
      )
    }
    case 'ev': {
      const I = it.k === 'stage' ? Kanban : it.k === 'hand' ? Hand : it.k === 'book' ? CalendarDays : it.query ? HelpCircle : AlertTriangle
      const pill = <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-tag bg-surface px-2.5 py-1 text-xs text-text-2 shadow-card', it.k === 'stage' && 'cursor-pointer hover:bg-subtle-2')} onClick={it.k === 'stage' ? () => nav(`/stages?camp=${v.camp}`) : undefined}><I className="size-3.5 shrink-0 text-icon" /><span className="min-w-0">{it.text}</span>{it.stage && <StageTag name={it.stage} stages={stages} size="sm" />}<span className="shrink-0 text-muted">· {it.time}</span></span>
      return <div className="flex justify-center py-0.5">{it.k === 'stage' ? <Tip content="Stage changes show here in real time. Click to open the board.">{pill}</Tip> : pill}</div>
    }
    case 'call': return (
      <div className="flex justify-center py-1">
        <div className="w-full max-w-[460px] rounded-card bg-surface p-3 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-sm"><span className="flex size-7 items-center justify-center rounded-control bg-success-soft text-success"><Phone className="size-4" /></span><span className="font-medium">{it.d === 'i' ? 'Incoming' : 'Outgoing'} call · {it.dur}</span><span className="text-muted">with {agentName(it.who)}</span><span className="ml-auto text-xs text-muted">{it.time}</span></div>
          <Recording dur={it.dur.replace('m ', ':').replace('s', '')} />
          <p className="mt-2 text-sm"><span className="font-semibold">AI summary: </span>{it.summary}</p>
          <Transcript lines={it.tr} className="mt-1.5" />
        </div>
      </div>
    )
    case 'inchat': return (
      <div className="flex justify-center py-1">
        <div className={cn('w-full max-w-[520px] rounded-card border p-3', it.resolved ? 'border-border bg-surface opacity-70' : 'border-[#FFB800] bg-warning-soft')}>
          <div className="flex items-start gap-2 text-sm">{it.k === 'book' ? <CalendarDays className="mt-0.5 size-4 shrink-0" /> : <Kanban className="mt-0.5 size-4 shrink-0" />}<span className="flex-1">{it.text}{it.k === 'stage' && ' Move it?'}</span></div>
          {!it.resolved ? (
            <div className="mt-2 flex flex-wrap gap-2 pl-6">
              {it.k === 'book' ? <>
                <Button variant="primary" onClick={() => { onResolve(); s.pushConvoItem(v.id, { t: 'ev', k: 'book', text: 'Rhea (receptionist) took over the booking request', time: now() }); s.assigned.filter((a) => a.convo === v.id && a.kind === 'book').forEach((a) => s.resolveAssigned(a.id)); toast.success('Rhea is booking it and will confirm by text') }}><Bot />Assign to Rhea</Button>
                <Button onClick={() => { onResolve(); s.updateConvo(v.id, { human: true }); toast('You’re handling the booking') }}>Handle it myself</Button>
              </> : <>
                <Button variant="primary" onClick={() => { onResolve(); if (c && it.stage) { s.moveLead(c.id, it.stage, 'you', 'confirmed in a human chat'); toast.success(`Moved to ${it.stage}`) } }}>Yes, move to {it.stage}</Button>
                <Button onClick={() => { onResolve(); if (c) s.moveLead(c.id, 'Pending', 'you'); toast('Kept in Pending') }}>Not yet</Button>
              </>}
            </div>
          ) : <div className="mt-1 pl-6 text-xs text-muted">Done</div>}
        </div>
      </div>
    )
    case 'quote': return (
      <div className="flex justify-end">
        <div className="w-full max-w-[360px] rounded-card bg-surface p-3 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-sm"><FileText className="size-4 text-icon" /><span className="font-semibold">Quotation {it.no}</span><Badge tone="green" className="ml-auto">Sent</Badge></div>
          {it.lines.map(([l, a], i) => <div key={i} className="flex justify-between gap-3 text-sm"><span className="truncate text-muted">{l}</span><span className="tabular">{money(a, it.cur)}</span></div>)}
          <div className="mt-1 flex justify-between border-t border-border-2 pt-1 text-sm font-semibold"><span>Total</span><span className="tabular">{money(it.total, it.cur)}</span></div>
          <div className="mt-1 text-right text-2xs text-muted">{it.time} · by {it.via.map((p) => PLATFORMS[p as Platform]?.label ?? p).join(' and ')}</div>
        </div>
      </div>
    )
  }
}

function Composer({ v, onTakeOver }: { v: Convo; onTakeOver: () => void }) {
  const s = useStore(); const c = s.contacts.find((x) => x.id === v.cid); const agent = s.agents.find((a) => a.id === v.agent)
  const [text, setText] = React.useState(''); const [via, setVia] = React.useState<Platform>(v.plat); const [busy, setBusy] = React.useState(false)
  const ref = React.useRef<HTMLTextAreaElement>(null); const file = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { const el = ref.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(140, el.scrollHeight) + 'px' }, [text])
  const send = (t = text) => {
    if (!t.trim()) return
    if (!v.human) { s.updateConvo(v.id, { human: true, needs: false }); s.pushConvoItem(v.id, { t: 'ev', k: 'hand', text: `You took over · ${agent?.name} is paused`, time: now() }) }
    s.sendMessage(v.id, t.trim()); setText('')
    if (via !== v.plat) toast(`Sent by ${PLATFORMS[via].label}`)
    setTimeout(() => s.pushConvoItem(v.id, { t: 'm', d: 'i', who: null, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: now(), st: 'read' }), 5200)
  }
  const ai = () => { setBusy(true); const last = lastMsg(v); setTimeout(() => { setBusy(false); setText(last?.d === 'i' ? `Hi ${c?.first || 'there'}, thanks for your message! ${/noon|saturday|install/i.test(last.text) ? 'Yes — I can book the installer for Saturday between 9 and 11 AM. Shall I lock that in?' : /price|much|\$|1\.05/i.test(last.text) ? 'Happy to talk numbers — can I call you at 6 PM today?' : 'Let me check that for you right away.'}` : `Hi ${c?.first || 'there'}, just checking in — any questions I can answer?`) }, 600) }
  return (
    <div className="shrink-0 border-t border-border bg-surface p-3">
      {!v.human && <div className="mb-2 flex items-center gap-2 text-xs text-muted"><Bot className="size-3.5" /><span className="flex-1">{agent?.name} (AI) is handling this chat. Typing here takes over.</span><Button variant="link" className="text-xs" onClick={onTakeOver}>Take over now</Button></div>}
      <div className="rounded-card border border-border-strong focus-within:border-input-border-hover focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
        <textarea id="chat-composer" ref={ref} rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder={`Message ${c?.first || ''} on ${PLATFORMS[via].label}…`} className="block min-h-10 w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none focus-visible:outline-none" />
        <div className="flex flex-wrap items-center gap-1 px-2 pb-2">
          <Select variant="button" value={via} onValueChange={(p) => setVia(p as Platform)} options={([v.plat, ...(['sms', 'wa', 'msg'] as Platform[]).filter((p) => p !== v.plat)]).map((p) => ({ value: p, label: `via ${PLATFORMS[p].label}`, icon: <PlatIcon p={p} size={12} tip={false} /> }))} />
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost">Templates<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent className="w-72">{TEMPLATES.map(([l, t]) => <DropdownMenuItem key={l} onSelect={() => setText(t.replace('{first_name}', c?.first || 'there'))} className="h-auto flex-col items-start py-1.5"><span className="font-medium">{l}</span><span className="line-clamp-1 text-xs text-muted">{t}</span></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
          <Button variant="ghost" loading={busy} onClick={ai}>{!busy && <Sparkles />}Write with AI</Button>
          <span className="flex-1" />
          <input ref={file} type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) send(`📎 ${f.name}`); e.target.value = '' }} />
          <Tip content="Attach a file or picture"><Button variant="ghost" size="icon-sm" onClick={() => file.current?.click()} aria-label="Attach"><Paperclip /></Button></Tip>
          <Tip content="Send a voice note"><Button variant="ghost" size="icon-sm" onClick={() => send('🎤 Voice note · 0:12')} aria-label="Voice note"><Mic /></Button></Tip>
          <Button variant="primary" size="icon-sm" onClick={() => send()} disabled={!text.trim()} aria-label="Send"><Send /></Button>
        </div>
      </div>
    </div>
  )
}

function AnalyzeChat({ open, onOpenChange, v }: { open: boolean; onOpenChange: (o: boolean) => void; v: Convo }) {
  const s = useStore(); const c = s.contacts.find((x) => x.id === v.cid); const last = lastMsg(v)
  const rows: [string, string][] = [['Mood', v.needs ? 'Frustrated — wants a person' : last?.d === 'i' && /thank|great|perfect|yes/i.test(last.text) ? 'Positive' : 'Neutral, interested'], ['Stage', `${c?.stage ?? '—'} — the AI is 92% sure this is right`], ['What they want', /noon|saturday|install/i.test(last?.text ?? '') ? 'An installation before noon on Saturday' : /1\.05|price|negotiat/i.test(last?.text ?? '') ? 'To negotiate the price with a person' : 'More information before deciding'], ['Agent mistakes', 'None found'], ['Next best step', /saturday|install/i.test(last?.text ?? '') ? 'Book Saturday 9–11 AM with Install team A' : 'Reply within 5 minutes and offer a call']]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" title={<span className="flex items-center gap-2"><Sparkles className="size-4" />Chat analysis</span>} description={c?.name} footer={<><Button onClick={() => { s.addReport({ name: `Chat analysis — ${c?.name}`, folder: 'r6', date: '2026-09-27', by: 'Max', kind: 'Analysis' }); toast.success('Saved to Reports') }}>Save to Reports</Button><Button variant="primary" onClick={() => onOpenChange(false)}>Done</Button></>}>
        <dl className="space-y-2">{rows.map(([k, val]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="text-sm">{val}</dd></div>)}</dl>
      </DialogContent>
    </Dialog>
  )
}
