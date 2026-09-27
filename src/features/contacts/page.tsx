import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Upload, MoreHorizontal, Search, Filter, X, Sparkles, Mic, Folder, FolderPlus, Rows3, LayoutGrid, ShieldBan, HeartPulse, Users, Copy, AlertTriangle, ChevronDown, ArrowUpDown, Columns3, Megaphone, Tag, Trash2, Kanban, FolderInput, Pencil, ChevronRight, FolderOpen, Play, CornerDownRight, Check, RefreshCw, Settings2, Download } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { PageBody, PageHeader, Toolbar } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox, Kbd, Switch } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, EmptyState } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AiMark, DirIcon } from '@/components/app/icons'
import { StageTag, AgentChip } from '@/components/app/bits'
import { FILTERS, FD, runFilters, sayFilter, parseNL, score, type Filter as FilterT } from './filters'
import { AddContactDialog, ImportDialog, SaveFolderDialog, PhoneMenu, MissingDialog, DuplicatesDialog, EnrichDialog, ContactSettingsDialog } from './dialogs'
import type { Contact } from '@/data/types'
import { agoTxt } from '@/data/seed'

type View = 'rows' | 'folders' | 'dnc' | 'health'
const COLS = [['phone', 'Phone'], ['email', 'Email'], ['stage', 'Stage'], ['camp', 'Campaign'], ['source', 'Lead source'], ['agent', 'Agent'], ['last', 'Last contacted'], ['purchase', 'Last purchase'], ['score', 'Score'], ['city', 'City'], ['tags', 'Tags']] as const

