import * as React from 'react'
import { Tooltip as T } from 'radix-ui'
import { cn } from '@/lib/utils'

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <T.Provider delayDuration={250} skipDelayDuration={150}>{children}</T.Provider>
)

export function Tip({
  content, children, side = 'top', align = 'center', className,
}: { content: React.ReactNode; children: React.ReactElement; side?: 'top' | 'bottom' | 'left' | 'right'; align?: 'start' | 'center' | 'end'; className?: string }) {
  if (!content) return children
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn('z-[10000] max-w-[275px] rounded-control bg-surface px-2 py-1 text-sm text-text shadow-tooltip anim-pop', className)}
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  )
}
