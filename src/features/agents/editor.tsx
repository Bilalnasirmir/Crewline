import * as React from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Bot, Sparkles, ChevronDown, Check, Pencil, Trash2, History, FlaskConical, AlertTriangle, BarChart3, MoreHorizontal } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { useStore, useAgent } from '@/store'
import { PageHeader } from '@/components/app/page'
import { askConfirm, askText } from '@/components/app/ask'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, Banner, EmptyState } from '@/components/ui/card'
import { Dialog, DialogContent, Sheet } from '@/components/ui/dialog'
import { Segmented } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AnalyzeDialog, type Analysis } from '@/features/shared/ai'
import { reviewOf, applyFixes, missingForLive, andList, type ReviewItem } from '@/data/review'
import { AT } from '@/data/seed'
import { AgentBuilder } from './builder'
import { TestPanel, ReviewPanel } from './side'
import { SECTIONS, ProfileSec, StyleSec, InstructionsSec, JobSec, QaSec, KnowledgeSec, ActionsSec, RulesSec, FollowSec, BookingSec, type SecProps } from './sections'
import type { Agent, AgentSnap, Job, Version } from '@/data/types'

const RENDER: Record<string, (p: SecProps) => React.ReactNode> = {
  profile: ProfileSec, style: StyleSec, instructions: InstructionsSec, job: JobSec, qa: QaSec,
  knowledge: KnowledgeSec, actions: ActionsSec, rules: RulesSec, follow: FollowSec, booking: BookingSec,
}
/** Which fields belong to which part, to label a new version ("Updated job, Q&A"). */
const PARTS: [string, (keyof Agent)[]][] = [
  ['Profile', ['name', 'type', 'mode', 'dir', 'langs', 'voice', 'status']], ['Style', ['style']], ['Instructions', ['instr', 'template']], ['Job', ['job']],
  ['Q&A', ['qa']], ['Knowledge', ['kb']], ['Actions', ['act', 'http']], ['Rules', ['rules', 'discount', 'handoff']], ['Follow-ups', ['follow']], ['Bookings', ['booking']],
]
const STATUS: Record<Agent['status'], { l: string; tone: 'green' | 'neutral' | 'amber' | 'blue' }> = { live: { l: 'Live', tone: 'green' }, ready: { l: 'Ready', tone: 'blue' }, paused: { l: 'Paused', tone: 'amber' }, draft: { l: 'Draft', tone: 'neutral' } }

/** The settings part of an agent, compared to spot unsaved changes (versions, stats and campaigns are managed elsewhere). */
const settingsKey = (x: Agent) => JSON.stringify({ ...x, score: 0, versions: 0, ver: 0, camps: 0, edited: 0 })
function snapOf(x: Agent): AgentSnap {
  const { id: _id, versions: _v, ver: _n, ws: _ws, history: _h, global: _g, camps: _c, status: _s, score: _sc, edited: _e, ...rest } = x
  return structuredClone(rest)
}
const fresh = (id: string) => structuredClone(useStore.getState().agents.find((x) => x.id === id)!)

export function AgentEditorPage() {
  const { id = '' } = useParams(); const nav = useNavigate()
  const stored = useAgent(id)
  if (!stored) return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Agent not found" crumbs={[{ label: 'AI Agents', to: '/agents' }]} />
      <EmptyState icon={<Bot />} title="This agent doesn’t exist any more" description="It may have been deleted." action={<Button variant="primary" onClick={() => nav('/agents')}>Back to AI Agents</Button>} />
    </div>
  )
  // A new key per agent gives each one a fresh draft.
  return <Editor key={id} stored={stored} />
}

