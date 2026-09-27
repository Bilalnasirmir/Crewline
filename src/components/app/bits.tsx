import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn, nf } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Tip } from '@/components/ui/tooltip'
import { AgentAvatar, Avatar } from '@/components/ui/avatar'
import { useStore } from '@/store'
import type { Stage } from '@/data/types'

/** Stage tag coloured from the stage's own colour. Hover shows campaign + source when given. */
export function StageTag({ name, stages, tip, className, size = 'md' }: { name: string; stages?: Stage[]; tip?: React.ReactNode; className?: string; size?: 'sm' | 'md' }) {
  const st = stages?.find((s) => s.name === name)
  const color = st?.color ?? '#8A93A6'
  const el = (
    <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-tag font-medium', size === 'sm' ? 'h-[18px] px-1.5 text-[11px]' : 'h-5 px-1.5 text-xs', className)} style={{ background: color + '1a', color }}>
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} /><span className="truncate">{name}</span>
    </span>
  )
  return tip ? <Tip content={tip}>{el}</Tip> : el
}

export function AgentChip({ id, size = 20, link = true, className, showType }: { id: string | null | undefined; size?: number; link?: boolean; className?: string; showType?: boolean }) {
  const a = useStore((s) => s.agents.find((x) => x.id === id))
  if (id === 'you') return <span className={cn('inline-flex items-center gap-1.5 text-base', className)}><Avatar name="Bilal Nasir" size={size} />You</span>
  if (!a) return <span className="text-muted">—</span>
  const inner = <><AgentAvatar name={a.name} size={size} /><span className="truncate">{a.name}</span>{showType && <span className="text-muted">· {a.type}</span>}</>
  return link ? <Link to={`/agents/${a.id}`} className={cn('inline-flex min-w-0 items-center gap-1.5 text-text hover:text-primary hover:no-underline', className)} onClick={(e) => e.stopPropagation()}>{inner}</Link> : <span className={cn('inline-flex items-center gap-1.5', className)}>{inner}</span>
}

export function ContactChip({ id, size = 20, className }: { id: string | null | undefined; size?: number; className?: string }) {
  const c = useStore((s) => s.contacts.find((x) => x.id === id))
  if (!c) return <span className="text-muted">Unknown</span>
  const nm = c.name || 'Name missing'
  return <Link to={`/contacts/${c.id}`} className={cn('inline-flex min-w-0 items-center gap-1.5 text-text hover:text-primary hover:no-underline', className)} onClick={(e) => e.stopPropagation()}><Avatar name={nm} size={size} /><span className="truncate">{nm}</span></Link>
}

export function CampaignChip({ id, className }: { id: string | null | undefined; className?: string }) {
  const c = useStore((s) => s.campaigns.find((x) => x.id === id))
  if (!c) return <span className="text-muted">Inbound</span>
  return <Link to={`/campaigns/${c.id}`} className={cn('truncate text-text hover:text-primary hover:no-underline', className)} onClick={(e) => e.stopPropagation()}>{c.name}</Link>
}

/** KPI tile. Compact, click-through, optional delta and tooltip. */
export function Kpi({ label, value, delta, up, to, tip, onClick, className, sub }: { label: React.ReactNode; value: React.ReactNode; delta?: React.ReactNode; up?: boolean; to?: string; tip?: React.ReactNode; onClick?: () => void; className?: string; sub?: React.ReactNode }) {
  const body = (
    <Card className={cn('flex h-[88px] flex-col justify-between p-4 transition-colors', (to || onClick) && 'cursor-pointer hover:bg-subtle-2', className)} onClick={onClick}>
      <span className="truncate text-sm text-muted">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tabular tracking-tight text-text">{value}</span>
        {delta !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', up === undefined ? 'text-muted' : up ? 'text-success' : 'text-danger')}>
            {up === true && <ArrowUpRight className="size-3" />}{up === false && <ArrowDownRight className="size-3" />}{delta}
          </span>
        )}
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </div>
    </Card>
  )
  const wrapped = to ? <Link to={to} className="block hover:no-underline">{body}</Link> : body
  return tip ? <Tip content={tip}>{wrapped}</Tip> : wrapped
}

export const Num = ({ n }: { n: number }) => <span className="tabular">{nf(n)}</span>

/** Horizontal bar for stage breakdowns and similar. */
export function BarRow({ label, value, max, color, right, onClick }: { label: React.ReactNode; value: number; max: number; color?: string; right?: React.ReactNode; onClick?: () => void }) {
  return (
    <div className={cn('grid grid-cols-[132px_1fr_56px] items-center gap-3 py-1', onClick && 'cursor-pointer rounded-control hover:bg-subtle-2')} onClick={onClick}>
      <span className="truncate text-sm">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full" style={{ width: `${max ? Math.max(2, (value / max) * 100) : 0}%`, background: color ?? 'var(--primary)' }} /></div>
      <span className="text-right text-sm tabular">{right ?? nf(value)}</span>
    </div>
  )
}
