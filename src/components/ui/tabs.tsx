import * as React from 'react'
import { Tabs as T } from 'radix-ui'
import { cn } from '@/lib/utils'

export const Tabs = T.Root
export const TabsContent = T.Content

export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof T.List>>(
  ({ className, ...props }, ref) => (
    <T.List ref={ref} className={cn('flex items-center gap-1 overflow-x-auto', className)} {...props} />
  ),
)
TabsList.displayName = 'TabsList'

/** Polaris tab: 28px, 12px / 550, 8px radius. Selected = light grey fill, no underline. */
const tabClass = 'relative flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-control px-3 text-xs font-medium text-text transition-colors hover:bg-fill-hover [&_svg]:size-4'

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof T.Trigger> & { count?: number }>(
  ({ className, children, count, ...props }, ref) => (
    <T.Trigger ref={ref} className={cn(tabClass, 'data-[state=active]:bg-fill-selected', className)} {...props}>
      {children}
      {count !== undefined && <span className="rounded-tag bg-neutral-badge px-1.5 text-xs text-text-2 tabular">{count}</span>}
    </T.Trigger>
  ),
)
TabsTrigger.displayName = 'TabsTrigger'

/** Small view switcher that looks like Polaris tabs. */
export function Segmented<T extends string>({
  value, onChange, options, className,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[]; className?: string; size?: 'sm' | 'md' }) {
  return (
    <div role="tablist" className={cn('inline-flex shrink-0 items-center gap-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(tabClass, '[&_svg]:size-3.5', value === o.value && 'bg-fill-selected hover:bg-fill-selected')}
        >
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  )
}
