import * as React from 'react'
import { Popover as P } from 'radix-ui'
import { cn } from '@/lib/utils'

export const Popover = P.Root
export const PopoverTrigger = P.Trigger
export const PopoverAnchor = P.Anchor
export const PopoverClose = P.Close

export const PopoverContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof P.Content>>(
  ({ className, align = 'start', sideOffset = 6, ...props }, ref) => (
    <P.Portal>
      <P.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn('z-[1000] w-72 rounded-menu border border-border bg-surface p-3 shadow-menu outline-none anim-pop', className)}
        {...props}
      />
    </P.Portal>
  ),
)
PopoverContent.displayName = 'PopoverContent'
