import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card bg-surface shadow-card', className)} {...p} />
}
export function CardHeader({ className, title, description, action, icon }: { className?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className={cn('flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="text-muted [&_svg]:size-4">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate">{title}</h3>
          {description && <p className="truncate text-xs text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
    </div>
  )
}
export function CardBody({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...p} />
}

export function EmptyState({ icon, title, description, action, className, compact }: { icon?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-16', className)}>
      {icon && <span className="flex size-10 items-center justify-center rounded-card bg-subtle text-muted [&_svg]:size-5">{icon}</span>}
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-[40ch] text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="mt-1 flex gap-2">{action}</div>}
    </div>
  )
}

/** Attio-style property rows: grey label on the left, value on the right. */
export function PropertyList({ children, className, labelWidth = 120 }: { children: React.ReactNode; className?: string; labelWidth?: number }) {
  return <dl className={cn('grid gap-x-3 gap-y-1', className)} style={{ gridTemplateColumns: `${labelWidth}px minmax(0,1fr)` }}>{children}</dl>
}
export function Property({ label, children, icon }: { label: React.ReactNode; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <>
      <dt className="flex h-8 items-center gap-1.5 truncate text-sm text-muted [&_svg]:size-3.5">{icon}{label}</dt>
      <dd className="flex min-h-8 min-w-0 items-center text-base">{children}</dd>
    </>
  )
}
