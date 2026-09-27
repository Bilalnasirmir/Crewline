import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** Every page starts with the same 48px header row: breadcrumb/title on the left, actions on the right. */
export function PageHeader({ title, crumbs, actions, icon, sub, className, children }: { title: React.ReactNode; crumbs?: { label: string; to?: string }[]; actions?: React.ReactNode; icon?: React.ReactNode; sub?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex min-h-14 shrink-0 items-center justify-between gap-3 px-4 pt-3 md:px-6', className)}>
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="text-text [&_svg]:size-5">{icon}</span>}
        {crumbs?.map((c, i) => (
          <React.Fragment key={i}>
            {c.to ? <Link to={c.to} className="truncate text-base text-muted hover:text-text hover:no-underline">{c.label}</Link> : <span className="truncate text-base text-muted">{c.label}</span>}
            <ChevronRight className="size-3.5 shrink-0 text-faint" />
          </React.Fragment>
        ))}
        <h1 className="truncate text-xl font-bold leading-7 tracking-tight">{title}</h1>
        {sub && <span className="hidden truncate text-sm text-muted sm:inline">{sub}</span>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&>*]:shrink-0">{actions}</div>}
    </div>
  )
}

/** Secondary row under the header: filters, view switcher, search. 40px. */
export function Toolbar({ left, right, className }: { left?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-1.5 md:px-6', className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">{left}</div>
      <div className="flex shrink-0 items-center gap-1.5">{right}</div>
    </div>
  )
}

/** Scrollable content area. `narrow` centers forms/settings at 960px, `wide` at 1261px. */
export function PageBody({ className, children, narrow, wide, flush }: { className?: string; children: React.ReactNode; narrow?: boolean; wide?: boolean; flush?: boolean }) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto', flush ? '' : 'p-4 md:p-6', className)}>
      <div className={cn(narrow && 'mx-auto max-w-[960px]', wide && 'mx-auto max-w-[1261px]')}>{children}</div>
    </div>
  )
}

export function Section({ title, description, action, children, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-end justify-between gap-3">
        <div><h2 className="text-base font-semibold tracking-normal">{title}</h2>{description && <p className="text-sm text-muted">{description}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  )
}
