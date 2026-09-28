import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Send, Inbox, Repeat, Check, Sparkles, Plus, Trash2, Folder, Search, ShieldBan, Settings2, ChevronLeft, ChevronRight, Mic, AlertTriangle, Pencil } from 'lucide-react'
import { cn, nf, money } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge, Count } from '@/components/ui/badge'
import { Card, CardBody, CardHeader, Banner } from '@/components/ui/card'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch, CheckMark, ChoiceRow, Slider } from '@/components/ui/controls'
import { Segmented } from '@/components/ui/tabs'
import { AgentAvatar } from '@/components/ui/avatar'
import { Tip } from '@/components/ui/tooltip'
import { PlatIcon, PLATFORMS } from '@/components/app/icons'
import { ToggleChip } from '@/components/app/bits'
import { LineList } from '@/features/shared/led'
import { FollowUpEditor } from '@/features/shared/followups'
import { AddKnowledgeDialog } from '@/features/shared/kb'
import { StageList } from '@/features/stages/stage-list'
import { PIPES } from '@/features/stages/stage-dialog'
import { BookingSettingsDialog } from '@/features/bookings/shared'
import { parseNL, runFilters, sayFilter } from '@/features/contacts/filters'
import { AT, AGENT_TYPES, dNice } from '@/data/seed'
import type { AgentType, CampaignSetup, Platform } from '@/data/types'

export type StepProps = { d: CampaignSetup; set: (p: Partial<CampaignSetup>) => void; id: string }
export const OUTB = ['Sales outreach', 'Reactivate old customers', 'Promotion or offer', 'Review requests', 'Referral requests', 'Appointment reminders']
export const INB = ['Appointment booking', 'Inbound ad campaign', 'Landing page / web form', 'Inbound call line', 'Social DMs']
export const CH: { p: Platform; l: string; from: string; ok: boolean }[] = [
  { p: 'sms', l: 'Text (SMS)', from: 'from (905) 555-0142', ok: true }, { p: 'call', l: 'Call', from: 'from (905) 555-0142', ok: true },
  { p: 'email', l: 'Email', from: 'from sales@metromobile.example', ok: true }, { p: 'wa', l: 'WhatsApp', from: '+1 905 555 0142', ok: true },
  { p: 'msg', l: 'Messenger', from: 'Metro Mobile page', ok: true }, { p: 'ig', l: 'Instagram', from: '@metromobile', ok: true },
  { p: 'tt', l: 'TikTok', from: 'Not connected', ok: false }, { p: 'chat', l: 'Web chat', from: 'metromobile.example', ok: true },
]
export const CURRENCIES = [['$', 'US dollar ($)'], ['CA$', 'Canadian dollar (CA$)'], ['₨', 'Pakistani rupee (₨)'], ['£', 'British pound (£)'], ['€', 'Euro (€)'], ['AED', 'UAE dirham (AED)'], ['₹', 'Indian rupee (₹)'], ['SAR', 'Saudi riyal (SAR)']]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 29 }, (_, i) => { const t = 360 + i * 30; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` })
export const t12 = (s: string) => { const [h, m] = s.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}` }

/** How many people the campaign reaches, and how many are skipped for Do-Not-Contact. */
export function audienceOf(d: CampaignSetup) {
  const st = useStore.getState()
  if (d.audience === 'folder') { const f = st.folders.find((x) => x.id === d.folder); const n = f?.count ?? 0; return { n, label: f ? f.name : 'No folder picked', dnc: Math.round(n * 0.009), noEmail: Math.round(n * 0.17) } }
  if (d.audience === 'selected') { const c = d.contact ? st.contacts.find((x) => x.id === d.contact) : undefined; const n = c ? 1 : d.selected; return { n, label: c ? c.name || c.phone : `${nf(d.selected)} people you selected`, dnc: c?.dnc ? 1 : 0, noEmail: c ? (c.email ? 0 : 1) : Math.round(n * 0.2) } }
  const L = d.filter.trim() ? runFilters(st.contacts, parseNL(d.filter).filters) : []
  return { n: L.length, label: d.filter.trim() ? `People matching “${d.filter}”` : 'No filter yet', dnc: L.filter((c) => c.dnc).length, noEmail: L.filter((c) => !c.email).length }
}

