import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Sparkles, Pause, Play, ChevronDown, Plus, Copy, Download, SlidersHorizontal, Trash2, Flag, Kanban, Megaphone, Users, MessageSquare, Trophy, UserPlus, ExternalLink, Pencil } from 'lucide-react'
import { cn, nf, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { PageBody, PageHeader, PageTabs, Section } from '@/components/app/page'
import { SearchRow, PillRow, FilterPill, CheckList, BulkBar } from '@/components/app/index-table'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardBody, Banner, EmptyState } from '@/components/ui/card'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Checkbox, Progress, Slider } from '@/components/ui/controls'
import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { DirTag, PlatIcon, PLATFORMS } from '@/components/app/icons'
import { StageTag, AgentChip, BarRow, Kpi } from '@/components/app/bits'
import { AskSheet, AnalyzeDialog, type Analysis } from '@/features/shared/ai'
import { StageList } from '@/features/stages/stage-list'
import { TileMetricsDialog, metricOf, statusLabel, statusTone } from './page'
import { CampaignWizard } from './wizard'
import { AT, agoTxt } from '@/data/seed'
import type { Campaign, Platform } from '@/data/types'

type Tab = 'dashboard' | 'people' | 'conversations' | 'agents' | 'stages' | 'settings'
const SHARE: Record<Platform, number> = { sms: 0.34, call: 0.28, email: 0.12, wa: 0.18, msg: 0.04, ig: 0.02, tt: 0.01, chat: 0.03, fb: 0.01 }
const tipStyle = { borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13, color: 'var(--text)' }

