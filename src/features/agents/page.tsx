import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Bot, Plus, Sparkles, MoreHorizontal, Pencil, Copy, Pause, Play, RotateCcw, Trash2, ChevronDown, Info, Trophy, MessageSquare, Megaphone, Phone, Globe } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { useStore } from '@/store'
import { PageBody, PageHeader, PageTabs } from '@/components/app/page'
import { askConfirm } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge, Count } from '@/components/ui/badge'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Sheet } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CampaignChip, Kpi } from '@/components/app/bits'
import { OptionRow } from '@/features/shared/led'
import { AT, AGENT_TYPES, promptTemplates } from '@/data/seed'
import { TYPE_ICON, metricVal, NewAgentDialog } from './common'
import { AgentBuilder } from './builder'
import type { Agent, AgentType } from '@/data/types'

const STATUS: Record<Agent['status'], { l: string; tone: 'green' | 'neutral' | 'amber' | 'blue' }> = { live: { l: 'Live', tone: 'green' }, ready: { l: 'Ready', tone: 'blue' }, paused: { l: 'Paused', tone: 'amber' }, draft: { l: 'Draft', tone: 'neutral' } }

export function AgentsPage() {
  const [sp, setSp] = useSearchParams(); const s = useStore()
  const tab = sp.get('tab') === 'leaderboard' ? 'leaderboard' : ((sp.get('type') as AgentType) || 'sales')
  const setTab = (t: string) => setSp(t === 'leaderboard' ? { tab: t } : { type: t }, { replace: true })
  const [newOpen, setNewOpen] = React.useState(!!sp.get('new')); const [builder, setBuilder] = React.useState(false); const [details, setDetails] = React.useState<Agent | null>(null)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="AI Agents" icon={<Bot />} sub={`${s.agents.length} agents · ${s.agents.filter((a) => a.status === 'live').length} live`}
        actions={<><Button variant="header" onClick={() => setBuilder(true)}><Sparkles />Create with AI</Button><Button variant="primary" onClick={() => setNewOpen(true)}><Plus />New agent</Button></>} />
      <PageTabs value={tab} onChange={setTab} tabs={[...AGENT_TYPES.map((t) => { const I = TYPE_ICON[t]; return { value: t, label: <>{AT[t].label}<Count n={s.agents.filter((a) => a.type === t).length} /></>, icon: <I /> } }), { value: 'leaderboard', label: 'Leaderboard', icon: <Trophy /> }]} />
      <PageBody wide>
        {tab === 'leaderboard' ? <Leaderboard /> : <TypeView type={tab as AgentType} onDetails={setDetails} onNew={() => setNewOpen(true)} />}
      </PageBody>
      <NewAgentDialog open={newOpen} onOpenChange={setNewOpen} startType={tab === 'leaderboard' ? 'sales' : (tab as AgentType)} onAI={() => setBuilder(true)} />
      <AgentBuilder open={builder} onOpenChange={setBuilder} agent={null} />
      <DetailsSheet a={details} onClose={() => setDetails(null)} />
    </div>
  )
}

