import { cn, initials } from '@/lib/utils'

const palette = ['#e3edfd', '#e6f4ea', '#fdf1e0', '#f3eefe', '#fde8ea', '#e0f2f1', '#fff4d6', '#eceff4']
const inks = ['#1d4fb8', '#1f6b3a', '#9a5a12', '#5b2fb0', '#b02a37', '#0e6b63', '#8a6100', '#3d4452']
const hash = (s: string) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

export function Avatar({ name, size = 24, className, square, src }: { name: string; size?: number; className?: string; square?: boolean; src?: string }) {
  const i = hash(name) % palette.length
  return (
    <span
      className={cn('inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-semibold leading-none', square ? 'rounded-[6px]' : 'rounded-full', className)}
      style={{ width: size, height: size, background: palette[i], color: inks[i], fontSize: Math.max(9, Math.round(size * 0.38)) }}
      aria-hidden
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  )
}

/** AI agents get a rounded-square avatar with a tinted initial, so they are always distinguishable from people. */
export function AgentAvatar({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  return <Avatar name={name} size={size} square className={cn('ring-1 ring-inset ring-black/5', className)} />
}
