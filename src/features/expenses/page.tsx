import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { Receipt, Sparkles, Download, CreditCard, Check, TrendingUp, Pencil, Info } from 'lucide-react'
import { cn, money, nf } from '@/lib/utils'
import { useStore } from '@/store'
import { PageBody, PageHeader } from '@/components/app/page'
import { askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/controls'
import { Sheet } from '@/components/ui/dialog'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Tip } from '@/components/ui/tooltip'
import { AskSheet } from '@/features/shared/ai'
import { PlatIcon } from '@/components/app/icons'
import type { Expense, Platform } from '@/data/types'

type Period = 'month' | '7' | 'last'
const CAT_COLOR: Record<string, string> = { AI: '#005BD3', Voice: '#0891B2', Messaging: '#047B5D', Telephony: '#C68A12', Data: '#8A6100', Platform: '#8A8A8A' }
const CH_LABEL: Record<string, string> = { call: 'Calls', sms: 'Texts', wa: 'WhatsApp', email: 'Email', msg: 'Social', all: 'All channels' }
const cents = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const rateTxt = (e: Expense) => (e.rate >= 1 ? `${money(e.rate)} / ${e.unit.replace(/s$/, '')}` : e.rate === 0 ? 'Included' : e.rate < 0.001 ? `$${(e.rate * 1000).toFixed(3)} / 1,000 ${e.unit}` : `$${e.rate.toFixed(4).replace(/0+$/, '')} / ${e.unit.replace(/s$/, '')}`)
const SAVINGS = [
  { id: 'wa', t: 'Send WhatsApp instead of SMS when the customer has it', d: '1 in 3 of your texted leads use WhatsApp, which costs less per conversation.', save: 84 },
  { id: 'vm', t: 'Shorten voicemails to 20 seconds', d: 'The average voicemail is 38 seconds. Shorter ones get the same call-backs.', save: 31 },
  { id: 'data', t: 'Skip data filling for contacts that are already complete', d: '412 lookups last month found nothing new.', save: 22 },
  { id: 'model', t: 'Use the lighter AI for follow-up texts', d: 'Follow-ups are short and simple. Replies stay the same quality.', save: 19 },
]

