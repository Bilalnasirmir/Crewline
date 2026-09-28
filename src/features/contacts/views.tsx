import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Upload, MoreHorizontal, Folder, FolderPlus, FolderOpen, FolderInput, LayoutGrid, ShieldBan, HeartPulse, Trash2, Pencil, ChevronRight, Play, Check, RefreshCw, Settings2, Sparkles, X, Search, MessageSquareText } from 'lucide-react'
import { cn, nf, plural } from '@/lib/utils'
import { useStore } from '@/store'
import { PageHeader, PageBody } from '@/components/app/page'
import { IndexTabs, SearchRow, Pager } from '@/components/app/index-table'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Input, Field } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Banner, Card, CardHeader, EmptyState } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tip } from '@/components/ui/tooltip'
import { score } from './filters'
import type { ContactsDialog } from './page'
import type { Contact, Folder as FolderT } from '@/data/types'

const nowStamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
const savedOn = (s: string) => new Date(s.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/* ---------- Folders (Windows-style) ---------- */
export function FoldersView() {
  const nav = useNavigate(); const { folders, patch } = useStore()
  const [cur, setCur] = React.useState<string | null>(null); const [sort, setSort] = React.useState<'name' | 'date' | 'count'>('date'); const [q, setQ] = React.useState('')
  const [renaming, setRenaming] = React.useState<string | null>(null); const [nm, setNm] = React.useState('')
  const open = (id: string) => nav(`/contacts?folder=${id}`)
  const children = (p: string | null) => folders.filter((f) => (q ? f.name.toLowerCase().includes(q.toLowerCase()) : f.parent === p)).sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : sort === 'count' ? (b.count ?? 0) - (a.count ?? 0) : b.saved.localeCompare(a.saved)))
  const path: FolderT[] = []; let p = cur; while (p) { const f = folders.find((x) => x.id === p); if (!f) break; path.unshift(f); p = f.parent }
  const mk = async (group: boolean, parent = cur) => { const n = await askText({ title: group ? 'New group' : 'New folder', label: 'Name', placeholder: group ? 'e.g. Canada' : 'e.g. Toronto Leads', hint: group ? 'Groups hold folders, like Canada → Mississauga Leads.' : undefined, ok: 'Create' }); if (n) { patch('folders', (fs) => [...fs, { id: 'f' + Date.now(), name: n, parent, group, count: group ? undefined : 0, saved: nowStamp(), src: group ? undefined : 'Created by hand' }]); toast.success(`${group ? 'Group' : 'Folder'} “${n}” created`) } }
  const remove = async (f: FolderT) => { if (await askConfirm({ title: `Delete “${f.name}”?`, description: f.group ? 'The folders inside move to the top level. Nobody is deleted from your database.' : 'The people stay in your database — only the folder goes away.', ok: 'Delete', danger: true })) { patch('folders', (fs) => fs.filter((x) => x.id !== f.id).map((x) => (x.parent === f.id ? { ...x, parent: f.parent } : x))); toast.success(`“${f.name}” deleted`) } }
  const Tree = ({ parent, depth }: { parent: string | null; depth: number }) => <>{folders.filter((f) => f.parent === parent).map((f) => (
    <div key={f.id}>
      <button onClick={() => (f.group || folders.some((x) => x.parent === f.id) ? setCur(f.id) : open(f.id))} onDoubleClick={() => open(f.id)} className={cn('flex h-7 w-full items-center gap-1.5 rounded-control pr-2 text-sm transition-colors hover:bg-subtle-2', cur === f.id && 'bg-fill-selected font-semibold hover:bg-fill-selected')} style={{ paddingLeft: 8 + depth * 14 }}>
        {cur === f.id ? <FolderOpen className="size-4 shrink-0 text-icon" /> : <Folder className="size-4 shrink-0 text-icon" />}<span className="truncate">{f.name}</span>{f.count !== undefined && <span className="ml-auto text-xs text-muted tabular">{nf(f.count)}</span>}
      </button>
      <Tree parent={f.id} depth={depth + 1} />
    </div>
  ))}</>
  const list = children(cur)
  return (
    <>
      <PageHeader title="Folders" icon={<Folder />} sub={`${folders.filter((f) => !f.group).length} folders · ${folders.filter((f) => f.group).length} groups`}
        actions={<><Button variant="header" onClick={() => mk(true)}><FolderPlus />New group</Button><Button variant="primary" onClick={() => mk(false)}><Plus />New folder</Button></>} />
      <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
        <Card className="hidden w-60 shrink-0 flex-col overflow-hidden md:flex">
          <CardHeader title="All folders" className="pb-2" />
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <button onClick={() => setCur(null)} className={cn('flex h-7 w-full items-center gap-1.5 rounded-control px-2 text-sm transition-colors hover:bg-subtle-2', cur === null && 'bg-fill-selected font-semibold hover:bg-fill-selected')}><LayoutGrid className="size-4 text-icon" />Top level</button>
            <Tree parent={null} depth={0} />
          </div>
        </Card>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
            <nav className="flex min-w-0 flex-1 items-center gap-1 text-sm" aria-label="Folder path">
              <button onClick={() => setCur(null)} className={cn('hover:text-text', cur ? 'text-muted' : 'font-semibold')}>Folders</button>
              {path.map((f) => <React.Fragment key={f.id}><ChevronRight className="size-3.5 text-faint" /><button onClick={() => setCur(f.id)} className={cn('truncate hover:text-text', f.id === cur ? 'font-semibold text-text' : 'text-muted')}>{f.name}</button></React.Fragment>)}
            </nav>
            <label className="flex h-8 w-[200px] items-center gap-2 rounded-control border border-input-border bg-input-bg px-2.5 md:h-7"><Search className="size-4 text-icon" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search folders" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <Select variant="button" value={sort} onValueChange={(v) => setSort(v as typeof sort)} options={[{ value: 'date', label: 'Sort: Date saved' }, { value: 'name', label: 'Sort: Name' }, { value: 'count', label: 'Sort: Most people' }]} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-16" onContextMenu={(e) => e.preventDefault()}>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
              {list.map((f) => (
                <DropdownMenu key={f.id} modal={false}>
                  <Card className="group relative transition-colors hover:bg-subtle-2">
                    <button onDoubleClick={() => (f.group ? setCur(f.id) : open(f.id))} onClick={() => f.group && setCur(f.id)} onContextMenu={(e) => { e.preventDefault(); (e.currentTarget.parentElement?.querySelector('[data-fmenu]') as HTMLElement)?.click() }} className="flex w-full items-start gap-3 p-4 pr-10 text-left">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-subtle text-icon">{f.group ? <LayoutGrid className="size-4" /> : <Folder className="size-4" />}</span>
                      <span className="min-w-0 flex-1">
                        {renaming === f.id
                          ? <Input autoFocus className="h-7 md:h-7" value={nm} onChange={(e) => setNm(e.target.value)} onBlur={() => { patch('folders', (fs) => fs.map((x) => (x.id === f.id ? { ...x, name: nm.trim() || x.name } : x))); setRenaming(null) }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenaming(null) }} onClick={(e) => e.stopPropagation()} />
                          : <h3 className="truncate">{f.name}</h3>}
                        <span className="block truncate text-sm">{f.group ? plural(folders.filter((x) => x.parent === f.id).length, 'folder') : plural(f.count ?? 0, 'person', 'people')}</span>
                        <span className="block truncate text-xs text-muted">Saved {savedOn(f.saved)}{f.src ? ` · ${f.src}` : ''}</span>
                      </span>
                    </button>
                    <DropdownMenuTrigger asChild><Button data-fmenu variant="ghost" size="icon-sm" className="absolute right-2 top-2" aria-label={`${f.name} menu`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                  </Card>
                  <DropdownMenuContent align="end" className="w-52">
                    {!f.group && <DropdownMenuItem onSelect={() => open(f.id)}><FolderOpen />Open<span className="ml-auto text-xs text-muted">Double-click</span></DropdownMenuItem>}
                    {!f.group && <DropdownMenuItem onSelect={() => nav(`/campaigns/new?folder=${f.id}`)}><Play />Start campaign</DropdownMenuItem>}
                    <DropdownMenuItem onSelect={() => { setRenaming(f.id); setNm(f.name) }}><Pencil />Rename</DropdownMenuItem>
                    <DropdownMenuSub><DropdownMenuSubTrigger><FolderInput />Move to</DropdownMenuSubTrigger><DropdownMenuSubContent>{[{ id: null as string | null, name: 'Top level' }, ...folders.filter((x) => x.group && x.id !== f.id)].map((g) => <DropdownMenuItem key={g.id ?? 'root'} onSelect={() => { patch('folders', (fs) => fs.map((x) => (x.id === f.id ? { ...x, parent: g.id } : x))); toast.success(`Moved to ${g.name}`) }}>{g.name}{f.parent === g.id && <Check className="ml-auto" />}</DropdownMenuItem>)}</DropdownMenuSubContent></DropdownMenuSub>
                    <DropdownMenuItem onSelect={() => mk(false, f.id)}><FolderPlus />New {f.group ? 'folder inside' : 'subfolder'}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem danger onSelect={() => remove(f)}><Trash2 />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
            {!list.length && <Card className="mt-1"><EmptyState icon={<Folder />} title={q ? 'No folders match' : 'This group is empty'} description="Filter people in Contacts, then Save as folder — or create one here." action={<Button variant="primary" onClick={() => mk(false)}><FolderPlus />New folder</Button>} /></Card>}
            <p className="mt-4 text-center text-sm text-muted">Double-click a folder to see its people. Right-click for Start campaign, Rename, Move and Delete.</p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- Do-Not-Contact ---------- */
const REASONS = ['Opted out', 'Litigator', 'National Do-Not-Call list', 'Asked by email', 'Manual']
export function DncView({ onImport }: { onImport: () => void }) {
  const nav = useNavigate(); const { dnc, patch, prefs, setPref } = useStore()
  const [q, setQ] = React.useState(''); const [tab, setTab] = React.useState('all'); const [page, setPage] = React.useState(0)
  const [add, setAdd] = React.useState(false); const [f, setF] = React.useState({ name: '', phone: '', reason: 'Manual', comment: '' })
  const rows = dnc.filter((d) => (tab === 'all' || d.reason === tab) && `${d.name} ${d.phone} ${d.reason} ${d.comment}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHeader title="Do-Not-Contact" icon={<ShieldBan />} sub={`${nf(dnc.length)} numbers`}
        actions={<><Button variant="header" onClick={() => nav('/settings/dncset')}><Settings2 />Settings</Button><Button variant="header" onClick={onImport}><Upload />Import list</Button><Button variant="primary" onClick={() => { setF({ name: '', phone: '', reason: 'Manual', comment: '' }); setAdd(true) }}><Plus />Add number</Button></>} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
        {!prefs.dncBannerHidden && <Banner tone="info" className="shrink-0" onDismiss={() => setPref('dncBannerHidden', true)}>Numbers here are skipped in every campaign, by every agent. Each campaign shows what it skipped and lets you send anyway.</Banner>}
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <IndexTabs value={tab} onChange={(v) => { setTab(v); setPage(0) }} tabs={[{ value: 'all', label: 'All' }, ...REASONS.map((r) => ({ value: r, label: r }))]} />
          <SearchRow value={q} onChange={setQ} placeholder="Search name, number, reason or comment" />
          <div className="min-h-0 flex-1 overflow-auto">
            <Table>
              <thead><tr><Th>Name</Th><Th>Phone</Th><Th>Reason</Th><Th>Added</Th><Th>By</Th><Th>Comment</Th><Th className="w-16" /></tr></thead>
              <tbody>{rows.slice(page * 50, page * 50 + 50).map((d) => (
                <Tr key={d.id}>
                  <Td className="font-medium">{d.name}</Td><Td className="tabular">{d.phone}</Td>
                  <Td><Badge tone={d.reason === 'Litigator' ? 'red' : d.reason === 'Opted out' ? 'amber' : 'neutral'}>{d.reason}</Badge></Td>
                  <Td className="text-muted">{d.added}</Td><Td className="text-muted">{d.by}</Td>
                  <Td className="max-w-[280px] truncate text-muted">{d.comment || '—'}</Td>
                  <Td className="text-right">
                    <Tip content="Edit comment"><Button variant="ghost" size="icon-xs" onClick={async () => { const c = await askText({ title: 'Comment', label: `Why is ${d.phone} on the list?`, value: d.comment, multiline: true }); if (c !== null) patch('dnc', (x) => x.map((y) => (y.id === d.id ? { ...y, comment: c } : y))) }} aria-label="Edit comment"><MessageSquareText /></Button></Tip>
                    <Tip content="Remove from the list"><Button variant="ghost" size="icon-xs" onClick={async () => { if (await askConfirm({ title: `Remove ${d.phone}?`, description: 'Agents will be able to contact this number again in campaigns that include it.', ok: 'Remove', danger: true })) { patch('dnc', (x) => x.filter((y) => y.id !== d.id)); toast.success('Removed from Do-Not-Contact') } }} aria-label="Remove"><Trash2 /></Button></Tip>
                  </Td>
                </Tr>
              ))}</tbody>
            </Table>
            {!rows.length && <EmptyState compact icon={<ShieldBan />} title="No numbers match" />}
          </div>
          <Pager page={page} size={50} total={rows.length} onChange={setPage} />
        </Card>
      </div>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent title="Add to Do-Not-Contact" size="sm" footer={<><Button onClick={() => setAdd(false)}>Cancel</Button><Button variant="primary" disabled={!f.phone.trim()} onClick={() => { patch('dnc', (x) => [{ id: 'd' + Date.now(), name: f.name || '—', phone: f.phone, reason: f.reason, added: 'Today', by: 'Bilal Nasir', comment: f.comment }, ...x]); setAdd(false); toast.success(`${f.phone} added · skipped in every campaign from now on`) }}>Add</Button></>}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3"><Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoFocus placeholder="(905) 555-0100" /></Field><Field label="Name (optional)"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
            <Field label="Reason"><Select value={f.reason} onValueChange={(v) => setF({ ...f, reason: v })} options={REASONS.map((x) => ({ value: x, label: x }))} /></Field>
            <Field label="Comment"><Input value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} placeholder="e.g. Asked us to stop on the phone" /></Field>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------- Database health ---------- */
export function HealthView({ openDlg }: { openDlg: (d: ContactsDialog, o?: { tab?: string; ids?: string[] }) => void }) {
  const nav = useNavigate(); const s = useStore()
  const dead = s.contacts.filter((c) => score(c) === 'Dead'); const nr = s.contacts.filter((c) => score(c) === 'Not responding')
  const list = [...dead, ...nr]
  const [found, setFound] = React.useState<Record<string, string>>({}); const [looking, setLooking] = React.useState<string[]>([]); const [rule, setRule] = React.useState('')
  const find = (c: Contact) => { setLooking((l) => [...l, c.id]); setTimeout(() => { setLooking((l) => l.filter((x) => x !== c.id)); setFound((f) => ({ ...f, [c.id]: c.phone.replace(/\d{4}$/, (m) => String((+m + 1) % 10000).padStart(4, '0')) })); toast(`New number found for ${c.name || c.phone}`) }, 1100) }
  const tiles: [string, number, string][] = [['Hot', s.contacts.filter((c) => score(c) === 'Hot').length, 'Reached a qualified, booked or won stage'], ['Warm', s.contacts.filter((c) => score(c) === 'Warm').length, 'Contacted in the last 14 days'], ['Cold', s.contacts.filter((c) => score(c) === 'Cold').length, 'No contact for 14+ days'], ['Not responding', nr.length, '3+ tries without a reply'], ['Dead', dead.length, 'Matches a dead-number rule'], ['Complete profiles', s.contacts.filter((c) => c.email && c.name && c.address).length, 'Name, email and address all filled']]
  const addRule = () => { if (rule.trim()) { s.patch('deadRules', (rs) => [...rs, { on: true, t: rule.trim() }]); setRule(''); toast.success('Rule added · checked every night') } }
  return (
    <>
      <PageHeader title="Database health" icon={<HeartPulse />} sub="Keeps your database fresh without anyone checking it by hand"
        actions={<><Button variant="header" onClick={() => openDlg('settings', { tab: 'score' })}>Lead scoring</Button><Button variant="primary" onClick={() => openDlg('enrich', { ids: list.map((c) => c.id) })}><Sparkles />Find updated info for all</Button></>} />
      <PageBody wide>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {tiles.map(([l, n, d]) => (
            <Tip key={l} content={d}>
              <Card className="cursor-pointer p-3 transition-colors hover:bg-subtle-2" onClick={() => nav(l === 'Complete profiles' ? '/contacts' : `/contacts?score=${encodeURIComponent(l)}`)}>
                <h3 className="truncate">{l}</h3><div className="text-2xl font-semibold tabular">{nf(n)}</div>
              </Card>
            </Tip>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader title={`Dead numbers & not responding · ${list.length}`} description="Remove them to keep campaigns clean, keep them, or let AI look for updated details."
              action={<Button variant="destructive" disabled={!dead.length} onClick={async () => { if (await askConfirm({ title: `Remove ${dead.length} dead numbers?`, description: 'They leave every campaign and folder. You can restore them within 30 days.', ok: 'Remove all dead', danger: true })) { const gone = dead; s.patch('contacts', (cs) => cs.filter((c) => score(c) !== 'Dead')); toast.success(`${gone.length} removed`, { action: { label: 'Undo', onClick: () => s.patch('contacts', (cs) => [...gone, ...cs]) } }) } }}><Trash2 />Remove all dead</Button>} />
            <div className="overflow-x-auto">
              <Table>
                <thead><tr><Th>Name</Th><Th>Phone</Th><Th>Why</Th><Th>Campaign</Th><Th className="text-right">Actions</Th></tr></thead>
                <tbody>{list.slice(0, 40).map((c) => (
                  <Tr key={c.id} clickable onClick={() => nav(`/contacts/${c.id}`)}>
                    <Td className="font-medium">{c.name || <span className="text-warning">Name missing</span>}</Td>
                    <Td className="tabular">{found[c.id] ? <span className="flex items-center gap-1.5"><span className="text-muted line-through">{c.phone}</span><ChevronRight className="size-3.5 text-faint" /><span className="font-medium text-success">{found[c.id]}</span></span> : c.phone}</Td>
                    <Td><Badge tone={score(c) === 'Dead' ? 'red' : 'amber'}>{score(c) === 'Dead' ? 'Dead' : 'Not responding'} · {c.noReply} tries</Badge></Td>
                    <Td className="max-w-[160px] truncate text-muted">{s.campaigns.find((k) => k.id === c.camp)?.name ?? '—'}</Td>
                    <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                      {found[c.id]
                        ? <span className="inline-flex gap-1.5"><Button size="sm" variant="primary" onClick={() => { s.updateContact(c.id, { phone: found[c.id], noReply: 0, attempts: 0 }); setFound((f) => { const n = { ...f }; delete n[c.id]; return n }); toast.success('Number updated · back in active campaigns') }}><Check />Update number</Button><Button size="sm" variant="ghost" onClick={() => setFound((f) => { const n = { ...f }; delete n[c.id]; return n })}><X />Ignore</Button></span>
                        : <span className="inline-flex gap-1.5"><Button size="sm" loading={looking.includes(c.id)} onClick={() => find(c)}>{!looking.includes(c.id) && <RefreshCw />}Find updated info</Button><Button size="sm" variant="ghost" onClick={() => { s.updateContact(c.id, { noReply: 0 }); toast('Kept · counts reset') }}>Keep</Button><Button size="sm" variant="ghost" onClick={() => { s.patch('contacts', (cs) => cs.filter((x) => x.id !== c.id)); toast.success('Removed', { action: { label: 'Undo', onClick: () => s.patch('contacts', (cs) => [c, ...cs]) } }) }}>Remove</Button></span>}
                    </Td>
                  </Tr>
                ))}</tbody>
              </Table>
              {!list.length && <EmptyState compact icon={<HeartPulse />} title="All clean" description="No dead or unresponsive numbers right now." />}
            </div>
          </Card>
          <Card className="self-start overflow-hidden">
            <CardHeader title="Dead-number rules" description="Matching contacts move to Dead numbers." action={<Button variant="ghost" onClick={() => openDlg('settings', { tab: 'dead' })}>Edit</Button>} />
            {s.deadRules.map((r, i) => (
              <label key={i} className="flex cursor-pointer items-center gap-3 border-t border-border-2 px-4 py-2">
                <span className={cn('flex-1 text-sm', !r.on && 'text-muted')}>{r.t}</span>
                <Switch size="sm" checked={r.on} onCheckedChange={(v) => s.patch('deadRules', (rs) => rs.map((x, j) => (j === i ? { ...x, on: v } : x)))} />
              </label>
            ))}
            <div className="flex gap-2 border-t border-border-2 p-3"><Input value={rule} onChange={(e) => setRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addRule()} placeholder="e.g. No answer to 4 calls in 2 weeks" /><Button onClick={addRule}><Plus />Add</Button></div>
          </Card>
        </div>
      </PageBody>
    </>
  )
}
