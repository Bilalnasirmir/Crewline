import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Sparkles, Check, Mic, ArrowUp, Pencil, SkipForward, Paperclip } from 'lucide-react'
import { uid } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/controls'
import { Tip } from '@/components/ui/tooltip'
import { ToggleChip } from '@/components/app/bits'
import { AT, AGENT_TYPES } from '@/data/seed'
import { PURPOSES, GOALS, TRIGGERS, makeAgent, CreatingAgent } from './common'
import type { Agent, AgentType } from '@/data/types'

type Q = { k: string; ask: string; kind: 'options' | 'multi' | 'text'; options?: string[]; optional?: boolean; confirm?: boolean; sample: string }
type Msg = { id: string; who: 'ai' | 'you'; text: string; list?: string[]; q?: Q; confirm?: boolean; done?: boolean }

const QS: Q[] = [
  { k: 'stages', ask: 'Let’s start with **stages** — where each lead is. Which stages should this agent move people through?', kind: 'options', options: ['Telecom: New → Contacted → Interested → Order Booked → Installed', 'Real estate: New → Qualified → Viewing Booked → Closed', 'Dental: Requested → Booked → Arrived → Completed', 'Build new stages with me'], sample: '' },
  { k: 'script', ask: 'Do you have a **script**? Paste it or say it. You can skip this — agents talk naturally without one.', kind: 'text', optional: true, confirm: true, sample: 'Say hi, say you’re from Metro Mobile, tell them internet is $50 with free installation, then ask if they have internet at home.' },
  { k: 'kb', ask: 'Now the **knowledge base**. What should the agent know? Paste your website, attach files, or just describe your business.', kind: 'text', confirm: true, sample: 'metromobile.example — we sell home internet and mobile plans in Mississauga, Toronto and Brampton. Free installation this month, no contract.' },
  { k: 'purpose', ask: 'What is this agent **for**? Pick all that apply.', kind: 'multi', options: PURPOSES.slice(0, 11), sample: '' },
  { k: 'goal', ask: 'And the **main goal** of each conversation?', kind: 'options', options: GOALS, sample: '' },
  { k: 'products', ask: 'What do you **sell**, and at what **prices**? You can also send a picture of your price list.', kind: 'text', confirm: true, sample: 'Phone line $20 a month, Internet 1 Gig $50 a month, TV $10 a month, 5G Unlimited $35 per line. Taxes included.' },
  { k: 'qual', ask: 'Who **qualifies**? Say it in your own words — I’ll turn it into a list.', kind: 'text', confirm: true, sample: 'They live in Mississauga, Toronto or Brampton, they are the account holder, and ideally they pay more than 60 dollars for internet today.' },
  { k: 'disq', ask: 'Who does **not** qualify?', kind: 'text', confirm: true, sample: 'Anyone outside our service area, anyone under 18, and people locked into a contract for more than 6 months.' },
  { k: 'handoff', ask: 'When should the agent **hand over to a person**?', kind: 'multi', options: TRIGGERS, sample: '' },
  { k: 'tone', ask: 'Last one: how should it **sound**?', kind: 'options', options: ['Professional', 'Friendly', 'Casual'], sample: '' },
]
const NEWQ: Q[] = [
  { k: 'type', ask: 'Hi! I’ll build your agent with you, one question at a time. **What should it mainly do?**', kind: 'options', options: AGENT_TYPES.map((t) => AT[t].label), sample: '' },
  { k: 'name', ask: 'What should we call it? Customers will hear this name.', kind: 'text', sample: 'Zara' },
]

const split = (t: string) => t.split(/\n|;|\.\s|,\s*(?:and\s+)?|\band\b(?= (?:they|anyone|people|ideally))/i).map((x) => x.replace(/^(and|or)\s+/i, '').trim().replace(/\.$/, '')).filter((x) => x.length > 3).map((x) => x[0].toUpperCase() + x.slice(1))
const bold = (s: string) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <b key={i} className="font-semibold">{p.slice(2, -2)}</b> : p))

