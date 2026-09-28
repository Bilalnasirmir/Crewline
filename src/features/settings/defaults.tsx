import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, Copy, Check, Settings2, Pencil, KeyRound, Webhook, Send, Download, ArrowRight, RotateCcw, Upload } from 'lucide-react'
import { cn, money } from '@/lib/utils'
import { useStore, stagesFor } from '@/store'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Segmented } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/controls'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { ToggleChip } from '@/components/app/bits'
import { PlatIcon } from '@/components/app/icons'
import { LineList, OptionRow } from '@/features/shared/led'
import { FollowUpEditor, defaultFollow, type FollowConfig } from '@/features/shared/followups'
import { StageList } from '@/features/stages/stage-list'
import { PIPES } from '@/features/stages/stage-dialog'
import { BookingSettingsDialog, BOOKING_CAMPS } from '@/features/bookings/shared'
import { AT, AGENT_TYPES } from '@/data/seed'
import { SecHead, SetCard, SwitchRow, SelectRow, usePref, t12 } from './ui'
import type { Pipe, Platform, Products } from '@/data/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 29 }, (_, i) => { const t = 420 + i * 30; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` })

export function CampDefSec() {
  const [days, setDays] = usePref<string[]>('set.campDays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  const [from, setFrom] = usePref('set.campFrom', '09:00'); const [to, setTo] = usePref('set.campTo', '20:00')
  const [ch, setCh] = usePref<Platform[]>('set.campCh', ['sms', 'call', 'email'])
  const [limit, setLimit] = usePref('set.campLimit', '500')
  const [follow, setFollow] = usePref<FollowConfig>('set.campFollow', defaultFollow())
  return (
    <div className="space-y-4">
      <SecHead title="Campaign defaults" description="Every new campaign starts with these. Change them inside any campaign." />
      <SetCard title="When campaigns reach people">
        <div className="space-y-2 py-3"><div className="text-base">Days</div><div className="flex flex-wrap gap-1.5">{DAYS.map((d) => <ToggleChip key={d} on={days.includes(d)} onClick={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d])}>{d}</ToggleChip>)}</div></div>
        <OptionRow title="Hours" description="In each person’s own time zone."><span className="flex items-center gap-2 text-sm"><Select size="sm" className="w-[110px]" value={from} onValueChange={setFrom} options={HOURS.map((t) => ({ value: t, label: t12(t) }))} />to<Select size="sm" className="w-[110px]" value={to} onValueChange={setTo} options={HOURS.map((t) => ({ value: t, label: t12(t) }))} /></span></OptionRow>
        <OptionRow title="New people per day" description="Spreads a big list over several days."><Input className="w-24" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ''))} /></OptionRow>
        <SwitchRow k="set.campHolidays" title="Skip public holidays" />
        <SwitchRow k="set.campLocal" title="Use each person’s local time" />
      </SetCard>
      <SetCard title="How campaigns talk">
        <div className="space-y-2 py-3"><div className="text-base">Channels</div><div className="flex flex-wrap gap-1.5">{(['sms', 'call', 'email', 'wa', 'msg', 'ig'] as Platform[]).map((p) => <ToggleChip key={p} on={ch.includes(p)} onClick={() => setCh(ch.includes(p) ? ch.filter((x) => x !== p) : [...ch, p])}><PlatIcon p={p} size={13} tip={false} mono={ch.includes(p)} />{{ sms: 'Text', call: 'Call', email: 'Email', wa: 'WhatsApp', msg: 'Messenger', ig: 'Instagram' }[p as string]}</ToggleChip>)}</div></div>
        <SwitchRow k="set.campAB" title="Test two opening messages and keep the winner" />
        <SwitchRow k="set.campTakeover" title="Let me take over any conversation" />
      </SetCard>
      <SetCard title="Follow-ups"><div className="py-3"><FollowUpEditor value={follow} onChange={setFollow} /></div></SetCard>
    </div>
  )
}

