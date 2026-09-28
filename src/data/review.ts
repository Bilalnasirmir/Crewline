import type { Agent } from './types'
import { AT, baseJob } from './seed'

/** One line of an agent's review. `area` is the editor section that fixes it. */
export type ReviewItem = {
  id: string; area: string; title: string; why: string; weight: number; ok: boolean
  /** What "Fix with AI" does, in plain words. */
  fixLabel?: string
  fix?: (a: Agent) => Partial<Agent>
  /** Conversations this was seen in (findings from real conversations only). */
  seen?: number
}
export type Review = { score: number; level: 'good' | 'almost' | 'work'; items: ReviewItem[] }

const qaHas = (a: Agent, re: RegExp) => a.qa.some((x) => re.test(`${x.q} ${x.a}`))

/** The instructions in Crewline's standard structure (goal, how to talk, when unsure). */
export const structuredInstr = (a: Agent) =>
  `You are ${a.name}, the ${AT[a.type].label.toLowerCase()} agent for {business}.\n\nGoal: ${a.job.goal.toLowerCase() || 'help the customer'}.\n\nHow to talk:\n- Keep replies short and friendly — one question at a time.\n- Use the customer’s name once, early.\n- Confirm names, dates and prices back to the customer.\n\nWhen unsure: say so honestly and hand over to a person.`

const DEFAULT_QA = [
  { q: 'Do I need to sign a contract?', a: 'No contract — you can cancel anytime.' },
  { q: 'Can I keep my number?', a: 'Yes, we move your number for free. It takes 1–2 days.' },
  { q: 'Is installation free?', a: 'Yes, installation is free this month.' },
]

/** Checks on the setup itself. Weights add up to 100. Each fix works on the agent it is given,
 *  so several fixes can be applied one after another. */
