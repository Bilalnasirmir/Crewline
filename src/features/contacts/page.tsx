import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Upload, MoreHorizontal, X, Sparkles, Mic, FolderPlus, ShieldBan, HeartPulse, Users, Copy, AlertTriangle, ChevronDown, ArrowUpDown, Columns3, Megaphone, Tag, Trash2, Kanban, Check, Settings2, Download, CornerDownRight, FolderOpen, ArrowUp, ArrowDown } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { PageHeader } from '@/components/app/page'
import { IndexTabs, SearchRow, PillRow, FilterPill, CheckList, BulkBar, Pager } from '@/components/app/index-table'
import { askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, EmptyState } from '@/components/ui/card'
import { DirIcon } from '@/components/app/icons'
import { StageTag, AgentChip } from '@/components/app/bits'
import { FILTERS, FD, runFilters, sayFilter, parseNL, score, type Filter as FilterT } from './filters'
import { AddContactDialog, ImportDialog, SaveFolderDialog, PhoneMenu, MissingDialog, DuplicatesDialog, EnrichDialog, ContactSettingsDialog } from './dialogs'
import { FoldersView, DncView, HealthView } from './views'
import type { Contact } from '@/data/types'
import { agoTxt } from '@/data/seed'

const COLS = [['phone', 'Phone'], ['email', 'Email'], ['stage', 'Stage'], ['camp', 'Campaign'], ['source', 'Lead source'], ['agent', 'Agent'], ['last', 'Last contacted'], ['purchase', 'Last purchase'], ['score', 'Score'], ['city', 'City'], ['tags', 'Tags']] as const
const SORT_KEY: Record<string, string> = { name: 'name', stage: 'stage', camp: 'camp', source: 'source', last: 'lastDays', city: 'city', score: 'noReply' }
const VIEWS: { value: string; label: string; filters: FilterT[] }[] = [
  { value: 'all', label: 'All', filters: [] },
  { value: 'hot', label: 'Hot leads', filters: [{ k: 'score', v: ['Hot'] }] },
  { value: 'customers', label: 'Customers', filters: [{ k: 'bought', v: 'yes' }] },
  { value: 'inbound', label: 'Inbound', filters: [{ k: 'dir', v: 'in' }] },
  { value: 'noemail', label: 'Missing email', filters: [{ k: 'hasEmail', v: 'no' }] },
  { value: 'nr', label: 'Not responding', filters: [{ k: 'score', v: ['Not responding', 'Dead'] }] },
]
const PINNED = ['stage', 'camp', 'source', 'city'] as const
const same = (a: FilterT[], b: FilterT[]) => JSON.stringify(a) === JSON.stringify(b)
export type ContactsDialog = 'add' | 'import' | 'import-dnc' | 'save' | 'missing' | 'dups' | 'enrich' | 'settings' | null

export function ContactsPage() {
  const [sp] = useSearchParams(); const s = useStore()
  const view = sp.get('view') || (sp.get('tab') === 'health' ? 'health' : 'rows')
  const [dlg, setDlg] = React.useState<ContactsDialog>(sp.get('import') ? 'import' : null)
  const [enrichIds, setEnrichIds] = React.useState<string[]>([]); const [settingsTab, setSettingsTab] = React.useState('fields')
  const [saveCount, setSaveCount] = React.useState(0); const [saveLabel, setSaveLabel] = React.useState('New folder')
  const openDlg = (d: ContactsDialog, o: { tab?: string; ids?: string[]; count?: number; label?: string } = {}) => {
    if (o.tab) setSettingsTab(o.tab); if (o.ids) setEnrichIds(o.ids); if (o.count !== undefined) setSaveCount(o.count); if (o.label) setSaveLabel(o.label)
    setDlg(d)
  }
  const close = (o: boolean) => { if (!o) setDlg(null) }
  const folder = s.folders.find((f) => f.id === sp.get('folder'))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {view === 'folders' ? <FoldersView /> : view === 'dnc' ? <DncView onImport={() => openDlg('import-dnc')} /> : view === 'health' ? <HealthView openDlg={openDlg} /> : <RowsView openDlg={openDlg} />}
      <AddContactDialog open={dlg === 'add'} onOpenChange={close} folder={folder?.id} />
      <ImportDialog open={dlg === 'import' || dlg === 'import-dnc'} dnc={dlg === 'import-dnc'} onOpenChange={close} />
      <SaveFolderDialog open={dlg === 'save'} onOpenChange={close} count={saveCount} label={saveLabel} />
      <MissingDialog open={dlg === 'missing'} onOpenChange={close} onEnrich={() => openDlg('enrich', { ids: s.contacts.filter((c) => !c.email || !c.name).map((c) => c.id) })} />
      <DuplicatesDialog open={dlg === 'dups'} onOpenChange={close} />
      <EnrichDialog open={dlg === 'enrich'} onOpenChange={close} ids={enrichIds} />
      <ContactSettingsDialog open={dlg === 'settings'} onOpenChange={close} tab={settingsTab} />
    </div>
  )
}

