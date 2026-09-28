import * as React from 'react'
import { AlertTriangle, CircleCheck, CircleX, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/** Polaris card: white surface, 12px radius, 1px drop shadow. The bevel edge is drawn
 *  on a layer above the content (like Polaris' ShadowBevel), so tables inside keep it. */
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('relative rounded-card bg-surface shadow-card before:pointer-events-none before:absolute before:inset-0 before:z-[2] before:rounded-[inherit] before:shadow-bevel', className)} {...p} />
}

/** Card title row: heading-sm title, optional secondary line, actions on the right. */
export function CardHeader({ className, title, description, action, icon }: { className?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className={cn('card-header flex flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pb-2 pt-4', className)}>
      <div className="flex min-w-0 flex-1 basis-48 items-start gap-2">
        {icon && <span className="flex h-5 items-center text-icon [&_svg]:size-4">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate">{title}</h3>
          {description && <p className="truncate text-sm text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="-my-1 flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
/** 16px card padding; sits 8px under a CardHeader. */
export function CardBody({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 [.card-header+&]:pt-0', className)} {...p} />
}

export function EmptyState({ icon, title, description, action, className, compact }: { icon?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2 px-4 py-8' : 'gap-4 px-6 py-16', className)}>
      {icon && <span className="flex size-10 items-center justify-center rounded-control bg-subtle text-icon [&_svg]:size-5">{icon}</span>}
      <div>
        <h2>{title}</h2>
        {description && <p className="mx-auto mt-1 max-w-[40ch] text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  )
}

const BANNER = {
  info: { Icon: Info, tile: 'bg-info-fill text-info' },
  success: { Icon: CircleCheck, tile: 'bg-success text-white' },
  warning: { Icon: AlertTriangle, tile: 'bg-warning-fill text-warning' },
  critical: { Icon: CircleX, tile: 'bg-danger text-white' },
}

/** Polaris banner: white card, tone shown by the icon tile. For notices that need attention. */
export function Banner({ tone = 'info', title, children, action, onDismiss, className }: { tone?: keyof typeof BANNER; title?: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; onDismiss?: () => void; className?: string }) {
  const { Icon, tile } = BANNER[tone]
  return (
    <Card role={tone === 'critical' || tone === 'warning' ? 'alert' : 'status'} className={cn('flex items-start gap-3 p-3', className)}>
      <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-control', tile)}><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1 py-1">
        {title && <h3>{title}</h3>}
        {children && <div className="text-sm">{children}</div>}
        {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
      </div>
      {onDismiss && <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss"><X /></Button>}
    </Card>
  )
}

/** Property rows: grey label on the left, value on the right. */
export function PropertyList({ children, className, labelWidth = 120 }: { children: React.ReactNode; className?: string; labelWidth?: number }) {
  return <dl className={cn('grid gap-x-3 gap-y-1', className)} style={{ gridTemplateColumns: `${labelWidth}px minmax(0,1fr)` }}>{children}</dl>
}
export function Property({ label, children, icon }: { label: React.ReactNode; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <>
      <dt className="flex h-8 items-center gap-1.5 truncate text-sm text-muted [&_svg]:size-4">{icon}{label}</dt>
      <dd className="flex min-h-8 min-w-0 items-center text-sm">{children}</dd>
    </>
  )
}
