import * as React from 'react'
import { toast } from 'sonner'
import { Sparkles, RotateCcw, Mic, Phone, PhoneOff, MicOff, Play, Pause, AlertTriangle, CircleCheck, ArrowRight, ArrowUp, ChevronDown, MessageSquare, Info } from 'lucide-react'
import { cn, uid } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/tabs'
import { AgentAvatar } from '@/components/ui/avatar'
import { reviewOf, applyFixes, type ReviewItem } from '@/data/review'
import { SECTIONS } from './sections'
import type { Agent } from '@/data/types'

const secName = (id: string) => SECTIONS.find(([k]) => k === id)?.[1] ?? id
const bizOf = (a: Agent) => (a.type === 'reception' ? 'BrightSmile Dental' : 'Metro Mobile')
const fill = (t: string, a: Agent) => t.replace(/\{first_name\}/g, 'Alex').replace(/\{agent\}/g, a.name).replace(/\{business\}/g, bizOf(a))

/* ---------------- Test ---------------- */

type Hint = { text: string; fix: string }
type Line = { id: string; who: 'agent' | 'you' | 'event' | 'hint'; text: string; secs?: number; fix?: string }
type Reply = { text: string; hints?: Hint[]; event?: string; next: number }

/** The agent's first message, from the script when there is one. */
function opening(a: Agent) {
  if (a.job.script.trim()) return fill(a.job.script, a)
  const ai = a.rules.disclose ? ', an AI assistant' : ''
  return a.dir === 'out' ? `Hi Alex, it’s ${a.name}${ai} from ${bizOf(a)}. Do you have a minute?` : `Hi! This is ${a.name}${ai} at ${bizOf(a)}. How can I help today?`
}

const STOP = new Set(['what', 'your', 'with', 'have', 'does', 'that', 'this', 'they', 'there', 'about', 'from', 'will', 'would', 'could', 'should', 'when', 'where', 'which', 'much', 'many', 'need', 'want', 'like', 'just', 'know', 'here', 'then', 'than', 'them', 'yes'])
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w))

/** How the agent would answer, using only what is filled in, plus hints when something is missing. */
function replyFor(a: Agent, raw: string, step: number): Reply {
  const t = raw.toLowerCase(); const j = a.job
  if (/\b(stop|unsubscribe|opt ?out)\b/.test(t)) return a.rules.optout
    ? { text: 'Done — you won’t get any more messages from us. Have a good day!', event: 'Opted out · added to Do not contact', next: step }
    : { text: 'No problem! By the way, our internet is only $50 a month…', hints: [{ text: `${a.name} ignored an opt-out word. Turn on “Honour opt-out words”.`, fix: 'rules' }], next: step }
  if (/(human|real person|manager|someone real|a person)/.test(t)) return a.rules.askHuman || j.triggers.includes('Customer asks for a human')
    ? { text: `Of course — I’m passing you to our ${j.handTo.toLowerCase()} now. Someone will reply in a few minutes.`, event: `Handed over to ${j.handTo}`, next: step }
    : { text: 'I can help you with anything you need!', hints: [{ text: `${a.name} didn’t hand over when asked for a person.`, fix: 'rules' }], next: step }
  if (/(angry|terrible|worst|ridiculous|scam|useless|hate|too expensive)/.test(t)) return a.rules.angry
    ? { text: 'I’m sorry about that — I hear you. Let me get someone from our team to help right away.', event: `Handed over to ${j.handTo} · customer unhappy`, next: step }
    : { text: 'I understand. Anyway, can I ask you a few questions?', hints: [{ text: 'The customer was unhappy and the agent kept going. Turn on “Hand over when the customer is angry”.', fix: 'rules' }], next: step }
  const city = t.match(/\b(hamilton|ottawa|montreal|vancouver|calgary|london)\b/)?.[1]
  if (city) {
    const C = city[0].toUpperCase() + city.slice(1)
    return j.disq.some((d) => /area/i.test(d.text))
      ? { text: `Sorry — we don’t cover ${C} yet. I’ll let you know as soon as we do!`, event: 'Disqualified · outside the service area', next: step }
      : { text: `${C}, great! Let’s get you set up.`, hints: [{ text: `The customer is outside your service area and ${a.name} didn’t notice. Your disqualifying criteria aren’t clear.`, fix: 'job' }], next: step }
  }
  const qa = a.qa.find((x) => x.q.trim() && x.a.trim() && words(x.q).some((w) => t.includes(w)))
  if (qa) return { text: qa.a, next: step }
  if (/(price|cost|how much|\$|expensive|cheap|plans?\b)/.test(t)) {
    if (!j.pricing.trim()) return { text: 'Good question — let me check our prices and get back to you.', hints: [{ text: `${a.name} doesn’t know your prices yet.`, fix: 'job' }], next: step }
    const hints = j.posture === 'Salesperson' ? [{ text: 'This reads a bit pushy for a first answer. Try the “Consultative” sales posture.', fix: 'job' }] : undefined
    return { text: `${j.pricing.split(/ · |\. /).slice(0, 3).join(', ').replace(/\.$/, '')}.${j.important[0] ? ` ${j.important[0]}.` : ''} Which one sounds right for you?`, hints, next: step }
  }
  if (/(discount|deal|cheaper|lower)/.test(t)) return a.discount
    ? { text: `I can take ${a.discount}% off your first three months. Shall I add that?`, next: step }
    : { text: 'Our prices are already our best, but installation is free this month.', next: step }
  if (/(book|appointment|schedule|visit|come in|saturday|tomorrow|install)/.test(t)) return a.booking || a.act.booking
    ? { text: 'I can book that for you. I have tomorrow at 10:00 AM or 2:30 PM — which works better?', event: 'Would create a booking', next: step }
    : { text: 'Let me bring in our receptionist to find you a time.', event: 'Rhea (receptionist) would step in to book', next: step }
  const qs = j.questions.filter((q) => q.q.trim())
  if (!qs.length) return { text: 'Thanks! Can you tell me a bit more about what you need?', hints: [{ text: `${a.name} has no questions to ask, so it can’t move the conversation forward.`, fix: 'job' }], next: step }
  if (step < qs.length) return { text: `Thanks! ${qs[step].q}`, next: step + 1 }
  return { text: 'Great, that’s everything I need. I’ll send you a confirmation by text.', event: `Stage would move to ${j.whenQual}`, next: step }
}

