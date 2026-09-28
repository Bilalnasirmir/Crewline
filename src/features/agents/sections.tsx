import * as React from 'react'
import { toast } from 'sonner'
import { Sparkles, Volume2, Mic, Plus, Trash2, ArrowUp, ArrowDown, Check, Image, Pencil, Settings2, Upload, Play, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardBody, Banner } from '@/components/ui/card'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Switch, Checkbox, ChoiceRow } from '@/components/ui/controls'
import { Segmented } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Table, Td, Th, Tr } from '@/components/ui/table'
import { AgentAvatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CampaignChip, ToggleChip } from '@/components/app/bits'
import { LineList, OptionRow } from '@/features/shared/led'
import { FollowUpEditor } from '@/features/shared/followups'
import { KbFolders } from '@/features/shared/kb'
import { BookingSettingsDialog } from '@/features/bookings/shared'
import { AT, AGENT_TYPES, promptTemplates } from '@/data/seed'
import { structuredInstr } from '@/data/review'
import { ACTIONS, ACT_TECH, ACT_FIN, RULES, PURPOSES, GOALS, TRIGGERS, DISQ_ACTIONS, CANT } from './common'
import type { Agent, HttpAction, Job, Question } from '@/data/types'

export type SecProps = { a: Agent; set: (p: Partial<Agent>) => void; setJob: (p: Partial<Job>) => void }
export const SECTIONS: [string, string][] = [['profile', 'Profile'], ['style', 'Style'], ['instructions', 'Instructions'], ['job', 'Job'], ['qa', 'Q&A'], ['knowledge', 'Knowledge'], ['actions', 'What it can do'], ['rules', 'Rules & handover'], ['follow', 'Follow-ups'], ['booking', 'Bookings']]
const LANGS = ['English', 'Urdu', 'Spanish', 'French', 'Arabic', 'Hindi', 'Punjabi', 'Mandarin', 'Portuguese', 'Tagalog']

