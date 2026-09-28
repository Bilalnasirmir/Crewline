import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Rocket, Check, ChevronDown, Sparkles, Download, Building2, Users, MessageSquare, Kanban, Bot, Megaphone, UserPlus, Play, X, Upload, CalendarDays, LifeBuoy, BookOpen, Video, MessagesSquare, Newspaper, ChevronRight, Mic, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { useMax } from '@/features/max/store'
import { PageBody, PageHeader } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Progress, Checkbox } from '@/components/ui/controls'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tip } from '@/components/ui/tooltip'

type StepDef = { I: React.ComponentType<{ className?: string }>; cta: string; to?: string; plan: string[] }
const STEP: Record<string, StepDef> = {
  app: { I: Download, cta: 'Install the app', plan: ['Add Crewline to your computer’s dock and your phone’s home screen', 'Turn on notifications for handovers, bookings and Assigned to me'] },
  profile: { I: Building2, cta: 'Edit business profile', to: '/settings/business', plan: ['Read your website metromobile.example', 'Fill in your business name, hours, products and prices', 'Write a first FAQ your agents can use'] },
  contacts: { I: Users, cta: 'Import contacts', to: '/contacts?import=1', plan: ['Import your spreadsheet and match the columns', 'Save the people as a folder', 'Fill missing emails and names'] },
  channels: { I: MessageSquare, cta: 'Connect channels', to: '/settings/channels', plan: ['Connect WhatsApp Business and Messenger', 'Register your SMS sender (takes 1–3 days)', 'Connect your Gmail so emails land in the Inbox'] },
  stages: { I: Kanban, cta: 'Set up stages', to: '/stages', plan: ['Suggest stages for your business: New → Contacted → Interested → Order Booked → Installed', 'Write the rules that move a lead into each stage'] },
  agents: { I: Bot, cta: 'Set up agents', to: '/agents', plan: ['Pick Sarah (sales) and Rhea (receptionist) for you', 'Give them your prices, hours and FAQs', 'Run a test chat and show you the result'] },
  campaign: { I: Megaphone, cta: 'New campaign', to: '/campaigns/new', plan: ['Create an outbound campaign for Mississauga Leads', 'Text first, call after 4 hours, email after a day', 'Keep it as a draft until you press Launch'] },
  team: { I: UserPlus, cta: 'Invite teammates', plan: ['Invite your manager and front desk', 'Give each the right role so they get handovers'] },
}
const OTHER = [
  { k: 'intro', t: 'Watch the 3-minute intro', d: 'See a campaign go from idea to bookings.', cta: 'Watch now', I: Play },
  { k: 'import', t: 'Bring your spreadsheet', d: 'Any columns, any format — AI matches them.', cta: 'Import contacts', I: Upload },
  { k: 'max', t: 'Let Max build your first campaign', d: 'Answer a few questions in chat. Max sets everything up and waits for your OK.', cta: 'Open Max', I: Sparkles },
  { k: 'test', t: 'Talk to an agent', d: 'Text or call Sarah the way a customer would.', cta: 'Try Sarah', I: Bot },
  { k: 'call', t: 'Book a free setup call', d: 'A specialist sets it up with you in 30 minutes.', cta: 'Pick a time', I: CalendarDays },
  { k: 'templates', t: 'Start from a ready-made agent', d: 'Dental receptionist, telecom sales, real estate and more.', cta: 'Browse agents', I: BookOpen },
]
const RES: [string, string, React.ComponentType<{ className?: string }>][] = [['Help center', 'Short answers to common questions', BookOpen], ['Video lessons', '12 lessons, 2–4 minutes each', Video], ['Community', 'Ask other business owners', MessagesSquare], ['Contact support', 'Chat with us, 24/7', LifeBuoy], ['What’s new', 'Latest features and fixes', Newspaper]]