const VOICE_NOTES: Record<string, string[]> = {
  reception: ['Hi, can I book a cleaning?', 'How much is a check-up?', 'What are your opening hours?', 'I want to talk to a real person.'],
  default: ['Hi, how much is your internet?', 'Do I need to sign a contract?', 'Can someone come on Saturday?', 'I want to talk to a real person.'],
}
const CALL_LINES: Record<Agent['type'], string[]> = {
  sales: ['Yes, hi. How much is it?', 'Do I need a contract?', 'OK. Can someone install it on Saturday?'],
  marketing: ['Sure, what’s this about?', 'How much is it?', 'Sounds good — can you book me in?'],
  support: ['Hi, I have a question about my plan.', 'Can I keep my number if I switch?', 'Thanks. Can I talk to a real person about my bill?'],
  tech: ['My internet keeps dropping.', 'I already restarted the modem.', 'Can someone come on Saturday?'],
  reception: ['Hi, I’d like to book a cleaning.', 'How much is it?', 'Tomorrow works.'],
  finance: ['I got an invoice I don’t understand.', 'How much do I owe?', 'Can I talk to a real person?'],
}
const secsOf = (t: string) => Math.max(2, Math.round(t.split(' ').length / 2.6))
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function VoiceNote({ secs, text, mine }: { secs: number; text: string; mine?: boolean }) {
  const [play, setPlay] = React.useState(false)
  React.useEffect(() => { if (!play) return; const t = setTimeout(() => setPlay(false), secs * 1000); return () => clearTimeout(t) }, [play, secs])
  const bars = React.useMemo(() => Array.from({ length: 22 }, (_, i) => 4 + ((text.charCodeAt(i % text.length) * (i + 3)) % 13)), [text])
  return (
    <div className="space-y-1">
      <div className={cn('flex items-center gap-2 rounded-[14px] px-2 py-1.5', mine ? 'rounded-br-[4px] bg-subtle' : 'rounded-bl-[4px] border border-border bg-surface')}>
        <button onClick={() => setPlay(!play)} aria-label={play ? 'Pause' : 'Play'} className="flex size-7 shrink-0 items-center justify-center rounded-full bg-btn text-btn-fg">{play ? <Pause className="size-3.5" /> : <Play className="size-3.5 translate-x-px" />}</button>
        <span className="relative flex h-5 items-center gap-[2px]">
          {bars.map((h, i) => <span key={i} className="w-[2px] rounded-full bg-border-strong" style={{ height: h }} />)}
          <span className="absolute inset-y-0 left-0 flex items-center gap-[2px] overflow-hidden" style={{ width: play ? '100%' : 0, transition: play ? `width ${secs}s linear` : 'none' }}>
            {bars.map((h, i) => <span key={i} className="w-[2px] shrink-0 rounded-full bg-text" style={{ height: h }} />)}
          </span>
        </span>
        <span className="text-xs text-muted tabular">{fmt(secs)}</span>
      </div>
      <p className="px-1 text-xs text-muted">“{text}”</p>
    </div>
  )
}

