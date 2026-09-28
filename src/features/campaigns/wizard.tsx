import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, ChevronLeft, ChevronRight, Rocket, Save, Sparkles, Megaphone } from 'lucide-react'
import { cn, nf, uid } from '@/lib/utils'
import { useStore } from '@/store'
import { useMax } from '@/features/max/store'
import { PageHeader } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/controls'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { PLATFORMS } from '@/components/app/icons'
import { defaultFollow } from '@/features/shared/followups'
import { PIPES } from '@/features/stages/stage-dialog'
import { dISO, dNice } from '@/data/seed'
import type { Campaign, CampaignSetup } from '@/data/types'
import { TypeStep, PeopleStep, ChannelsStep, StagesStep, AgentsStep, FollowStep, DetailsStep, ProductsStep, ScheduleStep, ReviewStep, audienceOf, t12, type StepProps } from './steps'

const STEPS = [
  { k: 'type', l: 'Campaign type' }, { k: 'people', l: 'Contacts' }, { k: 'channels', l: 'Channels' }, { k: 'stages', l: 'Stages' }, { k: 'agents', l: 'Agents' },
  { k: 'follow', l: 'Follow-ups' }, { k: 'details', l: 'Details & knowledge' }, { k: 'products', l: 'Products & revenue' }, { k: 'schedule', l: 'Schedule' }, { k: 'review', l: 'Review & launch' },
] as const
type StepKey = (typeof STEPS)[number]['k']
const VIEW: Record<StepKey, React.ComponentType<StepProps>> = { type: TypeStep, people: PeopleStep, channels: ChannelsStep, stages: StagesStep, agents: AgentsStep, follow: FollowStep, details: DetailsStep, products: ProductsStep, schedule: ScheduleStep, review: () => null }

/** Is a step complete enough? Required steps block launch; the others only lower the %. */
const valid = (k: StepKey, d: CampaignSetup): boolean => {
  switch (k) {
    case 'type': return !!d.name.trim()
    case 'people': return audienceOf(d).n > 0
    case 'channels': return d.ch.length > 0
    case 'agents': return d.aiAgents || d.agents.length > 0
    case 'details': return d.qual.length > 0 || !!d.script.trim()
    case 'products': return d.products.cats.some((c) => c.items.length > 0) && !!d.products.rev
    case 'schedule': return d.days.length > 0
    default: return true
  }
}
const REQUIRED: StepKey[] = ['type', 'people', 'channels', 'agents']
const MISSING: Partial<Record<StepKey, string>> = { type: 'a campaign name', people: 'who to reach', channels: 'at least one channel', agents: 'at least one agent' }

const summary = (k: StepKey, d: CampaignSetup, names: Record<string, string>) => {
  const a = audienceOf(d)
  switch (k) {
    case 'type': return `${d.dir === 'in' ? 'Inbound' : d.dir === 'both' ? 'Both' : 'Outbound'} · ${d.sub}`
    case 'people': return a.n ? `${a.label} · ${nf(a.n)}` : 'Not picked yet'
    case 'channels': return d.ch.length ? d.ch.map((c) => PLATFORMS[c].label).join(', ') : 'None yet'
    case 'stages': return `${PIPES.find((p) => p.v === d.pipe)?.l} stages`
    case 'agents': return d.agents.length ? d.agents.map((id) => names[id]).join(', ') : d.aiAgents ? 'AI picks' : 'None yet'
    case 'follow': return d.follow.ai ? 'AI handles them' : `${d.follow.out.length} steps`
    case 'details': return `${d.qual.length} rules${d.script ? ' · script' : ''}${d.booking ? ' · booking' : ''}`
    case 'products': return d.products.rev ? `Revenue at ${d.products.rev}` : 'Not set'
    case 'schedule': return d.when === 'now' ? `Now · ${t12(d.hours[0])}–${t12(d.hours[1])}` : `${dNice(d.date)} ${t12(d.time)}`
    case 'review': return 'Check and go live'
  }
}

export function NewCampaignPage() {
  const [sp] = useSearchParams(); const st = useStore()
  const [id] = React.useState(() => uid('k'))
  const [initial] = React.useState<CampaignSetup>(() => {
    const contact = sp.get('contact'); const selected = +(sp.get('selected') ?? 0); const c = contact ? st.contacts.find((x) => x.id === contact) : undefined
    const dir = sp.get('dir') === 'in' ? 'in' : 'out'
    return {
      name: '', biz: 'Metro Mobile', dir, sub: dir === 'in' ? 'Appointment booking' : 'Sales outreach',
      audience: contact || selected ? 'selected' : 'folder', folder: sp.get('folder'), filter: '', selected: c ? 1 : selected, contact: c?.id ?? null,
      ch: [], pipe: 'telecom', agents: [], weights: {}, aiAgents: false, follow: defaultFollow('s1'), booking: false, takeover: true,
      qual: [], disq: [], script: '', kb: [], dos: [], donts: [], opening: {}, callInfo: '', emailSubject: '', ab: false,
      products: structuredClone(st.products.k1), when: 'now', date: dISO(1), time: '09:00', hours: ['09:00', '20:00'], days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], localTz: true, limit: 500, skip: [], budget: 500, holidays: true,
    }
  })
  return <CampaignWizard mode="new" id={id} initial={initial} />
}