export function StageDefSec() {
  const s = useStore(); const nav = useNavigate()
  const [pipe, setPipe] = React.useState<Pipe>('telecom'); const [dir, setDir] = React.useState<'out' | 'in'>('out')
  return (
    <div className="space-y-4">
      <SecHead title="Stage defaults" description="The stages each kind of campaign uses. AI moves people between them as it talks." action={<Button onClick={() => nav('/stages')}>Open Stages<ArrowRight /></Button>} />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3">
          <Select variant="button" value={pipe} onValueChange={(v) => setPipe(v as Pipe)} options={PIPES.map((p) => ({ value: p.v, label: p.l }))} />
          <Segmented value={dir} onChange={setDir} options={[{ value: 'out', label: 'Outbound' }, { value: 'in', label: 'Inbound' }]} />
          <span className="flex-1" />
          <Button size="sm" onClick={async () => { if (await askConfirm({ title: `Copy ${dir === 'out' ? 'outbound' : 'inbound'} stages to ${dir === 'out' ? 'inbound' : 'outbound'}?`, description: 'The other list is replaced.', ok: 'Copy stages' })) { s.copyStages(pipe, dir); toast.success('Stages copied') } }}><Copy />Copy to {dir === 'out' ? 'inbound' : 'outbound'}</Button>
        </div>
        <StageList pipe={pipe} dir={dir} />
      </Card>
      <SetCard title="When the AI isn’t sure">
        <SelectRow k="reviewAt" title="Ask me when the AI is less than" description="Leads wait in Review for me and Assigned to me." d="70" options={['60', '70', '80', '90']} />
        <SwitchRow k="set.followLatest" title="Always follow the latest conversation" description="If someone says yes, then “I need time”, they move to Pending." />
      </SetCard>
    </div>
  )
}

const CURRENCIES: [string, string][] = [['$', 'US dollar ($)'], ['C$', 'Canadian dollar (C$)'], ['Rs', 'Pakistani rupee (Rs)'], ['€', 'Euro (€)'], ['£', 'British pound (£)'], ['AED', 'UAE dirham (AED)'], ['₹', 'Indian rupee (₹)'], ['SAR', 'Saudi riyal (SAR)'], ['A$', 'Australian dollar (A$)']]
export function ProductsSec() {
  const s = useStore()
  const camps = s.campaigns.filter((c) => s.products[c.id])
  const [camp, setCamp] = React.useState(camps[0]?.id ?? 'k1')
  const p = s.products[camp]; const c = s.campaigns.find((k) => k.id === camp)
  const set = (q: Partial<Products>) => s.patch('products', (x) => ({ ...x, [camp]: { ...x[camp], ...q } }))
  if (!p) return null
  const prices = p.cats.flatMap((x) => x.items.map((y) => y.value)).filter((v) => v > 0)
  return (
    <div className="space-y-4">
      <SecHead title="Products and currency" description="What each campaign sells. Revenue is counted when a lead reaches the revenue stage." action={<Select variant="button" align="end" value={camp} onValueChange={setCamp} options={camps.map((k) => ({ value: k.id, label: k.name }))} />} />
      <SetCard title="Money">
        <OptionRow title="Currency" description="Any currency works."><Select variant="button" align="end" value={p.cur} onValueChange={(cur) => { set({ cur }); toast.success('Currency saved') }} options={[...CURRENCIES, ...(CURRENCIES.some(([v]) => v === p.cur) ? [] : [[p.cur, p.cur] as [string, string]])].map(([v, l]) => ({ value: v, label: l }))} /></OptionRow>
        <OptionRow title="Count revenue at" description="The stage where a sale is final."><Select variant="button" align="end" value={p.rev} onValueChange={(rev) => set({ rev })} options={[...new Set([p.rev, ...stagesFor(c, s.stages).map((x) => x.name)])].map((x) => ({ value: x, label: x }))} /></OptionRow>
        <OptionRow title="When a sale is cancelled" description={p.cancel === 'full' ? 'Take the whole amount off revenue' : 'Keep what was already paid'}><Segmented value={p.cancel} onChange={(cancel) => set({ cancel })} options={[{ value: 'full', label: 'Remove it all' }, { value: 'partial', label: 'Keep what was paid' }]} /></OptionRow>
      </SetCard>
      {p.cats.map((cat, ci) => (
        <SetCard key={ci} title={cat.name} action={<span className="flex gap-1"><Button variant="ghost" size="icon-sm" aria-label="Rename category" onClick={async () => { const n = await askText({ title: 'Rename category', label: 'Name', value: cat.name }); if (n) set({ cats: p.cats.map((x, j) => (j === ci ? { ...x, name: n } : x)) }) }}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label="Delete category" onClick={() => set({ cats: p.cats.filter((_, j) => j !== ci) })}><Trash2 /></Button></span>} flush>
          {cat.items.map((it, ii) => (
            <div key={ii} className="flex items-center gap-2 border-t border-border-2 px-4 py-2">
              <Input className="flex-1" value={it.name} onChange={(e) => set({ cats: p.cats.map((x, j) => (j === ci ? { ...x, items: x.items.map((y, k) => (k === ii ? { ...y, name: e.target.value } : y)) } : x)) })} aria-label="Product name" />
              <span className="flex items-center gap-1 text-sm text-muted">{p.cur}<Input className="w-24" inputMode="decimal" value={it.value} onChange={(e) => set({ cats: p.cats.map((x, j) => (j === ci ? { ...x, items: x.items.map((y, k) => (k === ii ? { ...y, value: +e.target.value || 0 } : y)) } : x)) })} aria-label="Price" /></span>
              <Button variant="ghost" size="icon-sm" aria-label="Remove product" onClick={() => set({ cats: p.cats.map((x, j) => (j === ci ? { ...x, items: x.items.filter((_, k) => k !== ii) } : x)) })}><Trash2 /></Button>
            </div>
          ))}
          <div className="border-t border-border-2 px-4 py-2"><Button size="sm" onClick={() => set({ cats: p.cats.map((x, j) => (j === ci ? { ...x, items: [...x.items, { name: 'New product', value: 0 }] } : x)) })}><Plus />Add product</Button></div>
        </SetCard>
      ))}
      <Button onClick={async () => { const n = await askText({ title: 'New category', label: 'Name', placeholder: 'e.g. Add-ons' }); if (n) set({ cats: [...p.cats, { name: n, items: [] }] }) }}><Plus />Add a category</Button>
      <p className="text-sm text-muted">{p.cats.reduce((a, x) => a + x.items.length, 0)} products{prices.length ? ` · from ${money(Math.min(...prices), p.cur)}` : ''}</p>
    </div>
  )
}

