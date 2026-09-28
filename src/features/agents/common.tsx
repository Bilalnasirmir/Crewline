import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Target, Megaphone, LifeBuoy, Wrench, Bell, Receipt, Mic, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn, money, nf, uid } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/controls'
import { AgentAvatar } from '@/components/ui/avatar'
import { AT, AGENT_TYPES, baseJob } from '@/data/seed'
import type { Agent, AgentType } from '@/data/types'

export const TYPE_ICON: Record<AgentType, React.ComponentType<{ className?: string }>> = { sales: Target, marketing: Megaphone, support: LifeBuoy, tech: Wrench, reception: Bell, finance: Receipt }
export const metricVal = (a: Agent, key: string, unit: string) => (unit === '$' ? money(a.ws[key] ?? 0) : `${nf(a.ws[key] ?? 0)}${unit}`)

export const ACTIONS: [string, [string, string][]][] = [
  ['Calling', [['callOut', 'Make calls'], ['callIn', 'Answer incoming calls'], ['voicemail', 'Leave voicemail'], ['transferCall', 'Transfer a call to a person'], ['record', 'Record calls']]],
  ['Messaging', [['sms', 'Send texts (SMS)'], ['wa', 'Send WhatsApp, Messenger and Instagram messages'], ['email', 'Send emails'], ['media', 'Send pictures, files and links']]],
  ['Database', [['stages', 'Update lead stages from the conversation'], ['fields', 'Update contact fields when new information comes up'], ['tags', 'Update tags from the conversation'], ['comments', 'Leave comments for other agents and your team'], ['tasks', 'Create tasks for your team']]],
  ['Bookings', [['booking', 'Book, move and cancel appointments'], ['reminders', 'Send booking reminders']]],
  ['Sales & money', [['quote', 'Create and send quotations'], ['paylink', 'Send a payment link'], ['sale', 'Record a sale'], ['invoice', 'Create and send invoices'], ['refund', 'Request refunds (needs your approval)']]],
  ['Connections', [['http', 'Make HTTP requests to your systems (API)'], ['route', 'Route to the right agent (billing → Finance, tech → Tech support, sales → Sales)']]],
]
export const ACT_TECH: [string, [string, string][]] = ['Tech support extras', [['ticket', 'Create support tickets'], ['diag', 'Run guided troubleshooting'], ['status', 'Check order and service status'], ['reset', 'Reset passwords or devices (through your API)'], ['escalate', 'Escalate to your engineering team']]]
export const ACT_FIN: [string, [string, string][]] = ['Finance extras', [['recurring', 'Recurring billing'], ['reminder', 'Payment reminders'], ['plans', 'Offer payment plans'], ['tax', 'Apply taxes'], ['receipt', 'Send receipts'], ['multicur', 'Invoices in several currencies']]]
export const RULES: [string, [string, string][]][] = [
  ['Hand over to a person when…', [['askHuman', 'The customer asks for a human or a manager'], ['angry', 'The customer is angry or upset'], ['unknown', 'The agent doesn’t know the answer (twice)'], ['noInfo', 'Required information can’t be obtained'], ['unclear', 'Qualification is unclear'], ['legal', 'The customer asks for legal, medical or financial advice']]],
  ['Safety', [['noPrice', 'Never change pricing'], ['noDiscount', 'Never offer discounts above the limit'], ['noPromise', 'Never promise a time that isn’t on the calendar'], ['noPII', 'Never ask for card numbers or passwords in chat']]],
  ['Compliance', [['disclose', 'Say it’s an AI assistant at the start'], ['optout', 'Honour opt-out words in any language'], ['recordNotice', 'Play a recording notice on calls'], ['quiet', 'Respect quiet hours (8 AM – 9 PM local)']]],
  ['Working hours', [['hours24', 'Work 24/7'], ['afterHours', 'After hours: take a message and book a call-back']]],
]
export const PURPOSES = ['Generate leads', 'Qualify leads', 'Sell products', 'Book appointments', 'Schedule installation', 'Follow up with leads', 'Reactivate old leads', 'Upsell existing customers', 'Cross-sell products', 'Collect customer information', 'Transfer qualified leads to a person', 'Solve customer problems', 'Solve technical problems', 'Send invoices', 'Collect payments']
export const GOALS = ['Qualify the lead', 'Make the sale', 'Book an appointment', 'Get a call-back', 'Transfer to a person', 'Resolve the request']
export const TRIGGERS = ['Customer asks for a human', 'Customer is angry', 'Customer requests a manager', 'Agent doesn’t know the answer', 'Required information can’t be obtained', 'Qualification is unclear']
export const DISQ_ACTIONS = ['Send a notification', 'Add tag', 'Add reason', 'Send a follow-up', 'End conversation politely', 'Update database']
export const CANT = ['Ask another qualifying question', 'Continue the conversation', 'Mark as “Needs review”', 'Transfer to a person', 'Disqualify', 'Stop qualifying']

