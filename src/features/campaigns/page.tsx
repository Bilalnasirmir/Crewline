import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Megaphone, Pause, Play, MoreHorizontal, SlidersHorizontal, Sparkles, Copy, Trash2, Search, Check, Users } from 'lucide-react'
import { cn, nf, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { useMax } from '@/features/max/store'
import { PageBody, PageHeader, Toolbar } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Card, EmptyState } from '@/components/ui/card'
import { Progress, Checkbox } from '@/components/ui/controls'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { DirTag, PlatIcon } from '@/components/app/icons'
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
export const statusTone = (s: Campaign['status']) => (s === 'running' ? 'green' : s === 'paused' ? 'amber' : s === 'scheduled' ? 'blue' : 'neutral') as any
export const statusLabel = (s: Campaign['status']) => ({ running: 'Live', paused: 'Paused', scheduled: 'Scheduled', draft: 'Draft', ended: 'Ended' }[s])

export function CampaignsPage() {
  const nav = useNavigate(); const s = useStore(); const { send, newThread } = useMax()
  const [dir, setDir] = React.useState<'all' | 'in' | 'out'>('all'); const [status, setStatus] = React.useState('all'); const [q, setQ] = React.useState('')
  const [tileDlg, setTileDlg] = React.useState<Campaign | null>(null)
  const list = s.campaigns.filter((c) => (dir === 'all' || c.dir === dir) && (status === 'all' || c.status === status) && c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Campaigns" sub={`${s.campaigns.filter((c) => c.status === 'running').length} live`} icon={<Megaphone />}
        actions={<><Button size="sm" variant="ai" onClick={() => { newThread(); send('Build a campaign'); nav('/max') }}><Sparkles />Build with Max</Button><Button size="sm" variant="primary" onClick={() => nav('/campaigns/new')}><Plus />New campaign</Button></>} />
      <Toolbar left={<><Segmented size="sm" value={dir} onChange={setDir} options={[{ value: 'all', label: 'All' }, { value: 'out', label: 'Outbound' }, { value: 'in', label: 'Inbound' }]} /><Select size="sm" className="w-[140px]" value={status} onValueChange={setStatus} options={[{ value: 'all', label: 'Any status' }, { value: 'running', label: 'Live' }, { value: 'paused', label: 'Paused' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'draft', label: 'Draft' }]} /></>}
        right={<div className="relative"><Search className="absolute left-2.5 top-2 size-3.5 text-muted" /><Input className="h-8 w-[200px] pl-8" placeholder="Search campaigns" value={q} onChange={(e) => setQ(e.target.value)} /></div>} />
      <PageBody wide>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {list.map((c) => <CampaignTile key={c.id} c={c} onOpen={() => nav(`/campaigns/${c.id}`)} onCustomize={() => setTileDlg(c)} />)}
          <button onClick={() => nav('/campaigns/new')} className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-strong text-muted transition-colors hover:border-primary hover:text-primary"><Plus className="size-5" /><span className="text-base font-medium">New campaign</span><span className="text-sm">Pick people, channels and agents — 2 minutes</span></button>
        </div>
        {!list.length && <EmptyState icon={<Megaphone />} title="No campaigns match" action={<Button onClick={() => { setDir('all'); setStatus('all'); setQ('') }}>Clear filters</Button>} />}
      </PageBody>
      <TileMetricsDialog c={tileDlg} onClose={() => setTileDlg(null)} />
    </div>
  )
}

