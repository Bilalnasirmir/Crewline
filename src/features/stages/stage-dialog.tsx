import * as React from 'react'
import { toast } from 'sonner'
import { User, Send, Star, Clock, Check, Package, Zap, X, Minus, Inbox, Calendar, FileText, HelpCircle, MapPin, Phone, DollarSign, Truck, Heart, Flag, Home, Wrench, ThumbsUp, Hourglass, Sparkles } from 'lucide-react'
import { cn, uid } from '@/lib/utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { Switch, Checkbox, ChoiceRow } from '@/components/ui/controls'
import { Segmented } from '@/components/ui/tabs'
import { Tip } from '@/components/ui/tooltip'
import { DirIcon } from '@/components/app/icons'
import { StageTag } from '@/components/app/bits'
import { LineList } from '@/features/shared/led'
import type { Pipe, Stage } from '@/data/types'

export const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  user: User, send: Send, star: Star, clock: Clock, check: Check, package: Package, zap: Zap, x: X, minus: Minus, inbox: Inbox, calendar: Calendar,
  file: FileText, help: HelpCircle, pin: MapPin, phone: Phone, dollar: DollarSign, truck: Truck, heart: Heart, flag: Flag, home: Home, wrench: Wrench, thumb: ThumbsUp, wait: Hourglass,
}
export const STAGE_COLORS = ['#8A93A6', '#4C8BF5', '#7048E8', '#C68A12', '#0F766E', '#2A55B0', '#15803D', '#D92D20', '#6B6B6B', '#DB2777', '#0891B2', '#65A30D']
export const PIPES: { v: Pipe; l: string }[] = [{ v: 'telecom', l: 'Telecom' }, { v: 'realestate', l: 'Real estate' }, { v: 'dental', l: 'Dental' }]

/** Example criteria the AI writes for a stage name. */
export const aiCriteria = (name: string): string[] => {
  const n = name.toLowerCase()
  if (/qualif|interest/.test(n)) return ['Customer says they are interested', 'Customer says “OK, go ahead”', 'Customer says “yes, I need this”', 'Customer meets all required qualifying questions']
  if (/book|appoint|viewing|schedul/.test(n)) return ['A time was confirmed on the calendar', 'Customer received and accepted the confirmation']
  if (/pend|think|later/.test(n)) return ['Customer says they need time to think', 'Customer asks to be contacted later', 'AI could not decide the stage with confidence']
  if (/lost|not|cancel|no/.test(n)) return ['Customer says no or not interested', 'Customer asks us to stop contacting them']
  if (/won|install|closed|complete|paid|sold/.test(n)) return ['The order was delivered or the service was completed', 'Payment was received']
  return [`Customer did what “${name}” means for your business`, 'The agent confirmed it with the customer in the conversation']
}