export function GetStartedPage() {
  const nav = useNavigate(); const s = useStore(); const { send, newThread } = useMax()
  const done = s.gs.filter((g) => g.done).length
  const [open, setOpen] = React.useState<string | null>(() => s.gs.find((g) => !g.done)?.k ?? null)
  const [guideOpen, setGuideOpen] = React.useState(true)
  const [aiStep, setAiStep] = React.useState<string | null>(null); const [build, setBuild] = React.useState<string | null>(null)
  const [invite, setInvite] = React.useState(false); const [video, setVideo] = React.useState(false); const [call, setCall] = React.useState(false)
  const [biz, setBiz] = React.useState('')
  const hidden: string[] = s.prefs.gsHidden ?? []
  const mark = (k: string, v = true) => s.patch('gs', (g) => g.map((x) => (x.k === k ? { ...x, done: v } : x)))
  const next = (k: string) => { const i = s.gs.findIndex((g) => g.k === k); setOpen(s.gs.slice(i + 1).find((g) => !g.done)?.k ?? s.gs.find((g) => !g.done && g.k !== k)?.k ?? null) }
  const act = (k: string) => {
    if (k === 'app') { mark('app'); next('app'); toast.success('Installed · Crewline is in your dock and on your phone (demo)'); return }
    if (k === 'team') { setInvite(true); return }
    nav(STEP[k].to!)
  }
  const other = (k: string) => {
    if (k === 'intro') setVideo(true); else if (k === 'import') nav('/contacts?import=1'); else if (k === 'max') { newThread(); send('Build a campaign'); nav('/max') }
    else if (k === 'test') nav('/agents/s1'); else if (k === 'call') setCall(true); else nav('/agents')
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Get Started" icon={<Rocket />} actions={<><Button variant="header" onClick={() => setVideo(true)}><Play />Watch the intro</Button><Button variant="header" onClick={() => toast('Support chat opened — we usually reply in 2 minutes (demo)')}><LifeBuoy />Get help</Button></>} />
      <PageBody>
        <div className="mx-auto max-w-[998px] space-y-4">
          <Card className="p-5">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
              <div>
                <h2 className="text-xl">Hello, Bilal — let’s get started.</h2>
                <p className="mt-1 text-sm text-muted">A few short steps and your AI team starts calling, texting and booking for you. Most people finish in about 10 minutes.</p>
                <div className="mt-4 flex items-center gap-3"><Progress value={(done / s.gs.length) * 100} className="max-w-[240px]" /><span className="text-sm text-muted tabular">{done} of {s.gs.length} done</span></div>
              </div>
              <div className="rounded-card bg-subtle-2 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium"><Sparkles className="size-4" />Or tell us about your business — AI sets it all up</div>
                <Textarea value={biz} onChange={(e) => setBiz(e.target.value)} className="min-h-16 bg-surface" placeholder="e.g. We sell home internet and mobile plans in Mississauga. We want to call our 20,000 leads and book installations." />
                <div className="mt-2 flex items-center gap-1">
                  <Tip content="Say it instead"><Button variant="ghost" size="icon-sm" aria-label="Voice" onClick={() => setBiz('We run a dental clinic in Manhattan with 4 chairs. We want an AI receptionist to answer calls 24/7 and book cleanings and check-ups.')}><Mic /></Button></Tip>
                  <Tip content="Attach your website, price list or brochure"><Button variant="ghost" size="icon-sm" aria-label="Attach" onClick={() => toast('Attached price-list.pdf (demo)')}><Paperclip /></Button></Tip>
                  <Button variant="primary" className="ml-auto" disabled={!biz.trim()} onClick={() => setBuild(biz.trim())}><Sparkles />Build it for me</Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Setup guide" description={`${done} of ${s.gs.length} tasks complete`} action={<Button variant="ghost" size="icon" onClick={() => setGuideOpen(!guideOpen)} aria-label={guideOpen ? 'Collapse setup guide' : 'Expand setup guide'}><ChevronDown className={cn('transition-transform', !guideOpen && '-rotate-90')} /></Button>} />
            {guideOpen && <div className="px-2 pb-2">
              {s.gs.map((g) => { const d = STEP[g.k]; const isOpen = open === g.k; return (
                <div key={g.k} className={cn('rounded-control transition-colors', isOpen ? 'bg-subtle-2' : 'hover:bg-subtle-2')}>
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Tip content={g.done ? 'Mark as not done' : 'Mark as done'}>
                      <button onClick={() => { mark(g.k, !g.done); if (!g.done && isOpen) next(g.k) }} className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors', g.done ? 'border-btn bg-btn text-btn-fg' : 'border-dashed border-icon hover:border-solid')} aria-label={g.done ? `${g.l}: done` : `${g.l}: not done`}>{g.done && <Check className="size-3" strokeWidth={3} />}</button>
                    </Tip>
                    <button onClick={() => setOpen(isOpen ? null : g.k)} className={cn('min-w-0 flex-1 truncate py-1 text-left text-sm', isOpen && 'font-semibold', g.done && !isOpen && 'text-muted')}>{g.l}</button>
                  </div>
                  {isOpen && (
                    <div className="flex gap-4 px-2 pb-3 pl-10 anim-fade">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted">{g.d}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button variant="primary" onClick={() => act(g.k)}>{d.cta}</Button>
                          <Button onClick={() => setAiStep(g.k)}><Sparkles />Get it done with AI</Button>
                          {!g.done && <Button variant="ghost" onClick={() => { mark(g.k); next(g.k) }}>Mark as done</Button>}
                        </div>
                      </div>
                      <div className="hidden size-24 shrink-0 items-center justify-center rounded-card bg-surface shadow-bevel sm:flex"><d.I className="size-8 text-icon" /></div>
                    </div>
                  )}
                </div>
              ) })}
            </div>}
          </Card>

          {OTHER.some((o) => !hidden.includes(o.k)) && <>
            <h2 className="px-1 pt-2">Other ways to start</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OTHER.filter((o) => !hidden.includes(o.k)).map((o) => (
                <Card key={o.k} className="flex flex-col p-4">
                  <div className="flex items-start gap-2"><h3 className="flex-1 text-lg">{o.t}</h3><Button variant="ghost" size="icon-sm" className="-mr-1 -mt-1" onClick={() => s.setPref('gsHidden', [...hidden, o.k])} aria-label={`Hide ${o.t}`}><X /></Button></div>
                  <p className="mt-1 flex-1 text-sm text-muted">{o.d}</p>
                  <div className="mt-4"><Button onClick={() => other(o.k)}><o.I />{o.cta}</Button></div>
                </Card>
              ))}
            </div>
          </>}

          <Card className="overflow-hidden">
            <CardHeader title="Resources" />
            {RES.map(([t, d, I]) => (
              <button key={t} onClick={() => toast(`${t} opens in a new tab (demo)`)} className="flex w-full items-center gap-3 border-t border-border-2 px-4 py-2.5 text-left transition-colors hover:bg-subtle-2">
                <I className="size-4 shrink-0 text-icon" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t}</span><span className="block text-sm text-muted">{d}</span></span><ChevronRight className="size-4 text-icon" />
              </button>
            ))}
          </Card>
          {hidden.length > 0 && <p className="pb-4 text-center text-sm"><button className="text-primary hover:underline" onClick={() => s.setPref('gsHidden', [])}>Show hidden cards</button></p>}
        </div>
      </PageBody>

      <AiPlanDialog step={aiStep} onClose={() => setAiStep(null)} onDone={(k) => { mark(k); next(k) }} />
      <BuildAllDialog text={build} onClose={() => setBuild(null)} />
      <InviteDialog open={invite} onOpenChange={setInvite} onSent={() => { mark('team'); next('team') }} />
      <Dialog open={video} onOpenChange={setVideo}>
        <DialogContent size="lg" title="Crewline in 3 minutes">
          <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-card bg-topbar text-white">
            <Button variant="secondary" size="lg" onClick={() => toast('Playing the intro video (demo)')}><Play />Play</Button>
            <span className="text-sm text-white/70">Import → build a campaign → watch agents book</span>
          </div>
        </DialogContent>
      </Dialog>
      <CallDialog open={call} onOpenChange={setCall} />
    </div>
  )
}

