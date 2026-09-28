import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageSquare, Phone, Mail, CalendarDays, FileText, DollarSign, Sparkles, Pencil, Check, X, Kanban, ShoppingBag, Upload, StickyNote, Play, ChevronDown, ShieldBan, Trash2, Tag, Folder } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { useMax } from '@/features/max/store'
import { PageBody, PageHeader } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/controls'
import { Card, CardHeader, Property, PropertyList } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DirIcon, DirTag, PlatIcon } from '@/components/app/icons'
import { StageTag, AgentChip } from '@/components/app/bits'
import { PhoneMenu, EnrichDialog } from './dialogs'
import { askText } from '@/components/app/ask'
import { RecordSaleDialog } from '@/features/inbox/dialogs'
import { score } from './filters'
import { agoTxt, dNice } from '@/data/seed'

type HistItem = { k: 'chat' | 'call' | 'email' | 'stage' | 'sale' | 'book' | 'note' | 'import' | 'ai'; text: React.ReactNode; time: string; day: string; by?: string; sub?: React.ReactNode; open?: string; rec?: boolean }
const ICON: Record<HistItem['k'], { I: React.ComponentType<any>; c: string; l: string; d: string }> = {
  chat: { I: MessageSquare, c: 'text-info bg-info-soft', l: 'Chat', d: 'Text, WhatsApp or social message' }, call: { I: Phone, c: 'text-success bg-success-soft', l: 'Call', d: 'Phone call with recording and transcript' },
  email: { I: Mail, c: 'text-warning bg-warning-soft', l: 'Email', d: 'Email sent or received' }, stage: { I: Kanban, c: 'text-ai bg-ai-soft', l: 'Stage change', d: 'Moved between stages' },
  sale: { I: DollarSign, c: 'text-success bg-success-soft', l: 'Sale', d: 'Purchase recorded' }, book: { I: CalendarDays, c: 'text-primary bg-primary-soft', l: 'Booking', d: 'Appointment booked or changed' },
  note: { I: StickyNote, c: 'text-text-2 bg-subtle', l: 'Note', d: 'Team note' }, import: { I: Upload, c: 'text-text-2 bg-subtle', l: 'Added', d: 'How this person got into the database' }, ai: { I: Sparkles, c: 'text-ai bg-ai-soft', l: 'AI', d: 'Data found by AI' },
}