type OpenDlg = (d: ContactsDialog, o?: { tab?: string; ids?: string[]; count?: number; label?: string }) => void

function RowsView({ openDlg }: { openDlg: OpenDlg }) {
  const nav = useNavigate(); const [sp, setSp] = useSearchParams(); const s = useStore()
  const folder = s.folders.find((f) => f.id === sp.get('folder')); const campOpen = s.campaigns.find((c) => c.id === sp.get('camp'))
  const [filters, setFilters] = React.useState<FilterT[]>(() => (sp.get('score') ? [{ k: 'score', v: [sp.get('score')!] }] : []))
  const [match, setMatch] = React.useState<'all' | 'any'>('all')
  const [q, setQ] = React.useState(''); const [mode, setMode] = React.useState<'search' | 'ai'>('search'); const [nl, setNl] = React.useState(''); const [nlNote, setNlNote] = React.useState('')
  const [sel, setSel] = React.useState<Set<string>>(new Set()); const [page, setPage] = React.useState(0)
  const [cols, setCols] = React.useState<string[]>(() => s.prefs.contactCols ?? ['phone', 'email', 'stage', 'camp', 'source', 'agent', 'last', 'score'])
  const [sort, setSort] = React.useState<{ k: string; d: 1 | -1 }>({ k: 'lastDays', d: 1 })
  const views = [...VIEWS, ...((s.prefs.contactViews ?? []) as typeof VIEWS)]
  const activeView = views.find((v) => same(v.filters, filters))?.value ?? ''
  React.useEffect(() => { setPage(0) }, [filters, match, q, folder?.id, campOpen?.id])

  const base = React.useMemo(() => {
    let L = s.contacts
    if (folder) L = L.filter((c) => c.folder === folder.id || s.folders.some((f) => f.parent === folder.id && f.id === c.folder))
    if (campOpen) L = L.filter((c) => c.camp === campOpen.id)
    if (q) { const ql = q.toLowerCase(); L = L.filter((c) => `${c.name} ${c.phone} ${c.email} ${c.city} ${c.zip} ${c.stage} ${c.source} ${c.address} ${c.tags.join(' ')}`.toLowerCase().includes(ql)) }
    return runFilters(L, filters, match)
  }, [s.contacts, s.folders, folder, campOpen, q, filters, match])
  const rows = React.useMemo(() => [...base].sort((a, b) => { const va = (a as any)[sort.k] ?? '', vb = (b as any)[sort.k] ?? ''; return (va > vb ? 1 : va < vb ? -1 : 0) * sort.d }), [base, sort])
  const shown = rows.slice(page * 50, page * 50 + 50)
  const allSel = rows.length > 0 && rows.every((c) => sel.has(c.id))
  const toggleAll = () => setSel(allSel ? new Set() : new Set(rows.map((c) => c.id)))
  const setCol = (next: string[]) => { setCols(next); s.setPref('contactCols', next) }
  const sortBy = (k: string) => setSort({ k, d: sort.k === k ? (sort.d === 1 ? -1 : 1) : 1 })

  const runNl = (text = nl) => { if (!text.trim()) return; const r = parseNL(text); setFilters(r.filters); setNlNote(r.note || `Applied ${r.filters.length} filter${r.filters.length === 1 ? '' : 's'}: ${r.filters.map(sayFilter).join(' · ')}.`); setSel(new Set()); setMode('search'); setNl('') }
  const setFilter = (k: string, v: any) => setFilters(filters.some((f) => f.k === k) ? filters.map((f) => (f.k === k ? { ...f, v } : f)) : [...filters, { k, v }])
  const clearFilter = (k: string) => setFilters(filters.filter((f) => f.k !== k))
  const saveView = async () => { const n = await askText({ title: 'Save as view', label: 'View name', placeholder: 'e.g. Mississauga with email', hint: 'Views show as tabs above the table.' }); if (n) { s.setPref('contactViews', [...(s.prefs.contactViews ?? []), { value: 'v' + Date.now(), label: n, filters }]); toast.success(`View “${n}” saved`) } }
  const tiles = [
    { k: 'missing', l: 'Missing details', n: s.contacts.filter((c) => !c.email || !c.name || !c.address).length, I: AlertTriangle, d: 'Names, emails or addresses are empty', go: () => openDlg('missing') },
    { k: 'dups', l: 'Duplicates', n: 1202 + s.dups.length - 5, I: Copy, d: 'Found across your imports', go: () => openDlg('dups') },
    { k: 'nr', l: 'Not responding', n: s.contacts.filter((c) => score(c) === 'Not responding').length, I: HeartPulse, d: '3+ tries with no reply', go: () => setFilters([{ k: 'score', v: ['Not responding'] }]) },
    { k: 'dead', l: 'Dead numbers', n: s.contacts.filter((c) => score(c) === 'Dead').length, I: ShieldBan, d: 'Match your dead-number rules', go: () => nav('/contacts?view=health') },
    { k: 'dnc', l: 'Do-Not-Contact', n: s.dnc.length, I: ShieldBan, d: 'Skipped in every campaign', go: () => nav('/contacts?view=dnc') },
  ]
  const pinnedOpts: Record<string, { v: string; l: string }[]> = { stage: FD.stage.opts!(), camp: FD.camp.opts!(), source: FD.source.opts!(), city: FD.city.opts!() }
  const extra = filters.filter((f) => !PINNED.includes(f.k as (typeof PINNED)[number]))

  return (
    <>
      <PageHeader title="Contacts" icon={<Users />} sub={`${nf(50214 + s.contacts.length - 90)} people · ${nf(s.folders.filter((f) => !f.group).length)} folders`}
        actions={<>
          <Button variant="header" className="hidden md:inline-flex" onClick={() => openDlg('enrich', { ids: s.contacts.filter((c) => !c.email || !c.name).map((c) => c.id) })}><Sparkles />Fill missing data</Button>
          <Button variant="header" onClick={() => openDlg('import')}><Upload />Import</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="header">More actions<ChevronDown /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => toast.success(`Exported ${nf(rows.length)} people to CSV`)}><Download />Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => openDlg('settings', { tab: 'fields' })}><Settings2 />Custom fields</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openDlg('settings', { tab: 'sources' })}><CornerDownRight />Lead sources</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openDlg('settings', { tab: 'dead' })}><ShieldBan />Dead-number rules</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openDlg('settings', { tab: 'score' })}><HeartPulse />Lead scoring</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
          <Button variant="primary" onClick={() => openDlg('add')}><Plus />Add contact</Button>
        </>} />

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
        <div className="mb-3 grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tiles.map((t) => (
            <Tip key={t.k} content={t.d}>
              <Card className="cursor-pointer p-3 transition-colors hover:bg-subtle-2" onClick={t.go} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && t.go()}>
                <div className="flex items-center justify-between gap-2"><h3 className="truncate">{t.l}</h3><t.I className="size-4 shrink-0 text-icon" /></div>
                <div className="text-2xl font-semibold tabular">{nf(t.n)}</div>
              </Card>
            </Tip>
          ))}
        </div>

        {(folder || campOpen) && (
          <Card className="mb-3 flex shrink-0 flex-wrap items-center gap-2 px-3 py-2">
            {folder ? <FolderOpen className="size-4 text-icon" /> : <Megaphone className="size-4 text-icon" />}
            <span className="min-w-0 flex-1 truncate text-sm">{folder ? <>Folder <b className="font-semibold">{folder.name}</b> · {nf(folder.count ?? rows.length)} people{folder.src && <span className="text-muted"> · {folder.src}</span>}</> : <>Campaign <b className="font-semibold">{campOpen!.name}</b> · {nf(campOpen!.people)} people</>}</span>
            {folder && <Button onClick={() => nav(`/campaigns/new?folder=${folder.id}`)}><Megaphone />Start campaign</Button>}
            {campOpen && <Button onClick={() => nav(`/campaigns/${campOpen.id}`)}>Open campaign</Button>}
            <Button variant="ghost" onClick={() => { sp.delete('folder'); sp.delete('camp'); setSp(sp, { replace: true }) }}><X />Show whole database</Button>
          </Card>
        )}

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <IndexTabs tabs={views.map((v) => ({ value: v.value, label: v.label }))} value={activeView} onChange={(v) => { setFilters(views.find((x) => x.value === v)!.filters); setNlNote(''); setSel(new Set()) }} onAdd={filters.length ? saveView : undefined}
            right={<>
              <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" aria-label="Sort"><ArrowUpDown /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuLabel>Sort by</DropdownMenuLabel>{[['name', 'Name'], ['lastDays', 'Last contacted'], ['stage', 'Stage'], ['city', 'City'], ['attempts', 'Attempts']].map(([k, l]) => <DropdownMenuItem key={k} onSelect={() => sortBy(k)}>{l}{sort.k === k && (sort.d === 1 ? <ArrowUp className="ml-auto" /> : <ArrowDown className="ml-auto" />)}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
              <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" aria-label="Columns"><Columns3 /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuLabel>Columns</DropdownMenuLabel>{COLS.map(([k, l]) => <DropdownMenuCheckboxItem key={k} checked={cols.includes(k)} onSelect={(e) => e.preventDefault()} onCheckedChange={(v) => setCol(v ? COLS.map((c) => c[0]).filter((x) => x === k || cols.includes(x)) : cols.filter((x) => x !== k))}>{l}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>
            </>} />

          {mode === 'search'
            ? <SearchRow value={q} onChange={setQ} placeholder="Search name, phone, email, zip, city, tag…" right={<Button onClick={() => setMode('ai')}><Sparkles />Build filters with AI</Button>} />
            : <SearchRow autoFocus value={nl} onChange={setNl} left={<Sparkles className="size-4 shrink-0 text-icon" />} placeholder="Describe who you want — “women in Mississauga who have emails and bought in the last 3 months”" onKeyDown={(e) => e.key === 'Enter' && runNl()}
                right={<><Tip content="Say it instead"><Button variant="ghost" size="icon" aria-label="Speak your filter" onClick={() => { const t = 'people in Brooklyn who bought in the last 3 months'; setNl(t); setTimeout(() => runNl(t), 400) }}><Mic /></Button></Tip><Button variant="primary" disabled={!nl.trim()} onClick={() => runNl()}>Apply</Button><Button variant="ghost" onClick={() => setMode('search')}>Cancel</Button></>} />}

          <PillRow right={filters.length > 0 && <><span className="text-xs text-muted tabular">{nf(rows.length)} match</span><Button size="sm" onClick={() => openDlg('save', { count: rows.length, label: filters.map(sayFilter).join(' · ').slice(0, 40) })}><FolderPlus />Save as folder</Button></>}>
            {PINNED.map((k) => { const f = filters.find((x) => x.k === k); return (
              <FilterPill key={k} label={FD[k].label} value={f?.v.length ? f.v.map((id: string) => pinnedOpts[k].find((o) => o.v === id)?.l ?? id).join(', ') : undefined} onClear={() => clearFilter(k)}>
                <div className="mb-1.5 text-xs font-semibold text-muted">{FD[k].label}</div>
                <CheckList options={pinnedOpts[k]} value={f?.v ?? []} onChange={(v) => (v.length ? setFilter(k, v) : clearFilter(k))} />
              </FilterPill>
            ) })}
            {extra.map((f) => <FilterChip key={f.k} f={f} onChange={(v) => setFilter(f.k, v)} onRemove={() => clearFilter(f.k)} />)}
            <AddFilter onAdd={(k) => setFilters([...filters.filter((x) => x.k !== k), { k, v: structuredClone(FD[k].def) }])} exclude={filters.map((f) => f.k)} />
            {filters.length > 1 && <Segmented value={match} onChange={setMatch} options={[{ value: 'all', label: 'Match all' }, { value: 'any', label: 'Match any' }]} />}
            {filters.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setFilters([]); setNlNote('') }}>Clear all</Button>}
          </PillRow>
          {nlNote && <div className="flex items-start gap-2 border-b border-border-2 bg-subtle-2 px-3 py-2 text-sm anim-fade"><Sparkles className="mt-0.5 size-4 shrink-0 text-icon" /><span className="flex-1">{nlNote}{filters.length > 0 && <> Showing <b className="font-semibold">{nf(rows.length)}</b> people.</>}</span><button onClick={() => setNlNote('')} className="text-icon hover:text-text" aria-label="Dismiss"><X className="size-4" /></button></div>}

          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 overflow-auto" onContextMenu={(e) => e.preventDefault()}>
              <Table>
                <thead><tr>
                  <Th className="left-0 z-[2] w-9 pl-3 pr-0"><Checkbox checked={allSel ? true : sel.size ? 'indeterminate' : false} onCheckedChange={toggleAll} aria-label="Select all" /></Th>
                  <Th className="left-9 z-[2] min-w-[200px]"><SortHead k="name" label="Name" sort={sort} onSort={sortBy} /></Th>
                  {COLS.filter(([k]) => cols.includes(k)).map(([k, l]) => <Th key={k}>{SORT_KEY[k] ? <SortHead k={SORT_KEY[k]} label={l} sort={sort} onSort={sortBy} /> : l}</Th>)}
                  <Th className="w-8" />
                </tr></thead>
                <tbody>{shown.map((c) => <Row key={c.id} c={c} cols={cols} selected={sel.has(c.id)} onSelect={() => { const n = new Set(sel); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); setSel(n) }} onSave={() => openDlg('save', { count: 1, label: c.name || 'New folder' })} />)}</tbody>
              </Table>
              {!rows.length && <EmptyState icon={<Users />} title="No one matches" description="Change or clear the filters, or add people." action={<><Button onClick={() => { setFilters([]); setQ('') }}>Clear filters</Button><Button variant="primary" onClick={() => openDlg('add')}><Plus />Add contact</Button></>} />}
            </div>
            {sel.size > 0 && <BulkBar className="absolute inset-x-0 top-0" count={sel.size} total={rows.length} onToggleAll={toggleAll}><BulkActions ids={[...sel]} clear={() => setSel(new Set())} onSave={() => openDlg('save', { count: sel.size, label: 'Selected people' })} onEnrich={() => openDlg('enrich', { ids: [...sel] })} /></BulkBar>}
          </div>
          <Pager page={page} size={50} total={rows.length} onChange={setPage}>
            <span className="hidden sm:inline">{rows.filter((c) => c.consent.sms && !c.dnc).length} can get texts · {rows.filter((c) => c.consent.call && !c.dnc).length} calls · {rows.filter((c) => c.email).length} have email<span className="hidden lg:inline"> · Right-click a row for more</span></span>
          </Pager>
        </Card>
      </div>
    </>
  )
}