/** "Get it done with AI" for one step: shows the plan, waits for OK, then works through it. */
function AiPlanDialog({ step, onClose, onDone }: { step: string | null; onClose: () => void; onDone: (k: string) => void }) {
  const gs = useStore((s) => s.gs)
  const [n, setN] = React.useState(-1)
  React.useEffect(() => { setN(-1) }, [step])
  const d = step ? STEP[step] : null
  const run = () => { setN(0); let i = 0; const t = setInterval(() => { i++; setN(i); if (i >= (d?.plan.length ?? 0)) { clearInterval(t); if (step) onDone(step) } }, 700) }
  const finished = !!d && n >= d.plan.length
  return (
    <Dialog open={!!step} onOpenChange={(o) => !o && onClose()}>
      {d && step && (
        <DialogContent size="sm" title={<span className="flex items-center gap-2"><Sparkles className="size-4" />{gs.find((g) => g.k === step)?.l}</span>} description={n < 0 ? 'Here’s what AI will do. Nothing happens until you say OK.' : finished ? 'Done' : 'Working on it…'}
          footer={finished ? <Button variant="primary" onClick={onClose}>Done</Button> : n < 0 ? <><Button onClick={onClose}>Not now</Button><Button variant="primary" onClick={run}><Check />OK, go ahead</Button></> : <Button disabled>Working…</Button>}>
          <ul className="space-y-2">{d.plan.map((p, i) => <li key={p} className={cn('flex gap-2 text-sm', n >= 0 && i >= n && 'text-muted')}><span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full', n > i || finished ? 'bg-success text-white' : n === i ? 'border-2 border-text border-t-transparent animate-spin' : 'border border-border-strong')}>{(n > i || finished) && <Check className="size-2.5" strokeWidth={3} />}</span>{p}</li>)}</ul>
          {finished && <p className="mt-3 rounded-control bg-success-soft px-3 py-2 text-sm text-success-text">All set. You can review or change anything later.</p>}
        </DialogContent>
      )}
    </Dialog>
  )
}

/** Describe the business once; AI proposes the whole setup, then builds it after approval. */
function BuildAllDialog({ text, onClose }: { text: string | null; onClose: () => void }) {
  const s = useStore(); const nav = useNavigate()
  const dental = /dent|clinic|patient|doctor/i.test(text ?? '')
  const plan = dental
    ? ['Business profile: dental clinic, 4 chairs, open Mon–Sat', 'Stages: Requested → Booked → Arrived → Completed', 'Agents: Rhea and Sam as receptionists, answering 24/7', 'Booking: cleanings (45 min) and check-ups (30 min), reminders by text', 'Campaign: “Dental — 6-month recall” as a draft', 'Channels to connect: your clinic phone line and WhatsApp']
    : ['Business profile: telecom reseller in Mississauga', 'Stages: New → Contacted → Interested → Order Booked → Installed', 'Agents: Mia starts conversations, Sarah qualifies and books', 'Products: Internet 1 Gig $50, 5G Unlimited $35, TV $10', 'Campaign: “Mississauga Leads — Fiber” as a draft (text first, then call)', 'Channels to connect: SMS number and WhatsApp Business']
  const [picked, setPicked] = React.useState<string[]>([]); const [n, setN] = React.useState(-1)
  React.useEffect(() => { setPicked(plan); setN(-1) }, [text]) // new description → fresh plan
  const run = () => { setN(0); let i = 0; const t = setInterval(() => { i++; setN(i); if (i >= picked.length) { clearInterval(t); s.patch('gs', (g) => g.map((x) => (['profile', 'stages', 'agents', 'campaign'].includes(x.k) ? { ...x, done: true } : x))); s.addActivity({ icon: 'megaphone', text: '<b>Max</b> set up your workspace from your description', time: 'just now', k: 'sys' }) } }, 650) }
  const finished = n >= picked.length && n >= 0
  return (
    <Dialog open={!!text} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="md" title={<span className="flex items-center gap-2"><Sparkles className="size-4" />{finished ? 'Your workspace is ready' : 'Here’s what I’ll set up'}</span>} description={`From: “${(text ?? '').slice(0, 90)}${(text ?? '').length > 90 ? '…' : ''}”`}
        footer={finished ? <><Button onClick={() => { onClose(); nav('/campaigns') }}>See the campaign</Button><Button variant="primary" onClick={() => { onClose(); nav('/home') }}>Go to Home</Button></> : n < 0 ? <><Button onClick={onClose}>Not now</Button><Button variant="primary" disabled={!picked.length} onClick={run}><Check />OK, go ahead</Button></> : <Button disabled>Setting up…</Button>}>
        {n < 0 && <p className="mb-3 text-sm text-muted">Untick anything you don’t want. Nothing goes live — the campaign stays a draft until you launch it.</p>}
        <div className="space-y-1">{(n < 0 ? plan : picked).map((p, i) => (
          <label key={p} className={cn('flex items-start gap-2 rounded-control px-2 py-1.5 text-sm', n < 0 && 'cursor-pointer hover:bg-subtle-2', n >= 0 && i >= n && !finished && 'text-muted')}>
            {n < 0 ? <Checkbox className="mt-0.5" checked={picked.includes(p)} onCheckedChange={(c) => setPicked(c ? [...picked, p] : picked.filter((x) => x !== p))} /> : <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full', n > i || finished ? 'bg-success text-white' : 'border border-border-strong')}>{(n > i || finished) && <Check className="size-2.5" strokeWidth={3} />}</span>}
            {p}
          </label>
        ))}</div>
      </DialogContent>
    </Dialog>
  )
}

export function InviteDialog({ open, onOpenChange, onSent }: { open: boolean; onOpenChange: (o: boolean) => void; onSent?: () => void }) {
  const { patch, biz } = useStore()
  const [email, setEmail] = React.useState(''); const [role, setRole] = React.useState('Team member'); const [scope, setScope] = React.useState('All businesses')
  React.useEffect(() => { if (open) { setEmail(''); setRole('Team member'); setScope('All businesses') } }, [open])
  const ok = /.+@.+\..+/.test(email)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" title="Invite a teammate" description="They get handovers and can step into any conversation"
        footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!ok} onClick={() => { patch('team', (t) => [...t, { name: email.split('@')[0].replace(/\W+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()), role, scope, email }]); onOpenChange(false); onSent?.(); toast.success(`Invite sent to ${email}`) }}>Send invite</Button></>}>
        <div className="space-y-3">
          <Field label="Email"><Input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@business.com" /></Field>
          <Field label="Role" hint={role === 'Admin' ? 'Can change everything except billing.' : role === 'Manager' ? 'Runs campaigns and handles handovers.' : role === 'View only' ? 'Can see dashboards and reports.' : 'Replies in the Inbox and handles Assigned to me.'}><Select value={role} onValueChange={setRole} options={['Admin', 'Manager', 'Team member', 'View only'].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Can see"><Select value={scope} onValueChange={setScope} options={['All businesses', ...biz.map((b) => b.name)].map((x) => ({ value: x, label: x }))} /></Field>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CallDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [slot, setSlot] = React.useState('')
  const slots = ['Mon 10:00 AM', 'Mon 2:30 PM', 'Tue 11:00 AM', 'Tue 4:00 PM', 'Wed 9:30 AM', 'Wed 1:00 PM']
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setSlot('') }}>
      <DialogContent size="sm" title="Book a free setup call" description="30 minutes on video, your time zone (Karachi)" footer={<><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!slot} onClick={() => { onOpenChange(false); toast.success(`Booked for ${slot} · the invite is in your email`) }}>Book call</Button></>}>
        <div className="grid grid-cols-2 gap-2">{slots.map((t) => <button key={t} onClick={() => setSlot(t)} className={cn('h-9 rounded-control border text-sm transition-colors', slot === t ? 'border-btn bg-subtle-2 font-medium' : 'border-border hover:bg-subtle-2')}>{t}</button>)}</div>
      </DialogContent>
    </Dialog>
  )
}
