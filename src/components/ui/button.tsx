import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Polaris button: 12px / 550 label (body-sm medium), 8px radius, bevel shadows.
 *  Desktop heights: micro 24, slim/medium 28, large 32. Phones get 4px more for touch. */
const buttonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-control text-xs font-medium transition-colors duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-btn text-btn-fg shadow-btn-primary hover:bg-btn-hover max-md:font-semibold',
        secondary: 'bg-surface text-text shadow-btn hover:bg-btn-2-hover active:bg-btn-2-active',
        ghost: 'text-text hover:bg-fill-hover active:bg-fill-selected',
        // Secondary actions in a page header: flat grey, as the Shopify admin shows them.
        header: 'bg-fill-tertiary text-text hover:bg-fill-tertiary-hover active:bg-fill-tertiary-active',
        outline: 'bg-surface text-text shadow-btn hover:bg-btn-2-hover active:bg-btn-2-active',
        destructive: 'bg-surface text-danger shadow-btn hover:bg-danger-soft',
        'destructive-solid': 'bg-danger text-white hover:bg-danger-text',
        // AI actions look like secondary buttons; the Sparkles icon marks them.
        ai: 'bg-surface text-text shadow-btn hover:bg-btn-2-hover active:bg-btn-2-active',
        link: 'text-sm font-normal text-primary hover:underline',
      },
      size: {
        xs: 'h-7 px-2 md:h-6',
        sm: 'h-8 px-3 md:h-7',
        md: 'h-8 px-3 md:h-7',
        lg: 'h-9 px-3 text-sm md:h-8',
        icon: 'size-8 p-0 md:size-7',
        'icon-sm': 'size-7 p-0 md:size-6',
        'icon-xs': 'size-6 p-0 md:size-5 [&_svg]:size-3.5',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0 md:h-auto' }],
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
