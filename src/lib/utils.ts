import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const nf = (n: number) => Math.round(n).toLocaleString('en-US')
export const money = (n: number, cur = '$') => `${cur}${Math.round(n).toLocaleString('en-US')}`
export const pct = (n: number) => `${Math.round(n)}%`
export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
let _id = 1000
export const uid = (p = 'id') => `${p}${(_id++).toString(36)}`
export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
export const plural = (n: number, one: string, many = one + 's') => `${nf(n)} ${n === 1 ? one : many}`