function Stream({ a, lines, typing, onFix }: { a: Agent; lines: Line[]; typing: boolean; onFix: (s: string) => void }) {
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [lines.length, typing])
  return (
    <div className="space-y-3">
      {lines.map((l) => {
        if (l.who === 'event') return <div key={l.id} className="flex justify-center anim-fade"><span className="rounded-tag bg-subtle px-2 py-0.5 text-xs text-muted">{l.text}</span></div>
        if (l.who === 'hint') return (
          <div key={l.id} className="flex items-start gap-2 rounded-card border border-border bg-subtle-2 p-2.5 text-sm anim-fade">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span className="min-w-0 flex-1">{l.text}</span>
            {l.fix && <Button size="xs" onClick={() => onFix(l.fix!)}>Fix in {secName(l.fix)}</Button>}
          </div>
        )
        if (l.who === 'you') return <div key={l.id} className="flex justify-end anim-fade"><div className="max-w-[85%]">{l.secs ? <VoiceNote mine secs={l.secs} text={l.text} /> : <div className="rounded-[14px] rounded-br-[4px] bg-subtle px-3 py-2 text-sm">{l.text}</div>}</div></div>
        return (
          <div key={l.id} className="flex gap-2 anim-fade">
            <AgentAvatar name={a.name} size={24} className="mt-0.5" />
            <div className="max-w-[85%]">{l.secs ? <VoiceNote secs={l.secs} text={l.text} /> : <div className="rounded-[14px] rounded-bl-[4px] border border-border bg-surface px-3 py-2 text-sm">{l.text}</div>}</div>
          </div>
        )
      })}
      {typing && <div className="flex items-center gap-2 pl-8"><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite]" /><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite_.2s]" /><span className="size-1.5 rounded-full bg-muted animate-[pulse-dot_1s_infinite_.4s]" /></div>}
      <div ref={end} />
    </div>
  )
}

const SUGGEST: Record<string, string[]> = {
  reception: ['Can I book a cleaning?', 'How much is a check-up?', 'I want a real person', 'STOP'],
  default: ['How much is it?', 'Do I need a contract?', 'I live in Hamilton', 'I want a real person', 'STOP'],
}
function TestInput({ a, onSend }: { a: Agent; onSend: (t: string) => void }) {
  const [v, setV] = React.useState('')
  const submit = () => { const t = v.trim(); if (!t) return; onSend(t); setV('') }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">{(SUGGEST[a.type] ?? SUGGEST.default).map((t) => <Button key={t} size="xs" onClick={() => onSend(t)}>{t}</Button>)}</div>
      <div className="flex items-end gap-2 rounded-card border border-border-strong bg-surface p-1.5 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
        <textarea rows={1} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder={`Message ${a.name} as a customer…`} aria-label="Test message"
          className="max-h-24 min-h-7 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none focus-visible:outline-none" />
        <Button variant="primary" size="icon-sm" aria-label="Send" disabled={!v.trim()} onClick={submit}><ArrowUp /></Button>
      </div>
    </div>
  )
}