/** The editor works on a local draft; nothing reaches the store until Save changes. */
function Editor({ stored }: { stored: Agent }) {
  const [draft, setDraft] = React.useState<Agent>(() => structuredClone(stored))
  const updateAgent = useStore((s) => s.updateAgent); const campaigns = useStore((s) => s.campaigns); const prefs = useStore((s) => s.prefs); const setPref = useStore((s) => s.setPref)
  const id = stored.id
  const set = (p: Partial<Agent>) => setDraft((d) => ({ ...d, ...p }))
  const setJob = (p: Partial<Job>) => setDraft((d) => ({ ...d, job: { ...d.job, ...p } }))
  const dirty = settingsKey(draft) !== settingsKey(stored)
  const review = reviewOf(draft)
  const todoAreas = new Set(review.items.filter((i) => !i.ok).map((i) => i.area))
  const missing = missingForLive(draft)

  const [tab, setTab] = React.useState<'test' | 'review'>('test'); const [panel, setPanel] = React.useState(false)
  const [builder, setBuilder] = React.useState(false); const [analyze, setAnalyze] = React.useState(false)
  const [gate, setGate] = React.useState<ReviewItem[] | null>(null); const [manage, setManage] = React.useState(false)
  const [active, setActive] = React.useState('profile'); const [flash, setFlash] = React.useState<string | null>(null)
  const scroller = React.useRef<HTMLDivElement>(null)

  // Ask before leaving with unsaved changes.
  const dirtyRef = React.useRef(dirty); dirtyRef.current = dirty
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname)

  /* scroll spy + jump to a section */
  const onScroll = () => {
    const el = scroller.current; if (!el) return
    const top = el.getBoundingClientRect().top; let cur = SECTIONS[0][0]
    for (const [k] of SECTIONS) { const s = document.getElementById(`sec-${k}`); if (s && s.getBoundingClientRect().top - top < 140) cur = k }
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) cur = SECTIONS[SECTIONS.length - 1][0]
    setActive(cur)
  }
  const go = (k: string) => {
    setPanel(false)
    document.getElementById(`sec-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setFlash(k); setTimeout(() => setFlash((f) => (f === k ? null : f)), 1600)
  }

  /* saving and versions */
  const changed = PARTS.filter(([, ks]) => ks.some((k) => JSON.stringify(draft[k]) !== JSON.stringify(stored[k]))).map(([n]) => n)
  const withCurrentSnap = () => stored.versions.map((v) => (v.v === stored.ver && !v.snap ? { ...v, snap: snapOf(stored) } : v))
  const commit = async (asDraft = false) => {
    const label = await askText({ title: 'Save a new version', label: 'What changed? A short label helps you find this version later.', value: changed.length ? `Updated ${changed.join(', ').toLowerCase()}` : 'Small changes', ok: 'Save changes' })
    if (label === null) return
    const n = Math.max(...stored.versions.map((v) => v.v)) + 1
    const versions: Version[] = [...withCurrentSnap(), { v: n, label: label.trim() || 'Saved changes', date: 'Today', snap: snapOf(draft) }]
    const status: Agent['status'] = asDraft ? 'draft' : draft.status === 'draft' ? (draft.camps.length ? 'live' : 'ready') : draft.status
    updateAgent(id, { ...draft, versions, ver: n, edited: true, status })
    setDraft(fresh(id))
    toast.success(asDraft ? `Saved as a draft (v${n}) · ${draft.name} won’t talk to customers yet` : `Saved as v${n}${status === 'ready' ? ' · assign a campaign to put it to work' : ''}`)
  }
  const save = () => { if (missing.length) setGate(missing); else commit() }
  const switchTo = async (v: Version) => {
    if (v.v === stored.ver) return
    if (dirty && !(await askConfirm({ title: 'Discard unsaved changes?', description: `Switching to v${v.v} drops the changes you haven’t saved.`, ok: 'Discard and switch', danger: true }))) return
    updateAgent(id, { ...(v.snap ?? {}), ver: v.v, versions: withCurrentSnap() })
    setDraft(fresh(id))
    toast.success(`Now using v${v.v} · ${v.label}`)
  }
  const discard = async () => { if (await askConfirm({ title: 'Discard unsaved changes?', description: `${draft.name} goes back to v${stored.ver}.`, ok: 'Discard', danger: true })) { setDraft(structuredClone(stored)); toast('Changes discarded') } }
  const applyAI = (next: Agent, msg: string) => { setDraft(next); toast.success(msg) }

  const bizNames = [...new Set(campaigns.filter((c) => stored.camps.includes(c.id)).map((c) => c.biz))]
  const bizName = bizNames.length > 1 ? `${bizNames.length} businesses` : bizNames[0] ?? 'No campaign yet'
  const todo = review.items.filter((i) => !i.ok && i.fix)
  const analysis: Analysis = {
    title: `${draft.name} · AI analysis`, subject: `Last 30 days · ${nf(Math.round(draft.ws.msgs / 4))} conversations · ${nf(draft.ws.calls)} calls`, folder: 'r2', kind: 'Agents',
    kpis: [
      { l: 'Conversations', v: nf(Math.round(draft.ws.msgs / 4)) },
      { l: 'Success rate', v: `${draft.ws.success}%`, d: `Crewline average ${draft.global.success}%` },
      { l: 'Conversion', v: `${draft.ws.conv}%`, d: `Crewline average ${draft.global.conv}%` },
      { l: 'Review score', v: `${review.score}%`, d: review.score >= 90 ? 'Good to go' : review.score >= 70 ? 'Almost there' : 'Needs work' },
    ],
    flow: [{ l: 'Reached', n: Math.round(draft.ws.msgs / 4) }, { l: 'Replied', n: draft.ws.replies }, { l: 'Interested', n: Math.round(draft.ws.replies * 0.46) }, { l: 'Qualified', n: Math.round(draft.ws.replies * 0.27) }, { l: AT[draft.type].metrics[0].label, n: Math.round(draft.ws.replies * 0.27 * draft.ws.conv / 30) }],
    wrong: review.items.filter((i) => !i.ok).slice(0, 4).map((i) => `${i.title}: ${i.why}`).concat(review.items.every((i) => i.ok) ? ['Nothing big — keep testing new openers.'] : []),
    works: ['Replies in under 5 seconds, day and night', 'People who get a price in the first two messages convert twice as often', 'Hand-overs are rare — about 3% of conversations'],
    often: ['Customer asks the price → agent answers → customer asks about a contract', 'No reply to the first text → a call the next day reaches 31%', 'Customer asks for a later time → agent books a call-back'],
    suggestions: todo.map((i) => i.fixLabel!),
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={draft.name || 'Untitled agent'} crumbs={[{ label: 'AI Agents', to: `/agents?type=${stored.type}` }]}
        sub={`${draft.mode} · ${bizName} · v${stored.ver}`}
        actions={<>
          {dirty && <Button variant="header" className="max-md:hidden" onClick={discard}>Discard</Button>}
          <Button variant="header" className="xl:hidden" onClick={() => setPanel(true)}><FlaskConical />Test & review</Button>
          <Button variant="header" className="max-md:hidden" onClick={() => setBuilder(true)}><Sparkles />Edit with AI</Button>
          <Button variant="header" className="max-md:hidden" onClick={() => setAnalyze(true)}><BarChart3 />Analyze with AI</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="header" size="icon" className="md:hidden" aria-label="More actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onSelect={() => setBuilder(true)}><Sparkles />Edit with AI</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAnalyze(true)}><BarChart3 />Analyze with AI</DropdownMenuItem>
              {dirty && <><DropdownMenuSeparator /><DropdownMenuItem danger onSelect={discard}>Discard changes</DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="header" aria-label="Versions"><History />v{stored.ver}<ChevronDown /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Versions</DropdownMenuLabel>
              {[...stored.versions].reverse().map((v) => (
                <DropdownMenuItem key={v.v} onSelect={() => switchTo(v)}>
                  <span className="w-7 font-medium tabular">v{v.v}</span><span className="min-w-0 flex-1 truncate">{v.label}</span><span className="text-xs text-muted">{v.date}</span>{v.v === stored.ver ? <Check /> : <span className="w-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setManage(true)}><Pencil />Rename or delete versions…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="primary" disabled={!dirty} onClick={save}>Save changes</Button>
        </>}>
        <Badge tone={STATUS[stored.status].tone} dot className="ml-1.5">{STATUS[stored.status].l}</Badge>
        {dirty && <Badge tone="amber" className="ml-1">Unsaved changes</Badge>}
      </PageHeader>

      <div className="flex min-h-0 flex-1 gap-4 px-4">
        <nav aria-label="Agent sections" className="hidden w-[168px] shrink-0 space-y-0.5 overflow-y-auto pb-4 lg:block">
          {SECTIONS.map(([k, l]) => (
            <button key={k} onClick={() => go(k)} aria-current={active === k}
              className={cn('flex h-7 w-full items-center gap-2 rounded-control px-2 text-left text-sm transition-colors', active === k ? 'bg-surface font-semibold shadow-card' : 'hover:bg-fill-hover')}>
              <span className="flex-1 truncate">{l}</span>
              {todoAreas.has(k) && <span className="size-1.5 rounded-full bg-warning-fill" aria-label="Has suggestions" />}
            </button>
          ))}
        </nav>

        <div ref={scroller} onScroll={onScroll} className="-mx-1 min-h-0 min-w-0 flex-1 overflow-y-auto px-1 pb-16">
          <div className="mx-auto max-w-[780px] space-y-4">
            {missing.length > 0 && (
              <Banner tone="warning" title={`Finish setting up ${draft.name}`}
                action={<><Button onClick={() => setBuilder(true)}><Sparkles />Answer with AI</Button><Button variant="ghost" onClick={() => go('job')}>Answer one by one</Button></>}>
                Tell it {andList(missing.map((i) => i.need))} before it can talk to customers.
              </Banner>
            )}
            {!id.startsWith('ag') && !prefs.hideAgentWsNote && (
              <Banner tone="info" onDismiss={() => setPref('hideAgentWsNote', true)}>Edits apply only to your workspace. Other businesses on Crewline still see the default {stored.name}.</Banner>
            )}
            {SECTIONS.map(([k]) => (
              <section key={k} id={`sec-${k}`} className={cn('scroll-mt-1 rounded-card transition-shadow duration-300', flash === k && 'shadow-[0_0_0_2px_var(--primary)]')}>
                {RENDER[k]({ a: draft, set, setJob })}
              </section>
            ))}
          </div>
        </div>

        <aside className="hidden w-[380px] shrink-0 flex-col pb-4 xl:flex">
          <SidePanel a={draft} tab={tab} setTab={setTab} score={review.score} onFix={go} onApply={applyAI} />
        </aside>
      </div>

      <Sheet open={panel} onOpenChange={setPanel} width={420} title={`Test ${draft.name}`} bodyClassName="flex flex-col p-0">
        <SidePanel a={draft} tab={tab} setTab={setTab} score={review.score} onFix={go} onApply={applyAI} flat />
      </Sheet>

      <AgentBuilder open={builder} onOpenChange={setBuilder} agent={draft} onApply={(d) => setDraft(d)} />
      <AnalyzeDialog open={analyze} onOpenChange={setAnalyze} a={analysis} onApply={(picked) => setDraft(applyFixes(draft, todo.filter((i) => picked.includes(i.fixLabel!))))} />

      <Dialog open={!!gate} onOpenChange={(o) => !o && setGate(null)}>
        <DialogContent size="sm" title="Update your agent" description={`${draft.name} needs a few answers before it can talk to customers`}
          footer={<>
            <Button variant="ghost" className="mr-auto" onClick={() => { setGate(null); commit(true) }}>Save as draft</Button>
            <Button onClick={() => { setGate(null); go('job') }}>Answer one by one</Button>
            <Button variant="primary" onClick={() => { setGate(null); setBuilder(true) }}><Sparkles />Answer with AI</Button>
          </>}>
          <ul className="space-y-2">{gate?.map((i) => <li key={i.id} className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /><span><span className="font-medium">{i.title}</span><span className="block text-muted">{i.why}</span></span></li>)}</ul>
        </DialogContent>
      </Dialog>

      <Dialog open={manage} onOpenChange={setManage}>
        <DialogContent size="md" title="Versions" description={`${stored.name} is using v${stored.ver}`} footer={<Button onClick={() => setManage(false)}>Done</Button>} bodyClassName="p-0">
          {[...stored.versions].reverse().map((v) => (
            <div key={v.v} className="flex items-center gap-3 border-b border-border-2 px-4 py-2.5 last:border-0">
              <Badge tone={v.v === stored.ver ? 'green' : 'neutral'}>v{v.v}</Badge>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm">{v.label}</span><span className="block text-xs text-muted">{v.date}{v.v === stored.ver ? ' · in use' : ''}</span></span>
              {v.v !== stored.ver && <Button size="xs" onClick={() => { setManage(false); switchTo(v) }}>Use this</Button>}
              <Button variant="ghost" size="icon-sm" aria-label={`Rename v${v.v}`} onClick={async () => { const t = await askText({ title: `Rename v${v.v}`, label: 'Label', value: v.label, ok: 'Rename' }); if (t) updateAgent(id, { versions: stored.versions.map((x) => (x.v === v.v ? { ...x, label: t } : x)) }) }}><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" aria-label={`Delete v${v.v}`} disabled={v.v === stored.ver} onClick={async () => { if (await askConfirm({ title: `Delete v${v.v}?`, description: `“${v.label}” is removed for good. The version in use stays.`, ok: 'Delete version', danger: true })) { updateAgent(id, { versions: stored.versions.filter((x) => x.v !== v.v) }); toast.success(`v${v.v} deleted`) } }}><Trash2 /></Button>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      <Dialog open={blocker.state === 'blocked'} onOpenChange={(o) => !o && blocker.reset?.()}>
        <DialogContent size="sm" title="Leave without saving?" description={`Your changes to ${draft.name} aren’t saved`}
          footer={<><Button onClick={() => blocker.reset?.()}>Keep editing</Button><Button variant="destructive" onClick={() => blocker.proceed?.()}>Leave without saving</Button></>}>
          <p className="text-sm">Unsaved changes: {changed.join(', ') || 'small edits'}. Press Save changes to keep them as a new version.</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SidePanel({ a, tab, setTab, score, onFix, onApply, flat }: { a: Agent; tab: 'test' | 'review'; setTab: (t: 'test' | 'review') => void; score: number; onFix: (s: string) => void; onApply: (next: Agent, msg: string) => void; flat?: boolean }) {
  const body = (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'test', label: 'Test', icon: <FlaskConical /> }, { value: 'review', label: <>Review<Badge tone={score >= 90 ? 'green' : score >= 70 ? 'amber' : 'red'} className="ml-1 h-4 px-1.5">{score}%</Badge></> }]} />
      </div>
      <div className="min-h-0 flex-1">{tab === 'test' ? <TestPanel a={a} onFix={onFix} /> : <ReviewPanel a={a} onFix={onFix} onApply={onApply} />}</div>
    </>
  )
  return flat ? body : <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">{body}</Card>
}
