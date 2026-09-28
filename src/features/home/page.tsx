import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, SlidersHorizontal, ChevronRight, Megaphone, Users, Receipt, CalendarDays, Phone, Kanban, Hand, Database, X, Inbox, MessageSquare, GripVertical, Check, Home as HomeIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { toast } from 'sonner'
import { cn, nf, money } from '@/lib/utils'
import { useStore } from '@/store'
import { useMax } from '@/features/max/store'
import { Composer } from '@/features/max/chat'
import { PageBody, PageHeader } from '@/components/app/page'
import { Card, CardBody, CardHeader, EmptyState } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/controls'
import { Tip } from '@/components/ui/tooltip'
import { AgentAvatar } from '@/components/ui/avatar'
import { AiMark, DirIcon } from '@/components/app/icons'
import { Kpi, AgentChip, BarRow } from '@/components/app/bits'
import { dISO } from '@/data/seed'

const KPIS: Record<string, { l: string; v: (f: number) => string; d: string; to: string; tip: string }> = {
  convos: { l: 'Conversations today', v: (f) => nf(412 * f), d: '+12% vs last Sunday', to: '/inbox', tip: 'Chats, calls and emails handled by agents today' },
  calls: { l: 'Calls made', v: (f) => nf(186 * f), d: 'by 6 agents', to: '/inbox?kind=calls', tip: 'Outbound calls placed by AI agents' },
  answered: { l: 'Calls answered', v: (f) => nf(121 * f), d: '65% answer rate', to: '/inbox?kind=calls', tip: 'Calls where a person picked up' },
  texts: { l: 'Texts & emails sent', v: (f) => nf(1930 * f), d: '312 replies', to: '/inbox', tip: 'SMS, WhatsApp, social DMs and email' },
  booked: { l: 'Appointments & orders', v: (f) => nf(38 * f), d: '+6 vs last Sunday', to: '/bookings', tip: 'Booked by agents today' },
  sales: { l: 'Sales closed', v: (f) => nf(21 * f), d: '$14,820 revenue', to: '/stages', tip: 'Leads that reached a revenue stage today' },
  revenue: { l: 'Revenue today', v: (f) => money(14820 * f), d: '+8% vs last Sunday', to: '/reports', tip: 'Based on product values at the revenue stage' },
  cost: { l: 'AI cost today', v: (f) => money(212 * f), d: '$5.58 per booking', to: '/expenses', tip: 'Calling, voices, tokens and messaging' },
  handoffs: { l: 'Handed to you', v: (f) => nf(6 * f), d: '2 waiting', to: '/assigned', tip: 'Conversations that need a person' },
  replies: { l: 'Reply rate', v: () => '31%', d: '+2 pts', to: '/campaigns', tip: 'Replies ÷ messages sent, last 7 days' },
}
const PANELS: Record<string, string> = { attention: 'Needs your attention', kpis: 'Key numbers', bookings: 'Bookings per day', split: 'Inbound vs outbound', funnel: 'Stage funnel', activity: 'Live agent activity', assigned: 'Assigned to me', upcoming: 'Coming up today', agents: 'Your AI team', channels: 'By channel', folders: 'Lead folder performance' }
const CHIPS: [string, React.ComponentType<{ className?: string }>, string][] = [
  ['Build a campaign', Megaphone, 'Build an outbound campaign for Mississauga Leads by text and call'],
  ['Find people in Brooklyn', Users, 'Find people in Brooklyn'],
  ['What should I fix today?', Sparkles, 'What should I fix today?'],
  ['Bookings on Sep 23', CalendarDays, 'How many bookings did we have on September 23?'],
  ['Reduce my costs', Receipt, 'How can I reduce my costs?'],
]
/** List rows inside cards: divider on top (Polaris index-table style), 16px sides. */
const row = 'flex border-t border-border-2 px-4 py-2'

