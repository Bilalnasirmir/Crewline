import * as React from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { Card, CardHeader } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/controls'
import { OptionRow } from '@/features/shared/led'

/** A setting kept in this browser's preferences, with a default. */
export function usePref<T>(key: string, d: T): [T, (v: T) => void] {
  const v = useStore((s) => s.prefs[key]) as T | undefined; const setPref = useStore((s) => s.setPref)
  return [v ?? d, (x: T) => setPref(key, x)]
}

/** Section title at the top of a settings page. */
export function SecHead({ title, description, action }: { title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0"><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="text-sm text-muted">{description}</p>}</div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  )
}

/** A card of setting rows. */
export function SetCard({ title, description, action, children, className, flush }: { title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; flush?: boolean }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {title && <CardHeader title={title} description={description} action={action} />}
      <div className={cn(flush ? '' : 'divide-y divide-border-2 px-4 pb-1', !title && !flush && 'pt-1')}>{children}</div>
    </Card>
  )
}

/** On/off setting row, saved right away. */
export function SwitchRow({ k, title, description, d = true, onChange }: { k: string; title: React.ReactNode; description?: React.ReactNode; d?: boolean; onChange?: (v: boolean) => void }) {
  const [v, set] = usePref<boolean>(k, d)
  return <OptionRow title={title} description={description}><Switch checked={v} onCheckedChange={(x) => { set(x); onChange?.(x); toast(x ? 'Turned on' : 'Turned off') }} aria-label={typeof title === 'string' ? title : undefined} /></OptionRow>
}

/** Pick-one setting row, saved right away. */
export function SelectRow({ k, title, description, d, options }: { k: string; title: React.ReactNode; description?: React.ReactNode; d: string; options: string[] }) {
  const [v, set] = usePref<string>(k, d)
  return <OptionRow title={title} description={description}><Select variant="button" align="end" value={v} onValueChange={(x) => { set(x); toast.success('Saved') }} options={options.map((o) => ({ value: o, label: o }))} /></OptionRow>
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIMES = Array.from({ length: 35 }, (_, i) => { const t = 360 + i * 30; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` })
export const t12 = (s: string) => { const [h, m] = s.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}` }
export type Hours = Record<string, [string, string, boolean]>
export const defaultHours = (): Hours => Object.fromEntries(DAYS.map((d) => [d, ['09:00', '18:00', d !== 'Sun']])) as Hours

/** Opening hours, one row per day. */
export function HoursEditor({ value, onChange }: { value: Hours; onChange: (h: Hours) => void }) {
  return (
    <div className="divide-y divide-border-2">
      {DAYS.map((d) => { const [a, b, on] = value[d] ?? ['09:00', '18:00', false]; return (
        <div key={d} className="flex flex-wrap items-center gap-3 py-2">
          <Switch checked={on} onCheckedChange={(v) => onChange({ ...value, [d]: [a, b, v] })} aria-label={`Open on ${d}`} />
          <span className="w-10 text-sm font-medium">{d}</span>
          {on ? <><Select size="sm" className="w-[112px]" value={a} onValueChange={(v) => onChange({ ...value, [d]: [v, b, on] })} options={TIMES.map((t) => ({ value: t, label: t12(t) }))} /><span className="text-sm text-muted">to</span><Select size="sm" className="w-[112px]" value={b} onValueChange={(v) => onChange({ ...value, [d]: [a, v, on] })} options={TIMES.map((t) => ({ value: t, label: t12(t) }))} /></> : <span className="text-sm text-muted">Closed</span>}
        </div>
      ) })}
    </div>
  )
}
