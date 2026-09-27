import * as React from 'react'
import { Switch as S, Checkbox as C, RadioGroup as R, Separator as Sep, Progress as P, Slider as Sl } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Switch({ className, size = 'md', ...props }: React.ComponentPropsWithoutRef<typeof S.Root> & { size?: 'sm' | 'md' }) {
  return (
    <S.Root
      className={cn(
        'relative shrink-0 rounded-full bg-border-strong transition-colors data-[state=checked]:bg-primary disabled:opacity-50',
        size === 'sm' ? 'h-4 w-7' : 'h-5 w-9', className,
      )}
      {...props}
    >
      <S.Thumb className={cn('block rounded-full bg-white shadow-sm transition-transform', size === 'sm' ? 'size-3 translate-x-0.5 data-[state=checked]:translate-x-3.5' : 'size-4 translate-x-0.5 data-[state=checked]:translate-x-[18px]')} />
    </S.Root>
  )
}

export function Checkbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof C.Root>) {
  return (
    <C.Root
      className={cn('flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-strong bg-surface transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary disabled:opacity-50', className)}
      {...props}
    >
      <C.Indicator className="text-white">
        {props.checked === 'indeterminate' ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
      </C.Indicator>
    </C.Root>
  )
}

export const RadioGroup = R.Root
export function Radio({ className, ...props }: React.ComponentPropsWithoutRef<typeof R.Item>) {
  return (
    <R.Item className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface transition-colors data-[state=checked]:border-primary', className)} {...props}>
      <R.Indicator className="size-2 rounded-full bg-primary" />
    </R.Item>
  )
}

/** Card-like choice row with a radio or checkbox on the left. */
export function ChoiceRow({
  checked, onClick, title, description, icon, right, className, disabled,
}: { checked: boolean; onClick: () => void; title: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode; right?: React.ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={checked}
      className={cn(
        'flex w-full items-start gap-3 rounded-card border p-3 text-left transition-colors hover:bg-subtle-2 disabled:opacity-50',
        checked ? 'border-primary bg-primary-soft/60 hover:bg-primary-soft/60' : 'border-border', className,
      )}
    >
      <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border', checked ? 'border-primary' : 'border-border-strong')}>
        {checked && <span className="size-2 rounded-full bg-primary" />}
      </span>
      {icon && <span className="mt-0.5 text-muted [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium">{title}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      {right}
    </button>
  )
}

export const Separator = ({ className, orientation = 'horizontal', ...p }: React.ComponentPropsWithoutRef<typeof Sep.Root>) => (
  <Sep.Root orientation={orientation} className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} {...p} />
)

export function Progress({ value, className, color }: { value: number; className?: string; color?: string }) {
  return (
    <P.Root className={cn('h-1.5 w-full overflow-hidden rounded-full bg-subtle', className)} value={value}>
      <P.Indicator className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </P.Root>
  )
}

export function Slider({ className, ...props }: React.ComponentPropsWithoutRef<typeof Sl.Root>) {
  return (
    <Sl.Root className={cn('relative flex h-5 w-full touch-none select-none items-center', className)} {...props}>
      <Sl.Track className="relative h-1.5 grow rounded-full bg-subtle"><Sl.Range className="absolute h-full rounded-full bg-primary" /></Sl.Track>
      <Sl.Thumb className="block size-4 rounded-full border border-border-strong bg-surface shadow-btn focus:outline-none focus:ring-2 focus:ring-primary/25" />
    </Sl.Root>
  )
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-border bg-subtle px-1 font-sans text-[11px] text-muted', className)}>{children}</kbd>
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-control bg-subtle', className)} />
}