export function ContactsPage() {
  const nav = useNavigate(); const [sp, setSp] = useSearchParams()
  const s = useStore()
  const view = (sp.get('view') as View) || (sp.get('tab') === 'health' ? 'health' : 'rows')
  const setView = (v: View) => { sp.set('view', v); sp.delete('tab'); setSp(sp, { replace: true }) }
  const openFolder = sp.get('folder')
  const [filters, setFilters] = React.useState<FilterT[]>([]); const [match, setMatch] = React.useState<'all' | 'any'>('all')
  const [q, setQ] = React.useState(''); const [nl, setNl] = React.useState(''); const [nlNote, setNlNote] = React.useState('')
  const [sel, setSel] = React.useState<Set<string>>(new Set())
  const [cols, setCols] = React.useState<string[]>(['phone', 'email', 'stage', 'camp', 'source', 'agent', 'last', 'score'])
  const [sort, setSort] = React.useState<{ k: string; d: 1 | -1 }>({ k: 'lastDays', d: 1 })
  const [dlg, setDlg] = React.useState<string | null>(sp.get('import') ? 'import' : null)
  const [enrichIds, setEnrichIds] = React.useState<string[]>([])
  const [settingsTab, setSettingsTab] = React.useState('fields')

  const folder = s.folders.find((f) => f.id === openFolder)
  const base = React.useMemo(() => {
    let L = s.contacts
    if (folder) L = L.filter((c) => c.folder === folder.id || s.folders.some((f) => f.parent === folder.id && f.id === c.folder))
    if (q) { const ql = q.toLowerCase(); L = L.filter((c) => `${c.name} ${c.phone} ${c.email} ${c.city} ${c.zip} ${c.stage} ${c.source}`.toLowerCase().includes(ql)) }
    return runFilters(L, filters, match)
  }, [s.contacts, folder, q, filters, match])
  const rows = React.useMemo(() => [...base].sort((a, b) => { const va = (a as any)[sort.k] ?? '', vb = (b as any)[sort.k] ?? ''; return (va > vb ? 1 : va < vb ? -1 : 0) * sort.d }), [base, sort])
  const allSel = rows.length > 0 && rows.every((c) => sel.has(c.id))

  const runNl = (text = nl) => { if (!text.trim()) return; const r = parseNL(text); setFilters(r.filters); setNlNote(r.note || `Applied ${r.filters.length} filter${r.filters.length === 1 ? '' : 's'}.`); setSel(new Set()) }
  const tiles = [
    { k: 'missing', l: 'Missing details', n: s.contacts.filter((c) => !c.email || !c.name || !c.address).length, I: AlertTriangle, tone: 'text-warning', d: 'names, emails, addresses' },
    { k: 'dups', l: 'Duplicates', n: 1202 + s.dups.length - 5, I: Copy, tone: 'text-warning', d: 'detected across imports' },
    { k: 'notresp', l: 'Not responding', n: s.contacts.filter((c) => score(c) === 'Not responding').length, I: HeartPulse, tone: 'text-muted', d: '3+ tries, no reply' },
    { k: 'dead', l: 'Dead numbers', n: s.contacts.filter((c) => score(c) === 'Dead').length, I: ShieldBan, tone: 'text-danger', d: 'matched your dead rules' },
    { k: 'dnc', l: 'Do-Not-Contact', n: s.dnc.length, I: ShieldBan, tone: 'text-muted', d: 'skipped in every campaign' },
  ]
  const onTile = (k: string) => { if (k === 'missing') setDlg('missing'); else if (k === 'dups') setDlg('dups'); else if (k === 'dnc') setView('dnc'); else { setView('rows'); setFilters([{ k: 'score', v: [k === 'dead' ? 'Dead' : 'Not responding'] }]) } }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Contacts" sub={`${nf(50214 + s.contacts.length - 90)} people · ${nf(s.folders.filter((f) => !f.group).length)} folders`} icon={<Users />}
        actions={<>
          <Button size="sm" variant="ai" className="hidden md:inline-flex" onClick={() => { setEnrichIds(s.contacts.filter((c) => !c.email || !c.name).map((c) => c.id)); setDlg('enrich') }}><Sparkles />Fill missing data</Button>
          <Button size="sm" onClick={() => setDlg('import')}><Upload />Import</Button>
          <Button size="sm" variant="primary" onClick={() => setDlg('add')}><Plus />Add contact</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label="More"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => { setSettingsTab('fields'); setDlg('settings') }}><Settings2 />Custom fields</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setSettingsTab('sources'); setDlg('settings') }}><CornerDownRight />Lead sources</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setSettingsTab('dead'); setDlg('settings') }}><ShieldBan />Dead-number rules</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setSettingsTab('score'); setDlg('settings') }}><HeartPulse />Lead scoring</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast.success(`Exported ${nf(rows.length)} people to CSV`)}><Download />Export</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
        </>} />

      {/* views */}
      <div className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto px-3 [scrollbar-width:none] md:px-6">
        {([['rows', 'All people', Rows3], ['folders', 'Folders', LayoutGrid], ['dnc', 'Do-Not-Contact', ShieldBan], ['health', 'Database health', HeartPulse]] as const).map(([k, l, I]) => (
          <button key={k} onClick={() => setView(k)} className={cn('flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-control px-3 text-base font-semibold transition-colors', view === k ? 'bg-surface text-text shadow-card' : 'text-muted hover:bg-[#e3e3e3] hover:text-text')}><I className="size-4" />{l}{k === 'dnc' && <span className="rounded-tag bg-subtle px-1.5 text-xs text-muted">{s.dnc.length}</span>}</button>
        ))}
      </div>

      {view === 'rows' && (<>
        <div className="shrink-0 px-4 py-3 md:px-6">
          <div className="flex flex-wrap gap-2">
            {tiles.map((t) => <Tip key={t.k} content={t.d}><button onClick={() => onTile(t.k)} className="flex min-w-[150px] flex-1 items-center justify-between gap-3 rounded-card bg-surface px-3 py-2 text-left shadow-card transition-colors hover:bg-subtle-2"><span className="min-w-0"><span className="block truncate text-sm text-muted">{t.l}</span><span className="block text-lg font-semibold tabular leading-6">{nf(t.n)}</span></span><t.I className={cn('size-4 shrink-0', t.tone)} /></button></Tip>)}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 py-2 md:px-6">
            <div className="flex h-9 min-w-[280px] flex-1 items-center gap-2 rounded-control border border-border-strong bg-surface pl-3 pr-1 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <AiMark /><input value={nl} onChange={(e) => setNl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runNl()} placeholder="Build filters with AI — “women in Mississauga who have emails”" className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-faint" />
              <Tip content="Speak your filter"><Button variant="ghost" size="icon-xs" onClick={() => { setNl('people in Brooklyn who bought in the last 3 months'); setTimeout(() => runNl('people in Brooklyn who bought in the last 3 months'), 50) }} aria-label="Voice"><Mic /></Button></Tip>
              <Button variant="ai" size="sm" className="h-7" onClick={() => runNl()}><Sparkles />Apply</Button>
            </div>
            <div className="relative"><Search className="absolute left-2.5 top-2.5 size-4 text-muted" /><Input className="h-9 w-[260px] pl-8" placeholder="Search name, phone, email, zip…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <Toolbar
          left={<FilterChips filters={filters} setFilters={setFilters} match={match} setMatch={setMatch} />}
          right={<>
            <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><ArrowUpDown />Sort</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{[['name', 'Name'], ['lastDays', 'Last contacted'], ['stage', 'Stage'], ['city', 'City'], ['attempts', 'Attempts']].map(([k, l]) => <DropdownMenuItem key={k} onSelect={() => setSort({ k, d: sort.k === k ? (sort.d === 1 ? -1 : 1) : 1 })}>{l}{sort.k === k && <Check className="ml-auto !text-primary" />}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
            <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><Columns3 />Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{COLS.map(([k, l]) => <DropdownMenuCheckboxItem key={k} checked={cols.includes(k)} onCheckedChange={(v) => setCols(v ? [...cols, k] : cols.filter((x) => x !== k))}>{l}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>
          </>}
        />
        {nlNote && <div className="mx-4 mb-2 flex items-center gap-2 rounded-control bg-ai-soft px-3 py-1.5 text-sm md:mx-6"><AiMark /><span className="flex-1">{nlNote}{filters.length > 0 && <> Showing <b>{nf(rows.length)}</b> people.</>}</span>{filters.length > 0 && <Button size="sm" variant="ghost" onClick={() => setDlg('save')}><FolderPlus />Save as folder</Button>}<button onClick={() => setNlNote('')} className="text-muted hover:text-text"><X className="size-3.5" /></button></div>}
        {folder && <div className="mx-4 mb-2 flex items-center gap-2 rounded-control bg-surface px-3 py-1.5 text-sm shadow-card md:mx-6"><FolderOpen className="size-4 text-muted" /><span>Folder: <b>{folder.name}</b> · {nf(folder.count ?? rows.length)} people{folder.src && <span className="text-muted"> · {folder.src}</span>}</span><Button size="sm" variant="ghost" className="ml-1" onClick={() => nav(`/campaigns/new?folder=${folder.id}`)}><Megaphone />Start campaign</Button><button onClick={() => { sp.delete('folder'); setSp(sp, { replace: true }) }} className="ml-auto flex h-6 items-center gap-1 rounded-control px-2 text-muted hover:bg-subtle hover:text-text"><X className="size-3.5" />Show whole database</button></div>}
        {sel.size > 0 && <BulkBar sel={sel} clear={() => setSel(new Set())} onSave={() => setDlg('save')} onEnrich={() => { setEnrichIds([...sel]); setDlg('enrich') }} />}
        <div className="mx-4 min-h-0 flex-1 overflow-auto rounded-card bg-surface shadow-card md:mx-6" onContextMenu={(e) => { e.preventDefault() }}>
          <Table>
            <thead><tr>
              <Th className="w-9 pl-4 pr-0"><Checkbox checked={allSel ? true : sel.size ? 'indeterminate' : false} onCheckedChange={() => setSel(allSel ? new Set() : new Set(rows.map((c) => c.id)))} aria-label="Select all" /></Th>
              <Th className="min-w-[200px]">Name</Th>
              {COLS.filter(([k]) => cols.includes(k)).map(([k, l]) => <Th key={k}>{l}</Th>)}
              <Th className="w-8" />
            </tr></thead>
            <tbody>{rows.slice(0, 200).map((c) => <Row key={c.id} c={c} cols={cols} selected={sel.has(c.id)} onSelect={() => { const n = new Set(sel); n.has(c.id) ? n.delete(c.id) : n.add(c.id); setSel(n) }} onSave={() => { setSel(new Set([c.id])); setDlg('save') }} />)}</tbody>
          </Table>
          {!rows.length && <EmptyState icon={<Users />} title="No one matches" description="Change or clear the filters, or add people." action={<><Button onClick={() => { setFilters([]); setQ('') }}>Clear filters</Button><Button variant="primary" onClick={() => setDlg('add')}><Plus />Add contact</Button></>} />}
          {rows.length > 200 && <p className="px-4 py-3 text-center text-sm text-muted">Showing the first 200 of {nf(rows.length)}. Use filters to narrow down.</p>}
        </div>
        <div className="flex h-9 shrink-0 items-center gap-3 overflow-hidden whitespace-nowrap px-4 text-xs text-muted md:px-6"><span><b className="text-text">{nf(rows.length)}</b> people</span><span className="hidden sm:inline">{rows.filter((c) => c.consent.sms && !c.dnc).length} can get texts</span><span className="hidden sm:inline">{rows.filter((c) => c.consent.call && !c.dnc).length} can get calls</span><span className="hidden sm:inline">{rows.filter((c) => c.email).length} have email</span><span className="ml-auto hidden md:inline">Right-click a row for more</span></div>
      </>)}

      {view === 'folders' && <FoldersView onOpen={(id) => { sp.set('view', 'rows'); sp.set('folder', id); setSp(sp, { replace: true }) }} />}
      {view === 'dnc' && <DncView onImport={() => setDlg('import-dnc')} />}
      {view === 'health' && <HealthView onRules={() => { setSettingsTab('dead'); setDlg('settings') }} onEnrich={(ids) => { setEnrichIds(ids); setDlg('enrich') }} />}

      <AddContactDialog open={dlg === 'add'} onOpenChange={(o) => !o && setDlg(null)} folder={folder?.id} />
      <ImportDialog open={dlg === 'import' || dlg === 'import-dnc'} dnc={dlg === 'import-dnc'} onOpenChange={(o) => !o && setDlg(null)} />
      <SaveFolderDialog open={dlg === 'save'} onOpenChange={(o) => !o && setDlg(null)} count={sel.size || rows.length} label={filters.length ? filters.map(sayFilter).join(' · ').slice(0, 40) : 'New folder'} />
      <MissingDialog open={dlg === 'missing'} onOpenChange={(o) => !o && setDlg(null)} onEnrich={() => { setEnrichIds(s.contacts.filter((c) => !c.email || !c.name).map((c) => c.id)); setDlg('enrich') }} />
      <DuplicatesDialog open={dlg === 'dups'} onOpenChange={(o) => !o && setDlg(null)} />
      <EnrichDialog open={dlg === 'enrich'} onOpenChange={(o) => !o && setDlg(null)} ids={enrichIds} />
      <ContactSettingsDialog open={dlg === 'settings'} onOpenChange={(o) => !o && setDlg(null)} tab={settingsTab} />
    </div>
  )
}

/* ---------- filter chips + editor ---------- */
function FilterChips({ filters, setFilters, match, setMatch }: { filters: FilterT[]; setFilters: (f: FilterT[]) => void; match: 'all' | 'any'; setMatch: (m: 'all' | 'any') => void }) {
  const [adding, setAdding] = React.useState(false); const [fq, setFq] = React.useState('')
  const groups = Array.from(new Set(FILTERS.map((f) => f.group)))
  return (<>
    {filters.map((f, i) => <FilterChip key={i} f={f} onChange={(v) => setFilters(filters.map((x, j) => (j === i ? { ...x, v } : x)))} onRemove={() => setFilters(filters.filter((_, j) => j !== i))} />)}
    <Popover open={adding} onOpenChange={setAdding}>
      <PopoverTrigger asChild><Button size="sm" variant="ghost"><Filter />Filter</Button></PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="border-b border-border p-1.5"><Input className="h-7" placeholder="Search filters" value={fq} onChange={(e) => setFq(e.target.value)} autoFocus /></div>
        <div className="max-h-[320px] overflow-y-auto p-1">{groups.map((g) => { const fs = FILTERS.filter((f) => f.group === g && f.label.toLowerCase().includes(fq.toLowerCase())); return fs.length ? <div key={g}><div className="px-2 py-1 text-xs font-medium text-muted">{g}</div>{fs.map((f) => <button key={f.k} onClick={() => { setFilters([...filters, { k: f.k, v: structuredClone(f.def) }]); setAdding(false); setFq('') }} className="flex h-8 w-full items-center rounded-[6px] px-2 text-left text-base hover:bg-subtle">{f.label}</button>)}</div> : null })}</div>
      </PopoverContent>
    </Popover>
    {filters.length > 1 && <Segmented size="sm" value={match} onChange={setMatch} options={[{ value: 'all', label: 'Match all' }, { value: 'any', label: 'Match any' }]} />}
    {filters.length > 0 && <Button size="sm" variant="ghost" onClick={() => setFilters([])}>Clear</Button>}
  </>)
}
function FilterChip({ f, onChange, onRemove }: { f: FilterT; onChange: (v: any) => void; onRemove: () => void }) {
  const d = FD[f.k]; const [open, setOpen] = React.useState(f.v === d.def && (d.type === 'text' || (Array.isArray(d.def) && !d.def.length)))
  const opts = d.opts?.() ?? []
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span className="inline-flex h-7 items-center rounded-control border border-border-strong bg-surface text-sm">
        <PopoverTrigger asChild><button className="flex h-full items-center gap-1 rounded-l-control pl-2 pr-1.5 hover:bg-subtle"><span className="font-medium">{sayFilter(f)}</span><ChevronDown className="size-3 text-muted" /></button></PopoverTrigger>
        <button onClick={onRemove} className="flex h-full items-center rounded-r-control border-l border-border px-1.5 text-muted hover:bg-subtle hover:text-text" aria-label="Remove filter"><X className="size-3" /></button>
      </span>
      <PopoverContent className="w-72">
        <div className="mb-2 text-sm font-medium">{d.label}</div>
        {d.type === 'multi' && <div className="max-h-[240px] space-y-0.5 overflow-y-auto">{opts.map((o) => <label key={o.v} className="flex h-7 cursor-pointer items-center gap-2 rounded-[6px] px-1.5 text-base hover:bg-subtle"><Checkbox checked={f.v.includes(o.v)} onCheckedChange={(c) => onChange(c ? [...f.v, o.v] : f.v.filter((x: string) => x !== o.v))} />{o.l}</label>)}</div>}
        {d.type === 'one' && <Select value={f.v} onValueChange={onChange} options={opts.map((o) => ({ value: o.v, label: o.l }))} />}
        {d.type === 'yn' && <Segmented value={f.v} onChange={onChange} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />}
        {d.type === 'text' && <Input autoFocus value={f.v} onChange={(e) => onChange(e.target.value)} placeholder={f.k === 'zip' ? 'L5B, M5V, 11215 — several allowed' : 'Type a value'} onKeyDown={(e) => e.key === 'Enter' && setOpen(false)} />}
        {d.type === 'range' && <div className="flex items-center gap-2"><Input type="number" className="w-20" value={f.v[0]} onChange={(e) => onChange([+e.target.value, f.v[1]])} /><span className="text-sm text-muted">to</span><Input type="number" className="w-20" value={f.v[1]} onChange={(e) => onChange([f.v[0], +e.target.value])} /></div>}
        {d.type === 'recency' && <div className="flex flex-wrap items-center gap-2"><Segmented size="sm" value={f.v.m} onChange={(m) => onChange({ ...f.v, m })} options={[{ value: 'in', label: 'Contacted' }, { value: 'out', label: 'Not contacted' }]} /><span className="text-sm text-muted">in the last</span><Input type="number" className="w-16" value={f.v.d} onChange={(e) => onChange({ ...f.v, d: +e.target.value })} /><span className="text-sm text-muted">days</span></div>}
        <div className="mt-3 flex justify-end"><Button size="sm" variant="primary" onClick={() => setOpen(false)}>Done</Button></div>
      </PopoverContent>
    </Popover>
  )
}

/* ---------- table row ---------- */
function Row({ c, cols, selected, onSelect, onSave }: { c: Contact; cols: string[]; selected: boolean; onSelect: () => void; onSave: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const camp = s.campaigns.find((k) => k.id === c.camp); const stages = stagesFor(camp, s.stages)
  const sc = score(c)
  const cell: Record<string, React.ReactNode> = {
    phone: <PhoneMenu contact={c}><button className="tabular hover:text-primary" onClick={(e) => e.stopPropagation()}>{c.phone}</button></PhoneMenu>,
    email: c.email ? <span className="truncate">{c.email}</span> : <Badge tone="amber">Missing</Badge>,
    stage: c.stage === '—' ? <span className="text-muted">—</span> : <StageTag name={c.stage} stages={stages} tip={<div className="space-y-0.5"><div><b>Campaign:</b> {camp?.name ?? 'None'}</div><div><b>Lead source:</b> {c.source}</div>{c.sold && <div><b>Sold:</b> {c.sold}</div>}</div>} />,
    camp: camp ? <button className="truncate hover:text-primary" onClick={(e) => { e.stopPropagation(); nav(`/campaigns/${camp.id}`) }}>{camp.name}</button> : <span className="text-muted">—</span>,
    source: <span className="flex items-center gap-1.5"><DirIcon dir={c.dir} size={13} /><span className="truncate">{c.source}</span></span>,
    agent: <AgentChip id={c.agent} size={18} />,
    last: <span className="text-muted">{agoTxt(c.lastDays)}</span>,
    purchase: c.purchase ? <span className="truncate">{c.purchase.product} <span className="text-muted">· {c.purchase.date}</span></span> : <span className="text-muted">—</span>,
    score: <Badge tone={sc === 'Hot' ? 'green' : sc === 'Warm' ? 'amber' : sc === 'Dead' ? 'red' : sc === 'Not responding' ? 'amber' : 'neutral'}>{sc}</Badge>,
    city: c.city, tags: c.tags.length ? c.tags.map((t) => <Badge key={t} tone="outline" className="mr-1">{t}</Badge>) : <span className="text-muted">—</span>,
  }
  return (
    <DropdownMenu modal={false}>
      <Tr clickable selected={selected} onClick={() => nav(`/contacts/${c.id}`)} onContextMenu={(e) => { e.preventDefault(); (e.currentTarget.querySelector('[data-rowmenu]') as HTMLElement)?.click() }}>
        <Td className="h-8 w-9 pl-4 pr-0" onClick={(e) => e.stopPropagation()}><Checkbox checked={selected} onCheckedChange={onSelect} aria-label="Select" /></Td>
        <Td className="h-8"><span className="flex items-center gap-2"><Avatar name={c.name || '?'} size={20} /><span className={cn('truncate font-medium', !c.name && 'text-warning')}>{c.name || 'Name missing'}</span>{c.dnc && <Tip content="On Do-Not-Contact"><ShieldBan className="size-3.5 text-danger" /></Tip>}</span></Td>
        {COLS.filter(([k]) => cols.includes(k)).map(([k]) => <Td key={k} className="h-8 max-w-[240px]">{cell[k]}</Td>)}
        <Td className="h-8 w-8 pr-2" onClick={(e) => e.stopPropagation()}><DropdownMenuTrigger asChild><Button data-rowmenu variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" aria-label="Row menu"><MoreHorizontal /></Button></DropdownMenuTrigger></Td>
      </Tr>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={() => nav(`/contacts/${c.id}`)}><Users />Open profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSave}><FolderPlus />Save to folder</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => nav(`/campaigns/new?contact=${c.id}`)}><Megaphone />Start a campaign</DropdownMenuItem>
        <DropdownMenuSub><DropdownMenuSubTrigger><Kanban />Set stage</DropdownMenuSubTrigger><DropdownMenuSubContent>{stages.map((st) => <DropdownMenuItem key={st.id} onSelect={() => s.moveLead(c.id, st.name, 'you')}><StageTag name={st.name} stages={stages} size="sm" /></DropdownMenuItem>)}{!stages.length && <DropdownMenuItem disabled>Not in a campaign</DropdownMenuItem>}</DropdownMenuSubContent></DropdownMenuSub>
        <DropdownMenuItem onSelect={() => { const t = window.prompt('Add a tag'); if (t) s.updateContact(c.id, { tags: [...c.tags, t] }) }}><Tag />Add tag</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { s.patch('dnc', (d) => [{ id: 'd' + Date.now(), name: c.name, phone: c.phone, reason: 'Manual', added: 'Today', by: 'Bilal Nasir', comment: '' }, ...d]); s.updateContact(c.id, { dnc: true }); toast.success('Added to Do-Not-Contact') }}><ShieldBan />Add to Do-Not-Contact</DropdownMenuItem>
        <DropdownMenuItem danger onSelect={() => { s.patch('contacts', (cs) => cs.filter((x) => x.id !== c.id)); toast.success('Deleted · undo within 30 days', { action: { label: 'Undo', onClick: () => s.patch('contacts', (cs) => [c, ...cs]) } }) }}><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BulkBar({ sel, clear, onSave, onEnrich }: { sel: Set<string>; clear: () => void; onSave: () => void; onEnrich: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const ids = [...sel]
  return (
    <div className="mx-4 mb-2 flex flex-wrap items-center gap-1.5 rounded-control bg-primary-soft px-3 py-1.5 md:mx-6 anim-fade">
      <span className="mr-1 text-sm font-medium">{nf(sel.size)} selected</span>
      <Button size="sm" onClick={() => nav('/campaigns/new?selected=' + ids.length)}><Megaphone />Start campaign</Button>
      <Button size="sm" onClick={onSave}><FolderPlus />Save to folder</Button>
      <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm"><Kanban />Set stage<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent>{['New', 'Contacted', 'Interested', 'Pending', 'Order Booked', 'Not interested'].map((st) => <DropdownMenuItem key={st} onSelect={() => { ids.forEach((id) => s.moveLead(id, st, 'you')); toast.success(`${ids.length} moved to ${st}`); clear() }}>{st}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
      <Button size="sm" onClick={() => { const t = window.prompt('Tag to add'); if (t) { ids.forEach((id) => { const c = s.contacts.find((x) => x.id === id)!; s.updateContact(id, { tags: [...c.tags, t] }) }); toast.success(`Tag “${t}” added`) } }}><Tag />Add tag</Button>
      <Button size="sm" variant="ai" onClick={onEnrich}><Sparkles />Fill missing data</Button>
      <Button size="sm" variant="destructive" onClick={() => { s.patch('contacts', (cs) => cs.filter((c) => !sel.has(c.id))); toast.success(`${ids.length} deleted · undo within 30 days`); clear() }}><Trash2 />Delete</Button>
      <Button size="sm" variant="ghost" className="ml-auto" onClick={clear}><X />Clear</Button>
    </div>
  )
}

/* ---------- Folders (Windows-style) ---------- */
function FoldersView({ onOpen }: { onOpen: (id: string) => void }) {
  const nav = useNavigate(); const { folders, patch } = useStore()
  const [cur, setCur] = React.useState<string | null>(null); const [sort, setSort] = React.useState<'name' | 'date' | 'count'>('date'); const [q, setQ] = React.useState('')
  const [renaming, setRenaming] = React.useState<string | null>(null); const [nm, setNm] = React.useState('')
  const children = (p: string | null) => folders.filter((f) => f.parent === p && f.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'count' ? (b.count ?? 0) - (a.count ?? 0) : b.saved.localeCompare(a.saved))
  const path: typeof folders = []; let p = cur; while (p) { const f = folders.find((x) => x.id === p); if (!f) break; path.unshift(f); p = f.parent }
  const mk = (group: boolean) => { const n = window.prompt(group ? 'Group name' : 'Folder name'); if (n) patch('folders', (fs) => [...fs, { id: 'f' + Date.now(), name: n, parent: cur, group, count: group ? undefined : 0, saved: new Date().toISOString().slice(0, 16).replace('T', ' '), src: group ? undefined : 'Created by hand' }]) }
  const Tree = ({ parent, depth }: { parent: string | null; depth: number }) => <>{folders.filter((f) => f.parent === parent).map((f) => <div key={f.id}><button onClick={() => (f.group || folders.some((x) => x.parent === f.id) ? setCur(f.id) : onOpen(f.id))} onDoubleClick={() => onOpen(f.id)} className={cn('flex h-7 w-full items-center gap-1.5 rounded-control pr-2 text-sm hover:bg-subtle', cur === f.id && 'bg-subtle font-medium')} style={{ paddingLeft: 8 + depth * 14 }}>{f.group ? <Folder className="size-4 text-warning" /> : <Folder className="size-4 text-primary" />}<span className="truncate">{f.name}</span>{f.count !== undefined && <span className="ml-auto text-xs text-muted tabular">{nf(f.count)}</span>}</button><Tree parent={f.id} depth={depth + 1} /></div>)}</>
  return (
    <div className="flex min-h-0 flex-1">
      <aside className="mx-4 mb-4 hidden w-[240px] shrink-0 flex-col rounded-card bg-surface shadow-card md:flex md:ml-6">
        <div className="flex h-10 items-center justify-between border-b border-border px-3 text-sm font-medium"><span>All folders</span><Button size="icon-xs" variant="ghost" onClick={() => mk(true)} aria-label="New group"><FolderPlus /></Button></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2"><button onClick={() => setCur(null)} className={cn('flex h-7 w-full items-center gap-1.5 rounded-control px-2 text-sm hover:bg-subtle', cur === null && 'bg-subtle font-medium')}><LayoutGrid className="size-4 text-muted" />Top level</button><Tree parent={null} depth={0} /></div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar left={<><nav className="flex items-center gap-1 text-sm"><button onClick={() => setCur(null)} className="text-muted hover:text-text">Folders</button>{path.map((f) => <React.Fragment key={f.id}><ChevronRight className="size-3.5 text-faint" /><button onClick={() => setCur(f.id)} className={cn('hover:text-text', f.id === cur ? 'font-medium text-text' : 'text-muted')}>{f.name}</button></React.Fragment>)}</nav></>}
          right={<><div className="relative"><Search className="absolute left-2.5 top-2 size-3.5 text-muted" /><Input className="h-8 w-[180px] pl-8" placeholder="Search folders" value={q} onChange={(e) => setQ(e.target.value)} /></div><Select size="sm" className="w-[150px]" value={sort} onValueChange={(v) => setSort(v as any)} options={[{ value: 'date', label: 'Sort: Date saved' }, { value: 'name', label: 'Sort: Name' }, { value: 'count', label: 'Sort: People' }]} /><Button size="sm" onClick={() => mk(false)}><FolderPlus />New folder</Button></>} />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6" onContextMenu={(e) => e.preventDefault()}>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {children(cur).map((f) => (
              <DropdownMenu key={f.id} modal={false}>
                <div className="relative">
                  <button onDoubleClick={() => (f.group ? setCur(f.id) : onOpen(f.id))} onClick={() => f.group && setCur(f.id)} onContextMenu={(e) => { e.preventDefault(); (e.currentTarget.parentElement?.querySelector('[data-fmenu]') as HTMLElement)?.click() }} className="flex w-full items-start gap-3 rounded-card bg-surface p-3 pr-9 text-left shadow-card transition-colors hover:bg-subtle-2">
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-control', f.group ? 'bg-warning-soft text-warning' : 'bg-primary-soft text-primary')}><Folder className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      {renaming === f.id ? <Input autoFocus className="h-7" value={nm} onChange={(e) => setNm(e.target.value)} onBlur={() => { patch('folders', (fs) => fs.map((x) => (x.id === f.id ? { ...x, name: nm || x.name } : x))); setRenaming(null) }} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} onClick={(e) => e.stopPropagation()} /> : <span className="block truncate text-base font-medium">{f.name}</span>}
                      <span className="block truncate text-xs text-muted">{f.group ? `${folders.filter((x) => x.parent === f.id).length} folders` : `${nf(f.count ?? 0)} people`} · saved {new Date(f.saved.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      {f.src && <span className="block truncate text-xs text-faint">{f.src}</span>}
                    </span>
                  </button>
                  <DropdownMenuTrigger asChild><Button data-fmenu variant="ghost" size="icon-xs" className="absolute right-2 top-2" aria-label="Folder menu"><MoreHorizontal /></Button></DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="end" className="w-52">
                  {!f.group && <DropdownMenuItem onSelect={() => onOpen(f.id)}><FolderOpen />Open (double-click)</DropdownMenuItem>}
                  {!f.group && <DropdownMenuItem onSelect={() => nav(`/campaigns/new?folder=${f.id}`)}><Play />Start campaign</DropdownMenuItem>}
                  <DropdownMenuItem onSelect={() => { setRenaming(f.id); setNm(f.name) }}><Pencil />Rename</DropdownMenuItem>
                  <DropdownMenuSub><DropdownMenuSubTrigger><FolderInput />Move to</DropdownMenuSubTrigger><DropdownMenuSubContent>{[{ id: null, name: 'Top level' }, ...folders.filter((x) => x.group && x.id !== f.id)].map((g) => <DropdownMenuItem key={g.id ?? 'root'} onSelect={() => patch('folders', (fs) => fs.map((x) => (x.id === f.id ? { ...x, parent: g.id } : x)))}>{g.name}</DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub>
                  <DropdownMenuItem onSelect={() => { const n = window.prompt('Subfolder name'); if (n) patch('folders', (fs) => [...fs, { id: 'f' + Date.now(), name: n, parent: f.id, count: 0, saved: new Date().toISOString().slice(0, 16).replace('T', ' '), src: 'Created by hand' }]) }}><FolderPlus />New subfolder</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem danger onSelect={() => { patch('folders', (fs) => fs.filter((x) => x.id !== f.id && x.parent !== f.id)); toast.success(`“${f.name}” deleted · the people stay in your database`) }}><Trash2 />Delete folder</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            {!children(cur).length && <EmptyState className="col-span-full" icon={<Folder />} title="This group is empty" description="Save a filtered list here or create a folder." action={<Button onClick={() => mk(false)}><FolderPlus />New folder</Button>} />}
          </div>
          <p className="mt-4 text-xs text-muted">Double-click a folder to see its people. Right-click for Start campaign, Rename, Move and Delete. Filter people, then right-click → Save to folder.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Do-Not-Contact ---------- */
function DncView({ onImport }: { onImport: () => void }) {
  const { dnc, patch } = useStore(); const [q, setQ] = React.useState(''); const [add, setAdd] = React.useState(false)
  const [f, setF] = React.useState({ name: '', phone: '', reason: 'Manual', comment: '' })
  const rows = dnc.filter((d) => `${d.name} ${d.phone} ${d.reason}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Toolbar left={<><span className="text-sm text-muted">Numbers here are skipped in every campaign, by every agent. Campaigns show what was skipped and let you send anyway.</span></>}
        right={<><div className="relative"><Search className="absolute left-2.5 top-2 size-3.5 text-muted" /><Input className="h-8 w-[200px] pl-8" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div><Button size="sm" onClick={onImport}><Upload />Import list</Button><Button size="sm" variant="primary" onClick={() => setAdd(true)}><Plus />Add number</Button></>} />
      <div className="mx-4 mb-4 min-h-0 flex-1 overflow-auto rounded-card bg-surface shadow-card md:mx-6"><Table><thead><tr><Th>Name</Th><Th>Phone</Th><Th>Reason</Th><Th>Added</Th><Th>By</Th><Th>Comment</Th><Th className="w-8" /></tr></thead>
        <tbody>{rows.map((d) => <Tr key={d.id}><Td className="font-medium">{d.name}</Td><Td className="tabular">{d.phone}</Td><Td><Badge tone={d.reason === 'Litigator' ? 'red' : d.reason === 'Opted out' ? 'amber' : 'neutral'}>{d.reason}</Badge></Td><Td className="text-muted">{d.added}</Td><Td className="text-muted">{d.by}</Td><Td className="max-w-[280px] truncate text-muted">{d.comment || '—'}</Td><Td><Button variant="ghost" size="icon-xs" onClick={() => { patch('dnc', (x) => x.filter((y) => y.id !== d.id)); toast.success('Removed from Do-Not-Contact') }} aria-label="Remove"><Trash2 /></Button></Td></Tr>)}</tbody></Table></div>
      <Dialog open={add} onOpenChange={setAdd}><DialogContent title="Add to Do-Not-Contact" size="sm" footer={<><Button onClick={() => setAdd(false)}>Cancel</Button><Button variant="primary" onClick={() => { patch('dnc', (x) => [{ id: 'd' + Date.now(), name: f.name || '—', phone: f.phone, reason: f.reason, added: 'Today', by: 'Bilal Nasir', comment: f.comment }, ...x]); setAdd(false); toast.success('Added') }}>Add</Button></>}>
        <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-sm font-medium text-text-2">Name</label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div><div className="space-y-1.5"><label className="text-sm font-medium text-text-2">Phone</label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoFocus /></div></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-2">Reason</label><Select value={f.reason} onValueChange={(v) => setF({ ...f, reason: v })} options={['Manual', 'Opted out', 'Litigator', 'Asked by email', 'National Do-Not-Call list'].map((x) => ({ value: x, label: x }))} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-2">Comment</label><Input value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} /></div></div></DialogContent></Dialog>
    </div>
  )
}

/* ---------- Database health ---------- */
function HealthView({ onRules, onEnrich }: { onRules: () => void; onEnrich: (ids: string[]) => void }) {
  const nav = useNavigate(); const s = useStore()
  const dead = s.contacts.filter((c) => score(c) === 'Dead'); const nr = s.contacts.filter((c) => score(c) === 'Not responding')
  const [found, setFound] = React.useState<Record<string, string>>({})
  const find = (c: Contact) => { toast('Searching public sources…'); setTimeout(() => setFound({ ...found, [c.id]: c.phone.replace(/\d{4}$/, (m) => String(+m + 1).padStart(4, '0')) }), 900) }
  return (
    <PageBody wide>
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Hot', s.contacts.filter((c) => score(c) === 'Hot').length, 'green'], ['Warm', s.contacts.filter((c) => score(c) === 'Warm').length, 'amber'], ['Cold', s.contacts.filter((c) => score(c) === 'Cold').length, 'neutral'], ['Not responding', nr.length, 'amber'], ['Dead', dead.length, 'red'], ['Complete profiles', s.contacts.filter((c) => c.email && c.name && c.address).length, 'blue']].map(([l, n, tone]) => <Card key={l as string} className="flex items-center justify-between p-3"><span className="text-sm">{l}</span><Badge tone={tone as any}>{nf(n as number)}</Badge></Card>)}
      </div>
      <Card className="mt-4"><div className="flex items-center justify-between border-b border-border px-4 py-2.5"><div><h3>Dead-number rules</h3><p className="text-xs text-muted">Contacts matching any active rule land below.</p></div><Button size="sm" onClick={onRules}><Settings2 />Edit rules</Button></div><div className="flex flex-wrap gap-1.5 p-3">{s.deadRules.map((r) => <Badge key={r.t} tone={r.on ? 'neutral' : 'outline'} className={cn(!r.on && 'opacity-60')}>{r.on ? <Check /> : <X />}{r.t}</Badge>)}</div></Card>
      <Card className="mt-4"><div className="flex items-center justify-between border-b border-border px-4 py-2.5"><div><h3>Dead numbers & not responding <span className="ml-1 text-muted">{dead.length + nr.length}</span></h3><p className="text-xs text-muted">Remove them to keep the database fresh, or let AI look for updated details.</p></div><div className="flex gap-1.5"><Button size="sm" variant="ai" onClick={() => onEnrich([...dead, ...nr].map((c) => c.id))}><Sparkles />Find updated info for all</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm(`Remove ${dead.length} dead numbers? They can be restored within 30 days.`)) { s.patch('contacts', (cs) => cs.filter((c) => score(c) !== 'Dead')); toast.success('Removed') } }}><Trash2 />Remove all dead</Button></div></div>
        <Table><thead><tr><Th>Name</Th><Th>Phone</Th><Th>Why</Th><Th>Attempts</Th><Th>Campaign</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>{[...dead, ...nr].slice(0, 40).map((c) => <Tr key={c.id} clickable onClick={() => nav(`/contacts/${c.id}`)}><Td className="font-medium">{c.name || <span className="text-warning">Name missing</span>}</Td><Td className="tabular">{c.phone}{found[c.id] && <span className="ml-2 text-success">→ {found[c.id]}</span>}</Td><Td><Badge tone={score(c) === 'Dead' ? 'red' : 'amber'}>{score(c) === 'Dead' ? 'No reply after 5 tries' : `No reply after ${c.noReply} tries`}</Badge></Td><Td className="tabular">{c.attempts}</Td><Td className="text-muted">{s.campaigns.find((k) => k.id === c.camp)?.name ?? '—'}</Td>
            <Td className="text-right" onClick={(e) => e.stopPropagation()}>{found[c.id] ? <Button size="sm" variant="primary" onClick={() => { s.updateContact(c.id, { phone: found[c.id], noReply: 0, attempts: 0 }); toast.success('Number updated') }}><Check />Update number</Button> : <><Button size="sm" variant="ai" onClick={() => find(c)}><RefreshCw />Find updated info</Button><Button size="sm" variant="ghost" className="ml-1" onClick={() => { s.updateContact(c.id, { noReply: 0 }); toast('Kept') }}>Keep</Button><Button size="sm" variant="ghost" onClick={() => { s.patch('contacts', (cs) => cs.filter((x) => x.id !== c.id)); toast.success('Removed') }}>Remove</Button></>}</Td></Tr>)}</tbody></Table>
      </Card>
    </PageBody>
  )
}

export { Kbd, Switch }