/** "Create / edit your agent with AI": a chat that asks one question at a time and checks each answer back. */
export function AgentBuilder({ open, onOpenChange, agent, onApply }: { open: boolean; onOpenChange: (o: boolean) => void; agent: Agent | null; onApply?: (a: Agent) => void }) {
  const nav = useNavigate(); const addAgent = useStore((s) => s.addAgent)
  const qs = React.useMemo(() => (agent ? QS : [...NEWQ, ...QS]), [agent])
  const [msgs, setMsgs] = React.useState<Msg[]>([]); const [qi, setQi] = React.useState(0); const [draft, setDraft] = React.useState<Agent | null>(null)
  const [text, setText] = React.useState(''); const [picked, setPicked] = React.useState<string[]>([]); const [pending, setPending] = React.useState<{ q: Q; value: string; list: string[] } | null>(null)
  const [type, setType] = React.useState<AgentType>('sales'); const [creating, setCreating] = React.useState<Agent | null>(null)
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs.length])
  React.useEffect(() => {
    if (!open) return
    setDraft(agent ? structuredClone(agent) : null); setQi(0); setPending(null); setPicked([]); setText('')
    const intro: Msg[] = agent ? [{ id: uid('b'), who: 'ai', text: `Let’s improve **${agent.name}** together. I’ll ask one thing at a time and check my understanding with you. Skip anything that doesn’t apply.` }] : []
    setMsgs([...intro, { id: uid('b'), who: 'ai', text: qs[0].ask, q: qs[0] }])
  }, [open, agent, qs])
  const q = qs[qi]; const finished = qi >= qs.length
  const say = (m: Omit<Msg, 'id'>) => setMsgs((x) => [...x, { ...m, id: uid('b') }])
  const next = (d: Agent | null) => {
    const n = qi + 1; setQi(n); setPicked([]); setPending(null)
    setTimeout(() => {
      if (n < qs.length) say({ who: 'ai', text: qs[n].ask, q: qs[n] })
      else say({ who: 'ai', text: `That’s everything. Here’s how **${d?.name ?? 'your agent'}** will behave:`, list: summaryOf(d), done: true })
    }, 350)
  }
  const apply = (k: string, value: string, list: string[]): Agent | null => {
    let d = draft
    if (k === 'type') { const t = AGENT_TYPES.find((x) => AT[x].label === value) ?? 'sales'; setType(t); return d }
    if (k === 'name') { d = makeAgent(type, value.trim()); setDraft(d); return d }
    if (!d) return d
    const job = { ...d.job }
    if (k === 'script') job.script = value
    if (k === 'kb') d = { ...d, kb: [...d.kb, { id: uid('kb'), name: 'From the AI builder', date: 'Today', items: [{ k: /\.\w{2,}/.test(value) ? 'link' : 'text', n: value.slice(0, 48), s: 'Added in the AI builder' }] }] }
    if (k === 'purpose') job.purposes = list
    if (k === 'goal') job.goal = value
    if (k === 'products') { job.products = value; job.pricing = list.join(' · ') }
    if (k === 'qual') job.qual = list.map((text) => ({ text, imp: /ideally|prefer/i.test(text) ? 'Preferred' as const : 'Required' as const }))
    if (k === 'disq') job.disq = list.map((text) => ({ text, imp: 'Required' as const }))
    if (k === 'handoff') job.triggers = list
    if (k === 'tone') job.tone = value
    d = { ...d, job }
    setDraft(d); return d
  }
  const answer = (value: string, list?: string[]) => {
    if (!q) return
    say({ who: 'you', text: value })
    if (q.confirm && value.trim()) { const l = list ?? split(value); setPending({ q, value, list: l }); setTimeout(() => say({ who: 'ai', text: 'Here’s what I understood — **am I correct?**', list: l, confirm: true }), 350); return }
    const d = apply(q.k, value, list ?? [value]); next(d)
  }
  const send = () => { const t = text.trim(); if (!t) return; setText(''); if (pending) { setPending(null); answer(t) } else answer(t) }
  const finish = () => {
    if (!draft) return
    if (agent) { onApply?.(draft); onOpenChange(false); toast.success(`${draft.name} updated · press Save changes to keep it as a new version`) }
    else { onOpenChange(false); setCreating(draft) }
  }
  return (<>
    <Sheet open={open} onOpenChange={onOpenChange} width={560} title={<span className="flex items-center gap-2"><Sparkles className="size-4" />{agent ? `Edit ${agent.name} with AI` : 'Create your agent with AI'}</span>} description={finished ? 'All done' : `Question ${Math.min(qi + 1, qs.length)} of ${qs.length}`} bodyClassName="flex flex-col p-0">
      <Progress value={(qi / qs.length) * 100} className="h-1 rounded-none" />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.map((m, i) => m.who === 'you'
          ? <div key={m.id} className="flex justify-end"><div className="max-w-[85%] rounded-[14px] rounded-br-[4px] bg-subtle px-3 py-2 text-sm">{m.text}</div></div>
          : (
            <div key={m.id} className="flex gap-2.5 anim-fade">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ai-soft text-ai"><Sparkles className="size-3" /></span>
              <div className="min-w-0 flex-1 space-y-2 text-sm leading-6">
                <p>{bold(m.text)}</p>
                {m.list && <ul className="space-y-1 rounded-card border border-border p-3">{m.list.map((l) => <li key={l} className="flex gap-2"><Check className="mt-1 size-3.5 shrink-0 text-success" />{l}</li>)}</ul>}
                {m.confirm && i === msgs.length - 1 && pending && <div className="flex gap-2"><Button variant="primary" onClick={() => { say({ who: 'you', text: 'Yes, that’s right' }); const d = apply(pending.q.k, pending.value, pending.list); next(d) }}><Check />Yes, that’s right</Button><Button onClick={() => { say({ who: 'you', text: 'Let me change it' }); setTimeout(() => say({ who: 'ai', text: 'No problem — say it again the way you want it. You can also edit the list later in the agent’s Job section.' }), 300) }}><Pencil />Change it</Button></div>}
                {m.q && i === msgs.length - 1 && !pending && m.q.kind !== 'text' && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">{m.q.options!.map((o) => m.q!.kind === 'multi'
                      ? <ToggleChip key={o} on={picked.includes(o)} onClick={() => setPicked(picked.includes(o) ? picked.filter((x) => x !== o) : [...picked, o])}>{picked.includes(o) && <Check />}{o}</ToggleChip>
                      : <Button key={o} className="h-auto min-h-7 whitespace-normal py-1 text-left" onClick={() => answer(o)}>{o}</Button>)}</div>
                    {m.q.kind === 'multi' && <Button variant="primary" disabled={!picked.length} onClick={() => answer(picked.join(', '), picked)}>Continue</Button>}
                  </div>
                )}
                {m.q && i === msgs.length - 1 && m.q.optional && !pending && <Button variant="ghost" onClick={() => { say({ who: 'you', text: 'Skip' }); next(draft) }}><SkipForward />Skip</Button>}
                {m.done && <Button variant="primary" onClick={finish}>{agent ? 'Use these answers' : `Create ${draft?.name ?? 'agent'}`}</Button>}
              </div>
            </div>
          ))}
        <div ref={end} />
      </div>
      {!finished && (q?.kind === 'text' || pending) && (
        <div className="shrink-0 border-t border-border p-3">
          <div className="rounded-card border border-border-strong focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
            <textarea autoFocus rows={2} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Type or say your answer…" className="block w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none focus-visible:outline-none" />
            <div className="flex items-center gap-1 px-2 pb-2">
              <Tip content="Say it (voice)"><Button variant="ghost" size="icon-sm" aria-label="Voice answer" onClick={() => setText(q?.sample ?? '')}><Mic /></Button></Tip>
              <Tip content="Attach a file or a picture of your prices"><Button variant="ghost" size="icon-sm" aria-label="Attach" onClick={() => setText((t) => (t ? t + ' ' : '') + '[price-list.jpg] Phone line $20, Internet 1 Gig $50, TV $10')}><Paperclip /></Button></Tip>
              <span className="flex-1" />
              <Button variant="primary" size="icon-sm" disabled={!text.trim()} onClick={send} aria-label="Send"><ArrowUp /></Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
    <CreatingAgent agent={creating} onDone={() => { if (creating) { addAgent(creating); nav(`/agents/${creating.id}`); toast.success(`${creating.name} is ready · test it on the right before going live`) } setCreating(null) }} />
  </>)
}

export function summaryOf(a: Agent | null): string[] {
  if (!a) return []
  const j = a.job
  return [
    `${a.name} is a ${AT[a.type].label.toLowerCase()} agent whose main goal is to ${j.goal.toLowerCase()}.`,
    j.products ? `Sells: ${j.products.slice(0, 90)}${j.products.length > 90 ? '…' : ''}` : 'No products yet.',
    `Qualifies people who: ${j.qual.filter((x) => x.imp === 'Required').map((x) => x.text.toLowerCase()).join('; ') || 'not set yet'}.`,
    j.disq.length ? `Politely stops with anyone who: ${j.disq.map((x) => x.text.toLowerCase()).join('; ')}.` : 'No disqualifying rules yet.',
    `Hands over to your team when: ${j.triggers.slice(0, 3).join(', ').toLowerCase() || 'never'}.`,
    `Sounds ${j.tone.toLowerCase()} and ${j.posture.toLowerCase()}, and always updates the database at the end.`,
  ]
}