/** The campaign wizard. The same screens open again from a campaign’s Settings tab (mode "edit"). */
export function CampaignWizard({ mode, id, initial, onSaved }: { mode: 'new' | 'edit'; id: string; initial: CampaignSetup; onSaved?: () => void }) {
  const nav = useNavigate(); const st = useStore(); const { send, newThread } = useMax()
  const [d, setD] = React.useState(initial); const [step, setStep] = React.useState(0)
  const [seen, setSeen] = React.useState<Set<number>>(() => new Set(mode === 'edit' ? STEPS.map((_, i) => i) : [0]))
  const [launching, setLaunching] = React.useState(-1)
  const top = React.useRef<HTMLDivElement>(null)
  const set = (p: Partial<CampaignSetup>) => setD((x) => ({ ...x, ...p }))
  const go = (i: number) => { setStep(i); setSeen((s) => new Set(s).add(i)); if (mode === 'new') top.current?.scrollTo({ top: 0 }); else top.current?.scrollIntoView({ block: 'start' }) }
  const names = Object.fromEntries(st.agents.map((a) => [a.id, a.name]))
  const done = STEPS.slice(0, 9).map((s, i) => valid(s.k, d) && seen.has(i))
  const pct = Math.round((done.filter(Boolean).length / 9) * 100)
  const missing = REQUIRED.filter((k) => !valid(k, d)).map((k) => MISSING[k]!)
  const ready = !missing.length
  const cur = STEPS[step]; const View = VIEW[cur.k]

  const build = (status: Campaign['status']): Campaign => {
    const a = audienceOf(d); const agents = d.agents.length ? d.agents : ['m1', 's1', 's2']
    return { id, name: d.name.trim() || 'Untitled campaign', dir: d.dir, sub: d.sub, biz: d.biz, pipe: d.pipe, folder: d.folder ?? 'f7', ch: d.ch.length ? d.ch : ['sms'], status, started: status === 'running' ? 'Today' : status === 'scheduled' ? `${dNice(d.date)}, ${t12(d.time)}` : 'Draft', people: a.n, reached: 0, replied: 0, interested: 0, booked: 0, installed: 0, revenue: 0, cost: 0, agents, weights: d.weights, booking: d.booking, metrics: ['people', 'reached', 'replied', 'booked', 'revenue'], budget: d.budget, skipped: a.dnc }
  }
  const saveDraft = () => { st.addCampaign(build('draft'), d); toast.success('Saved as a draft · finish it any time from Campaigns'); nav('/campaigns') }
  const launch = () => {
    if (!ready) { toast(`Still needed: ${missing.join(', ')}`); return }
    setLaunching(0); let i = 0
    const t = setInterval(() => {
      i++; setLaunching(i)
      if (i >= 4) {
        clearInterval(t)
        const c = build(d.when === 'now' ? 'running' : 'scheduled'); st.addCampaign(c, d)
        st.addActivity({ icon: 'megaphone', text: `<b>You</b> launched the campaign <b>${c.name}</b>`, time: 'just now', k: 'sys' })
        setTimeout(() => { setLaunching(-1); nav(`/campaigns/${id}`); toast.success(d.when === 'now' ? `${c.name} is live — agents are starting now` : `${c.name} is scheduled for ${dNice(d.date)}`) }, 350)
      }
    }, 550)
  }
  const saveEdit = () => { st.saveSetup(id, d); onSaved?.(); toast.success('Saved · agents use the new settings right away') }

  const tracker = (
    <Card className="overflow-hidden">
      <div className="px-4 pb-3 pt-3">
        <div className="flex items-baseline justify-between gap-2"><h3>{mode === 'new' ? 'Your campaign' : 'Campaign setup'}</h3><span className="text-2xl font-semibold tabular">{pct}%</span></div>
        <Progress value={pct} className="mt-1.5" />
        <p className="mt-1.5 text-xs text-muted">{mode === 'new' ? (pct >= 100 ? 'Everything’s set.' : `About ${Math.max(1, Math.ceil((100 - pct) / 40))} minute${pct > 60 ? '' : 's'} left`) : 'Click any step to change it.'}</p>
      </div>
      <ol className="border-t border-border-2 p-1.5">
        {STEPS.map((s, i) => { const ok = i < 9 ? done[i] : ready && pct === 100; const on = i === step; return (
          <li key={s.k}>
            <button onClick={() => go(i)} className={cn('flex w-full items-center gap-2.5 rounded-control px-2 py-1 text-left transition-colors hover:bg-subtle-2', on && 'bg-fill-selected hover:bg-fill-selected')}>
              <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full text-2xs font-semibold tabular', ok ? 'bg-btn text-btn-fg' : on ? 'border-2 border-text text-text' : 'border border-dashed border-icon text-muted')}>{ok ? <Check className="size-3" strokeWidth={3} /> : i}</span>
              <span className="min-w-0 flex-1"><span className={cn('block truncate text-sm', on ? 'font-semibold' : 'font-medium')}>{s.l}</span><span className="block truncate text-xs text-muted">{summary(s.k, d, names)}</span></span>
            </button>
          </li>
        ) })}
      </ol>
      <div className="space-y-2 border-t border-border-2 p-3">
        {mode === 'new' ? <Button variant="primary" className="w-full" disabled={!ready} onClick={launch}><Rocket />Launch campaign</Button> : <Button variant="primary" className="w-full" onClick={saveEdit}><Save />Save changes</Button>}
        {mode === 'new' && !ready && <p className="text-center text-xs text-muted">Still needed: {missing.join(', ')}</p>}
      </div>
    </Card>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {mode === 'new' && <PageHeader crumbs={[{ label: 'Campaigns', to: '/campaigns' }]} title="New campaign" icon={<Megaphone />}
        actions={<><Button variant="header" onClick={() => { newThread(); send('Build a campaign'); nav('/max') }}><Sparkles />Build with Max</Button><Button variant="header" onClick={saveDraft}><Save />Save draft</Button><Button variant="primary" disabled={!ready} onClick={launch}><Rocket />Launch</Button></>} />}
      <div ref={top} className={cn(mode === 'new' && 'min-h-0 flex-1 overflow-y-auto')}>
        <div className={cn('mx-auto grid max-w-[1200px] items-start gap-4 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_300px]', mode === 'edit' && 'max-w-none px-0')}>
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-3 lg:hidden">
              <Select className="flex-1" value={String(step)} onValueChange={(v) => go(+v)} options={STEPS.map((s, i) => ({ value: String(i), label: `${i}. ${s.l}` }))} />
              <span className="shrink-0 text-sm text-muted tabular">{pct}% done</span>
            </div>
            <div className="flex items-baseline gap-2 px-1 pt-1"><span className="text-sm text-muted tabular">Step {step} of 9</span><h2>{cur.l}</h2></div>
            {cur.k === 'review' ? <ReviewStep d={d} set={set} id={id} go={go} missing={missing} /> : <View d={d} set={set} id={id} />}
            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Button disabled={step === 0} onClick={() => go(step - 1)}><ChevronLeft />Back</Button>
              <span className="flex-1" />
              {step < 9 ? <Button variant="primary" onClick={() => go(step + 1)}>Next: {STEPS[step + 1].l}<ChevronRight /></Button>
                : mode === 'new' ? <Button variant="primary" size="lg" disabled={!ready} onClick={launch}><Rocket />{d.when === 'now' ? 'Launch campaign' : 'Schedule campaign'}</Button>
                : <Button variant="primary" onClick={saveEdit}><Save />Save changes</Button>}
            </div>
          </div>
          <aside className="hidden lg:sticky lg:top-0 lg:block">{tracker}</aside>
        </div>
      </div>
      <Dialog open={launching >= 0}>
        <DialogContent size="sm" hideClose title={<span className="flex items-center gap-2"><Rocket className="size-4" />Launching {d.name || 'your campaign'}</span>} onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          <Progress value={(Math.max(0, launching) / 4) * 100} className="mb-3" />
          {['Skipping Do-Not-Contact numbers', `Loading ${nf(audienceOf(d).n)} people`, 'Briefing the agents on your script and knowledge', d.when === 'now' ? 'Going live' : 'Scheduling'].map((t, i) => (
            <div key={t} className={cn('flex items-center gap-2 py-1 text-sm', i >= launching && 'text-muted')}>
              <span className={cn('flex size-4 items-center justify-center rounded-full', i < launching ? 'bg-success text-white' : i === launching ? 'border-2 border-text border-t-transparent animate-spin' : 'border border-border-strong')}>{i < launching && <Check className="size-2.5" strokeWidth={3} />}</span>{t}
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  )
}
