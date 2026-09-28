import * as React from 'react'
import { cn } from '@/lib/utils'

/** Polaris text field: 32px on desktop (36px on phones), 13px text, 8px radius, grey input border. */
export const inputClass =
  'flex h-9 w-full min-w-0 rounded-control border border-input-border bg-input-bg px-3 text-sm text-text transition-colors duration-150 hover:border-input-border-hover focus:border-input-border-hover disabled:border-border disabled:bg-subtle-2 disabled:text-disabled aria-invalid:border-danger aria-invalid:bg-danger-soft md:h-8'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, className)} {...props} />,
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(inputClass, 'h-auto min-h-20 resize-y py-1.5 md:h-auto', className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm text-text', className)} {...props} />
}

export function Field({
  label, hint, error, children, className, htmlFor, action,
}: { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; children: React.ReactNode; className?: string; htmlFor?: string; action?: React.ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {(label || action) && (
        <div className="flex items-center justify-between gap-2">
          {label ? <Label htmlFor={htmlFor}>{label}</Label> : <span />}
          {action}
        </div>
      )}
      {children}
      {error ? <p className="text-sm text-danger-text">{error}</p> : hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  )
}