export function BookDefSec() {
  const s = useStore(); const [open, setOpen] = React.useState<string | null>(null)
  return (
    <div className="space-y-4">
      <SecHead title="Booking defaults" description="Services, hours and reminders for each campaign that books appointments." />
      <SetCard title="Campaigns that book" flush>
        {BOOKING_CAMPS.map((k) => { const c = s.campaigns.find((x) => x.id === k); const b = s.bookingSet[k]; if (!c) return null; return (
          <div key={k} className="flex items-center gap-3 border-t border-border-2 px-4 py-2.5">
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{c.name}</span><span className="block text-xs text-muted">{(s.services[k] ?? []).length} services · {b?.cap ?? 1} {b?.capLabel ?? 'at a time'} · reminders {b?.reminders.map((r) => r.when).join(', ') || 'off'}</span></span>
            <Button size="sm" onClick={() => setOpen(k)}><Settings2 />Booking settings</Button>
          </div>
        ) })}
      </SetCard>
      <SetCard title="For every campaign">
        <SwitchRow k="set.receptionTakeover" title="Receptionist steps in for booking requests" description="In any campaign, even ones that don’t book. You get a notice too." />
        <SelectRow k="set.receptionist" title="Who books by default" d="Rhea" options={['Rhea', 'Sam', 'Lily', 'Me (manually)']} />
        <SelectRow k="set.bookRemind" title="Default reminder" d="24 hours before, by text" options={['24 hours before, by text', '2 hours before, by text', '1 day before, by email', 'No reminder']} />
        <SwitchRow k="set.bookPage" title="Turn on a self-booking page for new campaigns" d={false} />
      </SetCard>
      {open && <BookingSettingsDialog open={!!open} onOpenChange={(o) => !o && setOpen(null)} camp={open} />}
    </div>
  )
}