/** A new agent, from a default agent or blank (blank agents have an empty job so the gating pop-up shows). */
export function makeAgent(type: AgentType, name: string, from?: Agent, voice?: string): Agent {
  const base = from ?? useStore.getState().agents.find((a) => a.type === type)!
  const id = uid('ag')
  const job = from ? structuredClone(from.job) : { ...baseJob(type), qual: [], disq: [], products: '', pricing: '', questions: [], script: '' }
  return { ...structuredClone(base), id, name, voice: voice ?? base.voice, camps: [], status: 'draft', edited: true, ver: 1, versions: [{ v: 1, label: from ? `Started from ${from.name}` : 'Started blank', date: 'Today' }], ws: Object.fromEntries(Object.keys(base.ws).map((k) => [k, 0])), history: [], job, kb: from ? structuredClone(from.kb) : [], qa: from ? structuredClone(from.qa) : [], score: 0 } // the store works out the review score
}

/** The one expressive moment in the product: a calm, Monday-style "Creating agent…" animation. */
export function CreatingAgent({ agent, onDone }: { agent: Agent | null; onDone: () => void }) {
  const [n, setN] = React.useState(0)
  const steps = ['Setting up the voice', 'Loading your business knowledge', 'Connecting your stages', 'Writing the first instructions', 'Running a test conversation']
  React.useEffect(() => { if (!agent) return; setN(0); let i = 0; const t = setInterval(() => { i++; setN(i); if (i > steps.length) { clearInterval(t); setTimeout(onDone, 700) } }, 650); return () => clearInterval(t) }, [agent])
  const I = agent ? TYPE_ICON[agent.type] : Sparkles
  const done = n > steps.length
  return (
    <Dialog open={!!agent}>
      <DialogContent size="sm" hideClose onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} bodyClassName="p-0">
        <div className="relative flex h-[220px] items-center justify-center overflow-hidden bg-subtle-2">
          {[0, 0.8, 1.6].map((d) => <span key={d} className="anim-ring absolute size-28 rounded-full border-2 border-border-strong" style={{ animationDelay: `${d}s` }} />)}
          {[TYPE_ICON.sales, TYPE_ICON.reception, TYPE_ICON.marketing].map((OI, i) => <span key={i} className="anim-orbit absolute flex size-7 items-center justify-center rounded-full bg-surface shadow-card" style={{ animationDelay: `${-i * 2}s` }}><OI className="size-3.5 text-icon" /></span>)}
          <span className="anim-float relative flex size-20 items-center justify-center rounded-[20px] bg-surface shadow-[0_0_#0000,var(--shadow-bevel),var(--shadow-menu)]">
            {done ? <span className="flex size-10 items-center justify-center rounded-full bg-success text-white anim-pop"><Check className="size-6" strokeWidth={3} /></span> : <AgentAvatar name={agent?.name ?? 'A'} size={48} />}
            <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-btn text-btn-fg shadow-card"><I className="size-3.5" /></span>
          </span>
        </div>
        <div className="p-5">
          <h2 className="text-center text-xl">{done ? `${agent?.name} is ready` : `Creating ${agent?.name}…`}</h2>
          <Progress value={Math.min(100, (n / steps.length) * 100)} className="mt-3" />
          <ul className="mt-3 space-y-1.5">{steps.map((s, i) => <li key={s} className={cn('flex items-center gap-2 text-sm transition-colors', i >= n && 'text-muted')}><span className={cn('flex size-4 items-center justify-center rounded-full', i < n ? 'bg-success text-white' : i === n ? 'border-2 border-text border-t-transparent animate-spin' : 'border border-border-strong')}>{i < n && <Check className="size-2.5" strokeWidth={3} />}</span>{s}</li>)}</ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** New agent: pick a type, start from a default agent (or blank), name it. Or build it with AI. */
export function NewAgentDialog({ open, onOpenChange, startType, onAI }: { open: boolean; onOpenChange: (o: boolean) => void; startType?: AgentType; onAI: () => void }) {
  const nav = useNavigate(); const { agents, voices, addAgent } = useStore()
  const [type, setType] = React.useState<AgentType>('sales'); const [from, setFrom] = React.useState<string>('blank'); const [name, setName] = React.useState(''); const [voice, setVoice] = React.useState('')
  const [creating, setCreating] = React.useState<Agent | null>(null)
  React.useEffect(() => { if (open) { setType(startType ?? 'sales'); setFrom('blank'); setName(''); setVoice('') } }, [open])
  const pickFrom = (id: string) => { setFrom(id); const a = agents.find((x) => x.id === id); if (a && !name) setName(`${a.name} 2`) }
  const create = () => { const a = makeAgent(type, name.trim() || 'New agent', agents.find((x) => x.id === from), voice || undefined); onOpenChange(false); setCreating(a) }
  return (<>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" title="New AI agent" description="Every agent can call, text and email. Pick what it mainly does."
        footer={<><Button variant="ghost" className="mr-auto" onClick={() => { onOpenChange(false); onAI() }}><Sparkles />Build it with AI instead</Button><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!name.trim()} onClick={create}>Create agent</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AGENT_TYPES.map((t) => { const I = TYPE_ICON[t]; return (
              <button key={t} onClick={() => { setType(t); setFrom('blank') }} aria-pressed={type === t} className={cn('flex items-start gap-2.5 rounded-card border p-3 text-left transition-colors hover:bg-subtle-2', type === t ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border')}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-surface shadow-bevel"><I className="size-4 text-icon" /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold">{AT[t].label}</span><span className="block text-xs text-muted">{AT[t].desc}</span></span>
              </button>
            ) })}
          </div>
          <Field label="Start from">
            <div className="grid gap-2 sm:grid-cols-4">
              <button onClick={() => setFrom('blank')} className={cn('rounded-card border p-3 text-left text-sm transition-colors hover:bg-subtle-2', from === 'blank' ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border')}><span className="block font-semibold">Blank</span><span className="text-xs text-muted">Answer the questions yourself</span></button>
              {agents.filter((a) => a.type === type).slice(0, 3).map((a) => <button key={a.id} onClick={() => pickFrom(a.id)} className={cn('flex items-start gap-2 rounded-card border p-3 text-left text-sm transition-colors hover:bg-subtle-2', from === a.id ? 'border-btn bg-subtle-2 shadow-[inset_0_0_0_1px_var(--btn)]' : 'border-border')}><AgentAvatar name={a.name} size={24} /><span className="min-w-0"><span className="block font-semibold">{a.name}</span><span className="block truncate text-xs text-muted">{a.style.call}</span></span></button>)}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zara" /></Field>
            <Field label="Voice"><div className="flex gap-2"><Select className="flex-1" value={voice || (agents.find((x) => x.id === from)?.voice ?? '')} onValueChange={setVoice} placeholder="Default voice" options={[...agents.filter((a) => a.type === type).map((a) => a.voice), ...voices.map(([n, d]) => `${n} · ${d}`)].filter((v, i, arr) => arr.indexOf(v) === i).map((v) => ({ value: v, label: v }))} /><Button size="icon" aria-label="Play voice sample" onClick={() => toast('Playing a voice sample (demo)')}><Volume2 /></Button><Button size="icon" aria-label="Clone a voice" onClick={() => toast('Voice cloning opens in the agent editor')}><Mic /></Button></div></Field>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <CreatingAgent agent={creating} onDone={() => { if (creating) { addAgent(creating); nav(`/agents/${creating.id}`); toast.success(`${creating.name} created · answer a few questions and test before going live`) } setCreating(null) }} />
  </>)
}
