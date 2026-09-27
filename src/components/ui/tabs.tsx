import * as React from 'react'
import { Tabs as T } from 'radix-ui'
import { cn } from '@/lib/utils'

export const Tabs = T.Root
export const TabsContent = T.Content

export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof T.List>>(
  ({ className, ...props }, ref) => (
    <T.List ref={ref} className={cn('flex h-10 items-center gap-1 overflow-x-auto', className)} {...props} />
  ),
)
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof T.Trigger> & { count?: number }>(
  ({ className, children, count, ...props }, ref) => (
    <T.Trigger
      ref={ref}
      className={cn(
        'relative flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 text-base font-medium text-muted transition-colors hover:bg-subtle-2 hover:text-text data-[state=active]:bg-subtle data-[state=active]:text-text [&_svg]:size-4',
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
    <div role="tablist" className={cn('inline-flex shrink-0 items-center gap-0.5 rounded-[9px] bg-subtle-2 p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-[6px] px-2.5 font-medium text-muted transition-colors [&_svg]:size-3.5',
            size === 'sm' ? 'h-7 text-sm' : 'h-8 text-base',
            value === o.value ? 'bg-surface text-text shadow-btn' : 'hover:text-text',
          )}
        >
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  )
}
