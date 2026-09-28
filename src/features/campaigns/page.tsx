import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Megaphone, Pause, Play, MoreHorizontal, SlidersHorizontal, Sparkles, Copy, Trash2, Search, Check, LayoutGrid, Rows3, BarChart3, Pencil } from 'lucide-react'
import { cn, nf, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { useMax } from '@/features/max/store'
import { PageBody, PageHeader } from '@/components/app/page'
import { askConfirm } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Card, EmptyState } from '@/components/ui/card'
import { Progress, Checkbox } from '@/components/ui/controls'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { DirIcon, DirTag, PlatIcon } from '@/components/app/icons'
import type { Campaign } from '@/data/types'

export const MET: Record<string, { l: string; v: (c: Campaign) => string; tip: string }> = {
  people: { l: 'People', v: (c) => nf(c.people), tip: 'Everyone in this campaign' },
  reached: { l: 'Reached', v: (c) => nf(c.reached), tip: 'Got at least one message or call' },
  replied: { l: 'Replied', v: (c) => nf(c.replied), tip: 'Replied or answered at least once' },
  interested: { l: 'Interested', v: (c) => nf(c.interested), tip: 'Reached an interested/qualified stage' },
  booked: { l: 'Booked', v: (c) => nf(c.booked), tip: 'Orders or appointments booked' },
  installed: { l: 'Won', v: (c) => nf(c.installed), tip: 'Reached the revenue stage' },
  revenue: { l: 'Revenue', v: (c) => money(c.revenue), tip: 'From product values at the revenue stage' },
  cost: { l: 'Cost', v: (c) => money(c.cost), tip: 'AI, calls and messaging spend' },
  cpb: { l: 'Cost / booking', v: (c) => (c.booked ? '$' + (c.cost / c.booked).toFixed(2) : '—'), tip: 'Cost divided by bookings' },
  reply: { l: 'Reply rate', v: (c) => (c.reached ? Math.round((c.replied / c.reached) * 100) + '%' : '—'), tip: 'Replied ÷ reached' },
}
/** A metric key can also be "stage:Name" — how many people are in that stage right now. */
export const metricOf = (k: string, c: Campaign, contacts: { camp: string | null; stage: string }[]) => {
  if (k.startsWith('stage:')) { const n = k.slice(6); return { l: n, v: nf(contacts.filter((x) => x.camp === c.id && x.stage === n).length * Math.max(1, Math.round(c.people / 24))), tip: `People in the ${n} stage right now` } }
  const d = MET[k]; return d ? { l: d.l, v: d.v(c), tip: d.tip } : null
}
export const statusTone = (s: Campaign['status']) => (s === 'running' ? 'green' : s === 'paused' ? 'amber' : s === 'scheduled' ? 'blue' : 'neutral') as 'green' | 'amber' | 'blue' | 'neutral'
export const statusLabel = (s: Campaign['status']) => ({ running: 'Live', paused: 'Paused', scheduled: 'Scheduled', draft: 'Draft', ended: 'Ended' }[s])
const dirMatch = (c: Campaign, d: 'all' | 'in' | 'out') => d === 'all' || c.dir === d || c.dir === 'both'