function TypeView({ type, onDetails, onNew }: { type: AgentType; onDetails: (a: Agent) => void; onNew: () => void }) {
  const s = useStore(); const I = TYPE_ICON[type]
  const list = s.agents.filter((a) => a.type === type)
  const def = (s.prefs[`typeDefaults.${type}`] ?? {}) as Record<string, string | boolean>
  const setDef = (k: string, v: string | boolean) => { s.setPref(`typeDefaults.${type}`, { ...def, [k]: v }); toast(`Saved for every ${AT[type].label.toLowerCase()} agent`) }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted"><I className="size-4 text-icon" />{AT[type].desc}. All agents can call, text and email.<span className="ml-auto flex items-center gap-1.5"><Info className="size-4" />Your edits apply only to your workspace.</span></div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
        {list.map((a) => <AgentTile key={a.id} a={a} onDetails={() => onDetails(a)} />)}
        <button onClick={onNew} className="flex min-h-[260px] flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border-strong p-4 text-center transition-colors hover:bg-surface"><Plus className="mb-1 size-5 text-icon" /><h3>New {AT[type].label.toLowerCase()} agent</h3><span className="text-sm text-muted">{list.length ? `Start from ${list.slice(0, 3).map((a) => a.name).join(list.length > 2 ? ', ' : ' or ').replace(/, ([^,]*)$/, ' or $1')} — or from scratch` : 'Start from scratch'}</span></button>
      </div>
      <Card>
        <CardHeader title={`Settings for every ${AT[type].label.toLowerCase()} agent`} description="Defaults each agent starts with. Change any of them inside an agent." />
        <div className="divide-y divide-border-2 px-4 pb-2">
          <OptionRow title="Default instructions template" description="Written by Crewline; agents fill in your business details."><Select variant="button" value={String(def.template ?? promptTemplates[type][0])} onValueChange={(v) => setDef('template', v)} options={promptTemplates[type].map((t) => ({ value: t, label: t }))} /></OptionRow>
          <OptionRow title="Languages" description="Agents reply in the customer’s language when it’s on this list."><Select variant="button" value={String(def.langs ?? 'English')} onValueChange={(v) => setDef('langs', v)} options={['English', 'English + Urdu', 'English + Spanish', 'English + French', 'Any language'].map((x) => ({ value: x, label: x }))} /></OptionRow>
          <OptionRow title="Say it’s an AI assistant at the start" description="Recommended, and required in some places."><Switch checked={def.disclose !== false} onCheckedChange={(v) => setDef('disclose', v)} /></OptionRow>
          <OptionRow title="Leave comments on every conversation" description="So other agents and your team can see what happened."><Switch checked={def.comments !== false} onCheckedChange={(v) => setDef('comments', v)} /></OptionRow>
          {type === 'tech' && <>
            <OptionRow title="Ticketing system"><Select variant="button" value={String(def.tickets ?? 'Built-in tickets')} onValueChange={(v) => setDef('tickets', v)} options={['Built-in tickets', 'Zendesk', 'Freshdesk', 'Jira Service Management'].map((x) => ({ value: x, label: x }))} /></OptionRow>
            <OptionRow title="Status page" description="Agents check it before troubleshooting."><Input className="w-64" defaultValue="status.metromobile.example" onBlur={(e) => setDef('status', e.target.value)} /></OptionRow>
            <OptionRow title="Escalate to" description="Where unsolved issues go."><Input className="w-64" defaultValue="noc@metromobile.example" onBlur={(e) => setDef('escalate', e.target.value)} /></OptionRow>
          </>}
          {type === 'finance' && <>
            <OptionRow title="Payment provider"><Select variant="button" value={String(def.pay ?? 'Stripe')} onValueChange={(v) => setDef('pay', v)} options={['Stripe', 'Square', 'PayPal', 'Bank transfer only'].map((x) => ({ value: x, label: x }))} /></OptionRow>
            <OptionRow title="Tax rate"><Input className="w-48" defaultValue="13% HST (Ontario)" onBlur={(e) => setDef('tax', e.target.value)} /></OptionRow>
            <OptionRow title="Payment reminders"><Select variant="button" value={String(def.remind ?? '3 days before, on the day, 3 days after')} onValueChange={(v) => setDef('remind', v)} options={['3 days before, on the day, 3 days after', 'Weekly until paid', 'Only on the due date'].map((x) => ({ value: x, label: x }))} /></OptionRow>
            <OptionRow title="Refunds"><Select variant="button" value={String(def.refunds ?? 'Always need owner approval')} onValueChange={(v) => setDef('refunds', v)} options={['Always need owner approval', 'Auto-approve under $25'].map((x) => ({ value: x, label: x }))} /></OptionRow>
          </>}
        </div>
      </Card>
    </div>
  )
}