/** New / edit stage: name, colour and/or icon, criteria as sentences, and which campaigns use it. */
export function StageDialog({ open, onOpenChange, pipe, dir, stage, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; pipe: Pipe; dir: 'in' | 'out'; stage?: Stage | null; onSaved?: (s: Stage) => void }) {
  const { campaigns, upsertStage } = useStore()
  const [f, setF] = React.useState<Stage>({ id: '', name: '', color: STAGE_COLORS[1], icon: 'star', criteria: [], rev: false, type: 'open' })
  const [scope, setScope] = React.useState<'all' | 'some'>('all'); const [camps, setCamps] = React.useState<string[]>([])
  const [useIcon, setUseIcon] = React.useState(true)
  React.useEffect(() => {
    if (!open) return
    setF(stage ?? { id: uid('st'), name: '', color: STAGE_COLORS[1], icon: 'star', criteria: [], rev: false, type: 'open' })
    setScope(stage?.camps?.length ? 'some' : 'all'); setCamps(stage?.camps ?? []); setUseIcon(true)
  }, [open, stage])
  const same = campaigns.filter((c) => c.pipe === pipe && (c.dir === 'in' ? 'in' : 'out') === dir)
  const save = () => {
    const st = { ...f, name: f.name.trim(), icon: useIcon ? f.icon : '', camps: scope === 'some' ? camps : [] }
    upsertStage(pipe, dir, st)
    // A stage assigned to a campaign that uses another stage set is added to that set too.
    if (scope === 'some') campaigns.filter((c) => camps.includes(c.id) && (c.pipe !== pipe || (c.dir === 'in' ? 'in' : 'out') !== dir)).forEach((c) => upsertStage(c.pipe, c.dir === 'in' ? 'in' : 'out', { ...st, id: uid('st') }))
    onSaved?.(st); onOpenChange(false)
    toast.success(stage ? `“${st.name}” updated everywhere` : `Stage “${st.name}” added · agents start using it now`)
  }
  const Icon = STAGE_ICONS[f.icon] ?? Star
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" title={stage ? `Edit stage · ${stage.name}` : 'New stage'} description={<span className="flex items-center gap-1.5"><DirIcon dir={dir} size={12} withTip={false} />{dir === 'in' ? 'Inbound' : 'Outbound'} stages · {PIPES.find((p) => p.v === pipe)?.l}</span>}
        footer={<><span className="mr-auto hidden items-center gap-2 text-sm text-muted sm:flex">Preview <StageTag name={f.name || 'Stage name'} stages={[f]} /></span><Button onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary" disabled={!f.name.trim() || !f.criteria.length} onClick={save}>{stage ? 'Save stage' : 'Create stage'}</Button></>}>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-4">
            <Field label="Stage name"><Input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Qualified, Booked, Installed" /></Field>
            <Field label="When does a lead enter this stage?" hint="Write each rule as a sentence and press Enter. The AI checks every call, text and email against these and always follows the latest message.">
              <LineList items={f.criteria} onChange={(criteria) => setF({ ...f, criteria })} placeholder="e.g. Customer says “OK, go ahead”" numbered ai={() => { setF({ ...f, criteria: [...f.criteria, ...aiCriteria(f.name || 'this stage').filter((x) => !f.criteria.includes(x))] }); toast('AI added example criteria — edit anything that doesn’t fit') }} />
            </Field>
            <Field label="What kind of stage is it?">
              <Segmented value={f.type} onChange={(type) => setF({ ...f, type })} options={[{ value: 'open', label: 'In progress' }, { value: 'pending', label: 'Pending' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }]} />
            </Field>
            <label className="flex items-start justify-between gap-3 rounded-card border border-border p-3">
              <span><span className="block text-sm font-medium">This stage counts revenue</span><span className="block text-sm text-muted">When a lead reaches it, the product value is added to revenue. Only one stage per campaign should count.</span></span>
              <Switch checked={f.rev} onCheckedChange={(rev) => setF({ ...f, rev })} />
            </label>
            <div className="space-y-2">
              <div className="text-sm">Use it in</div>
              <ChoiceRow checked={scope === 'all'} onClick={() => setScope('all')} title="Every campaign with these stages" description={same.length ? same.map((c) => c.name).join(' · ') : 'No campaigns use this stage set yet'} />
              <ChoiceRow checked={scope === 'some'} onClick={() => setScope('some')} title="Only the campaigns I pick" description="One, several or all — including campaigns with other stages" />
              {scope === 'some' && <div className="ml-7 space-y-0.5">{campaigns.map((c) => <label key={c.id} className="flex h-8 cursor-pointer items-center gap-2 rounded-control px-2 text-sm hover:bg-subtle-2"><Checkbox checked={camps.includes(c.id)} onCheckedChange={(v) => setCamps(v ? [...camps, c.id] : camps.filter((x) => x !== c.id))} /><DirIcon dir={c.dir} size={12} withTip={false} /><span className="truncate">{c.name}</span></label>)}</div>}
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Colour">
              <div className="grid grid-cols-6 gap-1.5">{STAGE_COLORS.map((c) => <button key={c} onClick={() => setF({ ...f, color: c })} className={cn('size-7 rounded-control ring-offset-2 transition-shadow', f.color === c && 'ring-2 ring-text')} style={{ background: c }} aria-label={`Colour ${c}`} />)}</div>
            </Field>
            <Field label={<span className="flex items-center gap-2">Icon <Switch size="sm" checked={useIcon} onCheckedChange={setUseIcon} /></span>}>
              <div className={cn('grid grid-cols-6 gap-1.5', !useIcon && 'pointer-events-none opacity-40')}>
                {Object.entries(STAGE_ICONS).map(([k, I]) => <Tip key={k} content={k}><button onClick={() => setF({ ...f, icon: k })} className={cn('flex size-7 items-center justify-center rounded-control border transition-colors hover:bg-subtle-2', f.icon === k ? 'border-btn bg-subtle-2' : 'border-border')} aria-label={`Icon ${k}`}><I className="size-4 text-icon" /></button></Tip>)}
              </div>
            </Field>
            <div className="rounded-card bg-subtle-2 p-3">
              <div className="mb-2 text-xs text-muted">On the board</div>
              <div className="flex items-center gap-2 rounded-control bg-surface p-2 shadow-card">
                <span className="flex size-6 items-center justify-center rounded-control" style={{ background: f.color + '1f', color: f.color }}>{useIcon ? <Icon className="size-3.5" /> : <span className="size-2 rounded-full" style={{ background: f.color }} />}</span>
                <span className="truncate text-sm font-medium">{f.name || 'Stage name'}</span>
                {f.rev && <span className="ml-auto text-xs text-success">Revenue</span>}
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted"><Sparkles className="mt-0.5 size-3 shrink-0" />{f.criteria.length ? `${f.criteria.length} rule${f.criteria.length === 1 ? '' : 's'} — the AI moves a lead here when any rule matches.` : 'Add at least one rule.'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
