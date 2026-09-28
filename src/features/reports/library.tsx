import * as React from 'react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Folder, FolderOpen, FolderPlus, FileText, MoreHorizontal, Pencil, Trash2, FolderInput, Download, Link2, Sparkles, Mic, Check, ChevronRight, CircleCheck, AlertTriangle, Copy } from 'lucide-react'
import { cn, money, nf, plural } from '@/lib/utils'
import { useStore } from '@/store'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, EmptyState } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/input'
import { Progress } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SearchRow } from '@/components/app/index-table'
import { AnalyzeDialog, type Analysis } from '@/features/shared/ai'
import { dShort } from '@/data/seed'
import type { Report, ReportFolder } from '@/data/types'

const hash = (s: string) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
export const dateTxt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** Path from the top folder down to this one. */
function pathOf(id: string | null, folders: ReportFolder[]): ReportFolder[] {
  const out: ReportFolder[] = []; let cur = folders.find((f) => f.id === id)
  while (cur) { out.unshift(cur); cur = folders.find((f) => f.id === cur!.parent) }
  return out
}
/** A folder and everything inside it. */
const withChildren = (id: string, folders: ReportFolder[]): string[] => [id, ...folders.filter((f) => f.parent === id).flatMap((f) => withChildren(f.id, folders))]

/** Which folder and type a question belongs in. */
export function kindOf(q: string): { kind: string; folder: string } {
  const t = q.toLowerCase()
  if (/book|appointment|no.?show/.test(t)) return { kind: 'Bookings', folder: 'r4' }
  if (/expens|cost|spend|budget/.test(t)) return { kind: 'Expenses', folder: 'r3' }
  if (/agent|sarah|ellie|robert|rhea/.test(t)) return { kind: 'Agents', folder: 'r2' }
  if (/campaign|telecom|mobility|brooklyn|real estate/.test(t)) return { kind: 'Campaign', folder: /brooklyn|real estate/.test(t) ? 'r1b' : 'r1a' }
  if (/folder|database|contacts|leads/.test(t)) return { kind: 'Database', folder: 'r5' }
  return { kind: 'Analysis', folder: 'r6' }
}

/** The report document: what the AI found, written for a person to read. */
function docFor(r: Report) {
  const h = hash(r.id + r.name); const v = (a: number, b: number) => a + (h % (b - a + 1))
  const base: Record<string, { kpis: [string, string][]; bars: string; findings: string[]; recs: string[]; summary: string }> = {
    Campaign: { summary: 'Replies are strong and most bookings come from the second message. The follow-up call the next day does most of the work.', kpis: [['People reached', nf(v(800, 1300))], ['Reply rate', `${v(24, 34)}%`], ['Booked', nf(v(90, 140))], ['Sales', money(v(28, 40) * 1000)]], bars: 'Bookings per week', findings: ['The price in the first message doubles replies', 'Evening texts (6–8 PM) get the most replies', '12% of people ask about contracts — answered well'], recs: ['Move the opening text to 6 PM', 'Add a follow-up call after 1 day for people who opened but didn’t reply', 'Give Sarah more of the traffic (best conversion)'] },
    Agents: { summary: 'Sarah and Rhea lead on conversion. Robert talks the most but hands over often on price questions.', kpis: [['Conversations', nf(v(3800, 5200))], ['Average success', `${v(72, 84)}%`], ['Hand-overs', `${v(2, 5)}%`], ['Best agent', 'Sarah']], bars: 'Conversions by agent', findings: ['Hand-overs mostly happen on price negotiation', 'Chat agents reply in 4 seconds on average', 'Voice agents book 30% more appointments'], recs: ['Add a pricing Q&A for Robert', 'Let Rhea handle all booking requests', 'Review Ellie’s opener — reply rate dropped 6%'] },
    Expenses: { summary: 'AI calling and SMS are two-thirds of the spend. Moving part of the texting to WhatsApp would save the most.', kpis: [['Total spend', money(v(1400, 1800))], ['Per booking', `$${(v(140, 220) / 100).toFixed(2)}`], ['Budget used', `${v(70, 86)}%`], ['Possible saving', money(v(120, 180))]], bars: 'Spend by week', findings: ['AI calling is the biggest cost (34%)', 'SMS costs rose 18% with the new follow-ups', 'Data lookups found nothing new 412 times'], recs: ['Send WhatsApp to customers who have it', 'Shorten voicemails to 20 seconds', 'Skip lookups for complete contacts'] },
    Bookings: { summary: 'Bookings are steady and no-shows fell after the second reminder was added. Saturdays fill first.', kpis: [['Bookings', nf(v(220, 320))], ['Completed', `${v(84, 92)}%`], ['No-shows', `${v(6, 11)}%`], ['Busiest day', 'Saturday']], bars: 'Bookings per week', findings: ['No-shows drop by a third with a 2-hour reminder', 'Most bookings come in by phone (58%)', 'Rhea books 60% of appointments'], recs: ['Add Saturday afternoon hours', 'Offer a waitlist for full days', 'Text a reminder 2 hours before every booking'] },
    Database: { summary: 'Most of the folder is reachable. About 1 in 10 numbers look dead and should be cleaned up.', kpis: [['Contacts', nf(v(18000, 21000))], ['Reached', `${v(58, 72)}%`], ['Dead numbers', nf(v(1400, 2200))], ['Missing emails', nf(v(3000, 5000))]], bars: 'Contacts reached per week', findings: ['Numbers from the 2023 import fail most often', '2,100 contacts never opened a message', 'Emails are missing for 22% of contacts'], recs: ['Move dead numbers to their own folder', 'Run data filling on the 2023 import', 'Try email for people who never reply to texts'] },
  }
  return base[r.kind] ?? { summary: 'Here’s what stood out across your campaigns, agents, bookings and expenses.', kpis: [['Conversations', nf(v(4000, 6000))], ['Bookings', nf(v(300, 420))], ['Sales', money(v(120, 180) * 1000)], ['Spend', money(v(1400, 1800))]], bars: 'Results per week', findings: ['Inbound leads convert 2× better than outbound', 'The busiest hour is 6–7 PM', 'Replies are faster on WhatsApp'], recs: ['Put more budget on inbound ads', 'Schedule outbound texts for the evening', 'Offer WhatsApp in every campaign'] }
}

