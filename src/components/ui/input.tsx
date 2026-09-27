import * as React from 'react'
import { cn } from '@/lib/utils'

export const inputClass =
  'flex h-10 w-full min-w-0 rounded-control border border-border-strong bg-surface px-3 text-base text-text placeholder:text-faint transition-colors duration-150 hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-info/30 disabled:opacity-50 disabled:bg-subtle-2 aria-invalid:border-danger'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, className)} {...props} />,
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(inputClass, 'h-auto min-h-[88px] py-1.5 resize-y leading-5', className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium text-text-2', className)} {...props} />
}

export function Field({
  label, hint, error, children, className, htmlFor, action,
}: { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; children: React.ReactNode; className?: string; htmlFor?: string; action?: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5 min-w-0', className)}>
      {(label || action) && (
        <div className="flex items-center justify-between gap-2">
          {label ? <Label htmlFor={htmlFor}>{label}</Label> : <span />}
          {action}
        </div>
      )}
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}