export function ContactProfile() {
  const { id } = useParams(); const nav = useNavigate(); const s = useStore(); const { send, newThread } = useMax()
  const c = s.contacts.find((x) => x.id === id)
  const [edit, setEdit] = React.useState<string | null>(null); const [val, setVal] = React.useState('')
  const [tab, setTab] = React.useState('all'); const [enrich, setEnrich] = React.useState(false); const [sale, setSale] = React.useState(false)
  if (!c) return <div className="p-6 text-muted">This contact was removed.</div>
  const camp = s.campaigns.find((k) => k.id === c.camp); const stages = stagesFor(camp, s.stages); const folder = s.folders.find((f) => f.id === c.folder)
  const convos = s.convos.filter((v) => v.cid === c.id); const calls = s.calls.filter((l) => l.cid === c.id); const emails = s.emails.filter((e) => e.cid === c.id); const bks = s.bookings.filter((b) => b.cid === c.id)
  const hist: HistItem[] = []
  convos.forEach((v) => { let day = 'Earlier'; v.items.forEach((it) => { if (it.t === 'day') day = it.text; else if (it.t === 'm') hist.push({ k: 'chat', day, time: it.time, by: it.d === 'o' ? it.who ?? undefined : undefined, text: <span>{it.d === 'i' ? <b>{c.first || 'Customer'}:</b> : <b>{s.agents.find((a) => a.id === it.who)?.name ?? 'You'}:</b>} “{it.text.length > 90 ? it.text.slice(0, 88) + '…' : it.text}”</span>, sub: <PlatIcon p={v.plat} size={12} />, open: `/inbox?kind=chat&id=${v.id}` }); else if (it.t === 'ev') hist.push({ k: it.k === 'book' ? 'book' : it.k === 'stage' ? 'stage' : 'note', day, time: it.time, text: it.text }); else if (it.t === 'call') hist.push({ k: 'call', day, time: it.time, by: it.who, text: <span>Call · {it.dur} with {s.agents.find((a) => a.id === it.who)?.name} — {it.summary}</span>, rec: true, open: `/inbox?kind=calls` }) }) })
  emails.forEach((e) => hist.push({ k: 'email', day: e.time.includes('PM') || e.time.includes('AM') ? 'Today' : 'Earlier', time: e.time, text: <span>{e.box === 'sent' ? 'Email sent' : 'Email received'}: “{e.subj}”</span>, open: `/inbox?kind=email&id=${e.id}` }))
  bks.forEach((b) => hist.push({ k: 'book', day: 'This week', time: dNice(b.date), text: <span>{b.svc} with {b.staff} · {b.status}</span>, open: '/bookings' }))
  if (c.purchase) hist.push({ k: 'sale', day: 'Earlier', time: c.purchase.date, text: <span>Bought <b>{c.purchase.product}</b> for {money(c.purchase.amount)}{camp?.pipe === 'telecom' ? '/mo' : ''}</span> })
  hist.push({ k: 'import', day: 'Earlier', time: folder?.saved.slice(0, 10) ?? '', text: <span>Added to the database from <b>{c.source}</b>{folder && <> · folder <b>{folder.name}</b></>}</span> })
  const order = ['Today', 'Yesterday', 'This week', 'Friday', 'Wednesday', 'Earlier']
  const shown = hist.filter((h) => tab === 'all' || (tab === 'chats' && h.k === 'chat') || (tab === 'calls' && h.k === 'call') || (tab === 'emails' && h.k === 'email') || (tab === 'sales' && h.k === 'sale') || (tab === 'stages' && h.k === 'stage') || (tab === 'bookings' && h.k === 'book'))
  const groups = order.map((d) => [d, shown.filter((h) => h.day === d)] as const).filter(([, l]) => l.length)
  const sc = score(c)
  const fields: [string, string, string][] = [['first', 'First name', c.first], ['last', 'Last name', c.last], ['phone', 'Mobile', c.phone], ['email', 'Email', c.email], ['address', 'Address', c.address], ['city', 'City', c.city], ['zip', 'Postal code', c.zip], ['country', 'Country', c.country], ['lang', 'Language', c.lang], ['age', 'Age', String(c.age)]]
  const saveField = (k: string) => { const p: any = { [k]: k === 'age' ? +val : val }; if (k === 'first' || k === 'last') p.name = `${k === 'first' ? val : c.first} ${k === 'last' ? val : c.last}`.trim(); s.updateContact(c.id, p); setEdit(null); toast.success('Saved · every agent now uses the new value') }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader crumbs={[{ label: 'Contacts', to: '/contacts' }]} title={c.name || 'Name missing'}
        actions={<>
          <Button variant="header" onClick={() => { newThread(); send(`Analyze ${c.name || 'this contact'}'s conversations and tell me what to do next`); nav('/max') }}><Sparkles />Analyze with AI</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="header">More actions<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={async () => { const t = await askText({ title: 'Add a tag', label: 'Tag', placeholder: 'e.g. VIP' }); if (t) s.updateContact(c.id, { tags: [...c.tags, t] }) }}><Tag />Add tag</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => nav('/contacts?view=folders')}><Folder />Move to folder</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { s.updateContact(c.id, { dnc: !c.dnc }); toast.success(c.dnc ? 'Removed from Do-Not-Contact' : 'Added to Do-Not-Contact') }}><ShieldBan />{c.dnc ? 'Remove from' : 'Add to'} Do-Not-Contact</DropdownMenuItem>
            <DropdownMenuSeparator /><DropdownMenuItem danger onSelect={() => { s.patch('contacts', (cs) => cs.filter((x) => x.id !== c.id)); nav('/contacts'); toast.success('Deleted · undo within 30 days') }}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </>} />
      <PageBody wide>
        {/* identity row */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={c.name || '?'} size={56} />
            <div>
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl">{c.name || 'Name missing'}</h1>{c.dnc && <Badge tone="red"><ShieldBan />Do-Not-Contact</Badge>}<Badge tone={sc === 'Hot' ? 'green' : sc === 'Warm' ? 'amber' : sc === 'Dead' ? 'red' : 'neutral'}>{sc}</Badge>{c.tags.map((t) => <Badge key={t} tone="outline">{t}</Badge>)}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted"><PhoneMenu contact={c}><button className="tabular hover:text-primary">{c.phone}</button></PhoneMenu>{c.email && <span>{c.email}</span>}<span>{c.city}, {c.country}</span>{c.stage !== '—' && <StageTag name={c.stage} stages={stages} />}<DirTag dir={c.dir} /></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => nav(`/inbox?kind=chat&to=${c.id}`)}><MessageSquare />Text</Button>
            <PhoneMenu contact={c}><Button size="sm"><Phone />Call</Button></PhoneMenu>
            <Button size="sm" onClick={() => nav(`/inbox?kind=email&compose=${c.id}`)}><Mail />Email</Button>
            <Button size="sm" onClick={() => nav(`/bookings?new=1&who=${c.id}`)}><CalendarDays />Book</Button>
            <Button size="sm" onClick={() => nav(`/inbox?kind=chat&to=${c.id}&quote=1`)}><FileText />Send quotation</Button>
            <Button size="sm" onClick={() => setSale(true)}><DollarSign />Record sale</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
          {/* details */}
          <Card className="self-start">
            <CardHeader title="Details" action={<Button size="sm" onClick={() => setEnrich(true)}><Sparkles />Fill missing</Button>} />
            <div className="divide-y divide-border px-4">
              {fields.map(([k, l, v]) => (
                <div key={k} className="group flex min-h-9 items-center gap-2 py-1">
                  <span className="w-[96px] shrink-0 text-sm text-muted">{l}</span>
                  {edit === k ? <><Input autoFocus className="h-7" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveField(k); if (e.key === 'Escape') setEdit(null) }} /><Button size="icon-xs" variant="primary" onClick={() => saveField(k)} aria-label="Save"><Check /></Button><Button size="icon-xs" variant="ghost" onClick={() => setEdit(null)} aria-label="Cancel"><X /></Button></>
                    : <><span className={cn('min-w-0 flex-1 truncate text-base', !v && 'text-warning')}>{v || 'Missing'}</span><Button size="icon-xs" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={() => { setEdit(k); setVal(v) }} aria-label={`Edit ${l}`}><Pencil /></Button></>}
                </div>
              ))}
              {s.customFields.map((f) => <div key={f.name} className="group flex min-h-9 items-center gap-2 py-1"><span className="w-[96px] shrink-0 truncate text-sm text-muted">{f.name}</span><span className={cn('flex-1 truncate text-base', !c.custom[f.name] && 'text-faint')}>{c.custom[f.name] || 'Empty'}</span><Button size="icon-xs" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={async () => { const v = await askText({ title: f.name, label: `${f.name} for ${c.name || 'this contact'}`, value: c.custom[f.name] ?? '' }); if (v !== null) s.updateContact(c.id, { custom: { ...c.custom, [f.name]: v } }) }} aria-label="Edit"><Pencil /></Button></div>)}
            </div>
            <div className="border-t border-border px-4 py-3">
              <div className="mb-1.5 text-sm font-medium">Permission</div>
              {([['sms', 'Texts'], ['call', 'Calls'], ['email', 'Emails'], ['wa', 'WhatsApp']] as const).map(([k, l]) => <label key={k} className="flex h-7 items-center justify-between text-sm"><span>{l}</span><Switch size="sm" checked={c.consent[k]} onCheckedChange={(v) => { s.updateContact(c.id, { consent: { ...c.consent, [k]: v } }); toast(`${v ? 'Allowed' : 'Stopped'} ${l.toLowerCase()} · applied to every agent`) }} /></label>)}
              <p className="mt-1.5 text-xs text-muted">Proof: {c.source}, {folder?.saved.slice(0, 10)}</p>
            </div>
          </Card>

          {/* journey */}
          <Card className="min-w-0">
            <CardHeader title="Journey" description="Every message, call, sale and change" />
            <Tabs value={tab} onValueChange={setTab}><TabsList className="px-2">{[['all', 'All'], ['chats', 'Chats'], ['calls', 'Calls'], ['emails', 'Emails'], ['sales', 'Sales'], ['stages', 'Stages'], ['bookings', 'Bookings']].map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}</TabsList></Tabs>
            <div className="px-4 py-2">
              {groups.map(([day, items]) => (
                <div key={day} className="py-2">
                  <h4 className="mb-1 text-muted">{day}</h4>
                  {items.map((h, i) => { const d = ICON[h.k]; return (
                    <div key={i} className="group flex gap-3 py-1.5">
                      <Tip content={<span><b>{d.l}</b> — {d.d}</span>}><span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[6px]', d.c)}><d.I className="size-3.5" /></span></Tip>
                      <div className="min-w-0 flex-1">
                        <div className="text-base leading-5">{h.text}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">{h.sub}<span>{h.time}</span>{h.by && <AgentChip id={h.by} size={14} className="text-xs" />}{h.rec && <button className="flex items-center gap-1 hover:text-text" onClick={() => toast('Playing recording (demo)')}><Play className="size-3" />Recording</button>}{h.open && <button className="opacity-0 hover:text-primary group-hover:opacity-100" onClick={() => nav(h.open!)}>Open</button>}</div>
                      </div>
                    </div>
                  ) })}
                </div>
              ))}
              {!groups.length && <p className="py-8 text-center text-sm text-muted">Nothing here yet.</p>}
            </div>
          </Card>

          {/* right column */}
          <div className="space-y-4">
            <Card><CardHeader title="Campaign & stage" />
              <div className="p-4">
                {camp ? <>
                  <button onClick={() => nav(`/campaigns/${camp.id}`)} className="flex w-full items-center gap-2 text-left text-base font-medium hover:text-primary"><DirIcon dir={camp.dir} size={14} />{camp.name}</button>
                  <div className="mt-2"><Select value={c.stage} onValueChange={(v) => s.moveLead(c.id, v, 'you')} options={stages.map((st) => ({ value: st.name, label: st.name, icon: <span className="size-2 rounded-full" style={{ background: st.color }} /> }))} /></div>
                  <p className="mt-1.5 text-xs text-muted">Changing it here updates Stages, dashboards and every agent.</p>
                </> : <p className="text-sm text-muted">Not in a campaign. <button className="text-primary" onClick={() => nav('/campaigns/new')}>Add to one</button></p>}
                <PropertyList className="mt-3" labelWidth={92}>
                  <Property label="Folder"><button className="truncate hover:text-primary" onClick={() => nav(`/contacts?folder=${c.folder}`)}>{folder?.name ?? '—'}</button></Property>
                  <Property label="Lead source"><span className="flex items-center gap-1.5"><DirIcon dir={c.dir} size={13} />{c.source}</span></Property>
                  <Property label="Agent"><AgentChip id={c.agent} size={18} /></Property>
                  <Property label="Tries">{c.attempts} · {c.noReply} without reply</Property>
                  <Property label="Last contact">{agoTxt(c.lastDays)}</Property>
                </PropertyList>
              </div></Card>
            <Card><CardHeader title="Purchases" action={<Button size="sm" onClick={() => setSale(true)}><DollarSign />Record sale</Button>} />
              {c.purchase ? <div className="flex items-center gap-3 p-4"><span className="flex size-8 items-center justify-center rounded-[6px] bg-success-soft text-success"><ShoppingBag className="size-4" /></span><div><div className="text-base font-medium">{c.purchase.product}</div><div className="text-xs text-muted">{money(c.purchase.amount)} · {dNice(c.purchase.date)}</div></div></div> : <p className="p-4 text-sm text-muted">No purchases yet.</p>}</Card>
            <Card><CardHeader title="Notes" description="For your team and agents" /><div className="p-4"><Textarea placeholder="e.g. Prefers calls after 5 PM" value={c.notes} onChange={(e) => s.updateContact(c.id, { notes: e.target.value })} className="min-h-[72px]" /></div></Card>
            <Card><CardHeader title="Recent conversations" />{convos.length ? <div>{convos.map((v) => <button key={v.id} onClick={() => nav(`/inbox?kind=chat&id=${v.id}`)} className="flex w-full items-center gap-2 border-b border-border px-4 py-2 text-left text-sm hover:bg-subtle-2 last:border-0"><PlatIcon p={v.plat} size={14} /><span className="flex-1 truncate">{(v.items.filter((i) => i.t === 'm').slice(-1)[0] as any)?.text}</span><span className="text-xs text-muted">{v.time}</span></button>)}{calls.length > 0 && <div className="px-4 py-2 text-xs text-muted">{calls.length} calls · {emails.length} emails</div>}</div> : <p className="p-4 text-sm text-muted">No conversations yet.</p>}</Card>
          </div>
        </div>
      </PageBody>
      <EnrichDialog open={enrich} onOpenChange={setEnrich} ids={[c.id]} />
      <RecordSaleDialog open={sale} onOpenChange={setSale} contact={c} />
    </div>
  )
}