export function CampaignDetailPage() {
  const { id } = useParams(); const nav = useNavigate(); const [sp, setSp] = useSearchParams(); const s = useStore()
  const c = s.campaigns.find((x) => x.id === id)
  const tab = (sp.get('tab') as Tab) || 'dashboard'
  const setTab = (t: Tab) => { sp.set('tab', t); setSp(sp, { replace: true }) }
  const [ask, setAsk] = React.useState(false); const [analyze, setAnalyze] = React.useState(false); const [add, setAdd] = React.useState(false); const [metrics, setMetrics] = React.useState(false)
  const [hidden, setHidden] = React.useState<string[]>([])
  if (!c) return <div className="flex min-h-0 flex-1 flex-col"><PageHeader crumbs={[{ label: 'Campaigns', to: '/campaigns' }]} title="Campaign not found" /><PageBody><EmptyState icon={<Megaphone />} title="This campaign was deleted" action={<Button onClick={() => nav('/campaigns')}>All campaigns</Button>} /></PageBody></div>
  const takeovers = s.assigned.filter((a) => a.kind === 'book' && a.camp === c.id && !a.done)
  const toggle = () => { if (c.status === 'running') { s.updateCampaign(c.id, { status: 'paused' }); toast(`${c.name} paused — agents finish open conversations but start no new ones`) } else { s.updateCampaign(c.id, { status: 'running', started: c.status === 'draft' || c.status === 'scheduled' ? 'Today' : c.started }); toast.success(`${c.name} is live`) } }
  const tabs: { value: Tab; label: string }[] = [{ value: 'dashboard', label: 'Dashboard' }, { value: 'people', label: `People · ${nf(c.people)}` }, { value: 'conversations', label: 'Conversations' }, { value: 'agents', label: `Agents · ${c.agents.length}` }, { value: 'stages', label: 'Stages' }, { value: 'settings', label: 'Settings' }]
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader crumbs={[{ label: 'Campaigns', to: '/campaigns' }]} title={c.name}
        actions={<>
          <Button variant="header" onClick={() => setAsk(true)}><Sparkles />Ask AI</Button>
          <Button variant="header" onClick={() => setAnalyze(true)}><Sparkles />Analyze with AI</Button>
          {c.status !== 'ended' && <Button variant="header" onClick={toggle}>{c.status === 'running' ? <><Pause />Pause</> : <><Play />{c.status === 'draft' ? 'Launch' : 'Resume'}</>}</Button>}
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="header">More actions<ChevronDown /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => setMetrics(true)}><SlidersHorizontal />Customize metrics</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { s.patch('campaigns', (cs) => [{ ...c, id: 'k' + Date.now(), name: c.name + ' (copy)', status: 'draft', started: 'Draft', reached: 0, replied: 0, interested: 0, booked: 0, installed: 0, revenue: 0, cost: 0 }, ...cs]); toast.success('Duplicated as a draft') }}><Copy />Duplicate</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { s.addReport({ name: `${c.name} — report`, folder: 'r1', date: '2026-09-27', by: 'You', kind: 'Campaign' }); toast.success('Report saved to Reports › Campaigns') }}><Download />Save report</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={async () => { if (await askConfirm({ title: `End “${c.name}”?`, description: 'Agents stop starting conversations. Replies still land in the Inbox. You can duplicate it later.', ok: 'End campaign' })) { s.updateCampaign(c.id, { status: 'ended' }); toast('Campaign ended') } }}><Flag />End campaign</DropdownMenuItem>
              <DropdownMenuItem danger onSelect={async () => { if (await askConfirm({ title: `Delete “${c.name}”?`, description: 'The people and their history stay in Contacts.', ok: 'Delete', danger: true })) { s.patch('campaigns', (cs) => cs.filter((x) => x.id !== c.id)); nav('/campaigns'); toast.success('Campaign deleted') } }}><Trash2 />Delete</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
          <Button variant="primary" onClick={() => setAdd(true)}><UserPlus />Add more leads</Button>
        </>}>
        <span className="ml-2 hidden items-center gap-1.5 sm:flex"><DirTag dir={c.dir} /><Badge tone={statusTone(c.status)} dot>{statusLabel(c.status)}</Badge></span>
      </PageHeader>
      <PageTabs value={tab} onChange={setTab} tabs={tabs} />
      <PageBody className={tab === 'settings' ? 'pb-0' : undefined}>
        <div className="space-y-3 pb-4 empty:hidden">
          {c.status === 'paused' && !hidden.includes('paused') && <Banner tone="warning" title={`Paused — ${nf(c.people - c.reached)} people haven’t been contacted yet`} onDismiss={() => setHidden([...hidden, 'paused'])} action={<Button onClick={toggle}><Play />Resume</Button>}>Agents still answer replies, but start no new conversations.</Banner>}
          {!!c.skipped && !hidden.includes('dnc') && <Banner tone="warning" title={`${nf(c.skipped)} numbers were skipped`} onDismiss={() => setHidden([...hidden, 'dnc'])} action={<><Button onClick={() => nav('/contacts?view=dnc')}>View list</Button><Button variant="ghost" onClick={async () => { if (await askConfirm({ title: `Send anyway to ${c.skipped} people?`, description: 'They are on your Do-Not-Contact list (opt-outs, litigators or the national list). Sending anyway can break the law in some places.', ok: 'Send anyway', danger: true })) { s.updateCampaign(c.id, { skipped: 0 }); toast('Sending to them now · logged in the audit log') } }}>Send anyway</Button></>}>They’re on your Do-Not-Contact list, so no agent contacted them.</Banner>}
          {!c.booking && takeovers.length > 0 && !hidden.includes('rx') && <Banner tone="info" title={`Rhea stepped in for ${takeovers.length} appointment request${takeovers.length === 1 ? '' : 's'}`} onDismiss={() => setHidden([...hidden, 'rx'])} action={<><Button onClick={() => nav('/assigned')}>Open Assigned to me</Button><Button variant="ghost" onClick={() => nav(`/campaigns/${c.id}?tab=settings`)}>Change this</Button></>}>This campaign doesn’t book appointments, so the receptionist takes over whenever someone asks for a time.</Banner>}
        </div>
        {tab === 'dashboard' && <Dashboard c={c} onCustomize={() => setMetrics(true)} />}
        {tab === 'people' && <People c={c} onAdd={() => setAdd(true)} />}
        {tab === 'conversations' && <Conversations c={c} />}
        {tab === 'agents' && <Agents c={c} />}
        {tab === 'stages' && <Stages c={c} />}
        {tab === 'settings' && <CampaignWizard key={c.id} mode="edit" id={c.id} initial={s.setupOf(c.id)!} />}
      </PageBody>
      <AskSheet open={ask} onOpenChange={setAsk} title={`Ask about ${c.name}`} description="Your campaign manager — answers from this campaign’s live data" suggestions={['Which message is winning?', 'Which call script works best?', 'Which agent books the most?', 'Which day had the most bookings?', 'Where are leads getting stuck?', 'How much is each booking costing me?']} answer={(q) => campaignAnswer(c, q)} />
      <AnalyzeDialog open={analyze} onOpenChange={setAnalyze} a={analysisOf(c)} onApply={() => s.addActivity({ icon: 'megaphone', text: `<b>Max</b> applied suggestions to <b>${c.name}</b>`, time: 'just now', k: 'sys' })} />
      <AddLeadsDialog c={c} open={add} onOpenChange={setAdd} />
      <TileMetricsDialog c={metrics ? c : null} onClose={() => setMetrics(false)} />
    </div>
  )
}