function CampaignTile({ c, onOpen, onCustomize }: { c: Campaign; onOpen: () => void; onCustomize: () => void }) {
  const s = useStore()
  const agents = c.agents.map((id) => s.agents.find((a) => a.id === id)).filter(Boolean)
  return (
    <Card className="group flex flex-col transition-colors hover:border-border-strong">
      <button onClick={onOpen} className="flex-1 p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><div className="flex items-center gap-2"><DirTag dir={c.dir} /><Badge tone={statusTone(c.status)} dot>{statusLabel(c.status)}</Badge></div><h3 className="mt-2 truncate text-base">{c.name}</h3><p className="truncate text-sm text-muted">{c.biz} · {c.sub} · {c.status === 'scheduled' ? c.started : `started ${c.started}`}</p></div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">{c.metrics.map((m) => { const d = MET[m]; return d ? <Tip key={m} content={d.tip}><div className="min-w-0"><div className="truncate text-xs text-muted">{d.l}</div><div className="truncate text-base font-semibold tabular">{d.v(c)}</div></div></Tip> : null })}</div>
        <div className="mt-3"><Progress value={c.people ? (c.reached / c.people) * 100 : 0} /><div className="mt-1 text-xs text-muted">{nf(c.reached)} of {nf(c.people)} reached</div></div>
      </button>
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <div className="flex items-center gap-1">{c.ch.map((p) => <PlatIcon key={p} p={p} size={14} />)}</div>
        <div className="ml-1 flex -space-x-1">{agents.slice(0, 4).map((a) => <Tip key={a!.id} content={`${a!.name} · ${a!.type}`}><span><AgentAvatar name={a!.name} size={20} className="ring-2 ring-bg" /></span></Tip>)}{agents.length > 4 && <span className="flex size-5 items-center justify-center rounded-[6px] bg-subtle text-[10px] font-medium ring-2 ring-bg">+{agents.length - 4}</span>}</div>
        <span className="flex-1" />
        {c.status === 'running' ? <Button size="sm" variant="ghost" onClick={() => { s.updateCampaign(c.id, { status: 'paused' }); toast(`${c.name} paused — agents finish open conversations but start no new ones`) }}><Pause />Pause</Button> : c.status !== 'draft' && <Button size="sm" variant="ghost" onClick={() => { s.updateCampaign(c.id, { status: 'running', started: c.status === 'scheduled' ? 'Today' : c.started }); toast.success(`${c.name} is live`) }}><Play />{c.status === 'scheduled' ? 'Start now' : 'Resume'}</Button>}
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label="Campaign menu"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onCustomize}><SlidersHorizontal />Customize tile metrics</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { s.patch('campaigns', (cs) => [{ ...c, id: 'k' + Date.now(), name: c.name + ' (copy)', status: 'draft', started: 'Draft', reached: 0, replied: 0, interested: 0, booked: 0, installed: 0, revenue: 0, cost: 0 }, ...cs]); toast.success('Duplicated as a draft') }}><Copy />Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator /><DropdownMenuItem danger onSelect={() => { s.patch('campaigns', (cs) => cs.filter((x) => x.id !== c.id)); toast.success('Campaign deleted') }}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
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
  return (
    <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="Customize metrics" description={`${c.name} · pick up to 6, in the order you want`} size="sm" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => { s.updateCampaign(c.id, { metrics: sel }); onClose(); toast.success('Metrics updated') }}><Check />Save</Button></>}>
        <div className="mb-1 text-xs font-medium text-muted">Numbers</div>
        <div className="space-y-0.5">{Object.entries(MET).map(([k, d]) => <label key={k} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 hover:bg-subtle"><Checkbox checked={sel.includes(k)} onCheckedChange={() => toggle(k)} /><span className="flex-1 text-base">{d.l}</span>{sel.includes(k) && <span className="text-xs text-muted">#{sel.indexOf(k) + 1}</span>}</label>)}</div>
        <div className="mb-1 mt-3 text-xs font-medium text-muted">Any stage as a number</div>
        <div className="space-y-0.5">{stages.map((st) => { const k = 'stage:' + st.name; return <label key={k} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 hover:bg-subtle"><Checkbox checked={sel.includes(k)} onCheckedChange={() => toggle(k)} /><span className="size-2 rounded-full" style={{ background: st.color }} /><span className="flex-1 text-base">{st.name}</span></label> })}</div>
      </DialogContent>
    </Dialog>
  )
}
export { Users }