export function AgentDefSec() {
  const s = useStore(); const nav = useNavigate()
  return (
    <div className="space-y-4">
      <SecHead title="Agent defaults" description="Rules every AI agent follows. Each agent can go further in its own settings." />
      <SetCard title="Every agent">
        <SwitchRow k="set.agDisclose" title="Say it’s an AI assistant at the start" description="Recommended, and required in some places." />
        <SwitchRow k="set.agRecord" title="Record calls" description="With a short notice at the start of each call." />
        <SelectRow k="set.agDiscount" title="Biggest discount any agent may give" d="10%" options={['No discounts', '5%', '10%', '15%', '20%']} />
        <SelectRow k="set.agLang" title="Reply in" d="The customer’s language" options={['The customer’s language', 'English only', 'English and Urdu', 'English and Spanish']} />
        <SwitchRow k="set.agComments" title="Leave a note on every conversation" description="So other agents and your team see what happened." />
      </SetCard>
      <SetCard title="By type" flush>
        {AGENT_TYPES.map((t) => <button key={t} onClick={() => nav(`/agents?type=${t}`)} className="flex w-full items-center gap-3 border-t border-border-2 px-4 py-2.5 text-left hover:bg-subtle-2"><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{AT[t].label}</span><span className="block text-xs text-muted">{s.agents.filter((a) => a.type === t).map((a) => a.name).join(', ')}</span></span><ArrowRight className="size-4 text-icon" /></button>)}
      </SetCard>
      <Card><CardBody className="flex flex-wrap items-center gap-3"><span className="min-w-0 flex-1 text-sm"><span className="block font-medium">Reset every agent to Crewline’s defaults</span><span className="text-muted">Your business details, knowledge and versions stay.</span></span><Button onClick={async () => { if (await askConfirm({ title: 'Reset every agent?', description: 'Instructions, style and rules go back to the defaults. You can switch back to your saved versions any time.', ok: 'Reset agents' })) toast.success('All agents reset · your versions are kept') }}><RotateCcw />Reset</Button></CardBody></Card>
    </div>
  )
}

export function MaxSec() {
  const [mem, setMem] = usePref<string[]>('set.maxMemory', ['Bilal prefers short answers with numbers', 'Metro Mobile sells in Mississauga, Toronto and Brampton', 'Weekly report on Mondays'])
  return (
    <div className="space-y-4">
      <SecHead title="Max" description="Your AI assistant for the whole app." />
      <SetCard title="Max may do these without asking">
        <SwitchRow k="set.maxDrafts" title="Write drafts (campaigns, messages, reports)" />
        <SwitchRow k="set.maxStages" title="Move leads between stages" />
        <SwitchRow k="set.maxSchedule" title="Change campaign schedules" d={false} />
        <SwitchRow k="set.maxSend" title="Send messages for me" d={false} />
        <SwitchRow k="set.maxSpend" title="Spend money (numbers, data lookups)" d={false} />
      </SetCard>
      <SetCard title="Help and updates">
        <SwitchRow k="set.maxTips" title="Suggest fixes on Home" description="The “Needs your attention” list." />
        <SwitchRow k="set.maxWeekly" title="Weekly summary" description="Saved to Reports and sent by email." />
        <SelectRow k="set.maxVoice" title="Max’s voice" d="Nora" options={['Nora', 'Sarah', 'Robert', 'Jay', 'Bilal (cloned)']} />
      </SetCard>
      <SetCard title="What Max remembers" description="Edit or remove anything." action={<Button size="sm" variant="ghost" onClick={async () => { if (await askConfirm({ title: 'Clear Max’s memory?', description: 'Max forgets your preferences. Your data stays.', ok: 'Clear memory', danger: true })) { setMem([]); toast.success('Memory cleared') } }}>Clear</Button>}><div className="py-3"><LineList items={mem} onChange={setMem} placeholder="Tell Max something to remember" /></div></SetCard>
    </div>
  )
}

export function RepDefSec() {
  const s = useStore()
  return (
    <div className="space-y-4">
      <SecHead title="Report defaults" description="Where reports go and who sees them." />
      <SetCard title="Saving">
        <OptionRow title="Save AI reports in" description="Max, Expenses and campaign analyses land here."><Select variant="button" align="end" value={s.prefs['set.repFolder'] ?? 'r6'} onValueChange={(v) => { s.setPref('set.repFolder', v); toast.success('Saved') }} options={s.reportFolders.map((f) => ({ value: f.id, label: f.name }))} /></OptionRow>
        <SwitchRow k="set.repAuto" title="Save every AI answer as a report" d={false} />
        <SelectRow k="set.repShare" title="Who can see reports" d="Owner and managers" options={['Only me', 'Owner and managers', 'Everyone on the team']} />
      </SetCard>
      <SetCard title="PDF look">
        <OptionRow title="Logo on PDFs"><Button onClick={() => toast.success('Logo uploaded (demo)')}><Upload />Upload logo</Button></OptionRow>
        <SelectRow k="set.repSize" title="Page size" d="Letter" options={['Letter', 'A4']} />
      </SetCard>
    </div>
  )
}

