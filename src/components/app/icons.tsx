import * as React from 'react'
import { Sparkles, Send, Inbox, MessageSquare, Mail, Phone, Globe, HelpCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tip } from '@/components/ui/tooltip'
import type { Platform } from '@/data/types'

/** The one AI mark used on every AI action. */
export function AiMark({ className, size = 14 }: { className?: string; size?: number }) {
  return <Sparkles className={cn('shrink-0 text-ai', className)} style={{ width: size, height: size }} aria-hidden />
}

/** Inbound / outbound — deliberately not call or message arrows. */
export function DirIcon({ dir, size = 14, className, withTip = true }: { dir: 'in' | 'out' | 'both'; size?: number; className?: string; withTip?: boolean }) {
  const I = dir === 'in' ? Inbox : Send
  const el = (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-[4px]', dir === 'in' ? 'text-success' : dir === 'both' ? 'text-muted' : 'text-primary', className)} aria-label={dir === 'in' ? 'Inbound' : dir === 'out' ? 'Outbound' : 'Inbound and outbound'}>
      <I style={{ width: size, height: size }} />
    </span>
  )
  return withTip ? <Tip content={dir === 'in' ? 'Inbound — people reached out to you' : dir === 'out' ? 'Outbound — you reached out to them' : 'Works on inbound and outbound'}>{el}</Tip> : el
}
export function DirTag({ dir, className }: { dir: 'in' | 'out' | 'both'; className?: string }) {
  return (
    <span className={cn('inline-flex h-5 items-center gap-1 rounded-tag px-2 text-xs font-medium', dir === 'in' ? 'bg-success-badge text-success-text' : dir === 'both' ? 'bg-neutral-badge text-text-2' : 'bg-info-badge text-info', className)}>
      <DirIcon dir={dir} size={12} withTip={false} />{dir === 'in' ? 'Inbound' : dir === 'out' ? 'Outbound' : 'Both'}
    </span>
  )
}

const Wa = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.2 5.2 0 0 0 3.2.6 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>)
const Ig = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>)
const Msg = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2C6.5 2 2 6.1 2 11.3c0 3 1.4 5.6 3.7 7.3V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2zm1 12.5-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.4 5.8z"/></svg>)
const Tt = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.5 3c.3 2.4 1.7 3.9 4 4.1v3.3c-1.5.1-2.8-.3-4-1.1v6.4c0 3.4-2.5 5.8-5.7 5.8-3.1 0-5.5-2.4-5.5-5.4 0-3.3 3-5.9 6.4-5.3v3.4c-1.5-.5-3 .5-3 2 0 1.2.9 2.1 2.1 2.1 1.3 0 2.2-.9 2.2-2.4V3h3.5z"/></svg>)
const Fb = (p: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>)

export const PLATFORMS: Record<Platform, { label: string; Icon: React.ComponentType<any>; color: string }> = {
  sms: { label: 'SMS', Icon: MessageSquare, color: '#266DF0' },
  wa: { label: 'WhatsApp', Icon: Wa, color: '#25D366' },
  ig: { label: 'Instagram', Icon: Ig, color: '#E1306C' },
  msg: { label: 'Messenger', Icon: Msg, color: '#0084FF' },
  tt: { label: 'TikTok', Icon: Tt, color: '#111214' },
  fb: { label: 'Facebook', Icon: Fb, color: '#1877F2' },
  chat: { label: 'Web chat', Icon: Globe, color: '#7C3AED' },
  email: { label: 'Email', Icon: Mail, color: '#B7791F' },
  call: { label: 'Call', Icon: Phone, color: '#1F8A4C' },
}
export function PlatIcon({ p, size = 14, className, tip = true, mono }: { p: Platform; size?: number; className?: string; tip?: boolean; mono?: boolean }) {
  const d = PLATFORMS[p]; if (!d) return null
  const el = <span className={cn('inline-flex shrink-0 items-center justify-center', className)} style={{ color: mono ? undefined : d.color }} aria-label={d.label}><d.Icon style={{ width: size, height: size }} /></span>
  return tip ? <Tip content={d.label}>{el}</Tip> : el
}
export function PlatBadge({ p, className }: { p: Platform; className?: string }) {
  return <span className={cn('inline-flex h-5 items-center gap-1 rounded-tag bg-neutral-badge px-2 text-xs font-medium text-text-2', className)}><PlatIcon p={p} size={12} tip={false} />{PLATFORMS[p].label}</span>
}
export const QueryIcon = HelpCircle
export type { LucideIcon }
