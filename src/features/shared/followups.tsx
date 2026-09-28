import * as React from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/controls'
import { Segmented } from '@/components/ui/tabs'
import { AgentAvatar } from '@/components/ui/avatar'
import { AiMark, DirIcon } from '@/components/app/icons'
import type { FollowStep } from '@/data/types'

export type FollowConfig = { ai: boolean; out: FollowStep[]; in: FollowStep[]; drop: { on: boolean; n: number; cond: string } }
export const defaultFollow = (by = 's1'): FollowConfig => ({ ai: true, out: [{ if: 'No reply to text', after: '4 hours', then: 'Call', by, tpl: 'Friendly check-in call' }, { if: 'No answer to call', after: '1 day', then: 'Email', by, tpl: 'Offer recap email' }, { if: 'No reply to email', after: '2 days', then: 'Call', by, tpl: 'Last try call' }], in: [{ if: 'No reply to text', after: '15 minutes', then: 'Call', by, tpl: 'Quick call-back' }, { if: 'No answer to call', after: '2 hours', then: 'Text', by, tpl: 'Missed you text' }], drop: { on: true, n: 5, cond: 'no reply' } })

const IFS = ['No reply to text', 'No answer to call', 'No reply to email', 'Replied but not booked', 'Opened email, no reply', 'Voicemail left']
const AFTERS = ['15 minutes', '1 hour', '4 hours', '1 day', '2 days', '3 days', '1 week']
const THENS = ['Text', 'Call', 'Email', 'WhatsApp', 'Notify my team', 'Move to Pending']
const TPLS = ['Friendly check-in call', 'Offer recap email', 'Last try call', 'Quick call-back', 'Missed you text', 'Still interested? text', 'Write a new one with AI…']

/** Follow-up sequence editor shared by agents, campaigns and stages. Inbound and outbound are set separately. */
export function FollowUpEditor({ value, onChange, note, compact }: { value: FollowConfig; onChange: (v: FollowConfig) => void; note?: React.ReactNode; compact?: boolean }) {
  const agents = useStore((s) => s.agents)
  const [dir, setDir] = React.useState<'out' | 'in'>('out')
  const steps = value[dir]
  const setSteps = (st: FollowStep[]) => onChange({ ...value, [dir]: st })
  const upd = (i: number, p: Partial<FollowStep>) => setSteps(steps.map((s, j) => (j === i ? { ...s, ...p } : s)))
  return (
    <div className="space-y-3">
      <div className={cn('flex items-center justify-between gap-3 rounded-card border p-3', value.ai ? 'border-ai/40 bg-ai-soft/30' : 'border-border')}>
        <div className="flex items-start gap-2"><AiMark className="mt-1" /><div><div className="text-base font-medium">Let AI handle follow-ups</div><div className="text-sm text-muted">Max picks timing, channel and agent from what works best. Turn off to set every step yourself.</div></div></div>
        <Switch checked={value.ai} onCheckedChange={(ai) => onChange({ ...value, ai })} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Segmented size="sm" value={dir} onChange={setDir} options={[{ value: 'out', label: 'Outbound', icon: <DirIcon dir="out" size={12} withTip={false} /> }, { value: 'in', label: 'Inbound', icon: <DirIcon dir="in" size={12} withTip={false} /> }]} />
        <Button size="sm" variant="ghost" onClick={() => onChange({ ...value, [dir === 'out' ? 'in' : 'out']: steps.map((s) => ({ ...s })) })}>Copy to {dir === 'out' ? 'inbound' : 'outbound'}</Button>
      </div>
      <div className={cn('space-y-2', value.ai && 'pointer-events-none opacity-50')}>
        {steps.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-card border border-border bg-subtle-2 px-2.5 py-2 text-sm">
            <GripVertical className="size-3.5 text-faint" /><span className="w-5 text-xs text-muted tabular">{i + 1}.</span>
            <span className="text-muted">If</span><Select size="sm" className="w-[190px]" value={s.if} onValueChange={(v) => upd(i, { if: v })} options={IFS.map((x) => ({ value: x, label: x }))} />
            <span className="text-muted">after</span><Select size="sm" className="w-[120px]" value={s.after} onValueChange={(v) => upd(i, { after: v })} options={AFTERS.map((x) => ({ value: x, label: x }))} />
            <span className="text-muted">then</span><Select size="sm" className="w-[130px]" value={s.then} onValueChange={(v) => upd(i, { then: v })} options={THENS.map((x) => ({ value: x, label: x }))} />
            {!compact && <><span className="text-muted">by</span><Select size="sm" className="w-[130px]" value={s.by} onValueChange={(v) => upd(i, { by: v })} options={agents.map((a) => ({ value: a.id, label: a.name, icon: <AgentAvatar name={a.name} size={16} /> }))} />
            <span className="text-muted">using</span><Select size="sm" className="w-[200px]" value={s.tpl} onValueChange={(v) => upd(i, { tpl: v })} options={TPLS.map((x) => ({ value: x, label: x }))} /></>}
            <Button variant="ghost" size="icon-xs" className="ml-auto" onClick={() => setSteps(steps.filter((_, j) => j !== i))} aria-label="Remove step"><Trash2 /></Button>
          </div>
        ))}
        <Button size="sm" onClick={() => setSteps([...steps, { if: 'No reply to text', after: '1 day', then: 'Text', by: agents[0].id, tpl: 'Still interested? text' }])}><Plus />Add a step</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-card border border-border px-3 py-2 text-sm">
        <Switch size="sm" checked={value.drop.on} onCheckedChange={(on) => onChange({ ...value, drop: { ...value.drop, on } })} />
        <span>Drop the lead after</span><Input type="number" className="h-7 w-14" value={value.drop.n} onChange={(e) => onChange({ ...value, drop: { ...value.drop, n: +e.target.value } })} /><span>tries with</span>
        <Select size="sm" className="w-[150px]" value={value.drop.cond} onValueChange={(cond) => onChange({ ...value, drop: { ...value.drop, cond } })} options={[{ value: 'no reply', label: 'no reply' }, { value: 'no answer', label: 'no answer' }, { value: 'no reply or answer', label: 'no reply or answer' }]} />
        <span className="text-muted">— the agent stops following up with that person.</span>
      </div>
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  )
}