function AgentTile({ a, onDetails }: { a: Agent; onDetails: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const mine = a.camps.map((id) => s.campaigns.find((k) => k.id === id)).filter(Boolean)
  const toggleCamp = (cid: string, on: boolean) => {
    const c = s.campaigns.find((k) => k.id === cid)!
    s.updateCampaign(cid, { agents: on ? [...c.agents, a.id] : c.agents.filter((x) => x !== a.id) })
    s.updateAgent(a.id, { camps: on ? [...a.camps, cid] : a.camps.filter((x) => x !== cid), status: on && a.status !== 'paused' ? 'live' : a.status })
    toast.success(on ? `${a.name} now works on ${c.name}` : `${a.name} removed from ${c.name}`)
  }
  return (
    <Card className="flex flex-col">
      <div className="flex items-start gap-3 p-4 pb-3">
        <AgentAvatar name={a.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><h3 className="truncate text-lg">{a.name}</h3><Badge tone={STATUS[a.status].tone} dot>{STATUS[a.status].l}</Badge></div>
          <p className="truncate text-sm text-muted">{a.mode} · {a.voice.split('·')[1]?.trim() ?? a.voice} · v{a.ver}</p>
        </div>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`${a.name} menu`}><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => nav(`/agents/${a.id}`)}><Pencil />Edit</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { const copy = { ...structuredClone(a), id: 'ag' + Date.now(), name: `${a.name} (copy)`, camps: [], status: 'draft' as const }; s.addAgent(copy); toast.success(`${copy.name} created`) }}><Copy />Duplicate</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { s.updateAgent(a.id, { status: a.status === 'paused' ? (a.camps.length ? 'live' : 'ready') : 'paused' }); toast(a.status === 'paused' ? `${a.name} is working again` : `${a.name} paused — open conversations move to other agents`) }}>{a.status === 'paused' ? <><Play />Resume</> : <><Pause />Pause</>}</DropdownMenuItem>
            {a.edited && <DropdownMenuItem onSelect={async () => { if (await askConfirm({ title: `Reset ${a.name} to the Crewline default?`, description: 'Your business details, script and knowledge stay. Instructions, style and rules go back to the default. You can switch back to your version any time.', ok: 'Reset' })) toast.success(`${a.name} reset · your version is saved as v${a.ver}`) }}><RotateCcw />Reset to default</DropdownMenuItem>}
            {a.id.startsWith('ag') && <><DropdownMenuSeparator /><DropdownMenuItem danger onSelect={async () => { if (await askConfirm({ title: `Delete ${a.name}?`, description: 'Its campaigns keep running with their other agents.', ok: 'Delete agent', danger: true })) { s.patch('agents', (as) => as.filter((x) => x.id !== a.id)); toast.success(`${a.name} deleted`) } }}><Trash2 />Delete</DropdownMenuItem></>}
          </DropdownMenuContent></DropdownMenu>
      </div>
      <div className="flex flex-wrap gap-1.5 px-4">{mine.length ? mine.map((c) => <Badge key={c!.id} tone="outline"><CampaignChip id={c!.id} className="max-w-[180px]" /></Badge>) : <span className="text-sm text-muted">Not on any campaign yet</span>}</div>
      <div className="mt-3 grid grid-cols-3 gap-2 px-4">{AT[a.type].metrics.map((m) => <div key={m.key} className="min-w-0"><div className="truncate text-xs text-muted">{m.label}</div><div className="text-lg font-semibold tabular">{metricVal(a, m.key, m.unit)}</div></div>)}</div>
      <Tip content="Across every business on Crewline. Detailed campaign data stays private to each workspace.">
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-control bg-subtle-2 px-2.5 py-1.5 text-xs text-muted"><Globe className="size-3.5 shrink-0" /><span className="truncate">Across Crewline: <b className="font-semibold text-text">{a.global.success}%</b> success · <b className="font-semibold text-text">{a.global.conv}%</b> conversion · {a.global.accounts} businesses</span></div>
      </Tip>
      <div className="mt-auto flex items-center gap-2 border-t border-border-2 px-3 py-2 pt-2">
        <Button variant="ghost" onClick={onDetails}>More details</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost">Assign to<ChevronDown /></Button></DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Campaigns</DropdownMenuLabel>
            {s.campaigns.map((c) => <DropdownMenuCheckboxItem key={c.id} checked={c.agents.includes(a.id)} onSelect={(e) => e.preventDefault()} onCheckedChange={(on) => toggleCamp(c.id, !!on)}>{c.name}</DropdownMenuCheckboxItem>)}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => nav('/inbox')}><MessageSquare />Specific chats…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => nav('/campaigns?dir=in')}><Megaphone />Ad campaigns…</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => nav('/settings/channels')}><Phone />A phone number…</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>
        <Button className="ml-auto" onClick={() => nav(`/agents/${a.id}`)}><Pencil />Edit</Button>
      </div>
    </Card>
  )
}