/** Expenses: total spend, where it goes, cost per result, budgets by campaign and ways to save. */
export function ExpensesPage() {
  const s = useStore(); const nav = useNavigate()
  const [period, setPeriod] = React.useState<Period>('month'); const [cat, setCat] = React.useState('all'); const [ch, setCh] = React.useState('all'); const [camp, setCamp] = React.useState('all'); const [prov, setProv] = React.useState('all')
  const [ask, setAsk] = React.useState(false); const [row, setRow] = React.useState<Expense | null>(null)
  const applied: string[] = s.prefs.savingsApplied ?? []

  const usageDays = s.expDaily.reduce((a, b) => a + b, 0)
  const plan = s.expenses.filter((e) => e.cat === 'Platform').reduce((a, e) => a + e.cost, 0)
  const usage = s.expenses.filter((e) => e.cat !== 'Platform').reduce((a, e) => a + e.cost, 0)
  const last7 = s.expDaily.slice(-7).reduce((a, b) => a + b, 0) / usageDays
  // How much of each row falls in the chosen period (the plan is a monthly fee).
  const f = (e: Expense) => (period === 'month' ? 1 : period === '7' ? (e.cat === 'Platform' ? 7 / 30 : last7) : e.cat === 'Platform' ? 1 : 0.91)
  const share = (e: Expense) => (camp === 'all' ? 1 : e.by[camp] ?? 0)
  const rows = s.expenses.filter((e) => (cat === 'all' || e.cat === cat) && (ch === 'all' || e.ch === ch) && (prov === 'all' || e.prov === prov))
    .map((e) => ({ e, cost: e.cost * f(e) * share(e), qty: Math.round(e.qty * f(e) * share(e)) })).sort((a, b) => b.cost - a.cost)
  const total = rows.reduce((a, r) => a + r.cost, 0)
  const allTotal = s.expenses.reduce((a, e) => a + e.cost * f(e), 0)
  const lastMonth = s.expenses.reduce((a, e) => a + e.cost * (e.cat === 'Platform' ? 1 : 0.91), 0)
  const scale = allTotal ? total / allTotal : 0
  const days = period === '7' ? s.expDaily.slice(-7) : period === 'last' ? s.expDaily.map((v, i) => +(v * 0.91 + Math.sin(i) * 3).toFixed(2)).concat([36.2, 39.8, 41.1, 38.4]) : s.expDaily
  const factor = (usage / usageDays) * scale
  const daily = days.map((v, i) => ({ d: period === 'last' ? `Aug ${i + 1}` : `Sep ${period === '7' ? 21 + i : i + 1}`, v: +(v * factor).toFixed(2) }))
  const byCat = Object.entries(rows.reduce<Record<string, number>>((m, r) => { m[r.e.cat] = (m[r.e.cat] ?? 0) + r.cost; return m }, {})).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v)

  const camps = s.campaigns
  const spendOf = (k: string) => s.expenses.reduce((a, e) => a + e.cost * f(e) * (e.by[k] ?? 0), 0)
  const booked = camps.reduce((a, c) => a + c.booked, 0); const replied = camps.reduce((a, c) => a + c.replied, 0); const revenue = camps.reduce((a, c) => a + c.revenue, 0)
  const budget = camps.reduce((a, c) => a + (c.budget ?? 0), 0)
  const projected = period === 'month' ? (allTotal - plan) / 27 * 30 + plan : allTotal
  const saving = SAVINGS.filter((x) => !applied.includes(x.id)).reduce((a, x) => a + x.save, 0)
  const periodLabel = period === 'month' ? 'This month so far' : period === '7' ? 'Last 7 days' : 'Last month (August)'

  const exportCsv = () => {
    const csv = [['Service', 'Provider', 'Category', 'Channel', 'Usage', 'Unit', 'Rate', 'Cost'], ...rows.map((r) => [r.e.n, r.e.prov, r.e.cat, CH_LABEL[r.e.ch], String(r.qty), r.e.unit, rateTxt(r.e), r.cost.toFixed(2)])].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'expenses.csv'; a.click(); URL.revokeObjectURL(a.href); toast.success('Expenses downloaded')
  }
  const answer = (q: string) => {
    const t = q.toLowerCase(); const top = rows.slice(0, 3)
    if (/reduce|save|cut|cheaper|lower/.test(t)) return `You can save about **${money(saving)} a month** without hurting results:\n\n${SAVINGS.filter((x) => !applied.includes(x.id)).map((x) => `- **${x.t}** — about ${money(x.save)}/month`).join('\n')}\n\nYour biggest costs are ${top.map((r) => `${r.e.n} (${money(r.cost)})`).join(', ')}. I saved this as a report in **Reports › Expenses**.`
    if (/campaign|per booking|which/.test(t)) { const L = camps.map((c) => ({ c, per: spendOf(c.id) / Math.max(1, c.booked) })).sort((a, b) => b.per - a.per); return `Cost per booking by campaign:\n\n${L.map(({ c, per }) => `- **${c.name}**: ${cents(per)}`).join('\n')}\n\n**${L[0].c.name}** costs the most per booking — it’s ${L[0].c.status === 'paused' ? 'paused, so few bookings came in' : 'reaching many people who don’t reply yet'}. Saved to **Reports › Expenses**.` }
    if (/why|went up|increase|higher/.test(t)) return `Spending rose about **24% in the last 7 days**, mostly from **AI calling** (more follow-up calls in Telecom — Mobility Q4) and **SMS** (3 new follow-up texts). Results rose too: bookings are up 18% in the same days. Saved to **Reports › Expenses**.`
    return `So far this month you’ve spent **${cents(allTotal)}**. Every $1 spent brought in about **${money(revenue / Math.max(1, allTotal))}** in sales. Your cost per booking is **${cents(allTotal / Math.max(1, booked))}**. Saved to **Reports › Expenses**.`
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Expenses" icon={<Receipt />} sub="What your AI team and connected services cost"
        actions={<>
          <Button variant="header" onClick={() => setAsk(true)}><Sparkles />Ask AI</Button>
          <Button variant="header" onClick={exportCsv}><Download />Download</Button>
          <Button variant="header" onClick={() => nav('/settings/billing')}><CreditCard />Billing</Button>
        </>} />
      <PageBody wide>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented value={period} onChange={setPeriod} options={[{ value: 'month', label: 'This month' }, { value: '7', label: 'Last 7 days' }, { value: 'last', label: 'Last month' }]} />
            <span className="flex-1" />
            <Select variant="button" value={cat} onValueChange={setCat} options={[{ value: 'all', label: 'All types' }, ...Object.keys(CAT_COLOR).map((k) => ({ value: k, label: k, icon: <span className="size-2 rounded-full" style={{ background: CAT_COLOR[k] }} /> }))]} />
            <Select variant="button" value={ch} onValueChange={setCh} options={[{ value: 'all', label: 'All channels' }, ...['call', 'sms', 'wa', 'email', 'msg'].map((k) => ({ value: k, label: CH_LABEL[k], icon: <PlatIcon p={k as Platform} size={14} tip={false} /> }))]} />
            <Select variant="button" value={prov} onValueChange={setProv} options={[{ value: 'all', label: 'All services' }, ...[...new Set(s.expenses.map((e) => e.prov))].map((p) => ({ value: p, label: p }))]} />
            <Select variant="button" align="end" value={camp} onValueChange={setCamp} options={[{ value: 'all', label: 'All campaigns' }, ...camps.map((c) => ({ value: c.id, label: c.name }))]} />
          </div>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 gap-px bg-border-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div className="bg-surface p-5">
                <div className="text-sm text-muted">{periodLabel}{cat !== 'all' || ch !== 'all' || prov !== 'all' || camp !== 'all' ? ' · filtered' : ''}</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[28px] font-semibold leading-8 tracking-tight tabular">{cents(total)}</span>
                  {period === 'month' && scale === 1 && <span className="flex items-center gap-1 text-sm text-muted"><TrendingUp className="size-4" />On track for {money(projected)} by Sep 30</span>}
                  {period === 'last' && <span className="text-sm text-muted">{money(lastMonth)} in total</span>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[['Per reply', cents(total / Math.max(1, replied))], ['Per booking', cents(total / Math.max(1, booked))], ['Sales per $1', money(revenue / Math.max(1, allTotal))], ['Budget used', `${Math.round((allTotal / Math.max(1, budget)) * 100)}%`]].map(([l, v]) => (
                    <div key={l}><div className="text-xs text-muted">{l}</div><div className="text-lg font-semibold tabular">{v}</div></div>
                  ))}
                </div>
                <Progress value={(allTotal / Math.max(1, budget)) * 100} className="mt-3" />
                <p className="mt-1.5 text-xs text-muted">{money(allTotal)} of {money(budget)} across your campaign budgets</p>
              </div>
              <div className="flex items-center gap-4 bg-surface p-5">
                <div className="relative size-[132px] shrink-0">
                  <ResponsiveContainer><PieChart><Pie data={byCat} dataKey="v" nameKey="k" innerRadius={44} outerRadius={64} paddingAngle={1.5} stroke="none" animationDuration={600}>{byCat.map((c) => <Cell key={c.k} fill={CAT_COLOR[c.k]} />)}</Pie><RTip formatter={(v) => cents(Number(v))} contentStyle={{ borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13 }} /></PieChart></ResponsiveContainer>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {byCat.map((c) => (
                    <li key={c.k}><button onClick={() => setCat(cat === c.k ? 'all' : c.k)} className={cn('flex w-full items-center gap-2 rounded-control px-1.5 py-0.5 text-sm hover:bg-subtle-2', cat === c.k && 'bg-subtle')}>
                      <span className="size-2 shrink-0 rounded-full" style={{ background: CAT_COLOR[c.k] }} /><span className="flex-1 truncate text-left">{c.k}</span><span className="tabular">{money(c.v)}</span><span className="w-10 text-right text-xs text-muted tabular">{Math.round((c.v / Math.max(1, total)) * 100)}%</span>
                    </button></li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader title="Spend per day" description="Usage costs. Your monthly plan is billed on the 1st." />
              <CardBody className="h-[230px]">
                <ResponsiveContainer>
                  <AreaChart data={daily} margin={{ left: -12, right: 4, top: 8 }}>
                    <defs><linearGradient id="exp-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid vertical={false} stroke="var(--border-2)" />
                    <XAxis dataKey="d" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} interval={period === '7' ? 0 : 4} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <RTip formatter={(v) => [cents(Number(v)), 'Spent']} cursor={{ stroke: 'var(--border-strong)' }} contentStyle={{ borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13, color: 'var(--text)' }} />
                    <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} fill="url(#exp-fill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader title="Ways to save" description={saving ? `About ${money(saving)} a month` : 'All suggestions applied'} icon={<Sparkles />} />
              {SAVINGS.map((x) => { const on = applied.includes(x.id); return (
                <div key={x.id} className="flex items-start gap-3 border-t border-border-2 px-4 py-2.5">
                  <div className="min-w-0 flex-1"><div className={cn('text-sm font-medium', on && 'text-muted line-through')}>{x.t}</div><div className="text-xs text-muted">{x.d}</div></div>
                  {on ? <Badge tone="green"><Check />Applied</Badge> : <Button size="sm" onClick={() => { s.setPref('savingsApplied', [...applied, x.id]); toast.success(`Applied · saves about ${money(x.save)} a month`) }}>Save {money(x.save)}</Button>}
                </div>
              ) })}
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader title="Breakdown" description="Every service you pay for, with how much you used. Click a row for details." />
            <div className="overflow-x-auto">
              <Table>
                <thead><tr><Th>Service</Th><Th>Type</Th><Th>Channel</Th><Th align="right">Usage</Th><Th align="right">Rate</Th><Th className="w-[180px]">Share</Th><Th align="right">Cost</Th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <Tr key={r.e.n} clickable onClick={() => setRow(r.e)}>
                      <Td><span className="block font-medium">{r.e.n}</span><span className="block text-xs text-muted">{r.e.prov}</span></Td>
                      <Td><span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: CAT_COLOR[r.e.cat] }} />{r.e.cat}</span></Td>
                      <Td>{r.e.ch === 'all' ? <span className="text-muted">All</span> : <span className="flex items-center gap-1.5"><PlatIcon p={r.e.ch as Platform} size={14} tip={false} />{CH_LABEL[r.e.ch]}</span>}</Td>
                      <Td align="right">{nf(r.qty)} <span className="text-muted">{r.e.unit}</span></Td>
                      <Td align="right" className="text-muted">{rateTxt(r.e)}</Td>
                      <Td><span className="flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill-selected"><span className="block h-full rounded-full" style={{ width: `${(r.cost / Math.max(0.01, rows[0].cost)) * 100}%`, background: CAT_COLOR[r.e.cat] }} /></span><span className="w-9 text-right text-xs text-muted tabular">{Math.round((r.cost / Math.max(0.01, total)) * 100)}%</span></span></Td>
                      <Td align="right" className="font-medium">{cents(r.cost)}</Td>
                    </Tr>
                  ))}
                  <tr className="bg-subtle-2"><Td colSpan={6} className="font-semibold">Total</Td><Td align="right" className="font-semibold">{cents(total)}</Td></tr>
                </tbody>
              </Table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="By campaign" description="Spend, budget and what each booking cost" />
            <div className="overflow-x-auto">
              <Table>
                <thead><tr><Th>Campaign</Th><Th align="right">Spent</Th><Th className="w-[240px]">Budget</Th><Th align="right">Bookings</Th><Th align="right">Per booking</Th><Th align="right">Sales</Th><Th className="w-10" /></tr></thead>
                <tbody>{camps.map((c) => { const sp = spendOf(c.id); const pct = c.budget ? (sp / c.budget) * 100 : 0; return (
                  <Tr key={c.id} clickable onClick={() => nav(`/campaigns/${c.id}`)}>
                    <Td className="font-medium">{c.name}{c.status === 'paused' && <Badge tone="amber" className="ml-2">Paused</Badge>}</Td>
                    <Td align="right">{cents(sp)}</Td>
                    <Td><span className="flex items-center gap-2"><Progress value={pct} color={pct > 90 ? 'var(--danger)' : pct > 75 ? 'var(--warning-fill)' : undefined} className="flex-1" /><span className="w-24 text-right text-xs text-muted tabular">{c.budget ? `${Math.round(pct)}% of ${money(c.budget)}` : 'No budget'}</span></span></Td>
                    <Td align="right">{nf(c.booked)}</Td>
                    <Td align="right">{cents(sp / Math.max(1, c.booked))}</Td>
                    <Td align="right">{money(c.revenue)}</Td>
                    <Td className="py-0" onClick={(e) => e.stopPropagation()}><Tip content="Change budget"><Button variant="ghost" size="icon-sm" aria-label={`Change budget for ${c.name}`} onClick={async () => { const v = await askText({ title: `Monthly budget · ${c.name}`, label: 'Budget in dollars', value: String(c.budget ?? ''), ok: 'Save budget', hint: 'You get a notice at 80%, and the campaign pauses at 100% unless you allow more.' }); if (v && +v.replace(/[^\d.]/g, '') > 0) { s.updateCampaign(c.id, { budget: +v.replace(/[^\d.]/g, '') }); toast.success(`Budget set to ${money(+v.replace(/[^\d.]/g, ''))}`) } }}><Pencil /></Button></Tip></Td>
                  </Tr>
                ) })}</tbody>
              </Table>
            </div>
          </Card>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted"><Info className="size-3.5" />Costs update every hour. Prices come from each service; Crewline adds nothing on top.</p>
        </div>
      </PageBody>

      <Sheet open={!!row} onOpenChange={(o) => !o && setRow(null)} width={480} title={row?.n} description={row ? `${row.prov} · ${rateTxt(row)}` : undefined}>
        {row && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3"><div className="text-xs text-muted">Cost this month</div><div className="text-2xl font-semibold tabular">{cents(row.cost)}</div></Card>
              <Card className="p-3"><div className="text-xs text-muted">Used</div><div className="text-2xl font-semibold tabular">{nf(row.qty)}</div><div className="text-xs text-muted">{row.unit}</div></Card>
            </div>
            <Card className="overflow-hidden">
              <CardHeader title="By campaign" />
              {camps.map((c) => <div key={c.id} className="flex items-center gap-3 border-t border-border-2 px-4 py-2 text-sm"><span className="min-w-0 flex-1 truncate">{c.name}</span><span className="w-24"><Progress value={(row.by[c.id] ?? 0) * 100} /></span><span className="w-16 text-right tabular">{cents(row.cost * (row.by[c.id] ?? 0))}</span></div>)}
            </Card>
            <Card><CardBody className="space-y-1 text-sm"><h3>What this is</h3><p className="text-muted">{row.cat === 'AI' ? 'The AI thinking behind replies, calls and emails. You pay for the words it reads and writes.' : row.cat === 'Voice' ? 'Turning speech into text and text into a natural voice on calls.' : row.cat === 'Messaging' ? 'What carriers and apps charge to deliver your messages.' : row.cat === 'Telephony' ? 'Phone numbers and call minutes on the phone network.' : row.cat === 'Data' ? 'Looking up missing emails, numbers and updated details.' : 'Your Crewline plan.'}</p></CardBody></Card>
            <Button className="w-full" onClick={() => { setRow(null); setAsk(true) }}><Sparkles />Ask how to spend less on this</Button>
          </div>
        )}
      </Sheet>
      <AskSheet open={ask} onOpenChange={setAsk} title="Ask about expenses" description={periodLabel}
        suggestions={['How can I reduce my costs?', 'Which campaign costs the most per booking?', 'Why did spending go up this week?', 'Is my spending worth it?']}
        answer={answer} onAnswer={(q) => { s.addReport({ name: `Expenses: ${q.replace(/\?$/, '')}`, folder: 'r3', date: '2026-09-27', by: 'Max', kind: 'Expenses', q }); toast.success('Saved to Reports › Expenses') }} />
    </div>
  )
}