/* ---------- 0. Type ---------- */
export function TypeStep({ d, set }: StepProps) {
  const biz = useStore((s) => s.biz); const initialName = React.useRef(d.name)
  const subs = d.dir === 'out' ? OUTB : d.dir === 'in' ? INB : [...OUTB.slice(0, 3), ...INB.slice(0, 3)]
  const suggest = () => { const f = useStore.getState().folders.find((x) => x.id === d.folder); set({ name: `${d.biz === 'BrightSmile Dental' ? 'Dental' : d.biz === 'Keystone Realty' ? 'Real Estate' : 'Telecom'} — ${f ? f.name.replace(/ Leads$/, '') : d.sub} ${new Date(2026, 9, 1).toLocaleDateString('en-US', { month: 'long' })}` }) }
  return (<>
    <Card>
      <CardHeader title="What kind of campaign is this?" description="You can change it later in the campaign’s Settings." />
      <CardBody className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {([['out', 'Outbound', 'You reach out — texts, calls and emails to your list.', Send], ['in', 'Inbound', 'People reach you — ads, landing pages, calls and DMs.', Inbox], ['both', 'Both', 'Reach out, and answer everyone who replies or calls in.', Repeat]] as const).map(([v, l, dsc, I]) => (
            <button key={v} onClick={() => set({ dir: v, sub: v === 'in' ? INB[0] : OUTB[0] })} aria-pressed={d.dir === v} className={cn('flex flex-col items-start gap-2 rounded-card border p-3 text-left transition-colors hover:bg-subtle-2', d.dir === v ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border')}>
              <span className="flex w-full items-center justify-between"><span className="flex size-8 items-center justify-center rounded-control bg-surface shadow-bevel"><I className="size-4 text-icon" /></span>{d.dir === v && <span className="flex size-5 items-center justify-center rounded-full bg-btn text-btn-fg"><Check className="size-3" strokeWidth={3} /></span>}</span>
              <span className="text-sm font-semibold">{l}</span><span className="text-sm text-muted">{dsc}</span>
            </button>
          ))}
        </div>
        <Field label={d.dir === 'out' ? 'What is it for?' : 'What kind of inbound?'}>
          <div className="flex flex-wrap gap-1.5">{subs.map((x) => <ToggleChip key={x} on={d.sub === x} onClick={() => set({ sub: x })}>{d.sub === x && <Check />}{x}</ToggleChip>)}</div>
        </Field>
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="Name and business" />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <Field label="Campaign name" action={<Button variant="link" onClick={suggest}><Sparkles className="size-3.5" />Suggest a name</Button>}><Input autoFocus={!initialName.current} value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Mississauga Fiber — October" /></Field>
        <Field label="Business"><Select value={d.biz} onValueChange={(v) => set({ biz: v, pipe: v === 'BrightSmile Dental' ? 'dental' : v === 'Keystone Realty' ? 'realestate' : 'telecom' })} options={biz.map((b) => ({ value: b.name, label: `${b.name} · ${b.industry}` }))} /></Field>
      </CardBody>
    </Card>
  </>)
}

/* ---------- 1. Contacts ---------- */
export function PeopleStep({ d, set }: StepProps) {
  const nav = useNavigate(); const { folders, contacts } = useStore()
  const [q, setQ] = React.useState(''); const [text, setText] = React.useState(d.filter)
  const a = audienceOf(d)
  const groups = [...folders.filter((f) => f.group), { id: '__none', name: 'Other folders', parent: null, group: true, saved: '' }]
  const folderRow = (f: (typeof folders)[number], depth = 0) => (
    <button key={f.id} onClick={() => set({ folder: f.id })} className={cn('flex w-full items-center gap-3 rounded-control py-2 pr-2 text-left transition-colors hover:bg-subtle-2', d.folder === f.id && 'bg-fill-selected hover:bg-fill-selected')} style={{ paddingLeft: 8 + depth * 20 }}>
      <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border', d.folder === f.id ? 'border-btn bg-btn' : 'border-input-border')}>{d.folder === f.id && <span className="size-1.5 rounded-full bg-btn-fg" />}</span>
      <Folder className="size-4 shrink-0 text-icon" /><span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
      <span className="shrink-0 text-sm tabular">{nf(f.count ?? 0)}</span><span className="hidden w-24 shrink-0 text-right text-xs text-muted sm:block">{f.saved.slice(5, 10).replace('-', '/')}</span>
    </button>
  )
  return (<>
    <Card>
      <CardHeader title="Who should it reach?" description={d.dir === 'in' ? 'Inbound campaigns answer everyone who contacts you. You can also add a list to reach out to.' : 'Pick a saved folder, filter your database, or use the people you selected.'} />
      <CardBody className="space-y-3">
        <Segmented value={d.audience} onChange={(audience) => set({ audience })} options={[{ value: 'folder', label: 'A saved folder' }, { value: 'filter', label: 'Filter the database' }, ...(d.selected || d.contact ? [{ value: 'selected' as const, label: 'People I selected' }] : [])]} />
        {d.audience === 'folder' && (
          <div className="rounded-card border border-border">
            <div className="border-b border-border-2 p-2"><label className="flex h-8 items-center gap-2 rounded-control bg-subtle-2 px-2.5"><Search className="size-4 text-icon" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search folders" value={q} onChange={(e) => setQ(e.target.value)} /></label></div>
            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {q ? folders.filter((f) => !f.group && f.name.toLowerCase().includes(q.toLowerCase())).map((f) => folderRow(f))
                : groups.map((g) => { const kids = folders.filter((f) => !f.group && (g.id === '__none' ? f.parent === null : f.parent === g.id)); return kids.length ? (
                  <div key={g.id} className="mb-1"><h4 className="px-2 py-1 text-muted">{g.name}</h4>{kids.map((f) => <React.Fragment key={f.id}>{folderRow(f)}{folders.filter((x) => x.parent === f.id).map((x) => folderRow(x, 1))}</React.Fragment>)}</div>
                ) : null })}
            </div>
          </div>
        )}
        {d.audience === 'filter' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-control border border-input-border bg-input-bg px-3 md:h-8"><Sparkles className="size-4 shrink-0 text-icon" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && set({ filter: text })} placeholder="Describe who — “women in Mississauga with an email”" /></label>
              <Tip content="Say it instead"><Button variant="ghost" size="icon" aria-label="Voice" onClick={() => { setText('people in Brooklyn who bought in the last 3 months'); set({ filter: 'people in Brooklyn who bought in the last 3 months' }) }}><Mic /></Button></Tip>
              <Button variant="primary" onClick={() => set({ filter: text })}>Apply</Button>
            </div>
            {d.filter && <div className="flex flex-wrap items-center gap-1.5">{parseNL(d.filter).filters.map((f, i) => <Badge key={i}>{sayFilter(f)}</Badge>)}<span className="text-sm text-muted">· {nf(a.n)} of {nf(contacts.length)} match</span></div>}
            <Button variant="link" onClick={() => nav('/contacts')}>Or open Contacts and filter by hand, then “Start campaign”</Button>
          </div>
        )}
        {d.audience === 'selected' && <div className="rounded-card border border-border p-3 text-sm"><b className="font-semibold">{a.label}</b> — from Contacts. <Button variant="link" onClick={() => nav('/contacts')}>Change in Contacts</Button></div>}
      </CardBody>
    </Card>
    {d.dir !== 'out' && (
      <Card><CardHeader title="Where new inbound leads go" description="People who call, message or fill a form are added here automatically, with their lead source." />
        <CardBody className="grid gap-4 sm:grid-cols-2"><Field label="Inbound folder"><Select value="f7" options={folders.filter((f) => !f.group).map((f) => ({ value: f.id, label: f.name }))} onValueChange={() => toast('Inbound folder updated')} /></Field><Field label="Missing details"><label className="flex h-8 items-center gap-2 text-sm"><Switch defaultChecked />Fill them with AI automatically</label></Field></CardBody></Card>
    )}
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="p-4"><h3>People</h3><div className="text-2xl font-semibold tabular">{nf(a.n)}</div><p className="truncate text-xs text-muted">{a.label}</p></Card>
      <Card className="p-4"><h3 className="flex items-center gap-1.5"><ShieldBan className="size-4 text-icon" />Skipped</h3><div className="text-2xl font-semibold tabular">{nf(a.dnc)}</div><button className="text-xs text-primary hover:underline" onClick={() => nav('/contacts?view=dnc')}>On Do-Not-Contact · view list</button></Card>
      <Card className="p-4"><h3>Missing email</h3><div className="text-2xl font-semibold tabular">{nf(a.noEmail)}</div><button className="text-xs text-primary hover:underline" onClick={() => toast.success(`Filling ${nf(a.noEmail)} emails with AI · runs in the background`)}>Fill with AI</button></Card>
    </div>
  </>)
}

/* ---------- 2. Channels ---------- */
export function ChannelsStep({ d, set }: StepProps) {
  const nav = useNavigate(); const a = audienceOf(d)
  const toggle = (p: Platform) => set({ ch: d.ch.includes(p) ? d.ch.filter((x) => x !== p) : [...d.ch, p] })
  return (<>
    <Card>
      <CardHeader title="How should agents reach them?" description="Pick one, several or all. You write messages later — here you only choose the channels." action={<Button variant="ghost" onClick={() => set({ ch: d.ch.length ? [] : CH.filter((c) => c.ok).map((c) => c.p) })}>{d.ch.length ? 'Clear' : 'Select all'}</Button>} />
      <CardBody className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CH.map((c) => { const on = d.ch.includes(c.p); return (
          <button key={c.p} disabled={!c.ok} onClick={() => toggle(c.p)} aria-pressed={on} className={cn('flex items-start gap-2.5 rounded-card border p-3 text-left transition-colors enabled:hover:bg-subtle-2', on ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border', !c.ok && 'opacity-60')}>
            <PlatIcon p={c.p} size={18} tip={false} className="mt-0.5" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{c.l}</span><span className="block truncate text-xs text-muted">{c.from}</span></span>
            {c.ok ? <CheckMark on={on} className="mt-0.5" /> : null}
          </button>
        ) })}
      </CardBody>
      {CH.some((c) => !c.ok) && <div className="flex items-center gap-2 border-t border-border-2 px-4 py-2.5 text-sm text-muted"><AlertTriangle className="size-4 text-icon" />TikTok isn’t connected yet.<Button variant="link" onClick={() => nav('/settings/apps')}>Connect it</Button></div>}
    </Card>
    <Card className="p-4">
      <h3>Who agreed to what</h3>
      <p className="mt-1 text-sm text-muted">Of {nf(a.n)} people, {nf(Math.round(a.n * 0.89))} agreed to texts, {nf(Math.round(a.n * 0.79))} to calls, {nf(Math.round(a.n * 0.93))} to emails and {nf(Math.round(a.n * 0.66))} have WhatsApp. Agents only use the channels each person agreed to.</p>
    </Card>
  </>)
}

/* ---------- 3. Stages ---------- */
export function StagesStep({ d, set }: StepProps) {
  const dir = d.dir === 'in' ? 'in' : 'out'
  return (<>
    <Card className="overflow-hidden">
      <CardHeader title="Stages" description="Where each lead is. Agents move people between stages as they talk." action={<Select variant="button" value={d.pipe} onValueChange={(v) => set({ pipe: v as CampaignSetup['pipe'] })} options={PIPES.map((p) => ({ value: p.v, label: `${p.l} stages` }))} />} />
      <StageList pipe={d.pipe} dir={dir} />
    </Card>
    <Banner tone="info" action={<Button onClick={() => { const pipe = d.biz === 'BrightSmile Dental' ? 'dental' : d.biz === 'Keystone Realty' ? 'realestate' : 'telecom'; set({ pipe }); toast.success(`AI picked the ${PIPES.find((p) => p.v === pipe)?.l} stages for ${d.biz} — edit anything above`) }}><Sparkles />Let AI pick stages for my business</Button>}>
      Changes here apply to every {dir === 'in' ? 'inbound' : 'outbound'} campaign that uses {PIPES.find((p) => p.v === d.pipe)?.l} stages. The AI always follows the latest message, so if someone changes their mind the stage changes too.
    </Banner>
  </>)
}

/* ---------- 4. Agents ---------- */
export function AgentsStep({ d, set }: StepProps) {
  const agents = useStore((s) => s.agents)
  const [type, setType] = React.useState<AgentType>(d.dir === 'in' ? 'reception' : 'sales')
  const picked = agents.filter((a) => d.agents.includes(a.id))
  const sales = picked.filter((a) => a.type === 'sales')
  const toggle = (id: string) => { const on = d.agents.includes(id); set({ agents: on ? d.agents.filter((x) => x !== id) : [...d.agents, id], weights: on ? d.weights : { ...d.weights, [id]: d.weights[id] ?? 50 } }) }
  const total = sales.reduce((n, a) => n + (d.weights[a.id] ?? 50), 0) || 1
  return (<>
    <Card>
      <CardHeader title="Which agents do the work?" description="Several agents can share a campaign. Every message shows which agent sent it." />
      <CardBody className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-card border border-border p-3"><span><span className="flex items-center gap-1.5 text-sm font-medium"><Sparkles className="size-4" />Let AI pick the best agents</span><span className="block text-sm text-muted">Chosen by their results on campaigns like this one. You can still add or remove agents.</span></span><Switch checked={d.aiAgents} onCheckedChange={(aiAgents) => set({ aiAgents, ...(aiAgents && !d.agents.length ? { agents: d.dir === 'in' ? ['r1', 's2', 'm1'] : ['m1', 's1', 's2', 'r1'], weights: { s1: 60, s2: 40 } } : {}) })} /></label>
        <div className="-mx-1 overflow-x-auto px-1"><Segmented value={type} onChange={setType} options={AGENT_TYPES.map((t) => ({ value: t, label: <>{AT[t].label}<Count n={picked.filter((a) => a.type === t).length} /></> }))} /></div>
        <p className="text-sm text-muted">{AT[type].desc}. All agents can call, text and email.</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {agents.filter((a) => a.type === type).map((a) => { const on = d.agents.includes(a.id); return (
            <button key={a.id} onClick={() => toggle(a.id)} aria-pressed={on} className={cn('rounded-card border p-3 text-left transition-colors hover:bg-subtle-2', on ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border')}>
              <div className="flex items-start gap-2.5"><AgentAvatar name={a.name} size={32} /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{a.name}</span><span className="block truncate text-xs text-muted">{a.mode} · {a.voice.split('·')[1]?.trim() ?? a.voice}</span></span><CheckMark on={on} /></div>
              <div className="mt-3 grid grid-cols-3 gap-2">{AT[a.type].metrics.map((m) => <div key={m.key} className="min-w-0"><div className="truncate text-xs text-muted">{m.label}</div><div className="text-sm font-semibold tabular">{m.unit === '$' ? money(a.ws[m.key] ?? 0) : `${nf(a.ws[m.key] ?? 0)}${m.unit}`}</div></div>)}</div>
              <div className="mt-2 text-xs text-muted">Across Crewline: {a.global.success}% success · {a.global.conv}% conversion</div>
            </button>
          ) })}
        </div>
      </CardBody>
    </Card>
    {picked.length > 0 && (
      <Card className="overflow-hidden">
        <CardHeader title={`Your team · ${picked.length}`} description="Marketing starts conversations, sales qualifies and closes, the receptionist books." />
        {picked.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 border-t border-border-2 px-4 py-2.5">
            <AgentAvatar name={a.name} size={24} /><span className="w-32 min-w-0"><span className="block truncate text-sm font-medium">{a.name}</span><span className="block text-xs text-muted">{AT[a.type].label}</span></span>
            {a.type === 'sales' && sales.length > 1 ? <div className="flex min-w-[200px] flex-1 items-center gap-3"><Slider value={[d.weights[a.id] ?? 50]} max={100} step={5} onValueChange={([w]) => set({ weights: { ...d.weights, [a.id]: w } })} aria-label={`${a.name} share of new leads`} /><span className="w-28 whitespace-nowrap text-right text-sm tabular">{Math.round(((d.weights[a.id] ?? 50) / total) * 100)}% of leads</span></div>
              : <span className="flex-1 text-sm text-muted">{a.type === 'marketing' ? 'Sends the first message' : a.type === 'reception' ? 'Books appointments and answers questions' : a.type === 'sales' ? 'Handles every lead' : a.type === 'support' ? 'Solves problems after the sale' : a.type === 'tech' ? 'Fixes technical issues' : 'Invoices and payments'}</span>}
            <Button variant="ghost" size="icon-sm" onClick={() => toggle(a.id)} aria-label={`Remove ${a.name}`}><Trash2 /></Button>
          </div>
        ))}
      </Card>
    )}
  </>)
}

/* ---------- 5. Follow-ups ---------- */
export function FollowStep({ d, set }: StepProps) {
  return (
    <Card>
      <CardHeader title="Follow-ups" description="What happens when someone doesn’t reply. These override each agent’s own follow-up settings for this campaign." />
      <CardBody><FollowUpEditor value={d.follow} onChange={(follow) => set({ follow })} /></CardBody>
    </Card>
  )
}

/* ---------- 6. Details & knowledge ---------- */
const VARS = ['{first_name}', '{agent}', '{business}', '{offer}']
export function DetailsStep({ d, set, id }: StepProps) {
  const agents = useStore((s) => s.agents)
  const [booking, setBooking] = React.useState(false); const [kb, setKb] = React.useState(false)
  const msgCh = ([...d.ch.filter((c) => c !== 'call'), ...(d.ch.includes('call') ? ['call' as Platform] : [])]).filter((c, i, a) => a.indexOf(c) === i)
  const [tab, setTab] = React.useState<Platform>(msgCh[0] ?? 'sms')
  const kbNames = [...new Set([...agents.filter((a) => d.agents.includes(a.id)).flatMap((a) => a.kb.map((k) => k.name)), ...d.kb])]
  const write = (p: Platform) => { const txt = p === 'email' ? `Hi {first_name},\n\nIt’s {agent} from ${d.biz}. ${d.sub === 'Appointment booking' ? 'You’re due for a visit — reply with a time that suits you.' : 'This month you can get Internet 1 Gig for $50 with free installation, and keep your number.'}\n\nReply to this email or call us any time.` : p === 'call' ? `Introduce yourself as {agent}, ${d.biz}’s AI assistant. Confirm you’re speaking with {first_name}. Give the offer in one sentence, then ask one question.` : `Hi {first_name}, it’s {agent} from ${d.biz} 👋 ${d.sub === 'Appointment booking' ? 'Want me to find you a time this week?' : 'Internet 1 Gig is $50/month with free installation this month. Interested?'}`; if (p === 'call') set({ callInfo: txt }); else set({ opening: { ...d.opening, [p]: txt } }); toast('AI wrote it — edit anything you like') }
  return (<>
    <Card>
      <CardHeader title="Appointment booking" />
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between gap-3 py-2"><span><span className="block text-sm">This campaign books appointments</span><span className="block text-sm text-muted">Services, hours, capacity, reminders, booking page and calendar sync.</span></span><span className="flex shrink-0 items-center gap-2">{d.booking && <Button onClick={() => setBooking(true)}><Settings2 />Booking settings</Button>}<Switch checked={d.booking} onCheckedChange={(b) => { set({ booking: b }); if (b) setBooking(true) }} /></span></div>
        <div className="flex items-center justify-between gap-3 border-t border-border-2 py-2"><span><span className="block text-sm">Receptionist steps in for appointment requests</span><span className="block text-sm text-muted">If someone asks for a time, Rhea takes over — even if she isn’t on this campaign — and you get a notice in Assigned to me.</span></span><Switch checked={d.takeover} onCheckedChange={(takeover) => set({ takeover })} /></div>
      </div>
    </Card>
    <Card>
      <CardHeader title="Who qualifies" description="Write each rule as a sentence and press Enter. Mark how important each one is." />
      <CardBody className="grid gap-4 lg:grid-cols-2">
        <Field label="Qualifying criteria"><LineList items={d.qual} onChange={(qual) => set({ qual })} importance={['Required', 'Preferred', 'Optional']} placeholder="e.g. Lives in our service area" ai={() => set({ qual: [...d.qual, { text: 'Customer lives in a service area', imp: 'Required' }, { text: 'Customer is the account holder', imp: 'Required' }, { text: 'Open to switching this month', imp: 'Optional' }] })} /></Field>
        <Field label="Disqualifying criteria"><LineList items={d.disq} onChange={(disq) => set({ disq })} importance={['Required', 'Preferred', 'Optional']} placeholder="e.g. Address outside the service area" ai={() => set({ disq: [...d.disq, { text: 'Customer is under 18', imp: 'Required' }, { text: 'Locked into a contract for 6+ months', imp: 'Preferred' }] })} /></Field>
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="Script" description="Optional. Agents follow it loosely and answer questions in their own words." action={<Button variant="ghost" onClick={() => { set({ script: `Hi {first_name}, it’s {agent} from ${d.biz}. ${d.sub === 'Appointment booking' ? 'I can book you in this week — mornings or afternoons?' : 'You can get Internet 1 Gig for $50 a month with free installation this month. Do you have home internet right now?'}` }); toast('AI wrote a script') }}><Sparkles />Write with AI</Button>} />
      <CardBody><Textarea value={d.script} onChange={(e) => set({ script: e.target.value })} className="min-h-24" placeholder="Hi {first_name}, it’s {agent} from…" /><div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">Insert:{VARS.map((v) => <button key={v} onClick={() => set({ script: `${d.script}${d.script && !d.script.endsWith(' ') ? ' ' : ''}${v}` })} className="rounded-tag bg-neutral-badge px-1.5 font-mono text-text hover:bg-fill-selected">{v}</button>)}</div></CardBody>
    </Card>
    <Card>
      <CardHeader title="Knowledge" description="What agents can use to answer questions in this campaign." action={<Button onClick={() => setKb(true)}><Plus />Add knowledge base</Button>} />
      <CardBody className="flex flex-wrap gap-2">
        {kbNames.map((n) => <ToggleChip key={n} on={d.kb.includes(n)} onClick={() => set({ kb: d.kb.includes(n) ? d.kb.filter((x) => x !== n) : [...d.kb, n] })}><Folder />{n}</ToggleChip>)}
        {!kbNames.length && <p className="text-sm text-muted">Pick agents first, or add a knowledge base for this campaign.</p>}
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="Do’s and don’ts" />
      <CardBody className="grid gap-4 lg:grid-cols-2">
        <Field label="Always"><LineList items={d.dos} onChange={(dos) => set({ dos })} placeholder="e.g. Mention free installation" /></Field>
        <Field label="Never"><LineList items={d.donts} onChange={(donts) => set({ donts })} placeholder="e.g. Never offer more than 10% off" /></Field>
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="Opening messages" description="The first thing each channel says. Agents take it from there." />
      <CardBody className="space-y-3">
        {msgCh.length ? <>
          <div className="-mx-1 overflow-x-auto px-1"><Segmented value={msgCh.includes(tab) ? tab : msgCh[0]} onChange={setTab} options={msgCh.map((p) => ({ value: p, label: PLATFORMS[p].label, icon: <PlatIcon p={p} size={12} tip={false} /> }))} /></div>
          {(() => { const p = msgCh.includes(tab) ? tab : msgCh[0]; return p === 'call'
            ? <Field label="How agents open calls"><Textarea value={d.callInfo} onChange={(e) => set({ callInfo: e.target.value })} className="min-h-20" /></Field>
            : <>
              {p === 'email' && <Field label="Subject"><Input value={d.emailSubject} onChange={(e) => set({ emailSubject: e.target.value })} placeholder="e.g. Your October offer" /></Field>}
              <Field label={p === 'email' ? 'Email' : 'First message'} hint={p === 'sms' ? `${(d.opening.sms ?? '').length} characters · ${Math.max(1, Math.ceil((d.opening.sms ?? '').length / 160))} text${(d.opening.sms ?? '').length > 160 ? 's' : ''}` : undefined}><Textarea value={d.opening[p] ?? ''} onChange={(e) => set({ opening: { ...d.opening, [p]: e.target.value } })} className="min-h-24" /></Field>
            </> })()}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => write(msgCh.includes(tab) ? tab : msgCh[0])}><Sparkles />Write with AI</Button>
            <label className="ml-auto flex items-center gap-2 text-sm"><Switch size="sm" checked={d.ab} onCheckedChange={(ab) => set({ ab })} />Test two versions (A/B) and keep the winner</label>
          </div>
        </> : <p className="text-sm text-muted">Pick channels in step 2 first.</p>}
      </CardBody>
    </Card>
    <BookingSettingsDialog open={booking} onOpenChange={setBooking} camp={id} title="Booking settings for this campaign" />
    <AddKnowledgeDialog open={kb} onOpenChange={setKb} onSave={(name) => set({ kb: [...d.kb, name] })} />
  </>)
}

/* ---------- 7. Products & revenue ---------- */
export function ProductsStep({ d, set }: StepProps) {
  const stages = useStore((s) => s.stages)[d.pipe][d.dir === 'in' ? 'in' : 'out']
  const p = d.products
  const up = (next: Partial<typeof p>) => set({ products: { ...p, ...next } })
  const cat = (i: number, next: Partial<(typeof p.cats)[number]>) => up({ cats: p.cats.map((c, j) => (j === i ? { ...c, ...next } : c)) })
  const avg = p.cats.flatMap((c) => c.items).reduce((n, it, _, a) => n + it.value / a.length, 0)
  return (<>
    <Card>
      <CardHeader title="What you sell" description="Give each product a value. Revenue on every dashboard comes from these." action={<Select variant="button" value={p.cur} onValueChange={(cur) => up({ cur })} options={CURRENCIES.map(([v, l]) => ({ value: v, label: l }))} />} />
      <CardBody className="space-y-3">
        {p.cats.map((c, i) => (
          <div key={i} className="rounded-card border border-border">
            <div className="flex items-center gap-2 border-b border-border-2 p-2"><Input className="h-7 font-semibold md:h-7" value={c.name} onChange={(e) => cat(i, { name: e.target.value })} aria-label="Category name" /><Button variant="ghost" size="icon-sm" onClick={() => up({ cats: p.cats.filter((_, j) => j !== i) })} aria-label="Remove category"><Trash2 /></Button></div>
            {c.items.map((it, j) => (
              <div key={j} className="flex items-center gap-2 border-b border-border-2 px-2 py-1.5 last:border-0">
                <Input className="h-7 md:h-7" value={it.name} onChange={(e) => cat(i, { items: c.items.map((x, k) => (k === j ? { ...x, name: e.target.value } : x)) })} aria-label="Product name" />
                <span className="flex h-7 w-32 shrink-0 items-center gap-1 rounded-control border border-input-border bg-input-bg px-2"><span className="text-sm text-muted">{p.cur}</span><input className="w-full min-w-0 bg-transparent text-right text-sm tabular outline-none" inputMode="decimal" value={it.value} onChange={(e) => cat(i, { items: c.items.map((x, k) => (k === j ? { ...x, value: +e.target.value || 0 } : x)) })} aria-label="Value" /></span>
                <Button variant="ghost" size="icon-sm" onClick={() => cat(i, { items: c.items.filter((_, k) => k !== j) })} aria-label="Remove product"><Trash2 /></Button>
              </div>
            ))}
            <div className="p-2"><Button variant="ghost" onClick={() => cat(i, { items: [...c.items, { name: 'New product', value: 0 }] })}><Plus />Add product</Button></div>
          </div>
        ))}
        <Button onClick={() => up({ cats: [...p.cats, { name: 'New category', items: [{ name: 'New product', value: 0 }] }] })}><Plus />Add category</Button>
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="When does it count as revenue?" />
      <CardBody className="space-y-4">
        <Field label="Count revenue when a lead reaches" hint="Any stage — for example Installed, or Booked if you get paid at booking."><Select value={p.rev} onValueChange={(rev) => up({ rev })} options={stages.map((s) => ({ value: s.name, label: s.name, icon: <span className="size-2 rounded-full" style={{ background: s.color }} /> }))} /></Field>
        <div className="space-y-2">
          <div className="text-sm">If an order is cancelled</div>
          <ChoiceRow checked={p.cancel === 'full'} onClick={() => up({ cancel: 'full' })} title="Remove all of its revenue" description="The order is terminated." />
          <ChoiceRow checked={p.cancel === 'partial'} onClick={() => up({ cancel: 'partial' })} title="Remove part of it" description={p.cancel === 'partial' ? <span className="mt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>Keep<Input className="h-7 w-16 md:h-7" inputMode="numeric" value={p.pct ?? 50} onChange={(e) => up({ pct: Math.min(100, +e.target.value || 0) })} />% (e.g. a setup fee)</span> : 'e.g. keep a setup fee'} />
        </div>
        <p className="rounded-control bg-subtle-2 px-3 py-2 text-sm">Example: 20 people reach <b className="font-semibold">{p.rev || 'the revenue stage'}</b> with an average value of {money(avg, p.cur === '$' ? '$' : p.cur + ' ')} = <b className="font-semibold">{money(avg * 20, p.cur === '$' ? '$' : p.cur + ' ')}</b> revenue.</p>
      </CardBody>
    </Card>
  </>)
}

/* ---------- 8. Schedule ---------- */
export function ScheduleStep({ d, set }: StepProps) {
  const [month, setMonth] = React.useState(9) // October 2026 (0-based)
  const skip = d.skip ?? []
  const first = new Date(2026, month, 1); const lead = (first.getDay() + 6) % 7; const len = new Date(2026, month + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, i) => { const n = i - lead + 1; return n >= 1 && n <= len ? n : 0 })
  const iso = (n: number) => `2026-${String(month + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`
  return (<>
    <Card>
      <CardHeader title="When should it start?" />
      <CardBody className="space-y-2">
        <ChoiceRow checked={d.when === 'now'} onClick={() => set({ when: 'now' })} title="Go live now" description="Agents start within a minute of launching." />
        <ChoiceRow checked={d.when === 'later'} onClick={() => set({ when: 'later' })} title="Schedule it" description={d.when === 'later' ? <span className="mt-1 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}><Input type="date" className="h-8 w-40 md:h-7" value={d.date} onChange={(e) => set({ date: e.target.value })} /><span className="text-sm text-muted">at</span><Select size="sm" className="w-[110px]" value={d.time} onValueChange={(time) => set({ time })} options={HOURS.map((h) => ({ value: h, label: t12(h) }))} /></span> : 'Pick a date and time'} />
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="When agents work" description="Outside these hours agents answer replies but don’t start new conversations." />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center gap-2"><Select size="sm" className="w-[112px]" value={d.hours[0]} onValueChange={(v) => set({ hours: [v, d.hours[1]] })} options={HOURS.map((h) => ({ value: h, label: t12(h) }))} /><span className="text-sm text-muted">to</span><Select size="sm" className="w-[112px]" value={d.hours[1]} onValueChange={(v) => set({ hours: [d.hours[0], v] })} options={HOURS.map((h) => ({ value: h, label: t12(h) }))} /><label className="ml-2 flex items-center gap-2 text-sm"><Switch size="sm" checked={d.localTz} onCheckedChange={(localTz) => set({ localTz })} />In each person’s time zone</label></div>
        <div className="flex flex-wrap gap-1.5">{DAYS.map((x) => <ToggleChip key={x} on={d.days.includes(x)} onClick={() => set({ days: d.days.includes(x) ? d.days.filter((y) => y !== x) : [...d.days, x] })}>{x}</ToggleChip>)}</div>
        <div className="max-w-[320px] rounded-card border border-border p-3">
          <div className="mb-2 flex items-center justify-between"><Button variant="ghost" size="icon-sm" onClick={() => setMonth(Math.max(8, month - 1))} aria-label="Previous month"><ChevronLeft /></Button><h4>{first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4><Button variant="ghost" size="icon-sm" onClick={() => setMonth(Math.min(11, month + 1))} aria-label="Next month"><ChevronRight /></Button></div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DAYS.map((x) => <span key={x} className="text-2xs font-semibold text-muted">{x[0]}</span>)}
            {cells.map((n, i) => { if (!n) return <span key={i} />; const dow = DAYS[(i % 7)]; const off = !d.days.includes(dow) || skip.includes(iso(n)); return (
              <button key={i} onClick={() => set({ skip: skip.includes(iso(n)) ? skip.filter((x) => x !== iso(n)) : [...skip, iso(n)] })} disabled={!d.days.includes(dow)} className={cn('h-8 rounded-control text-sm tabular transition-colors enabled:hover:bg-subtle-2', off ? 'text-disabled line-through' : 'font-medium', skip.includes(iso(n)) && 'bg-danger-soft text-danger no-underline')} aria-label={`${dNice(iso(n))}${off ? ' — agents off' : ''}`}>{n}</button>
            ) })}
          </div>
          <p className="mt-2 text-xs text-muted">Click a day to give agents the day off.{skip.length ? ` ${skip.length} day${skip.length === 1 ? '' : 's'} off.` : ''}</p>
        </div>
      </CardBody>
    </Card>
    <Card>
      <CardHeader title="Limits" />
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between gap-3 py-2"><span className="text-sm">New conversations per day</span><Input className="w-24 text-right" inputMode="numeric" value={d.limit} onChange={(e) => set({ limit: +e.target.value || 0 })} /></div>
        <div className="flex items-center justify-between gap-3 border-t border-border-2 py-2"><span className="text-sm">Pause when spend reaches</span><span className="flex h-8 w-28 items-center gap-1 rounded-control border border-input-border bg-input-bg px-2 md:h-7"><span className="text-sm text-muted">$</span><input className="min-w-0 flex-1 bg-transparent text-right text-sm tabular outline-none" inputMode="numeric" value={d.budget ?? ''} onChange={(e) => set({ budget: +e.target.value || 0 })} aria-label="Budget" /></span></div>
        <div className="flex items-center justify-between gap-3 border-t border-border-2 py-2"><span className="text-sm">Pause on public holidays</span><Switch checked={d.holidays ?? true} onCheckedChange={(holidays) => set({ holidays })} /></div>
      </div>
    </Card>
  </>)
}

/* ---------- 9. Review ---------- */
export function ReviewStep({ d, go, missing }: StepProps & { go: (i: number) => void; missing: string[] }) {
  const agents = useStore((s) => s.agents); const a = audienceOf(d)
  const rows: [number, string, string][] = [
    [0, 'Type', `${d.dir === 'in' ? 'Inbound' : d.dir === 'both' ? 'Inbound and outbound' : 'Outbound'} · ${d.sub} · ${d.biz}`],
    [1, 'Contacts', `${a.label} · ${nf(a.n)} people · ${nf(a.dnc)} skipped (Do-Not-Contact)`],
    [2, 'Channels', d.ch.map((c) => PLATFORMS[c].label).join(', ') || 'None yet'],
    [3, 'Stages', `${PIPES.find((p) => p.v === d.pipe)?.l} stages`],
    [4, 'Agents', d.agents.length ? d.agents.map((id) => agents.find((x) => x.id === id)?.name).join(', ') : d.aiAgents ? 'Picked by AI' : 'None yet'],
    [5, 'Follow-ups', d.follow.ai ? 'AI handles follow-ups' : `${d.follow[d.dir === 'in' ? 'in' : 'out'].length} steps · drop after ${d.follow.drop.n} tries`],
    [6, 'Details', `${d.qual.length} qualifying rules · ${d.script ? 'script' : 'no script'} · ${d.kb.length} knowledge folders · booking ${d.booking ? 'on' : 'off'}`],
    [7, 'Revenue', `${d.products.cats.flatMap((c) => c.items).length} products · counted at ${d.products.rev || '—'} · ${d.products.cur}`],
    [8, 'Schedule', `${d.when === 'now' ? 'Starts now' : `Starts ${dNice(d.date)} at ${t12(d.time)}`} · ${d.days.join(', ')} · ${t12(d.hours[0])}–${t12(d.hours[1])}`],
  ]
  const cost = Math.round(a.n * 0.34)
  return (<>
    {missing.length > 0 && <Banner tone="warning" title="A few things are missing">{missing.join(' · ')}</Banner>}
    <Card className="overflow-hidden">
      <CardHeader title="Review" description="Everything below can be changed after launch in the campaign’s Settings." />
      {rows.map(([i, l, v]) => (
        <div key={l} className="flex items-start gap-3 border-t border-border-2 px-4 py-2.5">
          <span className="w-24 shrink-0 text-sm text-muted">{l}</span><span className="min-w-0 flex-1 text-sm">{v}</span>
          <Button variant="ghost" size="sm" onClick={() => go(i)}><Pencil />Edit</Button>
        </div>
      ))}
    </Card>
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="p-4"><h3>Estimated cost</h3><div className="text-2xl font-semibold tabular">{money(cost)}</div><p className="text-xs text-muted">AI minutes, messages and numbers</p></Card>
      <Card className="p-4"><h3>Expected bookings</h3><div className="text-2xl font-semibold tabular">{nf(Math.round(a.n * 0.09))}</div><p className="text-xs text-muted">Based on similar campaigns</p></Card>
      <Card className="p-4"><h3>Cost per booking</h3><div className="text-2xl font-semibold tabular">{a.n ? '$' + (cost / Math.max(1, Math.round(a.n * 0.09))).toFixed(2) : '—'}</div><p className="text-xs text-muted">Estimate</p></Card>
    </div>
  </>)
}