function DetailsSheet({ a, onClose }: { a: Agent | null; onClose: () => void }) {
  const nav = useNavigate()
  if (!a) return null
  return (
    <Sheet open={!!a} onOpenChange={(o) => !o && onClose()} width={560} title={`${a.name} · history`} description={`${AT[a.type].label} agent · ${a.mode}`} footer={<><Button onClick={onClose}>Close</Button><Button variant="primary" onClick={() => nav(`/agents/${a.id}`)}><Pencil />Edit {a.name}</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">{[['Success', `${a.ws.success}%`], ['Conversion', `${a.ws.conv}%`], ['Review score', `${a.score}%`]].map(([l, v]) => <Card key={l} className="p-3"><div className="text-xs text-muted">{l}</div><div className="text-2xl font-semibold tabular">{v}</div></Card>)}</div>
        <Card className="overflow-hidden">
          <CardHeader title="Campaigns it worked on" description="Your workspace only" />
          <Table><thead><tr><Th>Campaign</Th><Th>Business</Th><Th align="right">Calls</Th><Th align="right">Texts</Th><Th align="right">Conversion</Th></tr></thead>
            <tbody>{a.history.map((h) => <Tr key={h.camp}><Td className="font-medium">{h.camp}</Td><Td className="text-muted">{h.ind}</Td><Td align="right">{nf(h.calls)}</Td><Td align="right">{nf(h.texts)}</Td><Td align="right">{h.conv}%</Td></Tr>)}</tbody></Table>
        </Card>
        <Card><CardBody className="flex items-start gap-3 text-sm"><Globe className="mt-0.5 size-4 shrink-0 text-icon" /><span>Across all of Crewline, {a.name} is used by <b className="font-semibold">{a.global.accounts}</b> businesses with <b className="font-semibold">{a.global.success}%</b> success and <b className="font-semibold">{a.global.conv}%</b> conversion. Other businesses never see your data.</span></CardBody></Card>
        <Card className="overflow-hidden"><CardHeader title="Versions" />{[...a.versions].reverse().map((v) => <div key={v.v} className="flex items-center gap-3 border-t border-border-2 px-4 py-2 text-sm"><Badge tone={v.v === a.ver ? 'green' : 'neutral'}>v{v.v}</Badge><span className="flex-1">{v.label}</span><span className="text-muted">{v.date}</span></div>)}</Card>
      </div>
    </Sheet>
  )
}

function Leaderboard() {
  const nav = useNavigate(); const s = useStore()
  const [period, setPeriod] = React.useState('30'); const [type, setType] = React.useState('all'); const [camp, setCamp] = React.useState('all'); const [by, setBy] = React.useState('conv'); const [scope, setScope] = React.useState<'mine' | 'all'>('mine')
  const f = period === '7' ? 0.25 : period === '90' ? 2.8 : 1
  const rows = s.agents.filter((a) => (type === 'all' || a.type === type) && (camp === 'all' || a.camps.includes(camp)))
    .map((a) => ({ a, convos: Math.round(a.ws.msgs * f / 4), replies: Math.round(a.ws.replies * f), calls: Math.round(a.ws.calls * f), conv: scope === 'all' ? a.global.conv : a.ws.conv, success: scope === 'all' ? a.global.success : a.ws.success, booked: Math.round((a.ws.sales || a.ws.appts || a.ws.resolved || a.ws.leads) * f), score: a.score }))
    .sort((x, y) => (y[by as 'conv'] as number) - (x[by as 'conv'] as number))
  const maxConv = Math.max(...rows.map((r) => r.conv), 1)
  const top = (k: 'conv' | 'convos' | 'score') => [...rows].sort((x, y) => y[k] - x[k])[0]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={period} onChange={setPeriod} options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} />
        <Select variant="button" value={type} onValueChange={setType} options={[{ value: 'all', label: 'All types' }, ...AGENT_TYPES.map((t) => ({ value: t, label: AT[t].label }))]} />
        <Select variant="button" value={camp} onValueChange={setCamp} options={[{ value: 'all', label: 'All campaigns' }, ...s.campaigns.map((c) => ({ value: c.id, label: c.name }))]} />
        <Select variant="button" value={by} onValueChange={setBy} options={[['conv', 'Rank by conversion'], ['success', 'Rank by success'], ['convos', 'Rank by conversations'], ['booked', 'Rank by results'], ['score', 'Rank by review score']].map(([v, l]) => ({ value: v, label: l }))} />
        <div className="ml-auto"><Segmented value={scope} onChange={setScope} options={[{ value: 'mine', label: 'My workspace' }, { value: 'all', label: 'Across Crewline' }]} /></div>
      </div>
      {rows.length > 0 && <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Best converter" value={top('conv').a.name} sub={`${top('conv').conv}%`} onClick={() => nav(`/agents/${top('conv').a.id}`)} />
        <Kpi label="Most conversations" value={top('convos').a.name} sub={nf(top('convos').convos)} onClick={() => nav(`/agents/${top('convos').a.id}`)} />
        <Kpi label="Highest review score" value={top('score').a.name} sub={`${top('score').score}%`} onClick={() => nav(`/agents/${top('score').a.id}`)} />
      </div>}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto"><Table>
          <thead><tr><Th className="w-12">Rank</Th><Th>Agent</Th><Th>Type</Th><Th align="right">Conversations</Th><Th align="right">Replies</Th><Th align="right">Calls</Th><Th>Conversion</Th><Th align="right">Success</Th><Th align="right">Results</Th><Th align="right">Score</Th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <Tr key={r.a.id} clickable onClick={() => nav(`/agents/${r.a.id}`)}>
              <Td>{i < 3 ? <Badge tone={i === 0 ? 'amber' : 'neutral'}>{['1st', '2nd', '3rd'][i]}</Badge> : <span className="pl-2 text-muted tabular">{i + 1}</span>}</Td>
              <Td><span className="flex items-center gap-2"><AgentAvatar name={r.a.name} size={22} /><span className="font-medium">{r.a.name}</span>{r.a.status === 'paused' && <Badge tone="amber">Paused</Badge>}</span></Td>
              <Td className="text-muted">{AT[r.a.type].label}</Td>
              <Td align="right">{nf(r.convos)}</Td><Td align="right">{nf(r.replies)}</Td><Td align="right">{nf(r.calls)}</Td>
              <Td><span className="flex items-center gap-2"><span className="h-1.5 w-20 overflow-hidden rounded-full bg-fill-selected"><span className="block h-full rounded-full bg-primary" style={{ width: `${(r.conv / maxConv) * 100}%` }} /></span><span className="tabular">{r.conv}%</span></span></Td>
              <Td align="right">{r.success}%</Td><Td align="right">{nf(r.booked)}</Td>
              <Td align="right"><span className={cn('font-medium', r.score >= 85 ? 'text-success' : r.score < 70 ? 'text-warning' : '')}>{r.score}</span></Td>
            </Tr>
          ))}</tbody>
        </Table></div>
      </Card>
      <p className="text-center text-sm text-muted">“Results” means sales for sales agents, appointments for receptionists, resolved issues for support and tech, and leads for marketing.</p>
    </div>
  )
}