const AUDIT: [string, string, string][] = [['Today 5:12 PM', 'Bilal Nasir', 'Changed Sarah’s instructions (v5)'], ['Today 2:40 PM', 'Ali Raza', 'Exported 1,240 contacts'], ['Today 11:03 AM', 'Max', 'Moved 18 leads to Contacted'], ['Yesterday', 'Bilal Nasir', 'Invited sofia@keystonerealty.example'], ['Yesterday', 'Rhea (AI)', 'Added (647) 555-0122 to Do not contact'], ['Sep 25', 'Bilal Nasir', 'Connected Google Calendar'], ['Sep 24', 'Ali Raza', 'Paused Telecom — Fiber Win-back']]
export function ComplianceSec() {
  return (
    <div className="space-y-4">
      <SecHead title="Compliance and privacy" description="Consent, recordings, data you keep, and a log of who did what." />
      <SetCard title="Consent">
        <SwitchRow k="set.cmpConsent" title="Only message people who agreed to it" description="Checks consent for texts, calls, WhatsApp and email separately." />
        <SwitchRow k="set.cmpQuiet" title="No calls or texts before 8 AM or after 9 PM, their time" />
        <SwitchRow k="set.cmpNotice" title="Play a recording notice on calls" />
        <SwitchRow k="set.cmpMask" title="Hide card numbers and passwords in transcripts" />
      </SetCard>
      <SetCard title="Keeping data">
        <SelectRow k="set.cmpKeep" title="Keep recordings for" d="1 year" options={['90 days', '1 year', '2 years', 'Forever']} />
        <SelectRow k="set.cmpKeepMsg" title="Keep conversations for" d="2 years" options={['1 year', '2 years', '5 years', 'Forever']} />
        <OptionRow title="Someone asks for their data" description="Send everything you hold about them."><Button onClick={async () => { const e = await askText({ title: 'Export someone’s data', label: 'Their email or phone', placeholder: 'e.g. maria@example.com' }); if (e) toast.success(`A download link for ${e}’s data is being prepared`) }}><Download />Export</Button></OptionRow>
        <OptionRow title="Someone asks to be forgotten" description="Delete them everywhere, for good."><Button variant="destructive" onClick={async () => { const e = await askText({ title: 'Delete someone’s data', label: 'Their email or phone', ok: 'Continue' }); if (e && (await askConfirm({ title: `Delete everything about ${e}?`, description: 'Their contact, conversations, calls and bookings are removed. This can’t be undone.', ok: 'Delete for good', danger: true }))) toast.success(`${e} will be deleted within 24 hours`) }}>Delete</Button></OptionRow>
      </SetCard>
      <SetCard title="Activity log" action={<Button size="sm" onClick={() => toast('Log downloaded (demo)')}><Download />Download</Button>} flush>
        <div className="overflow-x-auto"><Table><thead><tr><Th>When</Th><Th>Who</Th><Th>What</Th></tr></thead><tbody>{AUDIT.map(([w, who, what], i) => <Tr key={i}><Td className="text-muted">{w}</Td><Td>{who}</Td><Td>{what}</Td></Tr>)}</tbody></Table></div>
      </SetCard>
    </div>
  )
}