/** Test the agent the way a customer would: by text, voice note or phone call. Uses the unsaved draft. */
export function TestPanel({ a, onFix }: { a: Agent; onFix: (section: string) => void }) {
  const [mode, setMode] = React.useState<'text' | 'voice' | 'call'>('text')
  const [lines, setLines] = React.useState<Line[]>([]); const [typing, setTyping] = React.useState(false)
  const step = React.useRef(0); const vn = React.useRef(0); const timers = React.useRef<number[]>([])
  const [call, setCall] = React.useState<'idle' | 'ringing' | 'live' | 'ended'>('idle'); const [secs, setSecs] = React.useState(0); const [muted, setMuted] = React.useState(false)
  const live = React.useRef(false); live.current = call === 'live'
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const push = (l: Omit<Line, 'id'>) => setLines((x) => [...x, { ...l, id: uid('t') }])
  const reset = React.useCallback(() => {
    clear(); step.current = 0; vn.current = 0; setTyping(false); setCall('idle'); setSecs(0); setMuted(false)
    setLines(mode === 'call' ? [] : [{ id: uid('t'), who: 'agent', text: opening(a), secs: mode === 'voice' ? secsOf(opening(a)) : undefined }])
  }, [mode, a.id])
  React.useEffect(() => { reset(); return clear }, [reset])
  React.useEffect(() => { if (call !== 'live') return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t) }, [call])

  const answer = (text: string, voice: boolean, delay = 900) => {
    const r = replyFor(a, text, step.current); step.current = r.next
    setTyping(true)
    later(() => {
      setTyping(false)
      push({ who: 'agent', text: r.text, secs: voice ? secsOf(r.text) : undefined })
      if (r.event) push({ who: 'event', text: r.event })
      r.hints?.forEach((h) => push({ who: 'hint', text: h.text, fix: h.fix }))
      // A hand-over, opt-out or disqualification ends a test call.
      if (live.current && r.event && /^(Handed over|Opted out|Disqualified)/.test(r.event)) { clear(); later(endCall, 1500) }
    }, delay)
  }
  const sendText = (t: string) => { push({ who: 'you', text: t }); answer(t, false) }
  const sendVoice = () => {
    const pool = VOICE_NOTES[a.type] ?? VOICE_NOTES.default; const t = pool[vn.current++ % pool.length]
    setTyping(true); later(() => { setTyping(false); push({ who: 'you', text: t, secs: secsOf(t) }); answer(t, true, 1100) }, 1200)
  }
  const startCall = () => {
    clear(); step.current = 0; setLines([]); setSecs(0); setCall('ringing')
    later(() => {
      setCall('live'); push({ who: 'event', text: `Connected · ${a.voice.split('·')[0].trim()} voice` }); push({ who: 'agent', text: opening(a) })
      CALL_LINES[a.type].forEach((c, i) => later(() => { push({ who: 'you', text: c }); answer(c, false, 1300) }, 2600 + i * 4200))
      later(() => endCall(), 2600 + CALL_LINES[a.type].length * 4200 + 800)
    }, 1400)
  }
  const endCall = () => { clear(); setTyping(false); setCall('ended'); push({ who: 'event', text: 'Call ended · a summary and recording would be saved to the contact' }) }
  const say = (t: string) => { push({ who: 'you', text: t }); answer(t, false, 1100) }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-2 px-3 py-2">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'Text', icon: <MessageSquare /> }, { value: 'voice', label: 'Voice note', icon: <Mic /> }, { value: 'call', label: 'Call', icon: <Phone /> }]} />
        <Button variant="ghost" size="icon-sm" aria-label="Start over" onClick={reset}><RotateCcw /></Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {mode === 'call' && call === 'idle' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="relative flex size-16 items-center justify-center">
              <span className="anim-ring absolute inset-0 rounded-full border-2 border-border-strong" />
              <AgentAvatar name={a.name} size={56} />
            </span>
            <div><h3>Call {a.name}</h3><p className="text-sm text-muted">You play the customer. It answers like a real call.</p></div>
            <Button variant="primary" onClick={startCall}><Phone />Start test call</Button>
          </div>
        ) : <Stream a={a} lines={lines} typing={typing} onFix={onFix} />}
        {mode === 'call' && call === 'ringing' && <p className="mt-6 text-center text-sm text-muted">Calling {a.name}…</p>}
      </div>
      <div className="shrink-0 border-t border-border-2 p-3">
        {mode === 'text' && <TestInput a={a} onSend={sendText} />}
        {mode === 'voice' && <Button className="w-full" onClick={sendVoice} disabled={typing}><Mic />{typing ? 'Recording…' : 'Record a voice note'}</Button>}
        {mode === 'call' && call !== 'idle' && (
          <div className="space-y-2">
            {call === 'live' && <div className="flex flex-wrap gap-1.5">{['I want a real person', 'That’s too expensive', 'I live in Hamilton', 'Stop calling me'].map((t) => <Button key={t} size="xs" onClick={() => say(t)}>“{t}”</Button>)}</div>}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm tabular"><span className={cn('size-2 rounded-full', call === 'live' ? 'bg-success animate-[pulse-dot_1.4s_infinite]' : 'bg-border-strong')} />{call === 'ringing' ? 'Ringing' : fmt(secs)}</span>
              <span className="flex-1" />
              {call === 'ended' ? <Button onClick={startCall}><Phone />Call again</Button> : <>
                <Button size="icon" aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => { setMuted(!muted); toast(muted ? 'Microphone on' : 'Microphone muted') }}>{muted ? <MicOff /> : <Mic />}</Button>
                <Button variant="destructive-solid" onClick={endCall}><PhoneOff />End call</Button>
              </>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Review ---------------- */

const LEVEL = {
  good: { l: 'Good to go', d: 'Ready to talk to customers.', c: 'var(--success)' },
  almost: { l: 'Almost there', d: 'Works well — a few changes will make it better.', c: 'var(--warning-fill)' },
  work: { l: 'Needs work', d: 'Answer the missing questions before it goes live.', c: 'var(--danger)' },
}

export function ScoreRing({ score, level, size = 88 }: { score: number; level: keyof typeof LEVEL; size?: number }) {
  const r = size / 2 - 6; const c = 2 * Math.PI * r
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill-selected)" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={LEVEL[level].c} strokeWidth={7} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(.2,0,.2,1)' }} />
      </svg>
      <span className="absolute text-2xl font-semibold tabular">{score}<span className="text-sm text-muted">%</span></span>
    </span>
  )
}

