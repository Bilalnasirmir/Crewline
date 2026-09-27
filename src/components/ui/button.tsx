import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-btn',
        secondary: 'bg-bg text-text border border-border hover:bg-subtle shadow-btn',
        ghost: 'text-text-2 hover:bg-subtle hover:text-text',
        outline: 'bg-transparent text-text border border-border hover:bg-subtle',
        destructive: 'bg-bg text-danger border border-border hover:bg-danger-soft shadow-btn',
        'destructive-solid': 'bg-danger text-white hover:opacity-90',
        ai: 'bg-ai-soft text-ai hover:opacity-90',
        link: 'text-primary hover:underline px-0 h-auto',
      },
      size: {
        sm: 'h-7 px-2.5 text-sm [&_svg]:size-3.5',
        md: 'h-8 px-3 text-base',
        lg: 'h-9 px-4 text-base',
        icon: 'h-8 w-8 p-0',
        'icon-sm': 'h-7 w-7 p-0 [&_svg]:size-3.5',
        'icon-xs': 'h-6 w-6 p-0 [&_svg]:size-3.5',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        type={asChild ? undefined : (props.type ?? 'button')}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
export { buttonVariants }