function checks(a: Agent): ReviewItem[] {
  const j = a.job
  const job = (x: Agent, p: Partial<Agent['job']>) => ({ job: { ...x.job, ...p } })
  const shorten = (t: string) => { const s = t.split(/(?<=[.!?])\s+/).filter(Boolean); return s.length > 2 ? `${s[0]} ${s[s.length - 1]}` : t.slice(0, 150) }
  return [
    { id: 'goal', area: 'job', weight: 4, ok: !!j.goal.trim(), title: 'Main goal is set', why: 'Every conversation needs one clear goal.', fixLabel: `Set the usual goal for a ${AT[a.type].label.toLowerCase()} agent`, fix: (x) => job(x, { goal: baseJob(x.type).goal }) },
    { id: 'products', area: 'job', weight: 10, ok: j.products.trim().length >= 10, title: 'Knows what you sell', why: 'Without products it can’t recommend anything.', fixLabel: 'Fill in your products from the knowledge base', fix: (x) => job(x, { products: baseJob(x.type).products }) },
    { id: 'pricing', area: 'job', weight: 8, ok: j.pricing.trim().length >= 5, title: 'Knows your prices', why: 'Price is the first thing most customers ask.', fixLabel: 'Fill in your prices from the knowledge base', fix: (x) => job(x, { pricing: baseJob(x.type).pricing }) },
    { id: 'qual', area: 'job', weight: 10, ok: j.qual.filter((q) => q.text.trim()).length >= 2 && j.qual.some((q) => q.imp === 'Required'), title: 'Clear qualifying criteria', why: 'At least two, with one marked Required, so it can decide who qualifies.', fixLabel: 'Suggest qualifying criteria', fix: (x) => job(x, { qual: baseJob(x.type).qual }) },
    { id: 'disq', area: 'job', weight: 6, ok: j.disq.some((q) => q.text.trim()), title: 'Knows who doesn’t qualify', why: 'So it stops politely instead of wasting anyone’s time.', fixLabel: 'Suggest disqualifying criteria', fix: (x) => job(x, { disq: baseJob(x.type).disq }) },
    { id: 'questions', area: 'job', weight: 8, ok: j.questions.filter((q) => q.q.trim()).length >= 2, title: 'Has questions to ask', why: 'Questions keep the conversation moving toward the goal.', fixLabel: 'Add the usual questions', fix: (x) => job(x, { questions: baseJob(x.type).questions }) },
    { id: 'handover', area: 'job', weight: 6, ok: j.triggers.length > 0, title: 'Knows when to hand over to a person', why: 'Upset customers and hard questions should reach your team.', fixLabel: 'Hand over when asked for a person, or when upset', fix: (x) => job(x, { triggers: baseJob(x.type).triggers }) },
    { id: 'qa', area: 'qa', weight: 8, ok: a.qa.filter((q) => q.q.trim() && q.a.trim()).length >= 3, title: 'Answers common questions', why: 'Add at least three questions customers often ask.', fixLabel: 'Add common questions and answers', fix: (x) => ({ qa: [...x.qa.filter((q) => q.q.trim()), ...DEFAULT_QA.filter((q) => !x.qa.some((y) => y.q === q.q))] }) },
    { id: 'kb', area: 'knowledge', weight: 8, ok: a.kb.some((f) => f.items.length > 0), title: 'Has a knowledge base', why: 'Files, links or notes it can look things up in.', fixLabel: 'Read your website into a knowledge base', fix: (x) => ({ kb: [...x.kb, { id: `kb${Date.now()}`, name: 'Your website', date: 'Today', items: [{ k: 'link', n: x.type === 'reception' ? 'brightsmile.example' : 'metromobile.example', s: '24 pages read' }] }] }) },
    { id: 'instr', area: 'instructions', weight: 8, ok: a.instr.length >= 120 && /goal/i.test(a.instr) && /(not sure|unsure)/i.test(a.instr), title: 'Instructions are clear and structured', why: 'Say the goal, how to talk, and what to do when unsure.', fixLabel: 'Rewrite the instructions in the standard structure', fix: (x) => ({ instr: structuredInstr(x) }) },
    { id: 'disclose', area: 'rules', weight: 4, ok: !!a.rules.disclose, title: 'Says it’s an AI assistant', why: 'Required in some places, and it builds trust.', fixLabel: 'Say it’s an AI assistant at the start', fix: (x) => ({ rules: { ...x.rules, disclose: true } }) },
    { id: 'optout', area: 'rules', weight: 4, ok: !!a.rules.optout, title: 'Honours opt-out words', why: 'STOP, unsubscribe and similar words must end messages.', fixLabel: 'Honour opt-out words in any language', fix: (x) => ({ rules: { ...x.rules, optout: true } }) },
    { id: 'follow', area: 'follow', weight: 4, ok: a.follow.ai || a.follow.out.length + a.follow.in.length > 0, title: 'Follows up when people don’t reply', why: 'Most sales happen after the second or third touch.', fixLabel: 'Let AI handle follow-ups', fix: (x) => ({ follow: { ...x.follow, ai: true } }) },
    { id: 'tone', area: 'job', weight: 4, ok: j.posture !== 'Salesperson', title: 'Doesn’t sound pushy', why: 'The “Salesperson” posture reads as aggressive in texts.', fixLabel: 'Switch to a consultative posture', fix: (x) => job(x, { posture: 'Consultative' }) },
    { id: 'opening', area: 'job', weight: 4, ok: j.script.length <= 150, title: 'Short first message', why: 'Openers longer than two sentences get fewer replies.', fixLabel: 'Shorten the opening to two sentences', fix: (x) => job(x, { script: shorten(x.job.script) }) },
    { id: 'booking', area: 'booking', weight: 4, ok: a.type !== 'reception' || a.booking, title: 'Can book appointments', why: 'A receptionist needs booking turned on.', fixLabel: 'Turn on booking', fix: (x) => ({ booking: true, act: { ...x.act, booking: true } }) },
  ]
}