/** AI's review of the draft: a score, what to improve (with "Fix with AI") and what already looks good. */
export function ReviewPanel({ a, onFix, onApply }: { a: Agent; onFix: (section: string) => void; onApply: (next: Agent, msg: string) => void }) {
  const r = reviewOf(a); const [showOk, setShowOk] = React.useState(false)
  const todo = r.items.filter((i) => !i.ok).sort((x, y) => y.weight - x.weight)
  const ok = r.items.filter((i) => i.ok)
  const fixOne = (i: ReviewItem) => onApply(applyFixes(a, [i]), `${i.fixLabel} · done`)
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center gap-4 border-b border-border-2 p-4">
        <ScoreRing score={r.score} level={r.level} />
        <div className="min-w-0">
          <h3>{LEVEL[r.level].l}</h3>
          <p className="text-sm text-muted">{LEVEL[r.level].d}</p>
          {todo.some((i) => i.fix) && <Button className="mt-2" onClick={() => onApply(applyFixes(a, todo), `${todo.filter((i) => i.fix).length} improvements made · review them, then save`)}><Sparkles />Optimize everything with AI</Button>}
        </div>
      </div>
      {todo.length > 0 && <div className="px-4 pb-1 pt-3"><h4 className="text-muted">To improve · {todo.length}</h4></div>}
      {todo.map((i) => (
        <div key={i.id} className="border-b border-border-2 px-4 py-3">
          <div className="flex items-start gap-2">
            {i.seen ? <MessageSquare className="mt-0.5 size-4 shrink-0 text-icon" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{i.title}</div>
              <p className="text-sm text-muted">{i.why}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {i.fix && <Button size="xs" onClick={() => fixOne(i)}><Sparkles />Fix with AI</Button>}
                <Button size="xs" variant="ghost" onClick={() => onFix(i.area)}>Go to {secName(i.area)}<ArrowRight /></Button>
                {i.seen && <Badge tone="outline">From {i.seen} real conversations</Badge>}
              </div>
            </div>
            <span className="text-xs text-muted tabular">+{i.weight}</span>
          </div>
        </div>
      ))}
      {!todo.length && <div className="flex items-center gap-2 p-4 text-sm"><CircleCheck className="size-4 text-success" />Nothing to improve right now.</div>}
      <button onClick={() => setShowOk(!showOk)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-subtle-2">
        <CircleCheck className="size-4 text-success" /><span className="flex-1">Looks good · {ok.length}</span><ChevronDown className={cn('size-4 text-icon transition-transform', showOk && 'rotate-180')} />
      </button>
      {showOk && <ul className="space-y-1.5 px-4 pb-3">{ok.map((i) => <li key={i.id} className="flex gap-2 text-sm text-muted"><CircleCheck className="mt-0.5 size-3.5 shrink-0 text-success" />{i.title}</li>)}</ul>}
      <p className="flex gap-1.5 border-t border-border-2 p-4 text-xs text-muted"><Info className="mt-px size-3.5 shrink-0" />The score updates as you edit and uses your real conversations. Nothing is saved until you press Save changes.</p>
    </div>
  )
}