type Key = { id: string; name: string; created: string; last: string; tail: string }
type Hook = { id: string; url: string; events: string[] }
const EVENTS = ['Lead created', 'Stage changed', 'Booking made', 'Booking cancelled', 'Sale recorded', 'Hand-over requested', 'Call finished']
export function IntegrationsSec() {
  const [keys, setKeys] = usePref<Key[]>('set.keys', [{ id: 'k1', name: 'Website form', created: 'Sep 2', last: 'Today', tail: '8f3a' }])
  const [hooks, setHooks] = usePref<Hook[]>('set.hooks', [{ id: 'h1', url: 'https://hooks.metromobile.example/crewline', events: ['Sale recorded', 'Booking made'] }])
  const [shown, setShown] = React.useState<string | null>(null)
  const [hook, setHook] = React.useState<Hook | null>(null)
  const newKey = async () => {
    const n = await askText({ title: 'Create an API key', label: 'What is it for?', placeholder: 'e.g. Zapier', ok: 'Create key' }); if (!n) return
    const secret = `crw_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`
    setKeys([...keys, { id: `k${Date.now()}`, name: n, created: 'Today', last: 'Never', tail: secret.slice(-4) }]); setShown(secret)
  }
  return (
    <div className="space-y-4">
      <SecHead title="Integrations and API" description="For developers: connect your own systems to Crewline." action={<Button onClick={() => toast('Opening the API guide (demo)')}>API guide<ArrowRight /></Button>} />
      <SetCard title="API keys" action={<Button size="sm" onClick={newKey}><KeyRound />Create key</Button>} flush>
        <Table><thead><tr><Th>Name</Th><Th>Key</Th><Th>Created</Th><Th>Last used</Th><Th className="w-10" /></tr></thead>
          <tbody>{keys.map((k) => <Tr key={k.id}><Td className="font-medium">{k.name}</Td><Td className="font-mono text-xs text-muted">crw_live_••••{k.tail}</Td><Td className="text-muted">{k.created}</Td><Td className="text-muted">{k.last}</Td><Td className="py-0"><Button variant="ghost" size="icon-sm" aria-label={`Revoke ${k.name}`} onClick={async () => { if (await askConfirm({ title: `Revoke “${k.name}”?`, description: 'Anything using this key stops working right away.', ok: 'Revoke key', danger: true })) { setKeys(keys.filter((x) => x.id !== k.id)); toast.success('Key revoked') } }}><Trash2 /></Button></Td></Tr>)}</tbody>
        </Table>
      </SetCard>
      <SetCard title="Webhooks" description="We send an update to your URL when something happens." action={<Button size="sm" onClick={() => setHook({ id: '', url: 'https://', events: ['Lead created'] })}><Webhook />Add webhook</Button>} flush>
        {hooks.map((h) => (
          <div key={h.id} className="flex items-center gap-3 border-t border-border-2 px-4 py-2.5">
            <span className="min-w-0 flex-1"><span className="block truncate font-mono text-xs">{h.url}</span><span className="mt-1 flex flex-wrap gap-1">{h.events.map((e) => <Badge key={e}>{e}</Badge>)}</span></span>
            <Button size="sm" onClick={() => toast.success('Test sent · your server answered 200 OK')}><Send />Test</Button>
            <Button variant="ghost" size="icon-sm" aria-label="Edit webhook" onClick={() => setHook(h)}><Settings2 /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Delete webhook" onClick={() => setHooks(hooks.filter((x) => x.id !== h.id))}><Trash2 /></Button>
          </div>
        ))}
      </SetCard>
      <Dialog open={!!shown} onOpenChange={(o) => !o && setShown(null)}>
        <DialogContent size="sm" title="Your new API key" description="Copy it now — you won’t see it again" footer={<Button variant="primary" onClick={() => setShown(null)}><Check />Done</Button>}>
          <div className="flex gap-2"><Input readOnly value={shown ?? ''} className="font-mono text-xs" /><Button onClick={() => { navigator.clipboard?.writeText(shown ?? ''); toast('Key copied') }}><Copy />Copy</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!hook} onOpenChange={(o) => !o && setHook(null)}>
        {hook && <DialogContent size="md" title={hook.id ? 'Edit webhook' : 'Add a webhook'} footer={<><Button onClick={() => setHook(null)}>Cancel</Button><Button variant="primary" disabled={!/^https:\/\/.+\..+/.test(hook.url) || !hook.events.length} onClick={() => { setHooks(hook.id ? hooks.map((x) => (x.id === hook.id ? hook : x)) : [...hooks, { ...hook, id: `h${Date.now()}` }]); setHook(null); toast.success('Webhook saved') }}>Save</Button></>}>
          <div className="space-y-4">
            <Field label="Your URL" hint="Must start with https://"><Input value={hook.url} onChange={(e) => setHook({ ...hook, url: e.target.value })} className="font-mono text-xs" /></Field>
            <Field label="Send when"><div className="grid gap-1 sm:grid-cols-2">{EVENTS.map((e) => <label key={e} className={cn('flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 text-sm hover:bg-subtle-2')}><Checkbox checked={hook.events.includes(e)} onCheckedChange={(v) => setHook({ ...hook, events: v ? [...hook.events, e] : hook.events.filter((x) => x !== e) })} />{e}</label>)}</div></Field>
          </div>
        </DialogContent>}
      </Dialog>
    </div>
  )
}
