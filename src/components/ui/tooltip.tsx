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
          className={cn('z-[10000] max-w-[280px] rounded-control bg-[#1c1d21] px-2.5 py-1.5 text-xs leading-4 text-white shadow-menu anim-pop', className)}
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  )
}