function SortHead({ k, label, sort, onSort }: { k: string; label: string; sort: { k: string; d: 1 | -1 }; onSort: (k: string) => void }) {
  return <button onClick={() => onSort(k)} className="-mx-1 inline-flex items-center gap-1 rounded-[6px] px-1 hover:bg-fill-hover hover:text-text">{label}{sort.k === k ? (sort.d === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 opacity-0 transition-opacity [button:hover>&]:opacity-100" />}</button>
}

/* ---------- filters ---------- */
function AddFilter({ onAdd, exclude }: { onAdd: (k: string) => void; exclude: string[] }) {
  const [open, setOpen] = React.useState(false); const [fq, setFq] = React.useState('')
  const groups = Array.from(new Set(FILTERS.map((f) => f.group)))
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><button className="inline-flex h-7 items-center gap-1 rounded-control border border-dashed border-border-strong bg-surface px-2 text-xs font-medium transition-colors hover:bg-subtle-2">Add filter<Plus className="size-3.5 text-icon" /></button></PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="border-b border-border p-1.5"><Input className="h-7 md:h-7" placeholder="Search 25 filters" value={fq} onChange={(e) => setFq(e.target.value)} autoFocus /></div>
        <div className="max-h-[320px] overflow-y-auto p-1.5">{groups.map((g) => { const fs = FILTERS.filter((f) => f.group === g && !exclude.includes(f.k) && f.label.toLowerCase().includes(fq.toLowerCase())); return fs.length ? <div key={g}><div className="px-2 py-1 text-xs font-semibold text-muted">{g}</div>{fs.map((f) => <button key={f.k} onClick={() => { onAdd(f.k); setOpen(false); setFq('') }} className="flex h-8 w-full items-center rounded-control px-2 text-left text-sm hover:bg-subtle-2">{f.label}</button>)}</div> : null })}</div>
      </PopoverContent>
    </Popover>
  )
}
function FilterChip({ f, onChange, onRemove }: { f: FilterT; onChange: (v: any) => void; onRemove: () => void }) {
  const d = FD[f.k]; const [open, setOpen] = React.useState(d.type === 'text' ? !f.v : Array.isArray(f.v) && !f.v.length)
  const opts = d.opts?.() ?? []
  return (
    <FilterPill label={d.label} value={sayFilter(f)} onClear={onRemove} open={open} onOpenChange={setOpen}>
      <div className="mb-2 text-xs font-semibold text-muted">{d.label}</div>
      {d.type === 'multi' && <CheckList options={opts} value={f.v} onChange={onChange} />}
      {d.type === 'one' && <Select value={f.v} onValueChange={onChange} options={opts.map((o) => ({ value: o.v, label: o.l }))} />}
      {d.type === 'yn' && <Segmented value={f.v} onChange={onChange} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />}
      {d.type === 'text' && <Input autoFocus value={f.v} onChange={(e) => onChange(e.target.value)} placeholder={f.k === 'zip' ? 'L5B, M5V, 11215 — several allowed' : 'Type a value'} onKeyDown={(e) => e.key === 'Enter' && setOpen(false)} />}
      {d.type === 'range' && <div className="flex items-center gap-2"><Input type="number" className="w-20" value={f.v[0]} onChange={(e) => onChange([+e.target.value, f.v[1]])} /><span className="text-sm text-muted">to</span><Input type="number" className="w-20" value={f.v[1]} onChange={(e) => onChange([f.v[0], +e.target.value])} /></div>}
      {d.type === 'recency' && <div className="flex flex-wrap items-center gap-2"><Segmented value={f.v.m} onChange={(m) => onChange({ ...f.v, m })} options={[{ value: 'in', label: 'Contacted' }, { value: 'out', label: 'Not contacted' }]} /><span className="text-sm text-muted">in the last</span><Input type="number" className="w-16" value={f.v.d} onChange={(e) => onChange({ ...f.v, d: +e.target.value })} /><span className="text-sm text-muted">days</span></div>}
      <div className="mt-3 flex justify-end"><Button variant="primary" onClick={() => setOpen(false)}>Done</Button></div>
    </FilterPill>
  )
}

/* ---------- table row ---------- */
function Row({ c, cols, selected, onSelect, onSave }: { c: Contact; cols: string[]; selected: boolean; onSelect: () => void; onSave: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const camp = s.campaigns.find((k) => k.id === c.camp); const stages = stagesFor(camp, s.stages)
  const sc = score(c)
  const addTag = async () => { const t = await askText({ title: `Add a tag to ${c.name || 'this contact'}`, label: 'Tag', placeholder: 'e.g. VIP' }); if (t) { s.updateContact(c.id, { tags: [...c.tags, t] }); toast.success(`Tagged “${t}”`) } }
  const cell: Record<string, React.ReactNode> = {
    phone: <PhoneMenu contact={c}><button className="tabular hover:text-primary" onClick={(e) => e.stopPropagation()}>{c.phone}</button></PhoneMenu>,
    email: c.email ? <span className="block max-w-[220px] truncate">{c.email}</span> : <Badge tone="amber">Missing</Badge>,
    stage: c.stage === '—' ? <span className="text-muted">—</span> : <StageTag name={c.stage} stages={stages} tip={<div className="space-y-0.5"><div><b className="font-semibold">Campaign:</b> {camp?.name ?? 'None'}</div><div><b className="font-semibold">Lead source:</b> {c.source}</div>{c.sold && <div><b className="font-semibold">Sold:</b> {c.sold}</div>}</div>} />,
    camp: camp ? <button className="block max-w-[200px] truncate hover:text-primary" onClick={(e) => { e.stopPropagation(); nav(`/campaigns/${camp.id}`) }}>{camp.name}</button> : <span className="text-muted">—</span>,
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
        <Td className="sticky left-0 z-[1] w-9 pl-3 pr-0" onClick={(e) => e.stopPropagation()}><Checkbox checked={selected} onCheckedChange={onSelect} aria-label={`Select ${c.name || 'contact'}`} /></Td>
        <Td className="sticky left-9 z-[1]"><span className="flex items-center gap-2"><Avatar name={c.name || '?'} size={20} /><span className={cn('truncate font-medium', !c.name && 'text-warning')}>{c.name || 'Name missing'}</span>{c.dnc && <Tip content="On Do-Not-Contact"><ShieldBan className="size-3.5 shrink-0 text-danger" /></Tip>}</span></Td>
        {COLS.filter(([k]) => cols.includes(k)).map(([k]) => <Td key={k} className="max-w-[240px]">{cell[k]}</Td>)}
        <Td className="w-8 pr-2" onClick={(e) => e.stopPropagation()}><DropdownMenuTrigger asChild><Button data-rowmenu variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" aria-label="Row menu"><MoreHorizontal /></Button></DropdownMenuTrigger></Td>
      </Tr>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={() => nav(`/contacts/${c.id}`)}><Users />Open profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSave}><FolderPlus />Save to folder</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => nav(`/campaigns/new?contact=${c.id}`)}><Megaphone />Start a campaign</DropdownMenuItem>
        <DropdownMenuSub><DropdownMenuSubTrigger><Kanban />Set stage</DropdownMenuSubTrigger><DropdownMenuSubContent>{stages.map((st) => <DropdownMenuItem key={st.id} onSelect={() => { s.moveLead(c.id, st.name, 'you'); toast.success(`${c.name || 'Contact'} moved to ${st.name}`) }}><StageTag name={st.name} stages={stages} size="sm" />{c.stage === st.name && <Check className="ml-auto" />}</DropdownMenuItem>)}{!stages.length && <DropdownMenuItem disabled>Not in a campaign</DropdownMenuItem>}</DropdownMenuSubContent></DropdownMenuSub>
        <DropdownMenuItem onSelect={addTag}><Tag />Add tag</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { s.patch('dnc', (d) => [{ id: 'd' + Date.now(), name: c.name, phone: c.phone, reason: 'Manual', added: 'Today', by: 'Bilal Nasir', comment: '' }, ...d]); s.updateContact(c.id, { dnc: true }); toast.success('Added to Do-Not-Contact') }}><ShieldBan />Add to Do-Not-Contact</DropdownMenuItem>
        <DropdownMenuItem danger onSelect={() => { s.patch('contacts', (cs) => cs.filter((x) => x.id !== c.id)); toast.success('Deleted · undo within 30 days', { action: { label: 'Undo', onClick: () => s.patch('contacts', (cs) => [c, ...cs]) } }) }}><Trash2 />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BulkActions({ ids, clear, onSave, onEnrich }: { ids: string[]; clear: () => void; onSave: () => void; onEnrich: () => void }) {
  const nav = useNavigate(); const s = useStore()
  const tag = async () => { const t = await askText({ title: `Tag ${ids.length} people`, label: 'Tag', placeholder: 'e.g. Spring promo' }); if (t) { ids.forEach((id) => { const c = s.contacts.find((x) => x.id === id); if (c) s.updateContact(id, { tags: [...c.tags, t] }) }); toast.success(`Tag “${t}” added to ${ids.length} people`) } }
  return (<>
    <Button size="sm" onClick={() => nav('/campaigns/new?selected=' + ids.length)}><Megaphone />Start campaign</Button>
    <Button size="sm" onClick={onSave}><FolderPlus />Save to folder</Button>
    <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm"><Kanban />Set stage<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent>{['New', 'Contacted', 'Interested', 'Pending', 'Order Booked', 'Not interested'].map((st) => <DropdownMenuItem key={st} onSelect={() => { ids.forEach((id) => s.moveLead(id, st, 'you')); toast.success(`${ids.length} moved to ${st}`); clear() }}>{st}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
    <Button size="sm" onClick={tag}><Tag />Add tag</Button>
    <Button size="sm" onClick={onEnrich}><Sparkles />Fill missing data</Button>
    <Button size="sm" variant="destructive" onClick={() => { const gone = s.contacts.filter((c) => ids.includes(c.id)); s.patch('contacts', (cs) => cs.filter((c) => !ids.includes(c.id))); toast.success(`${ids.length} deleted · undo within 30 days`, { action: { label: 'Undo', onClick: () => s.patch('contacts', (cs) => [...gone, ...cs]) } }); clear() }}><Trash2 />Delete</Button>
    <Button size="sm" variant="ghost" className="ml-auto" onClick={clear}>Clear</Button>
  </>)
}