/** Opens a saved report as a document you can read, analyze again, move or download. */
export function ReportViewer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const s = useStore()
  const r = s.reports.find((x) => x.id === id)
  const [analyze, setAnalyze] = React.useState(false)
  if (!r) return null
  const d = docFor(r); const h = hash(r.id)
  const bars = Array.from({ length: 6 }, (_, i) => ({ w: `Wk ${i + 1}`, n: 20 + ((h >> i) % 17) + i * 3 }))
  const folder = pathOf(r.folder, s.reportFolders).map((f) => f.name).join(' › ')
  const analysis: Analysis = { title: `${r.name} · analyzed again`, subject: `From the report saved ${dateTxt(r.date)}`, kpis: d.kpis.map(([l, v]) => ({ l, v })), wrong: d.findings.slice(0, 2), works: [d.findings[2], 'Agents replied to everyone within a minute'], suggestions: d.recs, folder: r.folder, kind: r.kind }
  return (
    <>
      <Dialog open={!!r} onOpenChange={(o) => !o && onClose()}>
        <DialogContent size="lg" title={r.name} description={`${folder} · ${dateTxt(r.date)} · by ${r.by}`}
          footer={<>
            <Button className="mr-auto" onClick={() => { navigator.clipboard?.writeText(`https://app.crewline.app/r/${r.id}`); toast('Link copied — only your team can open it') }}><Link2 />Copy link</Button>
            <Button onClick={() => toast('PDF downloaded (demo)')}><Download />PDF</Button>
            <Button variant="primary" onClick={() => setAnalyze(true)}><Sparkles />Analyze again with AI</Button>
          </>}>
          <article className="space-y-4">
            {r.q && <p className="rounded-control bg-subtle-2 px-3 py-2 text-sm"><span className="text-muted">You asked: </span>“{r.q}”</p>}
            <p className="text-sm leading-6">{d.summary}</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{d.kpis.map(([l, v]) => <div key={l} className="rounded-card border border-border p-3"><div className="text-xs text-muted">{l}</div><div className="text-2xl font-semibold tabular">{v}</div></div>)}</div>
            <div className="rounded-card border border-border p-3">
              <h3 className="mb-2">{d.bars}</h3>
              <div className="h-[180px]"><ResponsiveContainer><BarChart data={bars} margin={{ left: -24, right: 4, top: 4 }}><CartesianGrid vertical={false} stroke="var(--border-2)" /><XAxis dataKey="w" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} /><RTip cursor={{ fill: 'var(--fill-hover)' }} contentStyle={{ borderRadius: 8, border: 'none', background: 'var(--surface)', boxShadow: 'var(--shadow-tooltip)', fontSize: 13 }} /><Bar dataKey="n" name={d.bars} fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} /></BarChart></ResponsiveContainer></div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-card border border-border p-3"><h3 className="mb-2">What we found</h3><ul className="space-y-1.5">{d.findings.map((f, i) => <li key={f} className="flex gap-2 text-sm">{i < 2 ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> : <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />}{f}</li>)}</ul></div>
              <div className="rounded-card border border-border p-3"><h3 className="mb-2">What to do next</h3><ol className="list-decimal space-y-1.5 pl-5 text-sm">{d.recs.map((x) => <li key={x}>{x}</li>)}</ol></div>
            </div>
          </article>
        </DialogContent>
      </Dialog>
      <AnalyzeDialog open={analyze} onOpenChange={setAnalyze} a={analysis} onApply={() => toast('Max will track these changes and report back next week')} />
    </>
  )
}