/* ---------- Profile ---------- */
export function ProfileSec({ a, set }: SecProps) {
  const s = useStore(); const [clone, setClone] = React.useState(false)
  const switchMode = async (mode: Agent['mode']) => { if (mode === a.mode) return; const n = await askText({ title: `Rename ${a.name}?`, label: `Give the ${mode.toLowerCase()} its own name so nobody mixes them up`, value: mode === 'Chat agent' ? `${a.name} (chat)` : `${a.name} (voice)`, ok: 'Rename and switch' }); if (n) { set({ mode, name: n }); toast(`${n} is now a ${mode.toLowerCase()}`) } }
  // Campaign assignment takes effect right away (it isn't part of a saved version).
  const toggleCamp = (cid: string, on: boolean) => { const camps = on ? [...a.camps, cid] : a.camps.filter((x) => x !== cid); set({ camps }); s.updateAgent(a.id, { camps }); const c = s.campaigns.find((k) => k.id === cid)!; s.updateCampaign(cid, { agents: on ? [...c.agents, a.id] : c.agents.filter((x) => x !== a.id) }); toast.success(on ? `${a.name} now works on ${c.name}` : `${a.name} removed from ${c.name}`) }
  return (
    <Card>
      <CardHeader title="Profile" />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input value={a.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Type" hint="All agents can call, text and email."><Select value={a.type} onValueChange={(t) => set({ type: t as Agent['type'] })} options={AGENT_TYPES.map((t) => ({ value: t, label: AT[t].label }))} /></Field>
        <Field label="Label" hint="Only a label — switching asks for a new name."><Segmented value={a.mode} onChange={switchMode} options={[{ value: 'Voice agent', label: 'Voice agent' }, { value: 'Chat agent', label: 'Chat agent' }]} /></Field>
        <Field label="Works on"><Segmented value={a.dir} onChange={(dir) => set({ dir })} options={[{ value: 'out', label: 'Outbound only' }, { value: 'in', label: 'Inbound only' }, { value: 'both', label: 'Both' }]} /></Field>
        <Field label="Languages"><Combobox multiple creatable value={a.langs} onChange={(langs: string[]) => set({ langs })} options={LANGS.map((l) => ({ value: l, label: l }))} /></Field>
        <Field label="Voice" hint="Powered by ElevenLabs.">
          <div className="flex gap-2"><Select className="flex-1" value={a.voice} onValueChange={(voice) => set({ voice })} options={[a.voice, ...s.voices.map(([n, d]) => `${n} · ${d}`)].filter((v, i, arr) => arr.indexOf(v) === i).map((v) => ({ value: v, label: v }))} /><Button size="icon" aria-label="Play a sample" onClick={() => toast(`Playing ${a.voice.split('·')[0].trim()} (demo)`)}><Volume2 /></Button><Button onClick={() => setClone(true)}><Mic />Clone</Button></div>
        </Field>
        <Field label="Campaigns" className="sm:col-span-2" hint="An agent can work on any number of campaigns.">
          <div className="flex flex-wrap items-center gap-1.5">
            {a.camps.map((id) => <Badge key={id} tone="outline"><CampaignChip id={id} className="max-w-[220px]" /></Badge>)}
            <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm"><Plus />Assign to a campaign</Button></DropdownMenuTrigger><DropdownMenuContent className="w-64">{s.campaigns.map((c) => <DropdownMenuCheckboxItem key={c.id} checked={a.camps.includes(c.id)} onSelect={(e) => e.preventDefault()} onCheckedChange={(v) => toggleCamp(c.id, !!v)}>{c.name}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>
          </div>
        </Field>
        <label className="flex items-center justify-between gap-3 rounded-card border border-border p-3 sm:col-span-2"><span><span className="block text-sm font-medium">{a.status === 'paused' ? 'Paused' : 'Working'}</span><span className="block text-sm text-muted">Paused agents finish open conversations but start no new ones.</span></span><Switch checked={a.status !== 'paused'} onCheckedChange={(v) => set({ status: v ? (a.camps.length ? 'live' : 'ready') : 'paused' })} /></label>
      </CardBody>
      <CloneVoice open={clone} onOpenChange={setClone} onDone={(v) => set({ voice: v })} />
    </Card>
  )
}

export function CloneVoice({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: (v: string) => void }) {
  const patch = useStore((s) => s.patch)
  const [name, setName] = React.useState('My voice'); const [file, setFile] = React.useState(''); const [ok, setOk] = React.useState(false); const [rec, setRec] = React.useState(false)
  React.useEffect(() => { if (open) { setFile(''); setOk(false) } }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" title="Clone a voice" description="About a minute of clear speech is enough" footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!file || !ok} onClick={() => { const v = `${name} (cloned) · your own voice`; patch('voices', (vs) => [...vs, [`${name} (cloned)`, 'Your own voice']]); onDone(v); onOpenChange(false); toast.success('Voice cloned · ready in about 2 minutes') }}>Clone voice</Button></>}>
        <div className="space-y-3">
          <Field label="Voice name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-auto flex-col py-3 md:h-auto" loading={rec} onClick={() => { setRec(true); setTimeout(() => { setRec(false); setFile('Recording · 1:04') }, 1500) }}>{!rec && <Mic />}Record now</Button>
            <Button className="h-auto flex-col py-3 md:h-auto" onClick={() => setFile('voice-sample.mp3')}><Upload />Upload audio</Button>
          </div>
          {file && <Badge tone="green"><Check />{file}</Badge>}
          <label className="flex items-start gap-2 text-sm"><Checkbox className="mt-0.5" checked={ok} onCheckedChange={(v) => setOk(!!v)} />This is my voice, or I have written permission to use it.</label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Style per channel ---------- */
export function StyleSec({ a, set }: SecProps) {
  const [ch, setCh] = React.useState<'call' | 'text' | 'email'>('call')
  const presets = ['Friendly', 'Professional', 'Casual', 'Short and clear', 'Warm and patient', 'Light humour']
  return (
    <Card>
      <CardHeader title="How it talks" description="Set separately for calls, texts and emails." action={<Button variant="ghost" onClick={() => { set({ style: { ...a.style, [ch]: `${a.style[ch].replace(/\.$/, '')}. Mirrors the customer’s energy, uses their name once, and ends with one clear question.` } }); toast('AI improved the style') }}><Sparkles />Improve with AI</Button>} />
      <CardBody className="space-y-3">
        <Segmented value={ch} onChange={setCh} options={[{ value: 'call', label: 'Calls' }, { value: 'text', label: 'Texts & chats' }, { value: 'email', label: 'Emails' }]} />
        <Textarea value={a.style[ch]} onChange={(e) => set({ style: { ...a.style, [ch]: e.target.value } })} className="min-h-20" />
        <div className="flex flex-wrap gap-1.5">{presets.map((p) => <ToggleChip key={p} on={a.style[ch].toLowerCase().includes(p.toLowerCase())} onClick={() => set({ style: { ...a.style, [ch]: a.style[ch].toLowerCase().includes(p.toLowerCase()) ? a.style[ch] : `${a.style[ch].replace(/\.$/, '')}, ${p.toLowerCase()}` } })}>{p}</ToggleChip>)}</div>
      </CardBody>
    </Card>
  )
}

/* ---------- Instructions ---------- */
export function InstructionsSec({ a, set }: SecProps) {
  const [opt, setOpt] = React.useState<string | null>(null)
  const improved = structuredInstr(a)
  return (
    <Card>
      <CardHeader title="Instructions" description="Your business layer on top of Crewline’s hidden core instructions." action={<div className="flex gap-2"><Button variant="ghost" onClick={async () => { const t = await askText({ title: 'Take help from AI', label: 'Tell AI what you want the agent to do differently', placeholder: 'e.g. Always mention we don’t have contracts', multiline: true, ok: 'Add it' }); if (t) { set({ instr: `${a.instr}\n- ${t}` }); toast('Added to the instructions') } }}><Sparkles />Take help from AI</Button><Button onClick={() => setOpt(improved)}><Sparkles />Optimize with AI</Button></div>} />
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted">Template</span><Select variant="button" value={a.template} onValueChange={(template) => { set({ template }); toast(`Using “${template}” — your business details stay`) }} options={promptTemplates[a.type].map((t) => ({ value: t, label: t }))} /></div>
        <Textarea value={a.instr} onChange={(e) => set({ instr: e.target.value })} className="min-h-40 font-mono text-[13px]" />
        <p className="flex items-center gap-1.5 text-xs text-muted"><Lock className="size-3.5" />Crewline’s core instructions stay hidden and are the same for every business. Edits here apply only to your workspace.</p>
      </CardBody>
      <Dialog open={!!opt} onOpenChange={(o) => !o && setOpt(null)}>
        <DialogContent size="lg" title={<span className="flex items-center gap-2"><Sparkles className="size-4" />Optimized instructions</span>} description="Same meaning, clearer structure — review before using it" footer={<><Button onClick={() => setOpt(null)}>Keep mine</Button><Button variant="primary" onClick={() => { set({ instr: opt! }); setOpt(null); toast.success('Instructions updated · check the Review score') }}><Check />Use this</Button></>}>
          <div className="grid gap-3 md:grid-cols-2"><div><h4 className="mb-1 text-muted">Now</h4><pre className="whitespace-pre-wrap rounded-card bg-subtle-2 p-3 font-sans text-sm">{a.instr}</pre></div><div><h4 className="mb-1 text-muted">Suggested</h4><pre className="whitespace-pre-wrap rounded-card border border-border p-3 font-sans text-sm">{opt}</pre></div></div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ---------- Job (the full question set) ---------- */
function Sub({ title, n, children }: { title: string; n: number; children: React.ReactNode }) {
  return <div className="border-t border-border-2 px-4 py-4"><h3 className="mb-3 flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-subtle text-2xs font-semibold tabular text-muted">{n}</span>{title}</h3><div className="space-y-4">{children}</div></div>
}
export function JobSec({ a, setJob }: SecProps) {
  const j = a.job; const stages = useStore((s) => s.stages.telecom.out)
  const [pic, setPic] = React.useState(false)
  const setQ = (i: number, p: Partial<Question>) => setJob({ questions: j.questions.map((q, k) => (k === i ? { ...q, ...p } : q)) })
  const moveQ = (i: number, by: number) => { const L = [...j.questions]; const k = i + by; if (k < 0 || k >= L.length) return; [L[i], L[k]] = [L[k], L[i]]; setJob({ questions: L }) }
  const multi = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Job" description="Answer what applies — skip the rest. Every answer is a list you can edit line by line." />
      <Sub n={1} title="Purpose and goal">
        <Field label="What is it for?"><div className="flex flex-wrap gap-1.5">{PURPOSES.map((p) => <ToggleChip key={p} on={j.purposes.includes(p)} onClick={() => setJob({ purposes: multi(j.purposes, p) })}>{j.purposes.includes(p) && <Check />}{p}</ToggleChip>)}</div></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Main goal"><Select value={j.goal} onValueChange={(goal) => setJob({ goal })} options={[...new Set([j.goal, ...GOALS])].map((g) => ({ value: g, label: g }))} /></Field>
          <Field label="Who it talks to"><Segmented value={j.target} onChange={(target) => setJob({ target })} options={['Individuals', 'Businesses', 'Both'].map((x) => ({ value: x, label: x }))} /></Field>
        </div>
        <div className="flex items-center gap-3"><Switch checked={j.exclude.on} onCheckedChange={(on) => setJob({ exclude: { ...j.exclude, on } })} /><span className="text-sm">Anyone it should not talk to?</span>{j.exclude.on && <Input className="flex-1" value={j.exclude.who} onChange={(e) => setJob({ exclude: { ...j.exclude, who: e.target.value } })} />}</div>
      </Sub>
      <Sub n={2} title="Products and pricing">
        <Field label="What do you sell?"><Textarea value={j.products} onChange={(e) => setJob({ products: e.target.value })} className="min-h-16" /></Field>
        <Field label="Pricing" action={<Button variant="link" onClick={() => setPic(true)}><Image className="size-3.5" />Read it from a picture</Button>}><Textarea value={j.pricing} onChange={(e) => setJob({ pricing: e.target.value })} className="min-h-16" /></Field>
        <Field label="Billing"><Segmented value={j.billing} onChange={(billing) => setJob({ billing })} options={['One-time', 'Monthly', 'Annual', 'Not relevant'].map((x) => ({ value: x, label: x }))} /></Field>
      </Sub>
      <Sub n={3} title="Who it’s for">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Who is eligible"><LineList items={j.eligible} onChange={(eligible) => setJob({ eligible })} placeholder="e.g. 18 or older" /></Field>
          <Field label="Who is not eligible"><LineList items={j.notEligible} onChange={(notEligible) => setJob({ notEligible })} placeholder="e.g. Outside the service area" /></Field>
        </div>
        <Field label="Important product information"><LineList items={j.important} onChange={(important) => setJob({ important })} placeholder="e.g. Free installation this month" /></Field>
      </Sub>
      <Sub n={4} title="Qualifying">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Qualifying criteria"><LineList items={j.qual} onChange={(qual) => setJob({ qual })} importance={['Required', 'Preferred', 'Optional']} placeholder="Say it in a sentence" ai={() => setJob({ qual: [...j.qual, { text: 'Customer confirms the service address', imp: 'Required' }] })} /></Field>
          <Field label="Disqualifying criteria"><LineList items={j.disq} onChange={(disq) => setJob({ disq })} importance={['Required', 'Preferred', 'Optional']} placeholder="Say it in a sentence" /></Field>
        </div>
      </Sub>
      <Sub n={5} title="Questions to ask (in this order)">
        <div className="overflow-x-auto rounded-card border border-border">
          <Table>
            <thead><tr><Th className="w-8">#</Th><Th>Question</Th><Th>Needed?</Th><Th>Ask up to</Th><Th>If… then…</Th><Th className="w-24" /></tr></thead>
            <tbody>{j.questions.map((q, i) => (
              <Tr key={i}>
                <Td className="text-muted tabular">{i + 1}</Td>
                <Td className="min-w-[220px]"><Input className="h-7 md:h-7" value={q.q} onChange={(e) => setQ(i, { q: e.target.value })} /></Td>
                <Td><Select size="sm" className="w-[128px]" value={q.req} onValueChange={(req) => setQ(i, { req: req as Question['req'] })} options={['Required', 'Optional', 'Not required'].map((x) => ({ value: x, label: x }))} /></Td>
                <Td><Select size="sm" className="w-[140px]" value={q.att} onValueChange={(att) => setQ(i, { att })} options={['Once', 'Twice', 'Three times', 'Until answered', 'Custom'].map((x) => ({ value: x, label: x }))} /></Td>
                <Td className="min-w-[200px]"><Input className="h-7 md:h-7" value={q.cond} placeholder="e.g. Yes → ask the provider" onChange={(e) => setQ(i, { cond: e.target.value })} /></Td>
                <Td><span className="flex"><Button variant="ghost" size="icon-xs" disabled={!i} onClick={() => moveQ(i, -1)} aria-label="Move up"><ArrowUp /></Button><Button variant="ghost" size="icon-xs" disabled={i === j.questions.length - 1} onClick={() => moveQ(i, 1)} aria-label="Move down"><ArrowDown /></Button><Button variant="ghost" size="icon-xs" onClick={() => setJob({ questions: j.questions.filter((_, k) => k !== i) })} aria-label="Remove"><Trash2 /></Button></span></Td>
              </Tr>
            ))}</tbody>
          </Table>
          <div className="border-t border-border-2 p-2"><Button onClick={() => setJob({ questions: [...j.questions, { q: '', req: 'Optional', att: 'Once', cond: '' }] })}><Plus />Add a question</Button></div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Information to collect"><LineList items={j.collect} onChange={(collect) => setJob({ collect })} placeholder="e.g. Best time to call" /></Field>
          <Field label="What to recommend"><LineList items={j.rec} onChange={(rec) => setJob({ rec })} placeholder="e.g. 3+ people at home → Internet 1 Gig" /></Field>
        </div>
      </Sub>
      <Sub n={6} title="What happens next">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="When qualified, move to"><Select value={j.whenQual} onValueChange={(whenQual) => setJob({ whenQual })} options={[...new Set([j.whenQual, ...stages.map((st) => st.name)])].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="When it can’t decide"><Select value={j.cantDecide} onValueChange={(cantDecide) => setJob({ cantDecide })} options={[...new Set([j.cantDecide, ...CANT])].map((x) => ({ value: x, label: x }))} /></Field>
        </div>
        <Field label="When disqualified"><div className="flex flex-wrap gap-1.5">{DISQ_ACTIONS.map((x) => <ToggleChip key={x} on={j.whenDisq.includes(x)} onClick={() => setJob({ whenDisq: multi(j.whenDisq, x) })}>{j.whenDisq.includes(x) && <Check />}{x}</ToggleChip>)}</div></Field>
        <Field label="Hand over to a person when"><div className="flex flex-wrap gap-1.5">{TRIGGERS.map((x) => <ToggleChip key={x} on={j.triggers.includes(x)} onClick={() => setJob({ triggers: multi(j.triggers, x) })}>{j.triggers.includes(x) && <Check />}{x}</ToggleChip>)}</div></Field>
        <Field label="Who receives the hand-over"><Select value={j.handTo} onValueChange={(handTo) => setJob({ handTo })} options={['Sales team', 'Support team', 'Bilal Nasir', 'Ali Raza', 'Front desk'].map((x) => ({ value: x, label: x }))} /></Field>
      </Sub>
      <Sub n={7} title="Limits and follow-up">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Never…"><LineList items={j.restrict} onChange={(restrict) => setJob({ restrict })} placeholder="e.g. Never offer a discount" /></Field>
          <Field label="Follow-up rules"><LineList items={j.follow} onChange={(follow) => setJob({ follow })} placeholder="e.g. First follow-up by email after a day" /></Field>
        </div>
      </Sub>
      <Sub n={8} title="Behaviour">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Tone"><Segmented value={j.tone} onChange={(tone) => setJob({ tone })} options={['Professional', 'Friendly', 'Casual'].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Replies"><Select value={j.style} onValueChange={(style) => setJob({ style })} options={['Short and clear', 'Detailed', 'Match the customer'].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Sales posture"><Select value={j.posture} onValueChange={(posture) => setJob({ posture })} options={['Salesperson', 'Consultative', 'Direct', 'Neutral'].map((x) => ({ value: x, label: x }))} /></Field>
        </div>
        <Field label="Compliance and sensitive information"><LineList items={j.compliance} onChange={(compliance) => setJob({ compliance })} placeholder="e.g. Never store card numbers" /></Field>
        <Field label="Script (optional)"><Textarea value={j.script} onChange={(e) => setJob({ script: e.target.value })} className="min-h-16" /></Field>
      </Sub>
      <Dialog open={pic} onOpenChange={setPic}>
        <DialogContent size="sm" title="AI read your price list" description="price-list.jpg" footer={<><Button onClick={() => setPic(false)}>Change something</Button><Button variant="primary" onClick={() => { setJob({ pricing: 'Phone line $20/mo · Internet 1 Gig $50/mo · TV $10/mo · 5G Unlimited $35/line/mo · Taxes included · Free installation this month' }); setPic(false); toast.success('Pricing updated from the picture') }}><Check />Yes, that’s right</Button></>}>
          <p className="mb-2 text-sm">Here’s what I understood — <b className="font-semibold">is this correct?</b></p>
          <ul className="space-y-1 text-sm">{['Phone line — $20 / month', 'Internet 1 Gig — $50 / month', 'TV package — $10 / month', '5G Unlimited — $35 per line / month', 'Taxes included · free installation this month'].map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 size-4 text-success" />{x}</li>)}</ul>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ---------- Q&A ---------- */
export function QaSec({ a, set }: SecProps) {
  const up = (i: number, p: Partial<Agent['qa'][number]>) => set({ qa: a.qa.map((x, k) => (k === i ? { ...x, ...p } : x)) })
  return (
    <Card>
      <CardHeader title="Questions and answers" description="If the customer asks this → answer that." action={<Button variant="ghost" onClick={() => { set({ qa: [...a.qa, { q: 'Do you offer student discounts?', a: 'Yes — 10% off with a valid student ID.' }] }); toast('AI added a common question') }}><Sparkles />Suggest with AI</Button>} />
      <div>{a.qa.map((x, i) => (
        <div key={i} className="grid gap-2 border-t border-border-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
          <Input value={x.q} onChange={(e) => up(i, { q: e.target.value })} placeholder="If the customer asks…" aria-label="Question" />
          <Input value={x.a} onChange={(e) => up(i, { a: e.target.value })} placeholder="Answer" aria-label="Answer" />
          <Button variant="ghost" size="icon" onClick={() => set({ qa: a.qa.filter((_, k) => k !== i) })} aria-label="Remove"><Trash2 /></Button>
        </div>
      ))}</div>
      <div className="border-t border-border-2 px-4 py-3"><Button onClick={() => set({ qa: [...a.qa, { q: '', a: '' }] })}><Plus />Add a question</Button></div>
    </Card>
  )
}

/* ---------- Knowledge ---------- */
export function KnowledgeSec({ a, set }: SecProps) {
  return <Card><CardHeader title="What it knows" description="Files, website links, pictures, videos and text. Each “Add knowledge base” saves one folder." /><CardBody><KbFolders folders={a.kb} onChange={(kb) => set({ kb })} /></CardBody></Card>
}

/* ---------- Actions ---------- */
export function ActionsSec({ a, set }: SecProps) {
  const [http, setHttp] = React.useState<{ i: number; v: HttpAction } | null>(null)
  const cats = [...ACTIONS, ...(a.type === 'tech' ? [ACT_TECH] : []), ...(a.type === 'finance' ? [ACT_FIN] : [])]
  return (
    <Card className="overflow-hidden">
      <CardHeader title="What it can do" description="Turn each action on or off. Every agent always updates the database at the end of a conversation." />
      <div className="grid gap-px bg-border-2 md:grid-cols-2">
        {cats.map(([g, items]) => (
          <div key={g} className="bg-surface px-4 py-3">
            <h4 className="mb-1 text-muted">{g}</h4>
            {items.map(([k, l]) => <label key={k} className="flex cursor-pointer items-center justify-between gap-3 py-1.5"><span className="text-sm">{l}</span><Switch size="sm" checked={!!a.act[k]} onCheckedChange={(v) => set({ act: { ...a.act, [k]: v } })} /></label>)}
          </div>
        ))}
      </div>
      {a.act.http && (
        <div className="border-t border-border-2">
          <div className="flex items-center justify-between px-4 py-3"><h3>HTTP requests</h3><Button onClick={() => setHttp({ i: -1, v: { name: '', prompt: '', method: 'GET', url: 'https://', params: [], headers: [['Authorization', 'Bearer ']], fields: [] } })}><Plus />Add HTTP request</Button></div>
          {a.http.map((h, i) => (
            <button key={i} onClick={() => setHttp({ i, v: structuredClone(h) })} className="flex w-full items-center gap-3 border-t border-border-2 px-4 py-2.5 text-left hover:bg-subtle-2">
              <Badge tone="blue">{h.method}</Badge><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{h.name}</span><span className="block truncate font-mono text-xs text-muted">{h.url}</span></span><Pencil className="size-4 text-icon" />
            </button>
          ))}
          {!a.http.length && <p className="px-4 pb-3 text-sm text-muted">No requests yet. Add one to let the agent check an order, restart a modem or look something up in your system.</p>}
        </div>
      )}
      <HttpDialog value={http?.v ?? null} onClose={() => setHttp(null)} onSave={(v) => { set({ http: http && http.i >= 0 ? a.http.map((x, k) => (k === http.i ? v : x)) : [...a.http, v] }); setHttp(null); toast.success(`“${v.name}” saved`) }} onDelete={http && http.i >= 0 ? () => { set({ http: a.http.filter((_, k) => k !== http.i) }); setHttp(null) } : undefined} />
    </Card>
  )
}

function KV({ rows, onChange, label }: { rows: [string, string][]; onChange: (r: [string, string][]) => void; label: string }) {
  return (
    <Field label={label}>
      <div className="space-y-1.5">
        {rows.map(([k, v], i) => <div key={i} className="flex gap-2"><Input className="font-mono text-xs" value={k} placeholder="Key" onChange={(e) => onChange(rows.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} /><Input className="font-mono text-xs" value={v} placeholder="Value or {contact.field}" onChange={(e) => onChange(rows.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} /><Button variant="ghost" size="icon" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 /></Button></div>)}
        <Button variant="ghost" size="sm" onClick={() => onChange([...rows, ['', '']])}><Plus />Add</Button>
      </div>
    </Field>
  )
}
function HttpDialog({ value, onClose, onSave, onDelete }: { value: HttpAction | null; onClose: () => void; onSave: (v: HttpAction) => void; onDelete?: () => void }) {
  const [v, setV] = React.useState<HttpAction | null>(value); const [res, setRes] = React.useState('')
  React.useEffect(() => { setV(value); setRes('') }, [value])
  if (!v) return null
  return (
    <Dialog open={!!value} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg" title={value?.name ? `HTTP request · ${value.name}` : 'New HTTP request'} description="The agent calls your system when the prompt below applies"
        footer={<>{onDelete && <Button variant="destructive" className="mr-auto" onClick={onDelete}><Trash2 />Delete</Button>}<Button onClick={() => { setRes('Sending…'); setTimeout(() => setRes(JSON.stringify({ status: 200, data: { address: '214 King St W', outage: false, speed_mbps: 940, modem: 'online' } }, null, 2)), 700) }}><Play />Test request</Button><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!v.name.trim() || !v.url.trim()} onClick={() => onSave(v)}>Save</Button></>}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Action name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="e.g. Check service status" /></Field>
          <Field label="Method"><Segmented value={v.method} onChange={(method) => setV({ ...v, method })} options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ value: m, label: m }))} /></Field>
          <Field label="When should the agent use it?" className="md:col-span-2"><Textarea value={v.prompt} onChange={(e) => setV({ ...v, prompt: e.target.value })} className="min-h-16" placeholder="e.g. When a customer says their internet is down, to check for an outage at their address." /></Field>
          <Field label="URL" className="md:col-span-2"><Input className="font-mono text-xs" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} /></Field>
          <KV label="Parameters" rows={v.params} onChange={(params) => setV({ ...v, params })} />
          <KV label="Headers" rows={v.headers} onChange={(headers) => setV({ ...v, headers })} />
          <Field label="Information the agent must collect first" className="md:col-span-2"><LineList items={v.fields} onChange={(fields) => setV({ ...v, fields })} placeholder="e.g. address" /></Field>
          {res && <pre className="overflow-x-auto rounded-card bg-topbar p-3 font-mono text-xs text-white md:col-span-2">{res}</pre>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Rules & handover ---------- */
export function RulesSec({ a, set }: SecProps) {
  const s = useStore()
  const stages = [...new Set(Object.values(s.stages).flatMap((p) => [...p.out, ...p.in]).map((x) => x.name))]
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Rules and hand-over" />
      <div className="grid gap-px bg-border-2 md:grid-cols-2">
        {RULES.map(([g, items]) => (
          <div key={g} className="bg-surface px-4 py-3">
            <h4 className="mb-1 text-muted">{g}</h4>
            {items.map(([k, l]) => <label key={k} className="flex cursor-pointer items-center justify-between gap-3 py-1.5"><span className="text-sm">{l}</span><Switch size="sm" checked={!!a.rules[k]} onCheckedChange={(v) => set({ rules: { ...a.rules, [k]: v } })} /></label>)}
          </div>
        ))}
      </div>
      <div className="divide-y divide-border-2 border-t border-border-2 px-4">
        <OptionRow title="Biggest discount it may give"><Select variant="button" value={String(a.discount)} onValueChange={(v) => set({ discount: +v })} options={[0, 5, 10, 15, 20].map((d) => ({ value: String(d), label: d ? `${d}%` : 'No discounts' }))} /></OptionRow>
        <div className="space-y-3 py-3">
          <div className="flex items-center justify-between gap-3"><span><span className="block text-sm">Hand over at a stage</span><span className="block text-sm text-muted">When a lead reaches a stage, choose who takes it from there.</span></span><Switch checked={a.handoff.on} onCheckedChange={(on) => set({ handoff: { ...a.handoff, on } })} /></div>
          {a.handoff.on && (
            <div className="space-y-2 anim-fade">
              <div className="flex items-center gap-2 text-sm">At<Select variant="button" value={a.handoff.stage} onValueChange={(stage) => set({ handoff: { ...a.handoff, stage } })} options={stages.map((x) => ({ value: x, label: x }))} /></div>
              <ChoiceRow checked={a.handoff.mode === 'same'} onClick={() => set({ handoff: { ...a.handoff, mode: 'same' } })} title={`Continue with ${a.name}`} />
              <ChoiceRow checked={a.handoff.mode === 'another'} onClick={() => set({ handoff: { ...a.handoff, mode: 'another', to: s.agents.some((x) => x.id === a.handoff.to) ? a.handoff.to : 'r1' } })} title="Pass to another agent" />
              {a.handoff.mode === 'another' && <div className="pl-10"><Select size="sm" className="w-[240px]" value={a.handoff.to} onValueChange={(to) => set({ handoff: { ...a.handoff, to } })} options={s.agents.filter((x) => x.id !== a.id).map((x) => ({ value: x.id, label: `${x.name} · ${AT[x.type].label}`, icon: <AgentAvatar name={x.name} size={16} /> }))} /></div>}
              <ChoiceRow checked={a.handoff.mode === 'human'} onClick={() => set({ handoff: { ...a.handoff, mode: 'human', to: s.team.some((t) => t.email === a.handoff.to) ? a.handoff.to : s.team[0].email } })} title="Pass to a person" description="It lands in their Assigned to me" />
              {a.handoff.mode === 'human' && <div className="pl-10"><Select size="sm" className="w-[240px]" value={a.handoff.to} onValueChange={(to) => set({ handoff: { ...a.handoff, to } })} options={s.team.map((t) => ({ value: t.email, label: `${t.name} · ${t.role}` }))} /></div>}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ---------- Follow-ups ---------- */
export function FollowSec({ a, set }: SecProps) {
  return <Card><CardHeader title="Follow-ups" description="A campaign’s own follow-up settings override these." /><CardBody><FollowUpEditor value={a.follow} onChange={(follow) => set({ follow })} /></CardBody></Card>
}

/* ---------- Bookings ---------- */
export function BookingSec({ a, set }: SecProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Card>
      <CardHeader title="Bookings" />
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-3"><span><span className="block text-sm">{a.name} books appointments</span><span className="block text-sm text-muted">Services, capacity, hours, reminders, booking page and calendar sync.</span></span><span className="flex items-center gap-2">{a.booking && <Button onClick={() => setOpen(true)}><Settings2 />Booking settings</Button>}<Switch checked={a.booking} onCheckedChange={(booking) => { set({ booking, act: { ...a.act, booking } }); if (booking) setOpen(true) }} /></span></div>
        <Banner tone="info" className={cn(a.type === 'reception' && 'hidden')}>If a customer asks for an appointment in any campaign, the receptionist (Rhea) steps in automatically — even if she isn’t on it — and you get a notice in Assigned to me and inside the chat.</Banner>
      </CardBody>
      <BookingSettingsDialog open={open} onOpenChange={setOpen} camp={`agent:${a.id}`} title={`What ${a.name} can book`} />
    </Card>
  )
}
