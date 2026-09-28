import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/** Polaris badge: 20px tall, 2px 8px padding, 8px radius, 12px / 550. Status only. */
const badge = cva('inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-tag px-2 text-xs font-medium [&_svg]:size-3', {
  variants: {
    tone: {
      neutral: 'bg-neutral-badge text-text-2',
      blue: 'bg-info-badge text-info',
      green: 'bg-success-badge text-success-text',
      amber: 'bg-warning-badge text-warning',
      red: 'bg-danger-badge text-danger-text',
      ai: 'bg-neutral-badge text-text-2',
      outline: 'bg-surface text-text-2 shadow-[inset_0_0_0_1px_var(--border)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Badge({ className, tone, dot, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge> & { dot?: boolean }) {
  return (
    <span className={cn(badge({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/** Solid count bubble for nav and tabs. */
export function Count({ n, tone = 'neutral', className }: { n: number; tone?: 'neutral' | 'red' | 'blue'; className?: string }) {
  if (!n) return null
  return (
    <span className={cn('inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-semibold tabular',
      tone === 'red' ? 'bg-danger text-white' : tone === 'blue' ? 'bg-primary text-white' : 'bg-fill-selected text-text-2', className)}>
      {n > 99 ? '99+' : n}
    </span>
  )
}
