import * as React from 'react'
import { Tabs as T } from 'radix-ui'
import { cn } from '@/lib/utils'

export const Tabs = T.Root
export const TabsContent = T.Content

export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof T.List>>(
  ({ className, ...props }, ref) => (
    <T.List ref={ref} className={cn('flex h-9 items-end gap-1 overflow-x-auto border-b border-border', className)} {...props} />
  ),
)
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof T.Trigger> & { count?: number }>(
  ({ className, children, count, ...props }, ref) => (
    <T.Trigger
      ref={ref}
      className={cn(
        'relative -mb-px flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3 text-base font-medium text-muted transition-colors hover:text-text data-[state=active]:border-text data-[state=active]:text-text [&_svg]:size-4',
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className="rounded-tag bg-subtle px-1.5 text-xs text-muted tabular">{count}</span>}
    </T.Trigger>
  ),
)
TabsTrigger.displayName = 'TabsTrigger'

/** Pill-style segmented control (Attio view switcher). */
export function Segmented<T extends string>({
  value, onChange, options, className, size = 'md',
}: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[]; className?: string; size?: 'sm' | 'md' }) {
  return (
    <div role="tablist" className={cn('inline-flex shrink-0 items-center gap-0.5 rounded-control bg-subtle p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-[6px] px-2.5 font-medium text-muted transition-colors [&_svg]:size-3.5',
            size === 'sm' ? 'h-6 text-xs' : 'h-7 text-sm',
            value === o.value ? 'bg-bg text-text shadow-btn' : 'hover:text-text',
          )}
        >
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  )
}
