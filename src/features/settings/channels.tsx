import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, Copy, Check, RefreshCw, Phone, CircleCheck, Clock, Volume2, Mic, CalendarDays, Sheet as SheetIcon, Mail, CreditCard, Zap, MessageSquare, BookOpen, Users, Megaphone, CalendarCheck, Download, Upload, ShieldAlert } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { useStore } from '@/store'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { AgentAvatar } from '@/components/ui/avatar'
import { PlatIcon } from '@/components/app/icons'
import { LineList, OptionRow } from '@/features/shared/led'
import { CloneVoice } from '@/features/agents/sections'
import { AT, AGENT_TYPES } from '@/data/seed'
import { SecHead, SetCard, SwitchRow, usePref } from './ui'
import type { Platform } from '@/data/types'

function BuyNumber({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useStore()
  const [area, setArea] = React.useState('905'); const [pick, setPick] = React.useState(''); const [label, setLabel] = React.useState('New line'); const [agent, setAgent] = React.useState('r1')
  React.useEffect(() => { if (open) { setPick(''); setLabel('New line') } }, [open])
  const found = [11, 37, 58, 73, 96].map((n) => `(${area}) 555-01${String(n).padStart(2, '0')}`)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" title="Get a phone number" description="Local numbers work for calls and texts · $2 a month"
        footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!pick} onClick={() => { s.patch('numbers', (L) => [...L, { n: pick, l: label, agent, ty: 'Local · voice + SMS' }]); onOpenChange(false); toast.success(`${pick} is yours · ${s.agents.find((a) => a.id === agent)?.name} answers it`) }}>Get this number</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country"><Select value="ca" onValueChange={() => toast('More countries come with the backend')} options={[{ value: 'ca', label: 'Canada' }, { value: 'us', label: 'United States' }, { value: 'pk', label: 'Pakistan' }, { value: 'uk', label: 'United Kingdom' }]} /></Field>
            <Field label="Area code"><Input value={area} onChange={(e) => setArea(e.target.value.replace(/\D/g, '').slice(0, 3))} /></Field>
          </div>
          <div className="space-y-1">{found.map((n) => <label key={n} className={cn('flex h-9 cursor-pointer items-center gap-3 rounded-control border px-3 text-sm', pick === n ? 'border-btn bg-subtle-2' : 'border-border hover:bg-subtle-2')}><input type="radio" name="num" checked={pick === n} onChange={() => setPick(n)} className="accent-[var(--btn)]" /><Phone className="size-4 text-icon" /><span className="flex-1 tabular">{n}</span><span className="text-xs text-muted">Voice + SMS</span></label>)}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name it"><Input value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
            <Field label="Who answers"><Select value={agent} onValueChange={setAgent} options={s.agents.map((a) => ({ value: a.id, label: `${a.name} · ${AT[a.type].label}` }))} /></Field>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const DNS: [string, string, string][] = [['TXT', '@', 'v=spf1 include:mail.crewline.app ~all'], ['CNAME', 'crew._domainkey', 'dkim.crewline.app'], ['TXT', '_dmarc', 'v=DMARC1; p=none; rua=mailto:dmarc@crewline.app'], ['CNAME', 'bounce', 'return.crewline.app']]
const SOCIAL: [Platform, string][] = [['msg', 'Messenger'], ['ig', 'Instagram'], ['tt', 'TikTok'], ['fb', 'Facebook comments']]

export function ChannelsSec() {
  const s = useStore(); const [buy, setBuy] = React.useState(false)
  const [dnsOk, setDnsOk] = usePref('set.dnsOk', false); const [social, setSocial] = usePref<Record<string, boolean>>('set.social', { msg: true, ig: true, tt: true, fb: false })
  const [color, setColor] = usePref('set.chatColor', '#303030')
  const embed = `<script src="https://chat.crewline.app/widget.js" data-color="${color}" async></script>`
  return (
    <div className="space-y-4">
      <SecHead title="Channels" description="Phone numbers, texting, email, WhatsApp, social apps and web chat." />
      <SetCard title="Phone numbers" action={<Button onClick={() => setBuy(true)}><Plus />Get a number</Button>} flush>
        <div className="overflow-x-auto"><Table>
          <thead><tr><Th>Number</Th><Th>Name</Th><Th>Answered by</Th><Th>Type</Th><Th className="w-10" /></tr></thead>
          <tbody>{s.numbers.map((n) => (
            <Tr key={n.n}>
              <Td className="font-medium tabular">{n.n}</Td><Td>{n.l}</Td>
              <Td><Select size="sm" className="w-[170px]" value={n.agent} onValueChange={(agent) => { s.patch('numbers', (L) => L.map((x) => (x.n === n.n ? { ...x, agent } : x))); toast.success(`${s.agents.find((a) => a.id === agent)?.name} now answers ${n.n}`) }} options={s.agents.map((a) => ({ value: a.id, label: a.name, icon: <AgentAvatar name={a.name} size={16} /> }))} /></Td>
              <Td className="text-muted">{n.ty}</Td>
              <Td className="py-0"><Button variant="ghost" size="icon-sm" aria-label={`Release ${n.n}`} onClick={async () => { if (await askConfirm({ title: `Release ${n.n}?`, description: 'You can’t get the same number back later.', ok: 'Release number', danger: true })) { s.patch('numbers', (L) => L.filter((x) => x.n !== n.n)); toast.success('Number released') } }}><Trash2 /></Button></Td>
            </Tr>
          ))}</tbody>
        </Table></div>
      </SetCard>
      <SetCard title="Texting (SMS) registration" description="Carriers need to approve business texting. Until then texts are limited to 200 a day.">
        <div className="space-y-2 py-3">
          {[['Business details checked', true], ['How you’ll use texting — submitted', true], ['Carrier review — usually 3 to 5 days', false]].map(([l, ok]) => <div key={l as string} className="flex items-center gap-2 text-sm">{ok ? <CircleCheck className="size-4 text-success" /> : <Clock className="size-4 text-warning" />}{l}</div>)}
          <div className="flex gap-2 pt-1"><Badge tone="amber">In review</Badge><Button size="sm" onClick={() => toast('Still in review · we’ll notify you the moment it’s approved')}><RefreshCw />Check status</Button></div>
        </div>
      </SetCard>
      <SetCard title="Email sending" description="Add these records where your domain is managed, so emails land in the inbox, not spam." action={<Button onClick={() => { setDnsOk(true); toast.success('All four records found · email sending is verified') }}><RefreshCw />Check again</Button>} flush>
        <div className="overflow-x-auto"><Table>
          <thead><tr><Th>Type</Th><Th>Name</Th><Th>Value</Th><Th>Status</Th><Th className="w-10" /></tr></thead>
          <tbody>{DNS.map(([t, n, v], i) => <Tr key={n}><Td>{t}</Td><Td className="font-mono text-xs">{n}</Td><Td className="max-w-[280px] truncate font-mono text-xs">{v}</Td><Td>{dnsOk || i < 2 ? <Badge tone="green"><Check />Found</Badge> : <Badge tone="amber">Not found yet</Badge>}</Td><Td className="py-0"><Button variant="ghost" size="icon-sm" aria-label={`Copy ${n}`} onClick={() => { navigator.clipboard?.writeText(v); toast('Copied') }}><Copy /></Button></Td></Tr>)}</tbody>
        </Table></div>
      </SetCard>
      <SetCard title="WhatsApp, social and web chat">
        <OptionRow icon={<PlatIcon p="wa" size={16} tip={false} />} title="WhatsApp Business" description="(905) 555-0142 · display name “Metro Mobile” approved"><Badge tone="green"><Check />Connected</Badge></OptionRow>
        {SOCIAL.map(([p, l]) => <OptionRow key={p} icon={<PlatIcon p={p} size={16} tip={false} />} title={l} description={social[p] ? 'Messages arrive in your inbox' : 'Not connected'}><Button onClick={() => { setSocial({ ...social, [p]: !social[p] }); toast(social[p] ? `${l} disconnected` : `${l} connected (demo)`) }}>{social[p] ? 'Disconnect' : 'Connect'}</Button></OptionRow>)}
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-base"><PlatIcon p="chat" size={16} tip={false} />Web chat on your website</span><span className="flex items-center gap-2 text-sm text-muted">Colour<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-7 cursor-pointer rounded-control border border-border bg-transparent" aria-label="Chat colour" /></span></div>
          <div className="flex items-start gap-2"><Textarea readOnly value={embed} className="min-h-14 font-mono text-xs" /><Button onClick={() => { navigator.clipboard?.writeText(embed); toast('Code copied') }}><Copy />Copy</Button></div>
        </div>
      </SetCard>
      <BuyNumber open={buy} onOpenChange={setBuy} />
    </div>
  )
}

const APPS: [string, string, React.ComponentType<{ className?: string }>, boolean][] = [
  ['Google Calendar', 'Bookings show up in your calendar, busy times block slots', CalendarDays, true], ['Google Sheets', 'Send new leads and bookings to a sheet', SheetIcon, true],
  ['Outlook and Microsoft 365', 'Calendar and email', Mail, false], ['Stripe', 'Payment links, invoices and refunds for Finance agents', CreditCard, true],
  ['Zapier', 'Connect 6,000+ apps without code', Zap, false], ['Slack', 'Get hand-overs and summaries in a channel', MessageSquare, false],
  ['QuickBooks', 'Send invoices and payments to your books', BookOpen, false], ['Your old CRM', 'Import contacts and deals once', Users, false],
  ['Facebook and Google lead ads', 'New ad leads start an inbound campaign', Megaphone, true], ['Calendly', 'Import event types and bookings', CalendarCheck, false],
]
export function AppsSec() {
  const [on, setOn] = usePref<Record<string, boolean>>('set.apps', Object.fromEntries(APPS.map(([n, , , c]) => [n, c])))
  return (
    <div className="space-y-4">
      <SecHead title="Connected apps" description="Crewline works with the tools you already use." />
      <div className="grid gap-3 sm:grid-cols-2">
        {APPS.map(([n, d, I]) => (
          <Card key={n}><CardBody className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-subtle text-icon"><I className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-medium">{n}{on[n] && <Badge tone="green">Connected</Badge>}</span><span className="block text-sm text-muted">{d}</span></span>
            <Button size="sm" variant={on[n] ? 'ghost' : 'secondary'} onClick={() => { setOn({ ...on, [n]: !on[n] }); toast(on[n] ? `${n} disconnected` : `${n} connected (demo)`) }}>{on[n] ? 'Disconnect' : 'Connect'}</Button>
          </CardBody></Card>
        ))}
      </div>
    </div>
  )
}

export function VoicesSec() {
  const s = useStore(); const [clone, setClone] = React.useState(false)
  const [defs, setDefs] = usePref<Record<string, string>>('set.voiceDefaults', {})
  return (
    <div className="space-y-4">
      <SecHead title="Voices" description="Natural voices for calls, powered by ElevenLabs." action={<Button variant="primary" onClick={() => setClone(true)}><Mic />Clone a voice</Button>} />
      <SetCard title="Voice library" flush>
        {s.voices.map(([n, d]) => { const used = s.agents.filter((a) => a.voice.startsWith(n)).map((a) => a.name); return (
          <div key={n} className="flex items-center gap-3 border-t border-border-2 px-4 py-2">
            <Button variant="ghost" size="icon-sm" aria-label={`Play ${n}`} onClick={() => toast(`Playing ${n} (demo)`)}><Volume2 /></Button>
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{n}</span><span className="block text-xs text-muted">{d}{used.length ? ` · used by ${used.join(', ')}` : ''}</span></span>
            {/cloned/i.test(n) && <Button variant="ghost" size="icon-sm" aria-label={`Delete ${n}`} onClick={async () => { if (await askConfirm({ title: `Delete ${n}?`, description: 'Agents using it switch to their default voice.', ok: 'Delete voice', danger: true })) { s.patch('voices', (L) => L.filter((x) => x[0] !== n)); toast.success('Voice deleted') } }}><Trash2 /></Button>}
          </div>
        ) })}
      </SetCard>
      <SetCard title="Default voice for new agents">
        {AGENT_TYPES.map((t) => <OptionRow key={t} title={AT[t].label}><Select variant="button" align="end" value={defs[t] ?? s.agents.find((a) => a.type === t)!.voice.split('·')[0].trim()} onValueChange={(v) => { setDefs({ ...defs, [t]: v }); toast.success('Saved') }} options={s.voices.map(([n]) => ({ value: n, label: n }))} /></OptionRow>)}
      </SetCard>
      <SetCard title="Voice service">
        <OptionRow title="ElevenLabs" description="Included in your plan. Characters are billed at cost."><Badge tone="green"><Check />Connected</Badge></OptionRow>
        <SwitchRow k="set.ownKey" title="Use my own ElevenLabs account" description="Bring your own key and pay ElevenLabs directly." d={false} />
      </SetCard>
      <CloneVoice open={clone} onOpenChange={setClone} onDone={() => undefined} />
    </div>
  )
}

export function SourcesSec() {
  const s = useStore()
  return (
    <div className="space-y-4">
      <SecHead title="Lead sources" description="Where your leads come from. Shown when you hover a stage and used in reports." action={<Button onClick={async () => { const n = await askText({ title: 'Add a lead source', label: 'Name', placeholder: 'e.g. Trade show' }); if (n) { s.patch('sources', (L) => [...L, { n, dir: 'Inbound', on: true }]); toast.success(`${n} added`) } }}><Plus />Add source</Button>} />
      <SetCard>{s.sources.map((x) => (
        <OptionRow key={x.n} title={x.n} description={x.dir}><span className="flex items-center gap-2"><Switch checked={x.on} onCheckedChange={(on) => s.patch('sources', (L) => L.map((y) => (y.n === x.n ? { ...y, on } : y)))} aria-label={x.n} /><Button variant="ghost" size="icon-sm" aria-label={`Remove ${x.n}`} onClick={() => { s.patch('sources', (L) => L.filter((y) => y.n !== x.n)); toast.success('Removed') }}><Trash2 /></Button></span></OptionRow>
      ))}</SetCard>
    </div>
  )
}

const FIELD_TYPES = ['Text', 'Number', 'Date', 'Yes / no', 'Dropdown', 'Phone', 'Email', 'Money']
export function FieldsSec() {
  const s = useStore(); const [add, setAdd] = React.useState(false); const [n, setN] = React.useState(''); const [t, setT] = React.useState('Text')
  return (
    <div className="space-y-4">
      <SecHead title="Custom fields" description="Extra details you keep for every contact. Agents fill them in as they talk." action={<Button onClick={() => { setN(''); setT('Text'); setAdd(true) }}><Plus />Add field</Button>} />
      <SetCard flush><Table>
        <thead><tr><Th>Field</Th><Th>Type</Th><Th className="w-10" /></tr></thead>
        <tbody>{s.customFields.map((f) => <Tr key={f.name}><Td className="font-medium">{f.name}</Td><Td><Select size="sm" className="w-[140px]" value={FIELD_TYPES.includes(f.type) ? f.type : 'Text'} onValueChange={(type) => s.patch('customFields', (L) => L.map((x) => (x.name === f.name ? { ...x, type } : x)))} options={FIELD_TYPES.map((x) => ({ value: x, label: x }))} /></Td><Td className="py-0"><Button variant="ghost" size="icon-sm" aria-label={`Delete ${f.name}`} onClick={async () => { if (await askConfirm({ title: `Delete “${f.name}”?`, description: 'The values saved in this field are removed from every contact.', ok: 'Delete field', danger: true })) s.patch('customFields', (L) => L.filter((x) => x.name !== f.name)) }}><Trash2 /></Button></Td></Tr>)}</tbody>
      </Table></SetCard>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent size="sm" title="Add a field" footer={<><Button onClick={() => setAdd(false)}>Cancel</Button><Button variant="primary" disabled={!n.trim()} onClick={() => { s.patch('customFields', (L) => [...L, { name: n.trim(), type: t }]); setAdd(false); toast.success(`“${n}” added to every contact`) }}>Add field</Button></>}>
          <div className="space-y-4"><Field label="Name"><Input autoFocus value={n} onChange={(e) => setN(e.target.value)} placeholder="e.g. Account number" /></Field><Field label="Type"><Select value={t} onValueChange={setT} options={FIELD_TYPES.map((x) => ({ value: x, label: x }))} /></Field></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function HygieneSec() {
  const s = useStore(); const nav = useNavigate()
  return (
    <div className="space-y-4">
      <SecHead title="Database hygiene" description="Keep your contacts clean without thinking about it." action={<Button onClick={() => nav('/contacts?view=health')}>Open contact health</Button>} />
      <SetCard title="A number counts as dead when…" action={<Button size="sm" onClick={async () => { const t = await askText({ title: 'Add a rule', label: 'When should a number count as dead?', placeholder: 'e.g. The carrier says it’s disconnected' }); if (t) s.patch('deadRules', (L) => [...L, { on: true, t }]) }}><Plus />Add rule</Button>}>
        {s.deadRules.map((r, i) => <OptionRow key={i} title={r.t}><Switch checked={r.on} onCheckedChange={(on) => s.patch('deadRules', (L) => L.map((x, j) => (j === i ? { ...x, on } : x)))} aria-label={r.t} /></OptionRow>)}
      </SetCard>
      <SetCard title="Duplicates and missing details">
        <SwitchRow k="set.autoMerge" title="Merge exact duplicates automatically" description="Same name and phone number. Anything less certain comes to you." />
        <SwitchRow k="set.nightly" title="Check for duplicates every night" />
        <SwitchRow k="set.fillNew" title="Fill in missing emails and numbers for new leads" description="Uses data lookups (billed at cost)." d={false} />
      </SetCard>
    </div>
  )
}

export function DncSec() {
  const nav = useNavigate(); const dnc = useStore((s) => s.dnc)
  const [words, setWords] = usePref<string[]>('set.optWords', ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'STOPALL', 'PARA', 'ALTO', 'BAS'])
  return (
    <div className="space-y-4">
      <SecHead title="Do not contact" description="People who asked not to hear from you are never messaged or called." action={<Button onClick={() => nav('/contacts?view=dnc')}>Open the list ({nf(dnc.length)})</Button>} />
      <SetCard title="Rules">
        <SwitchRow k="set.dncNational" title="Check the national Do Not Call list before calling" />
        <SwitchRow k="set.dncVoice" title="Add people who say “don’t call me” on a call" description="AI listens for it in any language." />
        <SwitchRow k="set.dncAll" title="Apply across all your businesses" description="If someone opts out of one, they’re off all of them." d={false} />
      </SetCard>
      <SetCard title="Opt-out words" description="A text with one of these stops all messages right away."><div className="py-3"><LineList items={words} onChange={setWords} placeholder="Add a word and press Enter" /></div></SetCard>
    </div>
  )
}

const PROVIDERS: [string, string, string][] = [['People data', 'Missing emails and phone numbers', '$0.012 a lookup'], ['Business directory', 'Company names, sizes and addresses', '$0.02 a lookup'], ['Phone check', 'Tells mobiles from landlines and dead numbers', '$0.004 a check'], ['Email check', 'Finds emails that would bounce', '$0.003 a check'], ['AI web search', 'Finds updated details on the web', '$0.02 a search']]
export function DataSec() {
  const s = useStore()
  const [on, setOn] = usePref<Record<string, boolean>>('set.providers', { 'People data': true, 'Phone check': true, 'AI web search': true })
  const [cap, setCap] = usePref('set.lookupCap', '5000')
  const exportAll = () => {
    const rows = [['Name', 'Phone', 'Email', 'City', 'Stage', 'Campaign', 'Source'], ...s.contacts.map((c) => [c.name, c.phone, c.email, c.city, c.stage, s.campaigns.find((k) => k.id === c.camp)?.name ?? '', c.source])]
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'contacts.csv'; a.click(); URL.revokeObjectURL(a.href)
    toast.success(`${nf(s.contacts.length)} contacts exported`)
  }
  return (
    <div className="space-y-4">
      <SecHead title="Data" description="Where missing details come from, and your data in and out." />
      <SetCard title="Data providers" description="Only used when you ask, or when a rule above says so.">
        {PROVIDERS.map(([n, d, p]) => <OptionRow key={n} title={n} description={`${d} · ${p}`}><Switch checked={!!on[n]} onCheckedChange={(v) => { setOn({ ...on, [n]: v }); toast(v ? `${n} on` : `${n} off`) }} aria-label={n} /></OptionRow>)}
        <OptionRow title="Monthly lookup limit" description="Stops lookups when reached."><Input className="w-28" inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, ''))} /></OptionRow>
      </SetCard>
      <SetCard title="Your data">
        <OptionRow title="Export every contact" description="A spreadsheet file with all fields."><Button onClick={exportAll}><Download />Export</Button></OptionRow>
        <OptionRow title="Import contacts" description="From a spreadsheet or your old CRM."><Button onClick={() => toast('Open Contacts → Import to bring people in')}><Upload />Import</Button></OptionRow>
        <OptionRow title={<span className="flex items-center gap-2 text-danger"><ShieldAlert className="size-4" />Delete all contacts</span>} description="Removes every contact and conversation. This can’t be undone."><Button variant="destructive" onClick={async () => { if (await askConfirm({ title: 'Delete every contact?', description: 'Every contact, conversation and call recording is removed for good.', ok: 'Delete everything', danger: true })) toast('Deleting is switched off while you’re using sample data') }}>Delete</Button></OptionRow>
      </SetCard>
    </div>
  )
}