/* ---------- Dashboard ---------- */
function Dashboard({ c, onCustomize }: { c: Campaign; onCustomize: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const stages = stagesFor(c, s.stages); const members = s.contacts.filter((x) => x.camp === c.id); const scale = members.length ? c.people / members.length : 1
  const counts = Object.fromEntries(stages.map((st, i) => [st.name, members.length ? Math.round(members.filter((m) => m.stage === st.name).length * scale) : i === 0 ? c.people - c.reached : 0]))
  const maxCount = Math.max(1, ...Object.values(counts))
  const pattern = [0.6, 1.1, 1.3, 0.9, 1.4, 0.5, 0.4, 1.2, 1.5, 1.0, 1.6, 1.3, 0.7, 1.2]
  const perDay = pattern.map((f, i) => ({ d: new Date(2026, 8, 14 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), Booked: Math.round((c.booked / 18) * f), Replies: Math.round((c.replied / 18) * f * 0.9) }))
  const sum = c.ch.reduce((n, p) => n + SHARE[p], 0) || 1
  const [ab, setAb] = React.useState<'msg' | 'script' | 'agent'>('msg')
  const salesAgents = c.agents.map((id) => s.agents.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a && (a.type === 'sales' || a.type === 'reception'))
  const best = [...salesAgents].sort((a, b) => b.ws.conv - a.ws.conv)[0]
  const names = new Set([c.name, ...c.agents.map((id) => s.agents.find((a) => a.id === id)?.name ?? '')])
  const act = s.activity.filter((a) => [...names].some((n) => n && a.text.includes(n))).slice(0, 6)
  return (
    <div className="space-y-4">
      <Section title="Key numbers" action={<Button variant="ghost" onClick={onCustomize}><SlidersHorizontal />Customize</Button>}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{c.metrics.map((m) => { const d = metricOf(m, c, s.contacts); return d ? <Kpi key={m} label={d.l} value={d.v} tip={d.tip} /> : null })}</div>
      </Section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0"><CardHeader title="Stage breakdown" description="Where everyone in this campaign is right now" action={<Button variant="ghost" onClick={() => nav(`/stages?camp=${c.id}`)}><Kanban />Open board</Button>} />
          <CardBody>{stages.map((st) => <BarRow key={st.id} label={<span className="flex items-center gap-1.5"><span className="size-2 shrink-0 rounded-full" style={{ background: st.color }} />{st.name}</span>} value={counts[st.name]} max={maxCount} color={st.color} onClick={() => nav(`/stages?camp=${c.id}&view=list&stage=${encodeURIComponent(st.name)}`)} />)}</CardBody></Card>
        <Card className="min-w-0"><CardHeader title="Bookings per day" description="Hover a bar for the exact numbers" />
          <CardBody className="h-[240px]"><ResponsiveContainer><BarChart data={perDay} margin={{ left: -20, right: 4, top: 8 }}><CartesianGrid vertical={false} stroke="var(--border-2)" /><XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={1} /><YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><RTip cursor={{ fill: 'var(--fill-hover)' }} contentStyle={tipStyle} /><Bar dataKey="Booked" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardBody></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden"><CardHeader title="By channel" description="What each channel brings in and costs" />
          <div className="overflow-x-auto"><Table>
            <thead><tr><Th>Channel</Th><Th align="right">Sent</Th><Th align="right">Replies</Th><Th align="right">Booked</Th><Th align="right">Cost</Th><Th align="right">Per booking</Th></tr></thead>
            <tbody>{c.ch.map((p) => { const sh = SHARE[p] / sum; const booked = Math.round(c.booked * sh); const cost = c.cost * (p === 'call' ? sh * 1.8 : sh * 0.7); return (
              <Tr key={p}><Td><span className="flex items-center gap-2"><PlatIcon p={p} size={14} />{PLATFORMS[p].label}</span></Td><Td align="right">{nf(c.reached * sh * (p === 'call' ? 1.2 : 2.4))}</Td><Td align="right">{nf(c.replied * sh)}</Td><Td align="right">{nf(booked)}</Td><Td align="right">{money(cost)}</Td><Td align="right">{booked ? '$' + (cost / booked).toFixed(2) : '—'}</Td></Tr>
            ) })}</tbody>
          </Table></div></Card>
        <Card className="min-w-0 overflow-hidden"><CardHeader title="A/B tests" description="Which version is winning" action={<Button variant="ghost" onClick={async () => { const n = await askText({ title: 'New A/B test', label: 'What do you want to test?', placeholder: 'e.g. A shorter first text', ok: 'Start test' }); if (n) toast.success(`Test “${n}” started · AI writes version B and splits 50/50`) }}><Plus />New test</Button>} />
          <div className="px-4 pb-2"><Segmented value={ab} onChange={setAb} options={[{ value: 'msg', label: 'Message' }, { value: 'script', label: 'Call script' }, { value: 'agent', label: 'Agent' }]} /></div>
          {(ab === 'msg' ? [['A', '“Hi {first_name}, Internet 1 Gig is $50/month…”', 21, 38], ['B', '“Customers on your street are switching to…”', 34, 61]] : ab === 'script' ? [['A', 'Offer first, then questions', 18, 29], ['B', 'One question first, then the offer', 24, 41]] : salesAgents.map((a) => [a.name, `${AT[a.type].label} agent · ${a.mode}`, a.ws.conv, Math.round(c.booked * ((c.weights[a.id] ?? 50) / 100))])).map((r, i, arr) => { const win = r[2] === Math.max(...arr.map((x) => +x[2])); return (
            <div key={i} className="flex items-center gap-3 border-t border-border-2 px-4 py-2.5">
              {ab === 'agent' ? <AgentAvatar name={String(r[0])} size={24} /> : <span className="flex size-6 shrink-0 items-center justify-center rounded-control bg-subtle text-xs font-semibold">{r[0]}</span>}
              <span className="min-w-0 flex-1"><span className="block truncate text-sm">{ab === 'agent' ? r[0] : r[1]}</span><span className="block text-xs text-muted">{ab === 'agent' ? r[1] : `${r[3]} booked`}</span></span>
              <span className="text-right"><span className="block text-sm font-semibold tabular">{r[2]}%</span><span className="block text-xs text-muted">{ab === 'script' ? 'booked' : ab === 'agent' ? 'conversion' : 'replied'}</span></span>
              {win ? <Badge tone="green"><Trophy />Winning</Badge> : <span className="w-[76px]" />}
            </div>
          ) })}
          {ab !== 'agent' && <div className="border-t border-border-2 px-4 py-2.5"><Button onClick={() => toast.success('Version B now goes to everyone left · the test is saved in Reports')}>Use the winner for everyone</Button></div>}
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 overflow-hidden lg:col-span-2"><CardHeader title="Live activity" description="What the agents on this campaign are doing" action={<span className="flex h-7 items-center gap-1.5 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success animate-[pulse-dot_2s_infinite]" />Live</span>} />
          {(act.length ? act : s.activity.slice(0, 5)).map((a) => <div key={a.id} className={cn('flex gap-3 border-t border-border-2 px-4 py-2', a.fresh && 'anim-fade bg-subtle-2')}><span className="min-w-0 flex-1 text-sm [&_b]:font-semibold" dangerouslySetInnerHTML={{ __html: a.text }} /><span className="shrink-0 text-xs text-muted">{a.time}</span></div>)}
        </Card>
        <Card><CardHeader title="Budget" action={<Button variant="ghost" onClick={async () => { const v = await askText({ title: 'Monthly budget', label: 'Pause the campaign when spend reaches ($)', value: String(c.budget ?? 500) }); if (v && +v > 0) { useStore.getState().updateCampaign(c.id, { budget: +v }); toast.success(`Budget set to ${money(+v)}`) } }}><Pencil />Change</Button>} />
          <CardBody className="space-y-3">
            <div className="flex items-baseline justify-between"><span className="text-2xl font-semibold tabular">{money(c.cost)}</span><span className="text-sm text-muted">of {money(c.budget ?? 500)}</span></div>
            <Progress value={(c.cost / (c.budget ?? 500)) * 100} color={c.cost > (c.budget ?? 500) * 0.8 ? 'var(--warning-fill)' : undefined} />
            <div className="grid grid-cols-2 gap-2 text-sm"><div><div className="text-xs text-muted">Per booking</div><div className="font-semibold tabular">{c.booked ? '$' + (c.cost / c.booked).toFixed(2) : '—'}</div></div><div><div className="text-xs text-muted">Revenue per $1</div><div className="font-semibold tabular">{c.cost ? '$' + (c.revenue / c.cost).toFixed(0) : '—'}</div></div></div>
            {best && <p className="rounded-control bg-subtle-2 px-3 py-2 text-sm"><Sparkles className="mr-1 inline size-3.5" />{best.name} converts best here ({best.ws.conv}%). Give her more leads to lower the cost per booking.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

/* ---------- People ---------- */
function People({ c, onAdd }: { c: Campaign; onAdd: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const stages = stagesFor(c, s.stages)
  const [q, setQ] = React.useState(''); const [stage, setStage] = React.useState<string[]>([]); const [sel, setSel] = React.useState<Set<string>>(new Set())
  const rows = s.contacts.filter((x) => x.camp === c.id && (!stage.length || stage.includes(x.stage)) && `${x.name} ${x.phone} ${x.email} ${x.city}`.toLowerCase().includes(q.toLowerCase()))
  const all = rows.length > 0 && rows.every((r) => sel.has(r.id))
  return (
    <Card className="overflow-hidden">
      <SearchRow value={q} onChange={setQ} placeholder="Search people in this campaign" right={<Button onClick={onAdd}><UserPlus />Add more leads</Button>} />
      <PillRow right={<Button variant="ghost" size="sm" onClick={() => nav(`/contacts?camp=${c.id}`)}><ExternalLink />Open in Contacts</Button>}>
        <FilterPill label="Stage" value={stage.length ? stage.join(', ') : undefined} onClear={() => setStage([])}><CheckList options={stages.map((st) => ({ v: st.name, l: <StageTag name={st.name} stages={stages} size="sm" /> }))} value={stage} onChange={setStage} /></FilterPill>
        <span className="text-xs text-muted">{nf(rows.length)} shown · a sample of {nf(c.people)}</span>
      </PillRow>
      <div className="relative">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <thead><tr><Th className="w-9 pl-3 pr-0"><Checkbox checked={all ? true : sel.size ? 'indeterminate' : false} onCheckedChange={() => setSel(all ? new Set() : new Set(rows.map((r) => r.id)))} aria-label="Select all" /></Th><Th>Name</Th><Th>Stage</Th><Th>Channels</Th><Th>Agent</Th><Th>Last contacted</Th><Th>Lead source</Th></tr></thead>
            <tbody>{rows.map((x) => { const plats = [...new Set(s.convos.filter((v) => v.cid === x.id).map((v) => v.plat))]; return (
              <Tr key={x.id} clickable selected={sel.has(x.id)} onClick={() => nav(`/contacts/${x.id}`)}>
                <Td className="w-9 pl-3 pr-0" onClick={(e) => e.stopPropagation()}><Checkbox checked={sel.has(x.id)} onCheckedChange={() => { const n = new Set(sel); if (n.has(x.id)) n.delete(x.id); else n.add(x.id); setSel(n) }} aria-label="Select" /></Td>
                <Td><span className="flex items-center gap-2"><Avatar name={x.name || '?'} size={20} /><span className={cn('font-medium', !x.name && 'text-warning')}>{x.name || 'Name missing'}</span></span></Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu><DropdownMenuTrigger asChild><button className="rounded-tag hover:opacity-80">{x.stage === '—' ? '—' : <StageTag name={x.stage} stages={stages} />}</button></DropdownMenuTrigger>
                    <DropdownMenuContent><DropdownMenuLabel>Move to</DropdownMenuLabel>{stages.map((st) => <DropdownMenuItem key={st.id} onSelect={() => { s.moveLead(x.id, st.name, 'you'); toast.success(`${x.name || 'Contact'} moved to ${st.name}`) }}><StageTag name={st.name} stages={stages} size="sm" /></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
                </Td>
                <Td>{plats.length ? <span className="flex gap-1">{plats.map((p) => <PlatIcon key={p} p={p} size={14} />)}</span> : <span className="text-muted">—</span>}</Td>
                <Td><AgentChip id={x.agent} size={18} /></Td><Td className="text-muted">{agoTxt(x.lastDays)}</Td><Td className="text-muted">{x.source}</Td>
              </Tr>
            ) })}</tbody>
          </Table>
          {!rows.length && <EmptyState compact icon={<Users />} title="No one matches" />}
        </div>
        {sel.size > 0 && <BulkBar className="absolute inset-x-0 top-0" count={sel.size} total={rows.length} onToggleAll={() => setSel(all ? new Set() : new Set(rows.map((r) => r.id)))}>
          <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm"><Kanban />Set stage<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent>{stages.map((st) => <DropdownMenuItem key={st.id} onSelect={() => { sel.forEach((id) => s.moveLead(id, st.name, 'you')); toast.success(`${sel.size} moved to ${st.name}`); setSel(new Set()) }}>{st.name}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
          <Button size="sm" onClick={() => { sel.forEach((id) => s.updateContact(id, { camp: null, stage: '—' })); toast.success(`${sel.size} removed from this campaign · still in Contacts`); setSel(new Set()) }}>Remove from campaign</Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSel(new Set())}>Clear</Button>
        </BulkBar>}
      </div>
    </Card>
  )
}

/* ---------- Conversations ---------- */
function Conversations({ c }: { c: Campaign }) {
  const nav = useNavigate(); const s = useStore()
  const [when, setWhen] = React.useState<'live' | 'past' | 'both'>('both')
  const isLive = (t: string) => /AM|PM/.test(t)
  const list = s.convos.filter((v) => v.camp === c.id && (when === 'both' || (when === 'live') === isLive(v.time)))
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3"><Segmented value={when} onChange={setWhen} options={[{ value: 'live', label: 'Live' }, { value: 'past', label: 'Past' }, { value: 'both', label: 'Both' }]} /><span className="ml-auto text-xs text-muted">{list.length} conversations</span></div>
      {list.map((v) => { const x = s.contacts.find((k) => k.id === v.cid); const last = [...v.items].reverse().find((i) => i.t === 'm'); return (
        <button key={v.id} onClick={() => nav(`/inbox?kind=chat&id=${v.id}`)} className="flex w-full items-center gap-3 border-t border-border-2 px-4 py-2.5 text-left transition-colors hover:bg-subtle-2">
          <span className="relative"><Avatar name={x?.name || '?'} size={32} /><span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface p-px"><PlatIcon p={v.plat} size={12} tip={false} /></span></span>
          <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-medium">{x?.name || 'Name missing'}</span>{v.needs && <Badge tone="red">Needs you</Badge>}{v.human && <Badge>You’re handling</Badge>}</span><span className="block truncate text-sm text-muted">{last && last.t === 'm' ? last.text : ''}</span></span>
          <AgentChip id={v.agent} size={18} link={false} className="hidden text-sm sm:inline-flex" />
          <span className="flex w-20 shrink-0 flex-col items-end">{isLive(v.time) && !v.human ? <span className="flex items-center gap-1 text-xs font-medium text-success"><span className="size-1.5 rounded-full bg-success animate-[pulse-dot_2s_infinite]" />Live</span> : null}<span className="text-xs text-muted">{v.time}</span></span>
        </button>
      ) })}
      {!list.length && <EmptyState compact icon={<MessageSquare />} title="No conversations here" />}
    </Card>
  )
}

/* ---------- Agents ---------- */
function Agents({ c }: { c: Campaign }) {
  const nav = useNavigate(); const s = useStore()
  const list = c.agents.map((id) => s.agents.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a)
  const sales = list.filter((a) => a.type === 'sales'); const total = sales.reduce((n, a) => n + (c.weights[a.id] ?? 50), 0) || 1
  return (<>
    <div className="mb-3 flex justify-end">
      <DropdownMenu><DropdownMenuTrigger asChild><Button><Plus />Add agent</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-[360px] w-60 overflow-y-auto">{s.agents.filter((a) => !c.agents.includes(a.id)).map((a) => <DropdownMenuItem key={a.id} onSelect={() => { s.updateCampaign(c.id, { agents: [...c.agents, a.id], weights: a.type === 'sales' ? { ...c.weights, [a.id]: 50 } : c.weights }); toast.success(`${a.name} added · starts with the next conversation`) }}><AgentAvatar name={a.name} size={18} />{a.name}<span className="ml-auto text-xs text-muted">{AT[a.type].label}</span></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
    </div>
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
      {list.map((a) => { const share = a.type === 'sales' ? (c.weights[a.id] ?? 50) / total : 0; return (
        <Card key={a.id} className="flex flex-col">
          <button onClick={() => nav(`/agents/${a.id}`)} className="flex items-start gap-3 rounded-t-card p-4 text-left transition-colors hover:bg-subtle-2">
            <AgentAvatar name={a.name} size={40} /><span className="min-w-0 flex-1"><h3>{a.name}</h3><span className="block text-sm text-muted">{AT[a.type].label} · {a.mode}</span></span><Badge tone={a.status === 'live' ? 'green' : 'neutral'} dot>{a.status === 'live' ? 'Live' : 'Ready'}</Badge>
          </button>
          <div className="grid grid-cols-3 gap-2 px-4">{[['Conversations', nf(c.reached * (share || 0.2) * 0.8)], ['Booked', nf(c.booked * (share || 0.1))], [a.type === 'marketing' ? 'Reply rate' : 'Conversion', `${a.type === 'marketing' ? a.ws.reply : a.ws.conv}%`]].map(([l, v]) => <div key={l}><div className="text-xs text-muted">{l}</div><div className="text-lg font-semibold tabular">{v}</div></div>)}</div>
          {a.type === 'sales' && sales.length > 1 && <div className="mt-3 flex items-center gap-3 px-4"><Slider value={[c.weights[a.id] ?? 50]} max={100} step={5} onValueChange={([w]) => s.updateCampaign(c.id, { weights: { ...c.weights, [a.id]: w } })} aria-label={`${a.name} share of leads`} /><span className="shrink-0 whitespace-nowrap text-right text-xs text-muted tabular">{Math.round(share * 100)}% of leads</span></div>}
          <div className="mt-auto flex gap-2 border-t border-border-2 px-3 py-2 pt-2">
            <Button variant="ghost" onClick={() => nav(`/agents/${a.id}`)}>Open agent</Button>
            <Button variant="ghost" className="ml-auto" onClick={async () => { if (await askConfirm({ title: `Remove ${a.name} from this campaign?`, description: 'Their open conversations move to the other agents.', ok: 'Remove' })) { s.updateCampaign(c.id, { agents: c.agents.filter((x) => x !== a.id) }); toast.success(`${a.name} removed`) } }}>Remove</Button>
          </div>
        </Card>
      ) })}
    </div>
  </>)
}

/* ---------- Stages ---------- */
function Stages({ c }: { c: Campaign }) {
  const nav = useNavigate(); const s = useStore()
  const members = s.contacts.filter((x) => x.camp === c.id); const scale = members.length ? c.people / members.length : 1
  const counts = Object.fromEntries(stagesFor(c, s.stages).map((st, i) => [st.name, members.length ? Math.round(members.filter((m) => m.stage === st.name).length * scale) : i === 0 ? c.people : 0]))
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Stages in this campaign" description="Edit them any time — changes apply right away." action={<Button onClick={() => nav(`/stages?camp=${c.id}`)}><Kanban />Open board</Button>} />
      <StageList pipe={c.pipe} dir={c.dir === 'in' ? 'in' : 'out'} counts={counts} />
    </Card>
  )
}

/* ---------- Add more leads ---------- */
function AddLeadsDialog({ c, open, onOpenChange }: { c: Campaign; open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore(); const [src, setSrc] = React.useState<'folder' | 'filter' | 'import'>('folder'); const [folder, setFolder] = React.useState('f2'); const [n, setN] = React.useState(100)
  const f = s.folders.find((x) => x.id === folder); const maxN = src === 'folder' ? Math.min(5000, f?.count ?? 100) : 2000
  const skip = Math.round(n * 0.011)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" title="Add more leads" description={`To ${c.name} — no new campaign needed`} footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" onClick={() => { s.updateCampaign(c.id, { people: c.people + n - skip, skipped: (c.skipped ?? 0) + skip }); s.addActivity({ icon: 'megaphone', text: `<b>You</b> added ${nf(n - skip)} people to <b>${c.name}</b>`, time: 'just now', k: 'sys' }); onOpenChange(false); toast.success(`${nf(n - skip)} people added · agents start with them in their next working hours`) }}><UserPlus />Add {nf(n - skip)} people</Button></>}>
        <div className="space-y-4">
          <Segmented value={src} onChange={setSrc} options={[{ value: 'folder', label: 'From a folder' }, { value: 'filter', label: 'From filters' }, { value: 'import', label: 'Upload a file' }]} />
          {src === 'folder' && <Field label="Folder"><Select value={folder} onValueChange={setFolder} options={s.folders.filter((x) => !x.group).map((x) => ({ value: x.id, label: `${x.name} · ${nf(x.count ?? 0)}` }))} /></Field>}
          {src === 'filter' && <p className="rounded-control bg-subtle-2 px-3 py-2 text-sm">Uses the filters you last applied in Contacts. People already in the campaign are left out.</p>}
          {src === 'import' && <Button className="w-full" onClick={() => toast('Pick a file — AI matches the columns (demo)')}>Choose a file</Button>}
          <Field label={`How many · ${nf(n)}`} hint="People already in this campaign are never added twice."><Slider value={[n]} min={50} max={maxN} step={50} onValueChange={([v]) => setN(v)} /></Field>
          <p className="flex items-center gap-2 text-sm text-muted"><Tip content="On your Do-Not-Contact list"><span className="font-medium text-text">{skip} skipped</span></Tip>because they’re on Do-Not-Contact.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- AI answers and analysis for one campaign ---------- */
function campaignAnswer(c: Campaign, q: string) {
  const st = useStore.getState(); const s = q.toLowerCase()
  const agents = c.agents.map((id) => st.agents.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a)
  const best = [...agents].filter((a) => a.type !== 'marketing').sort((a, b) => b.ws.conv - a.ws.conv)[0]
  if (/message|text|wording|a\/b|winning|copy/.test(s)) return `**Message B is winning** in ${c.name}: 34% of people replied, against 21% for message A, and it booked 61 vs 38.\n\nB opens with “Customers on your street are switching…”. I’d send B to everyone left.`
  if (/script|call/.test(s)) return `The **“one question first”** call script books **24%** of answered calls vs **18%** for “offer first”. Calls between 4 and 8 PM book twice as often as morning calls.`
  if (/agent|who/.test(s)) return best ? `**${best.name}** books the most here — ${best.ws.conv}% conversion. ${agents.filter((a) => a.id !== best.id && a.type === best.type).map((a) => `${a.name} is at ${a.ws.conv}%`).join(', ') || 'No other agent of the same type is on this campaign'}.` : 'No sales or receptionist agent is on this campaign yet.'
  if (/day|when|time/.test(s)) return `**Thursday** had the most bookings (${Math.round(c.booked / 9)}), followed by Tuesday. Weekends are slowest. Most bookings happen **between 4 and 8 PM**.`
  if (/cost|spend|budget|expensive|each booking/.test(s)) return `You’ve spent **${money(c.cost)}** of your ${money(c.budget ?? 500)} budget. Each booking costs **${c.booked ? '$' + (c.cost / c.booked).toFixed(2) : '—'}**. Calls are about 60% of the cost — texting first and calling only people who reply would cut it by roughly a quarter.`
  if (/stuck|stage|pending|drop/.test(s)) return `Most leads stall between **Contacted** and **Interested**: ${nf(c.reached - c.replied)} people haven’t replied yet. ${nf(Math.round(c.interested * 0.14))} are in **Pending** (“need time to think”) — a follow-up text after 2 days usually moves a third of them.`
  return `Here’s ${c.name} in one line: **${nf(c.reached)}** reached, **${nf(c.replied)}** replied (${c.reached ? Math.round((c.replied / c.reached) * 100) : 0}%), **${nf(c.booked)}** booked, **${money(c.revenue)}** revenue for **${money(c.cost)}** spent. Ask me about messages, scripts, agents, days or costs.`
}

function analysisOf(c: Campaign): Analysis {
  return {
    title: `AI analysis · ${c.name}`, subject: `Read ${nf(c.replied * 3)} messages and ${nf(Math.round(c.reached * 0.4))} calls`, kind: 'Campaign', folder: 'r1',
    kpis: [{ l: 'Reply rate', v: c.reached ? Math.round((c.replied / c.reached) * 100) + '%' : '—' }, { l: 'Booking rate', v: c.replied ? Math.round((c.booked / c.replied) * 100) + '%' : '—', d: 'of people who replied' }, { l: 'Cost per booking', v: c.booked ? '$' + (c.cost / c.booked).toFixed(2) : '—' }, { l: 'Revenue', v: money(c.revenue) }],
    flow: [{ l: 'In campaign', n: c.people, color: '#8A93A6' }, { l: 'Reached', n: c.reached, color: '#4C8BF5' }, { l: 'Replied', n: c.replied, color: '#2A55B0' }, { l: 'Interested', n: c.interested || Math.round(c.replied * 0.5), color: '#7048E8' }, { l: 'Booked', n: c.booked, color: '#0F766E' }, { l: 'Won', n: c.installed, color: '#15803D' }],
    wrong: ['Agents ask for the address before explaining the offer — 22% stop replying there.', 'Calls placed before 10 AM are answered half as often.', `${nf(Math.round(c.interested * 0.14))} leads sit in Pending with no follow-up planned.`],
    works: ['Message B (“Customers on your street are switching…”) gets 62% more replies.', 'Mentioning “keep your number” lifts replies by 9%.', 'Evening calls (4–8 PM) book twice as often.'],
    often: ['People ask about the price with taxes', 'People ask if they can keep their number', 'People ask for a call after work'],
    suggestions: ['Send message B to everyone who hasn’t been contacted', 'Move calls to 4–8 PM in each person’s time zone', 'Add a follow-up text 2 days after “Pending”', 'Explain the offer before asking for the address'],
  }
}