/** Things AI noticed in real conversations. Which ones an agent has depends on its id, so agents differ. */
const FINDINGS: (Omit<ReviewItem, 'ok' | 'fix' | 'weight'> & { test: (a: Agent) => boolean; fix: (a: Agent) => Partial<Agent> })[] = [
  { id: 'f-discount', area: 'qa', seen: 14, title: 'Customers ask about discounts', why: 'Asked in 14 conversations this week, with no answer ready.', fixLabel: 'Add an answer about student discounts', test: (a) => qaHas(a, /discount/i), fix: (a) => ({ qa: [...a.qa, { q: 'Do you offer student discounts?', a: 'Yes — 10% off with a valid student ID.' }] }) },
  { id: 'f-hours', area: 'qa', seen: 9, title: 'People ask for your opening hours', why: '9 conversations ended without an answer.', fixLabel: 'Add your opening hours as an answer', test: (a) => qaHas(a, /hours|open/i), fix: (a) => ({ qa: [...a.qa, { q: 'What are your opening hours?', a: 'We’re open Monday to Saturday, 9 AM to 7 PM.' }] }) },
  { id: 'f-missed', area: 'follow', seen: 22, title: 'Missed calls get no text afterwards', why: '22 people missed a call and heard nothing until the next day.', fixLabel: 'Send a text 10 minutes after a missed call', test: (a) => a.follow.out.some((s) => s.if === 'No answer to call' && s.then === 'Text'), fix: (a) => ({ follow: { ...a.follow, out: [{ if: 'No answer to call', after: '10 minutes', then: 'Text', by: a.id, tpl: 'Missed you text' }, ...a.follow.out] } }) },
  { id: 'f-spanish', area: 'profile', seen: 11, title: 'Some leads write in Spanish', why: '11 people wrote in Spanish and got replies in English.', fixLabel: 'Add Spanish to its languages', test: (a) => a.langs.includes('Spanish'), fix: (a) => ({ langs: [...a.langs, 'Spanish'] }) },
  { id: 'f-short', area: 'style', seen: 31, title: 'Text replies run long', why: 'Replies over three sentences get 40% fewer answers.', fixLabel: 'Keep texts to 1–2 short sentences', test: (a) => /1–2/.test(a.style.text), fix: (a) => ({ style: { ...a.style, text: 'Friendly, 1–2 short sentences, one question at a time' } }) },
]
const FINDING_WEIGHT = 3

function findingsFor(a: Agent): ReviewItem[] {
  if (!a.ws.msgs) return [] // no real conversations yet
  let h = 0; for (const ch of a.id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return FINDINGS.filter((_, i) => ((h >> i) & 1) === 1 || i === h % FINDINGS.length)
    .map(({ test, ...f }) => ({ ...f, weight: FINDING_WEIGHT, ok: test(a) }))
}

/** AI's review of an agent: a score out of 100 and what to improve. Recomputed on every edit. */
export function reviewOf(a: Agent): Review {
  const items = [...checks(a), ...findingsFor(a)]
  const base = items.filter((i) => !i.seen && i.ok).reduce((n, i) => n + i.weight, 0)
  const score = Math.max(5, Math.min(100, base - items.filter((i) => i.seen && !i.ok).length * FINDING_WEIGHT))
  return { score, level: score >= 90 ? 'good' : score >= 70 ? 'almost' : 'work', items }
}

/** Apply several AI fixes one after another (each fix sees the previous ones). */
export function applyFixes(a: Agent, items: ReviewItem[]): Agent {
  return items.reduce<Agent>((d, i) => (i.fix ? { ...d, ...i.fix(d) } : d), a)
}

const NEED: Record<string, string> = { goal: 'its main goal', products: 'what you sell', qual: 'who qualifies' }
/** What must be answered before an agent can talk to customers (the "Update your agent" pop-up). */
export function missingForLive(a: Agent): (ReviewItem & { need: string })[] {
  return checks(a).filter((i) => NEED[i.id] && !i.ok).map((i) => ({ ...i, need: NEED[i.id] }))
}
/** "a, b and c" */
export const andList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