export function CampaignsPage() {
  const nav = useNavigate(); const s = useStore(); const { send, newThread } = useMax()
  const [dir, setDir] = React.useState<'all' | 'in' | 'out'>('all'); const [status, setStatus] = React.useState('all'); const [q, setQ] = React.useState('')
  const [layout, setLayout] = React.useState<'tiles' | 'table'>(s.prefs.campaignLayout ?? 'tiles')
  const [tileDlg, setTileDlg] = React.useState<Campaign | null>(null)
  const list = s.campaigns.filter((c) => dirMatch(c, dir) && (status === 'all' || c.status === status) && `${c.name} ${c.biz} ${c.sub}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Campaigns" sub={`${s.campaigns.filter((c) => c.status === 'running').length} live · ${s.campaigns.length} total`} icon={<Megaphone />}
        actions={<>
          <Button variant="header" onClick={() => nav('/reports')}><BarChart3 />Compare</Button>
          <Button variant="header" onClick={() => { newThread(); send('Build a campaign'); nav('/max') }}><Sparkles />Build with Max</Button>
          <Button variant="primary" onClick={() => nav('/campaigns/new')}><Plus />New campaign</Button>
        </>} />
      <PageBody wide={layout === 'tiles'}>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <label className="flex h-8 w-full items-center gap-2 rounded-control border border-input-border bg-input-bg px-2.5 sm:w-[240px] md:h-7"><Search className="size-4 shrink-0 text-icon" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search campaigns" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <Segmented value={dir} onChange={setDir} options={[{ value: 'all', label: 'All' }, { value: 'out', label: 'Outbound', icon: <DirIcon dir="out" size={12} withTip={false} /> }, { value: 'in', label: 'Inbound', icon: <DirIcon dir="in" size={12} withTip={false} /> }]} />
        <Select variant="button" value={status} onValueChange={setStatus} options={[{ value: 'all', label: 'Any status' }, { value: 'running', label: 'Live' }, { value: 'paused', label: 'Paused' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'draft', label: 'Draft' }, { value: 'ended', label: 'Ended' }]} />
        <div className="ml-auto"><Segmented value={layout} onChange={(v) => { setLayout(v); s.setPref('campaignLayout', v) }} options={[{ value: 'tiles', label: 'Tiles', icon: <LayoutGrid /> }, { value: 'table', label: 'Table', icon: <Rows3 /> }]} /></div>
      </div>
        {layout === 'tiles' ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {list.map((c) => <CampaignTile key={c.id} c={c} onCustomize={() => setTileDlg(c)} />)}
            <button onClick={() => nav('/campaigns/new')} className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border-strong p-4 text-center transition-colors hover:bg-surface"><Plus className="mb-1 size-5 text-icon" /><h3>New campaign</h3><span className="text-sm text-muted">Pick people, channels and agents — about 2 minutes</span></button>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto"><Table>
              <thead><tr><Th>Campaign</Th><Th>Status</Th><Th align="right">People</Th><Th align="right">Reached</Th><Th align="right">Reply rate</Th><Th align="right">Booked</Th><Th align="right">Revenue</Th><Th align="right">Cost</Th><Th align="right">Cost / booking</Th><Th>Agents</Th><Th>Started</Th></tr></thead>
              <tbody>{list.map((c) => (
                <Tr key={c.id} clickable onClick={() => nav(`/campaigns/${c.id}`)}>
                  <Td><span className="flex items-center gap-2"><DirIcon dir={c.dir} size={14} /><span className="font-medium">{c.name}</span></span></Td>
                  <Td><Badge tone={statusTone(c.status)} dot>{statusLabel(c.status)}</Badge></Td>
                  <Td align="right">{nf(c.people)}</Td><Td align="right">{nf(c.reached)}</Td><Td align="right">{MET.reply.v(c)}</Td><Td align="right">{nf(c.booked)}</Td><Td align="right">{money(c.revenue)}</Td><Td align="right">{money(c.cost)}</Td><Td align="right">{MET.cpb.v(c)}</Td>
                  <Td><span className="flex -space-x-1">{c.agents.slice(0, 5).map((id) => { const a = s.agents.find((x) => x.id === id); return a ? <AgentAvatar key={id} name={a.name} size={20} className="ring-2 ring-surface" /> : null })}</span></Td>
                  <Td className="text-muted">{c.started}</Td>
                </Tr>
              ))}</tbody>
            </Table></div>
          </Card>
        )}
        {!list.length && <EmptyState icon={<Megaphone />} title="No campaigns match" action={<Button onClick={() => { setDir('all'); setStatus('all'); setQ('') }}>Clear filters</Button>} />}
      </PageBody>
      <TileMetricsDialog c={tileDlg} onClose={() => setTileDlg(null)} />
    </div>
  )
}

function CampaignTile({ c, onCustomize }: { c: Campaign; onCustomize: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const agents = c.agents.map((id) => s.agents.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a)
  const toggle = () => {
    if (c.status === 'running') { s.updateCampaign(c.id, { status: 'paused' }); toast(`${c.name} paused — agents finish open conversations but start no new ones`) }
    else { s.updateCampaign(c.id, { status: 'running', started: c.status === 'scheduled' || c.status === 'draft' ? 'Today' : c.started }); toast.success(`${c.name} is live`) }
  }
  return (
    <Card className="flex flex-col">
      <button onClick={() => nav(`/campaigns/${c.id}`)} className="flex-1 rounded-t-card p-4 text-left transition-colors hover:bg-subtle-2">
        <div className="flex flex-wrap items-center gap-1.5"><DirTag dir={c.dir} /><Badge tone={statusTone(c.status)} dot>{statusLabel(c.status)}</Badge>{c.booking && <Badge>Books appointments</Badge>}</div>
        <h3 className="mt-2 truncate">{c.name}</h3>
        <p className="truncate text-sm text-muted">{c.biz} · {c.sub} · {c.status === 'scheduled' ? c.started : `started ${c.started}`}</p>
        <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 sm:grid-cols-5">{c.metrics.map((m) => { const d = metricOf(m, c, s.contacts); return d ? <Tip key={m} content={d.tip}><div className="min-w-0"><div className="truncate text-xs text-muted">{d.l}</div><div className="truncate text-lg font-semibold tabular">{d.v}</div></div></Tip> : null })}</div>
        <div className="mt-3"><Progress value={c.people ? (c.reached / c.people) * 100 : 0} /><div className="mt-1 text-xs text-muted">{nf(c.reached)} of {nf(c.people)} reached</div></div>
      </button>
      <div className="flex items-center gap-2 border-t border-border-2 px-3 py-2">
        <div className="flex items-center gap-1">{c.ch.map((p) => <PlatIcon key={p} p={p} size={14} />)}</div>
        <div className="ml-1 flex -space-x-1">{agents.slice(0, 4).map((a) => <Tip key={a.id} content={`${a.name} · ${a.type}`}><span><AgentAvatar name={a.name} size={20} className="ring-2 ring-surface" /></span></Tip>)}{agents.length > 4 && <span className="flex size-5 items-center justify-center rounded-md bg-subtle text-2xs font-medium ring-2 ring-surface">+{agents.length - 4}</span>}</div>
        <span className="flex-1" />
        {c.status !== 'ended' && <Button variant="ghost" onClick={toggle}>{c.status === 'running' ? <><Pause />Pause</> : <><Play />{c.status === 'scheduled' ? 'Start now' : c.status === 'draft' ? 'Launch' : 'Resume'}</>}</Button>}
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label="Campaign menu"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => nav(`/campaigns/${c.id}?tab=settings`)}><Pencil />Edit settings</DropdownMenuItem>
          <DropdownMenuItem onSelect={onCustomize}><SlidersHorizontal />Customize tile metrics</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { s.patch('campaigns', (cs) => [{ ...c, id: 'k' + Date.now(), name: c.name + ' (copy)', status: 'draft', started: 'Draft', reached: 0, replied: 0, interested: 0, booked: 0, installed: 0, revenue: 0, cost: 0 }, ...cs]); toast.success('Duplicated as a draft') }}><Copy />Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator /><DropdownMenuItem danger onSelect={async () => { if (await askConfirm({ title: `Delete “${c.name}”?`, description: 'Agents stop right away. The people and their history stay in Contacts.', ok: 'Delete campaign', danger: true })) { s.patch('campaigns', (cs) => cs.filter((x) => x.id !== c.id)); toast.success('Campaign deleted') } }}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>
    </Card>
  )
}

export function TileMetricsDialog({ c, onClose }: { c: Campaign | null; onClose: () => void }) {
  const s = useStore(); const [sel, setSel] = React.useState<string[]>([])
  React.useEffect(() => { if (c) setSel(c.metrics) }, [c])
  if (!c) return null
  const stages = stagesFor(c, s.stages)
  const toggle = (k: string) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : sel.length < 6 ? [...sel, k] : sel)
  const row = (k: string, label: React.ReactNode) => (
    <label key={k} className={cn('flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 hover:bg-subtle-2', !sel.includes(k) && sel.length >= 6 && 'opacity-50')}>
      <Checkbox checked={sel.includes(k)} onCheckedChange={() => toggle(k)} /><span className="flex flex-1 items-center gap-2 text-sm">{label}</span>{sel.includes(k) && <span className="text-xs text-muted tabular">#{sel.indexOf(k) + 1}</span>}
    </label>
  )
  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="Customize metrics" description={`${c.name} · pick up to 6, in the order you want`} size="sm" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => { s.updateCampaign(c.id, { metrics: sel }); onClose(); toast.success('Metrics updated') }}><Check />Save</Button></>}>
        <h4 className="mb-1 text-muted">Numbers</h4>
        <div className="space-y-0.5">{Object.entries(MET).map(([k, d]) => row(k, d.l))}</div>
        <h4 className="mb-1 mt-3 text-muted">Any stage as a number</h4>
        <div className="space-y-0.5">{stages.map((st) => row('stage:' + st.name, <><span className="size-2 rounded-full" style={{ background: st.color }} />{st.name}</>))}</div>
      </DialogContent>
    </Dialog>
  )
}
