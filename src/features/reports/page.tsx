import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { BarChart3, Sparkles, LayoutDashboard, FolderOpen, CalendarClock, Save, ChevronRight, ArrowRight } from 'lucide-react'
import { money, nf } from '@/lib/utils'
import { useStore } from '@/store'
import { PageBody, PageHeader, PageTabs } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Count } from '@/components/ui/badge'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { AgentAvatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Kpi, BarRow } from '@/components/app/bits'
import { DirIcon } from '@/components/app/icons'
import { AnalyzeDialog, type Analysis } from '@/features/shared/ai'
import { AT } from '@/data/seed'
import { Library, ReportViewer, GenerateDialog } from './library'

type Dir = 'all' | 'in' | 'out'
const F = { '7': 0.25, '30': 1, '90': 2.8 } as const

/** Reports: dashboards across the whole product, and the report library. */
export function ReportsPage() {
  const [sp, setSp] = useSearchParams(); const s = useStore()
  const tab = sp.get('tab') === 'library' ? 'library' : 'dash'
  const [open, setOpen] = React.useState<string | null>(null); const [gen, setGen] = React.useState(false)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Reports" icon={<BarChart3 />}
        actions={<>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="header"><CalendarClock />Schedule</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {['Email me a summary every Monday', 'Monthly expenses report on the 1st', 'Agent leaderboard every Friday'].map((x) => <DropdownMenuItem key={x} onSelect={() => toast.success(`Scheduled: ${x.toLowerCase()} · saved to Reports each time`)}>{x}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="primary" onClick={() => setGen(true)}><Sparkles />Generate with AI</Button>
        </>} />
      <PageTabs value={tab} onChange={(t) => setSp(t === 'library' ? { tab: 'library' } : {}, { replace: true })} tabs={[{ value: 'dash', label: 'Dashboards', icon: <LayoutDashboard /> }, { value: 'library', label: <>Report library<Count n={s.reports.length} /></>, icon: <FolderOpen /> }]} />
      <PageBody wide>
        {tab === 'library' ? <Library onOpen={setOpen} onGenerate={() => setGen(true)} /> : <Dashboards onSaved={(id) => setOpen(id)} />}
      </PageBody>
      <ReportViewer id={open} onClose={() => setOpen(null)} />
      <GenerateDialog open={gen} onOpenChange={setGen} onDone={(id) => { setSp({ tab: 'library' }, { replace: true }); setOpen(id) }} />
    </div>
  )
}

function Dashboards({ onSaved }: { onSaved: (id: string) => void }) {
  const s = useStore(); const nav = useNavigate()
  const [period, setPeriod] = React.useState<keyof typeof F>('30'); const [dir, setDir] = React.useState<Dir>('all'); const [biz, setBiz] = React.useState('all'); const [camp, setCamp] = React.useState('all')
  const [analyze, setAnalyze] = React.useState(false)
  const f = F[period]
  const pool = s.campaigns.filter((c) => (dir === 'all' || c.dir === dir) && (biz === 'all' || c.biz === biz))
  const C = camp === 'all' ? pool : pool.filter((c) => c.id === camp)
  const sum = (k: 'people' | 'reached' | 'replied' | 'interested' | 'booked' | 'installed' | 'revenue', L = C) => Math.round(L.reduce((a, c) => a + c[k], 0) * (k === 'people' ? 1 : f))
  const spendOf = (id: string) => s.expenses.reduce((a, e) => a + e.cost * (e.by[id] ?? 0), 0) * f
  const spend = C.reduce((a, c) => a + spendOf(c.id), 0)
  const days = period === '90' ? 13 : period === '7' ? 7 : 30
  const series = Array.from({ length: days }, (_, i) => { const w = 0.75 + 0.5 * Math.sin(i / 2.7) ** 2; return { d: period === '90' ? `Wk ${i + 1}` : period === '7' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `Sep ${i + 1}`, replies: Math.round((sum('replied') / days) * w), bookings: Math.round((sum('booked') / days) * (0.7 + 0.6 * Math.cos(i / 3.1) ** 2)) } })
  const funnel: [string, number, string][] = [['People', sum('people'), '#8A8A8A'], ['Reached', sum('reached'), '#4C8BF5'], ['Replied', sum('replied'), '#0891B2'], ['Booked', sum('booked'), '#005BD3'], ['Won', sum('installed'), '#047B5D']]
  const split = (['out', 'in'] as const).map((d) => { const L = s.campaigns.filter((c) => c.dir === d && (biz === 'all' || c.biz === biz)); return { d, reached: sum('reached', L), booked: sum('booked', L), revenue: sum('revenue', L), conv: Math.round((L.reduce((a, c) => a + c.booked, 0) / Math.max(1, L.reduce((a, c) => a + c.replied, 0))) * 100) } })
  const agents = s.agents.filter((a) => camp === 'all' ? a.camps.some((k) => C.some((c) => c.id === k)) : a.camps.includes(camp)).sort((a, b) => b.ws.conv - a.ws.conv).slice(0, 6)
  const bk = s.bookings.filter((b) => C.some((c) => c.id === b.camp) && b.date <= '2026-09-27' && b.date >= (period === '7' ? '2026-09-21' : '2026-08-29'))
  const bkDone = bk.filter((b) => b.status === 'completed').length; const bkNo = bk.filter((b) => b.status === 'noshow').length; const bkCx = bk.filter((b) => b.status === 'cancelled').length
  const cats = Object.entries(s.expenses.reduce<Record<string, number>>((m, e) => { m[e.cat] = (m[e.cat] ?? 0) + e.cost * C.reduce((a, c) => a + (e.by[c.id] ?? 0), 0) * f; return m }, {})).sort((a, b) => b[1] - a[1])
  const filters = [period === '7' ? 'Last 7 days' : period === '90' ? 'Last 90 days' : 'Last 30 days', dir === 'all' ? null : dir === 'in' ? 'Inbound' : 'Outbound', biz === 'all' ? null : biz, camp === 'all' ? null : s.campaigns.find((c) => c.id === camp)?.name].filter(Boolean).join(' · ')
  const analysis: Analysis = {
    title: 'Dashboard analysis', subject: filters, folder: 'r6', kind: 'Analysis',
    kpis: [{ l: 'Replies', v: nf(sum('replied')) }, { l: 'Bookings', v: nf(sum('booked')) }, { l: 'Sales', v: money(sum('revenue')) }, { l: 'Cost per booking', v: `$${(spend / Math.max(1, sum('booked'))).toFixed(2)}` }],
    flow: funnel.map(([l, n, color]) => ({ l, n, color })),
    wrong: ['Most people who don’t reply never get a second channel', 'Fiber Win-back is paused with people never contacted', 'No-shows are highest on Mondays'],
    works: ['Inbound converts about twice as well as outbound', 'Evening messages get the most replies', 'Receptionists book 6 in 10 appointments without help'],
    suggestions: ['Add a WhatsApp follow-up for people who ignore texts', 'Resume Fiber Win-back with Ellie', 'Send a 2-hour reminder for Monday bookings'],
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={period} onChange={setPeriod} options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} />
        <Segmented value={dir} onChange={(d) => { setDir(d); setCamp('all') }} options={[{ value: 'all', label: 'All' }, { value: 'in', label: 'Inbound', icon: <DirIcon dir="in" size={12} withTip={false} /> }, { value: 'out', label: 'Outbound', icon: <DirIcon dir="out" size={12} withTip={false} /> }]} />
        <Select variant="button" value={biz} onValueChange={(b) => { setBiz(b); setCamp('all') }} options={[{ value: 'all', label: 'All businesses' }, ...s.biz.map((b) => ({ value: b.name, label: b.name }))]} />
        <Select variant="button" value={camp} onValueChange={setCamp} options={[{ value: 'all', label: 'All campaigns' }, ...pool.map((c) => ({ value: c.id, label: c.name }))]} />
        <span className="flex-1" />
        <Button onClick={() => { const r = s.addReport({ name: `Dashboard · ${filters}`, folder: 'r6', date: '2026-09-27', by: 'You', kind: 'Analysis' }); toast.success('Saved to Reports › Max reports'); onSaved(r.id) }}><Save />Save as report</Button>
        <Button onClick={() => setAnalyze(true)}><Sparkles />Analyze with AI</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Reached" value={nf(sum('reached'))} delta="+9%" up />
        <Kpi label="Replies" value={nf(sum('replied'))} delta="+12%" up />
        <Kpi label="Bookings" value={nf(sum('booked'))} delta="+18%" up />
        <Kpi label="Sales" value={money(sum('revenue'))} delta="+15%" up />
        <Kpi label="Spend" value={money(spend)} delta="+6%" up good={false} to="/expenses" />
        <Kpi label="Per booking" value={`$${(spend / Math.max(1, sum('booked'))).toFixed(2)}`} delta="−10%" up={false} good />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Replies and bookings" description={filters} />
          <div className="flex gap-3 px-4 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-primary" />Replies</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-success" />Bookings</span></div>
          <CardBody className="h-[240px] pt-2">
            <ResponsiveContainer>
              <LineChart data={series} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border-2)" />
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={period === '30' ? 4 : 0} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <RTip cursor={{ stroke: 'var(--border-strong)' }} contentStyle={{ borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13, color: 'var(--text)' }} />
                <Line type="monotone" dataKey="replies" name="Replies" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="var(--success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="From first message to sale" description="How many people reach each step" />
          <CardBody className="space-y-3">{funnel.map(([l, n, color], i) => (
            <div key={l} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3">
              <span className="text-sm">{l}</span>
              <span className="h-2 overflow-hidden rounded-full bg-fill-selected"><span className="block h-full rounded-full" style={{ width: `${Math.max(2, (n / Math.max(1, funnel[0][1])) * 100)}%`, background: color }} /></span>
              <span className="text-right text-sm tabular">{nf(n)}{i > 0 && <span className="ml-1.5 inline-block w-9 text-xs text-muted">{Math.round((n / Math.max(1, funnel[i - 1][1])) * 100)}%</span>}</span>
            </div>
          ))}<p className="text-xs text-muted">The small number is the share of the step before.</p></CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Inbound vs outbound" description="People who came to you, and people you reached out to" />
        <div className="grid gap-px bg-border-2 sm:grid-cols-2">
          {split.map((x) => (
            <div key={x.d} className="bg-surface p-4">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium"><DirIcon dir={x.d} size={14} withTip={false} />{x.d === 'in' ? 'Inbound' : 'Outbound'}</div>
              <div className="grid grid-cols-4 gap-2">{[['Reached', nf(x.reached)], ['Booked', nf(x.booked)], ['Sales', money(x.revenue)], ['Booked per reply', `${x.conv}%`]].map(([l, v]) => <div key={l}><div className="text-xs text-muted">{l}</div><div className="text-lg font-semibold tabular">{v}</div></div>)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Campaigns compared" action={<Button variant="ghost" onClick={() => nav('/campaigns')}>All campaigns<ChevronRight /></Button>} />
        <div className="overflow-x-auto">
          <Table>
            <thead><tr><Th>Campaign</Th><Th align="right">Reached</Th><Th align="right">Reply rate</Th><Th align="right">Booked</Th><Th align="right">Sales</Th><Th align="right">Spend</Th><Th align="right">Per booking</Th><Th align="right">Return</Th></tr></thead>
            <tbody>{C.map((c) => { const sp = spendOf(c.id); return (
              <Tr key={c.id} clickable onClick={() => nav(`/campaigns/${c.id}`)}>
                <Td className="font-medium"><span className="flex items-center gap-1.5"><DirIcon dir={c.dir} size={12} />{c.name}</span></Td>
                <Td align="right">{nf(c.reached * f)}</Td><Td align="right">{Math.round((c.replied / Math.max(1, c.reached)) * 100)}%</Td><Td align="right">{nf(c.booked * f)}</Td>
                <Td align="right">{money(c.revenue * f)}</Td><Td align="right">{money(sp)}</Td><Td align="right">${(sp / Math.max(1, c.booked * f)).toFixed(2)}</Td>
                <Td align="right" className="font-medium">{Math.round((c.revenue * f) / Math.max(1, sp))}×</Td>
              </Tr>
            ) })}</tbody>
          </Table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader title="Top agents" description="By conversion" action={<Button variant="ghost" onClick={() => nav('/agents?tab=leaderboard')}>Leaderboard<ChevronRight /></Button>} />
          {agents.map((a) => (
            <button key={a.id} onClick={() => nav(`/agents/${a.id}`)} className="flex w-full items-center gap-2.5 border-t border-border-2 px-4 py-2 text-left hover:bg-subtle-2">
              <AgentAvatar name={a.name} size={22} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{a.name}</span><span className="block text-xs text-muted">{AT[a.type].label}</span></span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-fill-selected"><span className="block h-full rounded-full bg-primary" style={{ width: `${(a.ws.conv / Math.max(1, agents[0].ws.conv)) * 100}%` }} /></span><span className="w-9 text-right text-sm tabular">{a.ws.conv}%</span>
            </button>
          ))}
          {!agents.length && <p className="px-4 pb-4 text-sm text-muted">No agents on these campaigns.</p>}
        </Card>
        <Card>
          <CardHeader title="Bookings" action={<Button variant="ghost" onClick={() => nav('/bookings')}>Open<ChevronRight /></Button>} />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-2">{[['Completed', bkDone], ['No-shows', bkNo], ['Cancelled', bkCx]].map(([l, v]) => <div key={l as string}><div className="text-xs text-muted">{l}</div><div className="text-2xl font-semibold tabular">{nf(v as number)}</div></div>)}</div>
            <p className="text-sm text-muted">{bk.length ? `${Math.round((bkNo / Math.max(1, bkDone + bkNo)) * 100)}% of visits were no-shows.` : 'No bookings in these campaigns.'}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Expenses" action={<Button variant="ghost" onClick={() => nav('/expenses')}>Open<ChevronRight /></Button>} />
          <CardBody>{cats.slice(0, 5).map(([k, v]) => <BarRow key={k} label={k} value={v} max={cats[0]?.[1] ?? 1} right={money(v)} />)}</CardBody>
        </Card>
      </div>
      <button onClick={() => setAnalyze(true)} className="flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-border-strong p-3 text-sm text-muted transition-colors hover:bg-surface hover:text-text"><Sparkles className="size-4" />Ask AI what to do next with these numbers<ArrowRight className="size-4" /></button>
      <AnalyzeDialog open={analyze} onOpenChange={setAnalyze} a={analysis} />
    </div>
  )
}
