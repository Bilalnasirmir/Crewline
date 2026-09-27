import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badge = cva('inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-medium [&_svg]:size-3', {
  variants: {
    tone: {
      neutral: 'bg-[#e8e8e8] text-text-2',
      blue: 'bg-info-soft text-info',
      green: 'bg-success-soft text-success',
      amber: 'bg-warning-soft text-warning',
      red: 'bg-danger-soft text-danger',
      ai: 'bg-ai-soft text-ai',
      outline: 'border border-border bg-surface text-text-2',
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
    <span className={cn('inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular',
      tone === 'red' ? 'bg-danger text-white' : tone === 'blue' ? 'bg-primary text-white' : 'bg-subtle text-muted', className)}>
      {n > 99 ? '99+' : n}
    </span>
  )
}
