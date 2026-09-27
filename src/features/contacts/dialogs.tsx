import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Upload, Sparkles, Check, Phone, PhoneCall, Copy, MessageSquare, Merge, SkipForward, Trash2, Plus, FolderPlus } from 'lucide-react'
import { cn, nf, uid } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch, ChoiceRow, Progress } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AgentAvatar } from '@/components/ui/avatar'
import { AiMark } from '@/components/app/icons'
import type { Contact } from '@/data/types'

/* ---------- Add contact ---------- */
export function AddContactDialog({ open, onOpenChange, folder }: { open: boolean; onOpenChange: (o: boolean) => void; folder?: string }) {
  const { patch, customFields, folders } = useStore()
  const [f, setF] = React.useState<Record<string, string>>({ first: '', last: '', phone: '', email: '', address: '', city: 'Mississauga', country: 'Canada', zip: '', folder: folder ?? 'f1', source: 'Other' })
  const [custom, setCustom] = React.useState<{ name: string; type: string; value: string }[]>([])
  const [consent, setConsent] = React.useState(true); const [enrich, setEnrich] = React.useState(true)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const save = () => {
    const c: Contact = { id: uid('c'), first: f.first, last: f.last, name: `${f.first} ${f.last}`.trim(), gender: 'F', age: 30, phone: f.phone || '(905) 555-0100', email: f.email, address: f.address, city: f.city, region: '', country: f.country, zip: f.zip, folder: f.folder, camp: null, stage: '—', dir: 'out', source: f.source, agent: null, purchase: null, lastDays: 0, attempts: 0, noReply: 0, consent: { sms: consent, call: consent, email: consent, wa: consent }, dnc: false, tags: [], lang: 'English', notes: '', unknownName: !f.first, custom: Object.fromEntries(custom.map((x) => [x.name, x.value])) }
    patch('contacts', (cs) => [c, ...cs]); if (custom.length) patch('customFields', (cf) => [...cf, ...custom.filter((x) => !cf.some((y) => y.name === x.name)).map((x) => ({ name: x.name, type: x.type }))])
    onOpenChange(false); toast.success(`${c.name || 'Contact'} added${enrich ? ' · filling missing details with AI' : ''}`)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Add a contact" description="Fill in what you know. AI can find the rest." size="md" footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" onClick={save}>Add contact</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name"><Input value={f.first} onChange={set('first')} autoFocus /></Field>
          <Field label="Last name"><Input value={f.last} onChange={set('last')} /></Field>
          <Field label="Mobile"><Input value={f.phone} onChange={set('phone')} placeholder="(905) 555-0100" /></Field>
          <Field label="Email"><Input value={f.email} onChange={set('email')} placeholder="name@example.com" /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={f.address} onChange={set('address')} /></Field>
          <Field label="City"><Input value={f.city} onChange={set('city')} /></Field>
          <Field label="Postal / zip code"><Input value={f.zip} onChange={set('zip')} /></Field>
          <Field label="Lead folder"><Select value={f.folder} onValueChange={(v) => setF({ ...f, folder: v })} options={folders.filter((x) => !x.group).map((x) => ({ value: x.id, label: x.name }))} /></Field>
          <Field label="Lead source"><Select value={f.source} onValueChange={(v) => setF({ ...f, source: v })} options={useStore.getState().sources.map((s) => ({ value: s.n, label: s.n }))} /></Field>
          {custom.map((x, i) => <Field key={i} label={x.name} action={<button className="text-xs text-muted hover:text-danger" onClick={() => setCustom(custom.filter((_, j) => j !== i))}>Remove</button>}><Input value={x.value} onChange={(e) => setCustom(custom.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} /></Field>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm"><Plus />Add a field</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Your custom fields</DropdownMenuLabel>
              {customFields.map((cf) => <DropdownMenuItem key={cf.name} onSelect={() => setCustom([...custom, { name: cf.name, type: cf.type, value: '' }])}>{cf.name}<span className="ml-auto text-xs text-faint">{cf.type}</span></DropdownMenuItem>)}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { const n = window.prompt('New field name'); if (n) setCustom([...custom, { name: n, type: 'Text', value: '' }]) }}><Plus />New text field…</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { const n = window.prompt('New dropdown field name'); if (n) setCustom([...custom, { name: n, type: 'Dropdown', value: '' }]) }}><Plus />New dropdown field…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 divide-y divide-border rounded-card border border-border">
          <label className="flex items-center justify-between px-3 py-2.5"><span className="text-base">They agreed to be contacted</span><Switch checked={consent} onCheckedChange={setConsent} /></label>
          <label className="flex items-center justify-between px-3 py-2.5"><span className="flex items-center gap-1.5 text-base"><AiMark />Fill in anything missing with AI</span><Switch checked={enrich} onCheckedChange={setEnrich} /></label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Import ---------- */
export function ImportDialog({ open, onOpenChange, dnc }: { open: boolean; onOpenChange: (o: boolean) => void; dnc?: boolean }) {
  const [step, setStep] = React.useState(0); const [file, setFile] = React.useState(''); const [dup, setDup] = React.useState(0); const [cons, setCons] = React.useState(1); const [folder, setFolder] = React.useState('new'); const [name, setName] = React.useState('')
  const { folders, patch } = useStore(); const fileRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { if (open) { setStep(0); setFile('') } }, [open])
  const cols = [['Full Name', 'Name', 99], ['Tel #', 'Mobile', 97], ['E-mail', 'Email', 99], ['Postal', 'Postal code', 94], ['Sex', 'Gender', 91], ['Last Product', 'Last purchase · product', 88], ['Purchase Dt', 'Last purchase · date', 86], ['Provider', 'Current carrier (custom field)', 72]] as const
  const finish = () => { if (!dnc) { const id = uid('f'); patch('folders', (fs) => [...fs, { id, name: name || file.replace(/\.[^.]+$/, ''), parent: 'g1', count: 50214, saved: '2026-09-27 23:10', src: `Imported file · ${file}` }]) } setStep(3) }
  const steps = ['Upload', 'Match columns', 'Check & confirm', 'Done']
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={dnc ? 'Import a Do-Not-Contact list' : 'Import contacts'} description="Any format: CSV, Excel, Google Sheets, vCard or a pasted list" size="lg"
        footer={step < 3 ? <><Button onClick={() => (step ? setStep(step - 1) : onOpenChange(false))}>{step ? 'Back' : 'Cancel'}</Button>{step === 0 ? <Button variant="primary" disabled={!file} onClick={() => setStep(1)}>Continue</Button> : step === 1 ? <Button variant="primary" onClick={() => setStep(2)}>Continue</Button> : <Button variant="primary" onClick={finish}>Import 50,214 {dnc ? 'numbers' : 'people'}</Button>}</> : <Button variant="primary" onClick={() => onOpenChange(false)}>Done</Button>}>
        <div className="mb-5 flex items-center gap-2">{steps.map((s, i) => <React.Fragment key={s}><span className={cn('flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-medium', i === step ? 'bg-primary-soft text-primary' : i < step ? 'text-success' : 'text-muted')}><span className={cn('flex size-4 items-center justify-center rounded-full text-[10px]', i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-subtle')}>{i < step ? <Check className="size-2.5" strokeWidth={3} /> : i + 1}</span>{s}</span>{i < 3 && <span className="h-px w-6 bg-border" />}</React.Fragment>)}</div>
        {step === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border-strong px-6 py-10 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]?.name ?? 'leads.csv') }}>
            <span className="flex size-10 items-center justify-center rounded-card bg-subtle text-muted"><Upload className="size-5" /></span>
            <div><p className="font-medium">Drop a file here</p><p className="text-sm text-muted">Any column names are fine — AI matches them to your fields in the next step.</p></div>
            <input ref={fileRef} type="file" hidden onChange={(e) => setFile(e.target.files?.[0]?.name ?? '')} />
            <div className="flex gap-2"><Button variant="primary" onClick={() => fileRef.current?.click()}>Choose a file</Button><Button onClick={() => setFile('mississauga_leads_oct.xlsx')}>Use a sample file</Button></div>
            {file && <Badge tone="green"><Check />{file}</Badge>}
            <p className="text-xs text-muted">You can also connect Google Sheets, a CRM or a form in Settings → Connected apps.</p>
          </div>
        )}
        {step === 1 && (
          <div className="overflow-hidden rounded-card border border-border">
            <div className="flex h-9 items-center justify-between border-b border-border bg-subtle-2 px-3 text-sm"><span className="font-medium">{file} · 50,214 rows</span><span className="flex items-center gap-1 text-ai"><AiMark />AI matched 8 of 8 columns</span></div>
            <Table><thead><tr><Th>Column in your file</Th><Th>Example</Th><Th>Goes into</Th><Th>Confidence</Th></tr></thead>
              <tbody>{cols.map((c, i) => <Tr key={c[0]}><Td className="font-medium">{c[0]}</Td><Td className="text-muted">{['Maria Rivera', '905-555-2187', 'maria.rivera@gmail.com', 'L5B 9K4', 'F', 'Internet 1 Gig', '2026-08-13', 'Bell'][i]}</Td><Td><Select size="sm" className="w-[240px]" value={c[1]} options={[{ value: c[1], label: c[1] }, { value: 'skip', label: 'Don’t import' }, { value: 'new', label: '+ Create a new field…' }]} /></Td><Td><Badge tone={c[2] > 80 ? 'green' : 'amber'}>{c[2]}%{c[2] <= 80 ? ' · check' : ''}</Badge></Td></Tr>)}</tbody></Table>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><h3>1,212 look like people you already have</h3><p className="text-sm text-muted">Matched by phone, email, or name + address. Nothing is lost — merging keeps all history on one person.</p>
              {['Merge them (recommended)', 'Keep both copies', 'Skip them'].map((o, i) => <ChoiceRow key={o} checked={dup === i} onClick={() => setDup(i)} title={o} />)}</div>
            <div className="space-y-2"><h3>{dnc ? 'Where to keep them' : 'Save them as a folder'}</h3>
              {!dnc && <><ChoiceRow checked={folder === 'new'} onClick={() => setFolder('new')} title="New folder" description={<Input className="mt-1 h-7" placeholder="Folder name" value={name} onChange={(e) => setName(e.target.value)} onClick={(e) => e.stopPropagation()} />} /><ChoiceRow checked={folder === 'existing'} onClick={() => setFolder('existing')} title="Add to an existing folder" description={<Select size="sm" className="mt-1" value="f1" options={folders.filter((x) => !x.group).map((x) => ({ value: x.id, label: x.name }))} />} /></>}
              <h3 className="pt-2">How did they agree to hear from you?</h3>
              {['Signed up on my website or a form', 'Existing customers', 'I bought or was given this list'].map((o, i) => <ChoiceRow key={o} checked={cons === i} onClick={() => setCons(i)} title={o} />)}
              {cons === 2 && <p className="rounded-control bg-warning-soft px-3 py-2 text-sm text-warning">Bought lists get email only until each person agrees to texts or calls.</p>}
              <label className="flex items-center justify-between rounded-card border border-border px-3 py-2.5"><span className="flex items-center gap-1.5 text-base"><AiMark />Fill missing details after import</span><Switch defaultChecked /></label>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center"><Badge tone="green" className="mb-3"><Check />Import finished</Badge><h2>50,214 {dnc ? 'numbers are on your Do-Not-Contact list' : 'people are in your database'}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['New', '49,002'], ['Merged', '1,212'], ['Emails being filled', '8,430'], ['On Do-Not-Contact', '1,947']].map(([l, v]) => <div key={l} className="rounded-card border border-border p-3"><div className="text-xs text-muted">{l}</div><div className="text-xl font-semibold tabular">{v}</div></div>)}</div></div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Save to folder ---------- */
export function SaveFolderDialog({ open, onOpenChange, count, label }: { open: boolean; onOpenChange: (o: boolean) => void; count: number; label: string }) {
  const { folders, patch } = useStore()
  const [mode, setMode] = React.useState<'new' | 'existing'>('new'); const [name, setName] = React.useState(label); const [parent, setParent] = React.useState('g1'); const [existing, setExisting] = React.useState('f3')
  React.useEffect(() => { if (open) setName(label) }, [open, label])
  const save = () => {
    if (mode === 'new') patch('folders', (fs) => [...fs, { id: uid('f'), name: name || 'New folder', parent, count, saved: new Date().toISOString().slice(0, 16).replace('T', ' '), src: 'Saved from filters' }])
    else patch('folders', (fs) => fs.map((f) => (f.id === existing ? { ...f, count: (f.count ?? 0) + count } : f)))
    onOpenChange(false); toast.success(mode === 'new' ? `Folder “${name}” saved with ${nf(count)} people` : `${nf(count)} people added to the folder`)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Save to folder" description={`${nf(count)} people`} size="sm" footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" onClick={save}><FolderPlus />Save</Button></>}>
        <div className="space-y-2">
          <ChoiceRow checked={mode === 'new'} onClick={() => setMode('new')} title="Save as a new folder" description={mode === 'new' && <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" autoFocus /><Select size="sm" value={parent} onValueChange={setParent} options={[{ value: 'root', label: 'Top level' }, ...folders.filter((f) => f.group).map((f) => ({ value: f.id, label: `Inside ${f.name}` }))]} /></div>} />
          <ChoiceRow checked={mode === 'existing'} onClick={() => setMode('existing')} title="Add to an existing folder" description={mode === 'existing' && <div className="mt-2" onClick={(e) => e.stopPropagation()}><Select size="sm" value={existing} onValueChange={setExisting} options={folders.filter((f) => !f.group).map((f) => ({ value: f.id, label: f.name }))} /></div>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Phone menu: dial or AI call ---------- */
export function PhoneMenu({ contact, children }: { contact: Contact; children: React.ReactElement }) {
  const nav = useNavigate(); const { agents, updateContact, addActivity } = useStore()
  const aiCall = (id: string) => { const a = agents.find((x) => x.id === id)!; updateContact(contact.id, { stage: contact.stage === "—" || contact.stage === "New" ? "Contacted" : contact.stage, lastDays: 0, attempts: contact.attempts + 1, agent: id }); addActivity({ icon: 'phone', text: `<b>${a.name}</b> is calling <b>${contact.name || contact.phone}</b> now`, time: 'just now', k: 'call' }); toast.success(`${a.name} is calling ${contact.name || contact.phone} · database updated to Contacted`) }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="tabular">{contact.phone}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => nav(`/inbox?kind=calls&dial=${encodeURIComponent(contact.phone)}`)}><Phone />Call myself</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => nav(`/inbox?kind=chat&to=${contact.id}`)}><MessageSquare />Send a text</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1"><AiMark />Assign an AI agent to call now</DropdownMenuLabel>
        {agents.filter((a) => ['sales', 'reception', 'support'].includes(a.type)).slice(0, 5).map((a) => <DropdownMenuItem key={a.id} onSelect={() => aiCall(a.id)}><AgentAvatar name={a.name} size={18} />{a.name}<span className="ml-auto text-xs text-faint">{a.type}</span></DropdownMenuItem>)}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { navigator.clipboard?.writeText(contact.phone); toast('Copied') }}><Copy />Copy number</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------- Missing details / Duplicates / Enrich ---------- */
export function MissingDialog({ open, onOpenChange, onEnrich }: { open: boolean; onOpenChange: (o: boolean) => void; onEnrich: () => void }) {
  const contacts = useStore((s) => s.contacts)
  const rows = [['Name', contacts.filter((c) => !c.name).length], ['Email', contacts.filter((c) => !c.email).length], ['Address', contacts.filter((c) => !c.address).length], ['Postal code', contacts.filter((c) => !c.zip).length], ['Language', 0]] as const
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Missing details" description="What’s empty across your database" size="sm" footer={<><Button onClick={() => onOpenChange(false)}>Add manually</Button><Button variant="ai" onClick={() => { onOpenChange(false); onEnrich() }}><Sparkles />Fill missing data with AI</Button></>}>
        <div className="divide-y divide-border rounded-card border border-border">{rows.map(([l, n]) => <div key={l} className="flex items-center justify-between px-3 py-2.5 text-base"><span>{l}</span><span className={cn('tabular', n ? 'font-medium text-warning' : 'text-muted')}>{n ? `${n} missing` : 'complete'}</span></div>)}</div>
        <p className="mt-3 text-sm text-muted">AI looks up each person in your data providers and public sources. If nothing is found, the field stays empty — never guessed.</p>
      </DialogContent>
    </Dialog>
  )
}
export function DuplicatesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const dups = useStore((s) => s.dups), patch = useStore((s) => s.patch)
  const act = (i: number, what: string) => { patch('dups', (d) => d.filter((_, j) => j !== i)); toast.success(what) }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`${nf(1202 + dups.length - 5)} duplicates detected`} description="Nothing is deleted without your choice" size="lg" footer={<><Button onClick={() => onOpenChange(false)}>Close</Button><Button variant="primary" onClick={() => { patch('dups', () => []); toast.success('Merged all exact matches · 1,202 people cleaned up') }}><Merge />Merge all exact matches</Button></>}>
        <div className="space-y-2">{dups.map((d, i) => (
          <div key={i} className="rounded-card border border-border p-3">
            <div className="mb-2 flex items-center justify-between"><Badge tone="amber">{d.why}</Badge><div className="flex gap-1"><Button size="sm" onClick={() => act(i, 'Merged into one person')}><Merge />Merge</Button><Button size="sm" onClick={() => act(i, 'Kept the newest record')}>Overwrite</Button><Button size="sm" variant="ghost" onClick={() => act(i, 'Skipped')}><SkipForward />Skip</Button></div></div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">{[d.a, d.b].map((s, j) => <div key={j} className="rounded-control bg-subtle-2 p-2"><div className="font-medium">{s.name}</div><div className="tabular text-muted">{s.phone}</div><div className="text-muted">{s.email || <span className="text-warning">no email</span>}</div><div className="text-xs text-faint">from {s.src}</div></div>)}</div>
          </div>
        ))}{!dups.length && <p className="py-8 text-center text-sm text-muted">No duplicates left.</p>}</div>
      </DialogContent>
    </Dialog>
  )
}
export function EnrichDialog({ open, onOpenChange, ids }: { open: boolean; onOpenChange: (o: boolean) => void; ids: string[] }) {
  const [p, setP] = React.useState(0); const patch = useStore((s) => s.patch)
  const rows = ['Data provider A · email, phone, job', 'Data provider B · email, carrier, address', 'Data provider C · mobile number, line type', 'AI web search · names, businesses, public profiles', 'Email check · makes sure each address is real']
  React.useEffect(() => { if (!open) { setP(0); return } let i = 0; const t = setInterval(() => { i++; setP(i); if (i >= rows.length) { clearInterval(t); patch('contacts', (cs) => cs.map((c) => (ids.includes(c.id) && !c.email && Math.random() < 0.6 ? { ...c, email: `${(c.first || 'contact').toLowerCase()}.${(c.last || c.id).toLowerCase()}@gmail.com` } : ids.includes(c.id) && !c.name && Math.random() < 0.5 ? { ...c, first: 'Ayesha', last: 'Khan', name: 'Ayesha Khan', unknownName: false } : c))) } }, 650); return () => clearInterval(t) }, [open])
  const done = p >= rows.length
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Filling missing data with AI" description={`${nf(ids.length)} people · each provider only sees who the previous one couldn’t find`} size="sm" footer={<Button variant={done ? 'primary' : 'secondary'} onClick={() => onOpenChange(false)}>{done ? 'See the results' : 'Run in background'}</Button>}>
        <Progress value={(p / rows.length) * 100} className="mb-3" />
        <div className="space-y-1">{rows.map((r, i) => <div key={r} className={cn('flex items-center gap-2 rounded-control px-2 py-1.5 text-sm', i < p ? 'text-text' : i === p ? 'bg-subtle-2' : 'text-muted')}><span className={cn('flex size-4 items-center justify-center rounded-full', i < p ? 'bg-success text-white' : i === p ? 'bg-ai text-white animate-pulse' : 'bg-subtle')}>{i < p && <Check className="size-2.5" strokeWidth={3} />}</span>{r}{i < p && <span className="ml-auto text-xs text-muted tabular">found {[41, 23, 9, 12, 3][i]}</span>}</div>)}</div>
        {done && <p className="mt-3 rounded-control bg-success-soft px-3 py-2 text-sm text-success">Done: 85 emails and 6 names added. Each value is tagged with where it came from.</p>}
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Contact settings (fields, sources, dead rules, lead scoring) ---------- */
export function ContactSettingsDialog({ open, onOpenChange, tab = 'fields' }: { open: boolean; onOpenChange: (o: boolean) => void; tab?: string }) {
  const { customFields, sources, deadRules, patch } = useStore()
  const [t, setT] = React.useState(tab); React.useEffect(() => setT(tab), [tab, open])
  const [nf1, setNf] = React.useState(''); const [nt, setNt] = React.useState('Text'); const [nr, setNr] = React.useState('')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Contact settings" size="md" footer={<Button variant="primary" onClick={() => { onOpenChange(false); toast.success('Saved') }}>Done</Button>}>
        <div className="mb-4 flex gap-1 rounded-control bg-subtle p-0.5">{[['fields', 'Custom fields'], ['sources', 'Lead sources'], ['dead', 'Dead-number rules'], ['score', 'Lead scoring']].map(([k, l]) => <button key={k} onClick={() => setT(k)} className={cn('h-7 flex-1 rounded-[6px] text-sm font-medium', t === k ? 'bg-bg shadow-btn' : 'text-muted')}>{l}</button>)}</div>
        {t === 'fields' && <div className="space-y-3"><div className="divide-y divide-border rounded-card border border-border">{customFields.map((f, i) => <div key={f.name} className="flex items-center gap-3 px-3 py-2 text-base"><span className="flex-1">{f.name}</span><Badge>{f.type}</Badge><Button variant="ghost" size="icon-xs" onClick={() => patch('customFields', (c) => c.filter((_, j) => j !== i))} aria-label="Delete"><Trash2 /></Button></div>)}</div>
          <div className="flex gap-2"><Input placeholder="New field name" value={nf1} onChange={(e) => setNf(e.target.value)} /><Select className="w-[140px]" value={nt} onValueChange={setNt} options={['Text', 'Number', 'Date', 'Dropdown', 'Yes / No'].map((x) => ({ value: x, label: x }))} /><Button onClick={() => { if (nf1) { patch('customFields', (c) => [...c, { name: nf1, type: nt }]); setNf('') } }}><Plus />Add</Button></div>
          <p className="text-sm text-muted">Every custom field becomes a filter, a column and a merge field for agents.</p></div>}
        {t === 'sources' && <div className="divide-y divide-border rounded-card border border-border">{sources.map((s, i) => <div key={s.n} className="flex items-center gap-3 px-3 py-2 text-base"><span className="flex-1">{s.n}</span><Badge tone={s.dir === 'in' ? 'green' : 'blue'}>{s.dir === 'in' ? 'Inbound' : 'Outbound'}</Badge><Switch checked={s.on} onCheckedChange={(v) => patch('sources', (ss) => ss.map((x, j) => (j === i ? { ...x, on: v } : x)))} /></div>)}</div>}
        {t === 'dead' && <div className="space-y-3"><p className="text-sm text-muted">Contacts matching any rule move to Dead numbers. Written as sentences, like stages.</p><div className="divide-y divide-border rounded-card border border-border">{deadRules.map((r, i) => <div key={i} className="flex items-center gap-3 px-3 py-2 text-base"><span className="flex-1">{r.t}</span><Switch checked={r.on} onCheckedChange={(v) => patch('deadRules', (rs) => rs.map((x, j) => (j === i ? { ...x, on: v } : x)))} /><Button variant="ghost" size="icon-xs" onClick={() => patch('deadRules', (rs) => rs.filter((_, j) => j !== i))} aria-label="Delete"><Trash2 /></Button></div>)}</div>
          <div className="flex gap-2"><Input placeholder="e.g. No answer to 4 calls in 2 weeks" value={nr} onChange={(e) => setNr(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && nr) { patch('deadRules', (rs) => [...rs, { on: true, t: nr }]); setNr('') } }} /><Button onClick={() => { if (nr) { patch('deadRules', (rs) => [...rs, { on: true, t: nr }]); setNr('') } }}><Plus />Add rule</Button></div></div>}
        {t === 'score' && <div className="space-y-2">{[['Hot', 'Reached a qualified, booked or won stage', 'green'], ['Warm', 'Contacted in the last 14 days', 'amber'], ['Cold', 'No contact for 14+ days', 'neutral'], ['Not responding', '3+ attempts without a reply', 'amber'], ['Dead', 'Matches a dead-number rule', 'red']].map(([l, d, tone]) => <div key={l} className="flex items-center gap-3 rounded-card border border-border px-3 py-2"><Badge tone={tone as any}>{l}</Badge><span className="flex-1 text-sm">{d}</span><Button size="sm" variant="ghost">Edit</Button></div>)}<p className="text-sm text-muted">Scores update in real time as agents talk and are used by filters, folders and the dead list.</p></div>}
      </DialogContent>
    </Dialog>
  )
}

export { PhoneCall, Textarea }
