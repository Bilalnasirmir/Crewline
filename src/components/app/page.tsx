import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Segmented } from '@/components/ui/tabs'

/** Polaris page header: 16px from the top bar, optional icon + heading-lg title, actions on the right
 *  (28px buttons, 8px apart), 12px above the content. */
export function PageHeader({ title, crumbs, actions, icon, sub, className, children }: { title: React.ReactNode; crumbs?: { label: string; to?: string }[]; actions?: React.ReactNode; icon?: React.ReactNode; sub?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 pb-3 pt-4', className)}>
      <div className="flex min-h-7 min-w-0 items-center gap-1">
        {icon && <span className="flex size-5 shrink-0 items-center justify-center text-text [&_svg]:size-[18px]">{icon}</span>}
        {crumbs?.map((c, i) => (
          <React.Fragment key={i}>
            {c.to ? <Link to={c.to} className="truncate text-xl font-semibold text-muted hover:text-text hover:no-underline">{c.label}</Link> : <span className="truncate text-xl font-semibold text-muted">{c.label}</span>}
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </React.Fragment>
        ))}
        <h1 className="truncate">{title}</h1>
        {sub && <span className="ml-1 hidden truncate text-sm text-muted sm:inline">{sub}</span>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&>*]:shrink-0">{actions}</div>}
    </div>
  )
}

/** Secondary row under the header: filters, view switcher, search. */
export function Toolbar({ left, right, className }: { left?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pb-3', className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{left}</div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </div>
  )
}

/** Section tabs under the page header: Polaris tabs (28px, 12px / 550, selected = light fill). */
export function PageTabs<T extends string>({ value, onChange, tabs, right, className }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: React.ReactNode; icon?: React.ReactNode }[]; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex shrink-0 flex-wrap items-center gap-2 px-4 pb-3', className)}>
      <div className="-mx-1 flex min-w-0 flex-1 overflow-x-auto px-1 [scrollbar-width:none]"><Segmented value={value} onChange={onChange} options={tabs} /></div>
      {right && <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>}
    </div>
  )
}

/** Scrollable content area with 16px side padding. Polaris page widths: default 998px, `narrow` 662px (forms);
 *  `wide` 1200px for dashboards. Without either the content spans the full width (tables). */
export function PageBody({ className, children, narrow, wide, flush }: { className?: string; children: React.ReactNode; narrow?: boolean; wide?: boolean; flush?: boolean }) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto', flush ? '' : 'px-4 pb-16', className)}>
      <div className={cn(narrow && 'mx-auto max-w-[662px]', wide && 'mx-auto max-w-[1200px]')}>{children}</div>
    </div>
  )
}

/** Section heading outside the cards (heading-md), with an optional line of help text. */
export function Section({ title, description, action, children, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-end justify-between gap-3">
        <div><h2>{title}</h2>{description && <p className="text-sm text-muted">{description}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  )
}