export function HomePage() {
  const nav = useNavigate()
  const { send, newThread } = useMax()
  const s = useStore()
  const [camp, setCamp] = React.useState('all'); const [dir, setDir] = React.useState<'all' | 'in' | 'out'>('all'); const [folder, setFolder] = React.useState('all')
  const [custom, setCustom] = React.useState(false)
  const f = (camp === 'all' ? 1 : 0.4) * (dir === 'all' ? 1 : 0.55) * (folder === 'all' ? 1 : 0.3)
  const ask = (q: string) => { newThread(); send(q); nav('/max') }
  const attn = s.suggestions
  const bpd = Array.from({ length: 14 }, (_, i) => ({ d: new Date(2026, 8, 14 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), n: Math.round([4, 9, 12, 15, 11, 6, 5, 14, 18, 16, 21, 19, 8, 17][i] * f) }))
  const todays = s.bookings.filter((b) => b.date === dISO(0) && b.start >= 360).sort((a, b) => a.start - b.start).slice(0, 5)
  const openAssigned = s.assigned.filter((a) => !a.done)
  const show = (k: string) => s.homePanels.includes(k)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Home" icon={<HomeIcon />} actions={<Button variant="header" onClick={() => setCustom(true)}><SlidersHorizontal />Customize</Button>} />
      <PageBody wide>
        {/* Max: ask in your own words */}
        <section className="mx-auto mb-6 max-w-[662px] pt-2">
          <div className="text-center">
            <h2 className="text-xl">Good evening, Bilal. What do you want to do?</h2>
            <p className="mt-1 text-sm text-muted">Tell Max in your own words. It builds campaigns, finds people, fixes agents and explains any number below.</p>
          </div>
          <div className="mt-4"><Composer hint={null} placeholder="e.g. “Build a campaign for my Mississauga leads” or “Why did Win-back replies drop?”" onSend={(t) => ask(t)} /></div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {CHIPS.map(([l, I, q]) => <Button key={l} onClick={() => ask(q)}><I className="text-icon" />{l}</Button>)}
          </div>
        </section>

        {show('attention') && attn.length > 0 && (
          <Card className="mb-4 overflow-hidden">
            <CardHeader icon={<AiMark />} title={<span className="flex items-center gap-2">Needs your attention <Badge>{attn.length}</Badge></span>} description="The backend keeps checking your campaigns and agents. These go away once fixed."
              action={<Button onClick={() => ask('Fix everything that needs my attention')}><Sparkles />Let AI finish it with me</Button>} />
            <div>{attn.map((a) => (
              <div key={a.id} className={cn(row, 'flex-wrap items-center gap-x-3 gap-y-2')}>
                <Badge tone={a.area === 'Setup' ? 'blue' : a.area === 'Agent' ? 'neutral' : 'amber'} className="w-19 justify-center">{a.area}</Badge>
                <div className="min-w-0 flex-1 basis-48"><div className="truncate text-sm font-medium">{a.title}</div><div className="truncate text-sm text-muted">{a.fix}</div></div>
                <div className="ml-auto flex shrink-0 gap-2">
                  <Button variant="ghost" onClick={() => nav(a.go)}>Open</Button>
                  <Button onClick={() => ask(`Fix: ${a.title}`)}><Sparkles />Fix with AI</Button>
                </div>
              </div>
            ))}</div>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Select variant="button" value={camp} onValueChange={setCamp} options={[{ value: 'all', label: 'All campaigns' }, ...s.campaigns.map((c) => ({ value: c.id, label: c.name, icon: <DirIcon dir={c.dir} size={12} withTip={false} /> }))]} />
          <Segmented value={dir} onChange={setDir} options={[{ value: 'all', label: 'All' }, { value: 'out', label: 'Outbound', icon: <DirIcon dir="out" size={12} withTip={false} /> }, { value: 'in', label: 'Inbound', icon: <DirIcon dir="in" size={12} withTip={false} /> }]} />
          <Select variant="button" value={folder} onValueChange={setFolder} options={[{ value: 'all', label: 'All lead folders' }, ...s.folders.filter((x) => !x.group).map((x) => ({ value: x.id, label: x.name }))]} />
          {(camp !== 'all' || dir !== 'all' || folder !== 'all') && <Button variant="ghost" onClick={() => { setCamp('all'); setDir('all'); setFolder('all') }}><X />Clear</Button>}
          <span className="ml-auto text-xs text-muted">Hover any number for details</span>
        </div>

        {show('kpis') && <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{s.homeKpis.map((k) => { const d = KPIS[k]; return d ? <Kpi key={k} label={d.l} value={d.v(f)} delta={d.d} up={d.d.startsWith('+') ? true : undefined} to={d.to} tip={d.tip} /> : null })}</div>}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="min-w-0 space-y-4 lg:col-span-2">
            {show('bookings') && (
              <Card><CardHeader title="Bookings per day" description="Appointments and orders booked by agents, last 14 days" action={<Button variant="ghost" onClick={() => nav('/bookings')}>Open bookings<ChevronRight /></Button>} />
                <CardBody className="h-[228px]"><ResponsiveContainer><BarChart data={bpd} margin={{ left: -20, right: 4, top: 8 }}><CartesianGrid vertical={false} stroke="var(--border-2)" /><XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={1} /><YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><RTip cursor={{ fill: 'var(--fill-hover)' }} contentStyle={{ borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13, color: 'var(--text)' }} /><Bar dataKey="n" name="Booked" radius={[4, 4, 0, 0]}>{bpd.map((_, i) => <Cell key={i} fill={i === bpd.length - 1 ? 'var(--primary)' : 'var(--info-fill)'} />)}</Bar></BarChart></ResponsiveContainer></CardBody></Card>
            )}
            {show('funnel') && (
              <Card><CardHeader title="Stage funnel" description="Telecom — Mobility Q4" action={<Button variant="ghost" onClick={() => nav('/stages')}>Open board<ChevronRight /></Button>} />
                <CardBody>{[['New', 138, '#8A93A6'], ['Contacted', 758, '#4C8BF5'], ['Interested', 198, '#7048E8'], ['Order Booked', 121, '#0F766E'], ['Installed', 74, '#15803D']].map(([l, v, c]: any) => <BarRow key={l} label={l} value={Math.round(v * f)} max={758} color={c} onClick={() => nav('/stages')} />)}</CardBody></Card>
            )}
            {show('activity') && (
              <Card className="overflow-hidden"><CardHeader title="Live agent activity" description="What your AI team is doing right now" action={<span className="flex h-7 items-center gap-1.5 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success animate-[pulse-dot_2s_infinite]" />Live</span>} />
                <div>{s.activity.slice(0, 7).map((a) => { const I = ({ phone: Phone, calendar: CalendarDays, kanban: Kanban, hand: Hand, database: Database, x: X, inbox: Inbox, megaphone: Megaphone, 'message-square': MessageSquare } as any)[a.icon] ?? Sparkles; return (
                  <div key={a.id} className={cn(row, 'items-start gap-3', a.fresh && 'anim-fade bg-primary-soft/40')}><span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-subtle text-icon"><I className="size-3.5" /></span><div className="min-w-0 flex-1 text-sm [&_b]:font-semibold" dangerouslySetInnerHTML={{ __html: a.text }} /><span className="shrink-0 text-xs leading-5 text-muted">{a.time}</span></div>
                ) })}</div></Card>
            )}
          </div>
          <div className="min-w-0 space-y-4">
            {show('assigned') && (
              <Card className="overflow-hidden"><CardHeader title="Assigned to me" action={<Badge tone="red">{openAssigned.length}</Badge>} />
                {openAssigned.length ? <div>{openAssigned.slice(0, 4).map((a) => <button key={a.id} onClick={() => nav('/assigned')} className={cn(row, 'w-full items-start gap-2 text-left transition-colors hover:bg-subtle-2')}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-danger" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{a.title}</span><span className="block truncate text-sm text-muted">{a.desc}</span></span><ChevronRight className="mt-0.5 size-4 shrink-0 text-icon" /></button>)}</div> : <EmptyState compact title="Nothing waiting" description="Your agents have it covered." />}
                <div className="border-t border-border-2 p-2"><Button variant="ghost" className="w-full" onClick={() => nav('/assigned')}>See all</Button></div></Card>
            )}
            {show('upcoming') && (
              <Card className="overflow-hidden"><CardHeader title="Coming up today" description="BrightSmile Dental" action={<Button variant="ghost" onClick={() => nav('/bookings')}>Calendar</Button>} />
                <div>{todays.map((b) => <div key={b.id} className={cn(row, 'items-center gap-3')}><span className="w-15 shrink-0 text-sm tabular text-muted">{fmtMin(b.start)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm">{b.who}</span><span className="block truncate text-xs text-muted">{b.svc} · {b.staff}</span></span>{/^r/.test(b.by) && <AgentChip id={b.by} size={20} />}</div>)}</div></Card>
            )}
            {show('split') && (
              <Card><CardHeader title="Inbound vs outbound" description="Bookings this week" />
                <CardBody className="space-y-2"><div className="flex items-center gap-2 text-sm"><DirIcon dir="out" size={14} /><span className="w-18">Outbound</span><div className="h-2 flex-1 rounded-full bg-fill-selected"><div className="h-full w-[58%] rounded-full bg-primary" /></div><span className="w-8 text-right tabular">58%</span></div><div className="flex items-center gap-2 text-sm"><DirIcon dir="in" size={14} /><span className="w-18">Inbound</span><div className="h-2 flex-1 rounded-full bg-fill-selected"><div className="h-full w-[42%] rounded-full bg-success" /></div><span className="w-8 text-right tabular">42%</span></div></CardBody></Card>
            )}
            {show('agents') && (
              <Card className="overflow-hidden"><CardHeader title="Your AI team" description="Top agents this week" action={<Button variant="ghost" onClick={() => nav('/agents')}>All agents</Button>} />
                <div>{s.agents.filter((a) => a.status === 'live').sort((a, b) => b.ws.conv - a.ws.conv).slice(0, 5).map((a, i) => <button key={a.id} onClick={() => nav(`/agents/${a.id}`)} className={cn(row, 'w-full items-center gap-3 text-left transition-colors hover:bg-subtle-2')}><span className="w-4 text-xs text-muted tabular">{i + 1}</span><AgentAvatar name={a.name} size={24} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{a.name} <span className="font-normal text-muted">· {a.type}</span></span><span className="block text-xs text-muted">{a.ws.conv}% conversion · {nf(a.ws.calls)} calls</span></span><Tip content="Review score: how ready this agent is"><span className="text-sm font-medium tabular">{a.score}</span></Tip></button>)}</div></Card>
            )}
          </div>
        </div>
      </PageBody>
      <CustomizeDialog open={custom} onOpenChange={setCustom} />
    </div>
  )
}

const fmtMin = (m: number) => { const t = 540 + m, h = Math.floor(t / 60), mm = t % 60; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }

export function CustomizeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { homePanels, setHomePanels, homeKpis, setHomeKpis } = useStore()
  const toggle = (arr: string[], set: (a: string[]) => void, k: string) => set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Customize Home" description="Choose what to show. Drag to reorder." size="md" footer={<><Button onClick={() => { setHomePanels(['attention', 'kpis', 'bookings', 'split', 'activity', 'assigned', 'upcoming', 'agents']); setHomeKpis(['convos', 'calls', 'answered', 'texts', 'booked', 'sales', 'revenue', 'cost']) }}>Reset</Button><Button variant="primary" onClick={() => { onOpenChange(false); toast.success('Home updated') }}><Check />Done</Button></>}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div><h3 className="mb-2">Panels</h3><div className="space-y-0.5">{Object.entries(PANELS).map(([k, l]) => <label key={k} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 transition-colors hover:bg-subtle-2"><GripVertical className="size-4 text-faint" /><Checkbox checked={homePanels.includes(k)} onCheckedChange={() => toggle(homePanels, setHomePanels, k)} /><span className="text-sm">{l}</span></label>)}</div></div>
          <div><h3 className="mb-2">Key numbers</h3><div className="space-y-0.5">{Object.entries(KPIS).map(([k, d]) => <label key={k} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 transition-colors hover:bg-subtle-2"><Checkbox checked={homeKpis.includes(k)} onCheckedChange={() => toggle(homeKpis, setHomeKpis, k)} /><span className="text-sm">{d.l}</span></label>)}</div></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