/** "Generate with AI": ask in your own words (typed or spoken), AI reads everything and writes a report into a folder. */
export function GenerateDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: (id: string) => void }) {
  const s = useStore()
  const [q, setQ] = React.useState(''); const [folder, setFolder] = React.useState('auto'); const [step, setStep] = React.useState(-1)
  const steps = ['Reading campaigns and conversations', 'Checking bookings and agents', 'Adding up expenses', 'Writing the report']
  React.useEffect(() => { if (open) { setQ(''); setFolder('auto'); setStep(-1) } }, [open])
  const run = () => {
    setStep(0); let i = 0
    const t = setInterval(() => {
      i++; setStep(i)
      if (i >= steps.length) {
        clearInterval(t)
        const k = kindOf(q); const f = folder === 'auto' ? k.folder : folder
        const name = q.trim().replace(/\?$/, '').replace(/^./, (c) => c.toUpperCase()).slice(0, 80)
        const r = s.addReport({ name, folder: f, date: '2026-09-27', by: 'Max', kind: k.kind, q: q.trim() })
        toast.success(`Saved to Reports › ${pathOf(f, s.reportFolders).map((x) => x.name).join(' › ')}`)
        onOpenChange(false); onDone(r.id)
      }
    }, 700)
  }
  const ideas = ['How many bookings did we make this month, which agents were involved, and how can we optimize?', 'How is Telecom — Mobility Q4 going?', 'Compare inbound and outbound this month', 'Monthly expenses report with ways to save']
  return (
    <Dialog open={open} onOpenChange={(o) => step < 0 && onOpenChange(o)}>
      <DialogContent size="md" title={<span className="flex items-center gap-2"><Sparkles className="size-4" />Generate a report with AI</span>} description="AI looks through campaigns, contacts, agents, bookings and expenses"
        footer={step < 0 ? <>
          <Select variant="button" className="mr-auto" value={folder} onValueChange={setFolder} options={[{ value: 'auto', label: 'Save in: best folder' }, ...s.reportFolders.map((f) => ({ value: f.id, label: `Save in: ${pathOf(f.id, s.reportFolders).map((x) => x.name).join(' › ')}` }))]} />
          <Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!q.trim()} onClick={run}><Sparkles />Generate</Button>
        </> : undefined}>
        {step < 0 ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Textarea autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to know? e.g. How many bookings did we make, which agents were involved, and how can we do better?" className="min-h-24" />
              <Button variant="ghost" size="icon" aria-label="Say it instead" onClick={() => setQ(ideas[0])}><Mic /></Button>
            </div>
            <div className="flex flex-col items-start gap-1.5">{ideas.map((x) => <Button key={x} className="h-auto min-h-7 whitespace-normal py-1 text-left" onClick={() => setQ(x)}>{x}</Button>)}</div>
          </div>
        ) : (
          <div className="mx-auto max-w-[380px] space-y-3 py-6">
            <Progress value={(step / steps.length) * 100} />
            {steps.map((x, i) => <div key={x} className={cn('flex items-center gap-2 text-sm', i >= step && 'text-muted')}><span className={cn('flex size-4 items-center justify-center rounded-full', i < step ? 'bg-success text-white' : i === step ? 'animate-spin border-2 border-text border-t-transparent' : 'border border-border-strong')}>{i < step && <Check className="size-2.5" strokeWidth={3} />}</span>{x}</div>)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Report library: Windows-style folders and subfolders, each report named and dated. */
export function Library({ onOpen, onGenerate }: { onOpen: (id: string) => void; onGenerate: () => void }) {
  const s = useStore()
  const [cur, setCur] = React.useState<string | null>(null); const [q, setQ] = React.useState('')
  const folders = s.reportFolders
  const inFolder = (id: string) => s.reports.filter((r) => withChildren(id, folders).includes(r.folder)).length
  const subs = folders.filter((f) => f.parent === cur)
  const list = s.reports.filter((r) => (q ? `${r.name} ${r.kind}`.toLowerCase().includes(q.toLowerCase()) : cur ? r.folder === cur : true)).sort((a, b) => b.date.localeCompare(a.date))
  const path = pathOf(cur, folders)
  const newFolder = async () => {
    const n = await askText({ title: cur ? `New folder in ${path[path.length - 1].name}` : 'New folder', label: 'Folder name', placeholder: 'e.g. Q4 reviews', ok: 'Create folder' })
    if (n) { s.patch('reportFolders', (L) => [...L, { id: `rf${Date.now()}`, name: n, parent: cur }]); toast.success(`Folder “${n}” created`) }
  }
  const renameFolder = async (f: ReportFolder) => { const n = await askText({ title: 'Rename folder', label: 'Folder name', value: f.name, ok: 'Rename' }); if (n) s.patch('reportFolders', (L) => L.map((x) => (x.id === f.id ? { ...x, name: n } : x))) }
  const deleteFolder = async (f: ReportFolder) => {
    const ids = withChildren(f.id, folders); const n = s.reports.filter((r) => ids.includes(r.folder)).length
    if (!(await askConfirm({ title: `Delete “${f.name}”?`, description: n ? `Its ${plural(n, 'report')} move to “${folders.find((x) => x.id === f.parent)?.name ?? 'Max reports'}”.` : 'The folder is empty.', ok: 'Delete folder', danger: true }))) return
    const to = f.parent ?? 'r6'
    s.patch('reports', (L) => L.map((r) => (ids.includes(r.folder) ? { ...r, folder: to } : r))); s.patch('reportFolders', (L) => L.filter((x) => !ids.includes(x.id)))
    if (cur && ids.includes(cur)) setCur(f.parent); toast.success(`“${f.name}” deleted`)
  }
  const Tree = ({ parent, depth }: { parent: string | null; depth: number }) => (
    <>{folders.filter((f) => f.parent === parent).map((f) => (
      <React.Fragment key={f.id}>
        <div className={cn('group flex h-8 items-center gap-1 rounded-control pr-1 transition-colors', cur === f.id && !q ? 'bg-fill-selected' : 'hover:bg-fill-hover')} style={{ paddingLeft: 8 + depth * 16 }}>
          <button onClick={() => { setCur(f.id); setQ('') }} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
            {cur === f.id ? <FolderOpen className="size-4 shrink-0 text-icon" /> : <Folder className="size-4 shrink-0 text-icon" />}<span className="truncate">{f.name}</span><span className="ml-auto text-xs text-muted tabular">{inFolder(f.id)}</span>
          </button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" aria-label={`${f.name} options`}><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start"><DropdownMenuItem onSelect={() => renameFolder(f)}><Pencil />Rename</DropdownMenuItem><DropdownMenuItem danger onSelect={() => deleteFolder(f)}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
        <Tree parent={f.id} depth={depth + 1} />
      </React.Fragment>
    ))}</>
  )
  return (
    <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit p-2">
        <button onClick={() => { setCur(null); setQ('') }} className={cn('flex h-8 w-full items-center gap-2 rounded-control px-2 text-left text-sm', cur === null && !q ? 'bg-fill-selected font-medium' : 'hover:bg-fill-hover')}><FileText className="size-4 text-icon" />All reports<span className="ml-auto text-xs text-muted tabular">{s.reports.length}</span></button>
        <div className="my-1 h-px bg-border-2" />
        <Tree parent={null} depth={0} />
        <Button variant="ghost" className="mt-1 w-full justify-start" onClick={newFolder}><FolderPlus />New folder</Button>
      </Card>
      <Card className="min-w-0 overflow-hidden">
        <div className="flex min-h-11 flex-wrap items-center gap-1 border-b border-border-2 px-3 py-1.5 text-sm">
          <button onClick={() => setCur(null)} className="text-muted hover:text-text">Reports</button>
          {path.map((f) => <React.Fragment key={f.id}><ChevronRight className="size-3.5 text-faint" /><button onClick={() => setCur(f.id)} className={cn(f.id === cur ? 'font-medium' : 'text-muted hover:text-text')}>{f.name}</button></React.Fragment>)}
          <span className="flex-1" /><Button size="sm" onClick={newFolder}><FolderPlus />{cur ? 'New subfolder' : 'New folder'}</Button>
        </div>
        <SearchRow value={q} onChange={setQ} placeholder="Search every report" />
        {!q && subs.length > 0 && (
          <div className="grid grid-cols-2 gap-2 border-b border-border-2 p-3 sm:grid-cols-3 lg:grid-cols-4">
            {subs.map((f) => <button key={f.id} onDoubleClick={() => setCur(f.id)} onClick={() => setCur(f.id)} className="flex items-center gap-2.5 rounded-card border border-border px-3 py-2.5 text-left transition-colors hover:bg-subtle-2"><Folder className="size-5 shrink-0 fill-[color-mix(in_srgb,var(--warning-fill)_35%,transparent)] text-[color-mix(in_srgb,var(--warning-fill)_70%,var(--text))]" /><span className="min-w-0"><span className="block truncate text-sm font-medium">{f.name}</span><span className="block text-xs text-muted">{plural(inFolder(f.id), 'report')}</span></span></button>)}
          </div>
        )}
        {list.length ? (
          <div className="overflow-x-auto">
            <Table>
              <thead><tr><Th>Name</Th><Th>Type</Th>{(q || !cur) && <Th>Folder</Th>}<Th>By</Th><Th>Date</Th><Th className="w-10" /></tr></thead>
              <tbody>{list.map((r) => (
                <Tr key={r.id} clickable onClick={() => onOpen(r.id)}>
                  <Td className="max-w-[420px]"><span className="flex items-center gap-2"><FileText className="size-4 shrink-0 text-icon" /><span className="truncate font-medium">{r.name}</span></span></Td>
                  <Td><Badge>{r.kind}</Badge></Td>
                  {(q || !cur) && <Td className="text-muted">{pathOf(r.folder, folders).map((f) => f.name).join(' › ')}</Td>}
                  <Td>{r.by === 'Max' ? <span className="flex items-center gap-1"><Sparkles className="size-3.5 text-icon" />Max</span> : r.by}</Td>
                  <Td className="text-muted">{dShort(r.date)}</Td>
                  <Td className="py-0" onClick={(e) => e.stopPropagation()}><ReportMenu r={r} /></Td>
                </Tr>
              ))}</tbody>
            </Table>
          </div>
        ) : !q && subs.length ? <p className="px-4 py-3 text-sm text-muted">No reports directly in this folder — open a folder above.</p>
          : <EmptyState compact icon={<Folder />} title={q ? 'No reports match' : 'This folder is empty'} description="Generate a report with AI, or save one from Max, Expenses or a campaign." action={<Button onClick={onGenerate}><Sparkles />Generate with AI</Button>} />}
      </Card>
    </div>
  )
}

function ReportMenu({ r }: { r: Report }) {
  const s = useStore()
  const rename = async () => { const n = await askText({ title: 'Rename report', label: 'Name', value: r.name, ok: 'Rename' }); if (n) s.patch('reports', (L) => L.map((x) => (x.id === r.id ? { ...x, name: n } : x))) }
  const del = async () => { if (await askConfirm({ title: `Delete “${r.name}”?`, description: 'This can’t be undone.', ok: 'Delete report', danger: true })) { s.patch('reports', (L) => L.filter((x) => x.id !== r.id)); toast.success('Report deleted') } }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`${r.name} options`}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><FolderInput />Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">{s.reportFolders.map((f) => <DropdownMenuItem key={f.id} disabled={f.id === r.folder} onSelect={() => { s.patch('reports', (L) => L.map((x) => (x.id === r.id ? { ...x, folder: f.id } : x))); toast.success(`Moved to ${f.name}`) }}><Folder />{pathOf(f.id, s.reportFolders).map((x) => x.name).join(' › ')}</DropdownMenuItem>)}</DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={rename}><Pencil />Rename</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { s.addReport({ ...r, name: `${r.name} (copy)`, date: '2026-09-27', by: 'You' }); toast.success('Copy made') }}><Copy />Make a copy</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast('PDF downloaded (demo)')}><Download />Download PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onSelect={del}><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
