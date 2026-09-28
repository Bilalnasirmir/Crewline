import * as React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Rocket, Home, Sparkles, Inbox, Users, Megaphone, Kanban, CalendarDays, Bot, Receipt, BarChart3, Settings, Tag,
  PanelLeftClose, PanelLeftOpen, Search, Bell, UserCheck, Menu, SunMedium, Moon, MoonStar, Contrast, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, type Theme } from '@/store'
import { Tip, TooltipProvider } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/controls'
import { Count } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toaster } from 'sonner'
import { CommandPalette } from './command-palette'
import { MaxPanel } from '@/features/max/panel'

type NavChild = { to: string; label: string }
type NavDef = { to: string; label: string; Icon: React.ComponentType<any>; group: string; children?: NavChild[] }

const NAV: NavDef[] = [
  { to: '/get-started', label: 'Get Started', Icon: Rocket, group: '' },
  { to: '/home', label: 'Home', Icon: Home, group: '' },
  { to: '/max', label: 'Max', Icon: Sparkles, group: '' },
  { to: '/inbox', label: 'Inbox', Icon: Inbox, group: 'Work' },
  { to: '/contacts', label: 'Contacts', Icon: Users, group: 'Work', children: [
    { to: '/contacts?view=folders', label: 'Folders' },
    { to: '/contacts?view=dnc', label: 'Do-Not-Contact' },
    { to: '/contacts?view=health', label: 'Database health' },
  ] },
  { to: '/campaigns', label: 'Campaigns', Icon: Megaphone, group: 'Work', children: [{ to: '/campaigns/new', label: 'New campaign' }] },
  { to: '/stages', label: 'Stages', Icon: Kanban, group: 'Work' },
  { to: '/bookings', label: 'Bookings', Icon: CalendarDays, group: 'Work' },
  { to: '/agents', label: 'AI Agents', Icon: Bot, group: 'Work' },
  { to: '/expenses', label: 'Expenses', Icon: Receipt, group: 'Business' },
  { to: '/reports', label: 'Reports', Icon: BarChart3, group: 'Business' },
  { to: '/settings', label: 'Settings', Icon: Settings, group: 'Business' },
]

const THEMES: { v: Theme; label: string; Icon: React.ComponentType<any> }[] = [
  { v: 'light', label: 'Light', Icon: SunMedium }, { v: 'dark', label: 'Dark', Icon: Moon }, { v: 'navy', label: 'Dark blue', Icon: MoonStar }, { v: 'mixed', label: 'Mixed', Icon: Contrast },
]

/** Top-bar buttons sit on the dark bar, so they get their own light-on-dark states. */
const barBtn = 'relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-control px-2 text-xs font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white [&_svg]:size-5 [&_svg]:shrink-0'

export function AppShell() {
  const theme = useStore((s) => s.theme)
  const collapsed = useStore((s) => s.sidebarCollapsed)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [cmdOpen, setCmdOpen] = React.useState(false)
  const loc = useLocation()
  const liveTick = useStore((s) => s.liveTick)

  React.useEffect(() => { document.documentElement.className = theme === 'light' ? '' : `theme-${theme}` }, [theme])
  React.useEffect(() => { setMobileOpen(false) }, [loc.pathname])
  React.useEffect(() => { const t = setInterval(liveTick, 8000); return () => clearInterval(t) }, [liveTick])
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen((o) => !o) } }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-bg text-text">
        <TopBar onMenu={() => setMobileOpen(true)} onSearch={() => setCmdOpen(true)} />
        <div className="flex min-h-0 flex-1">
        {/* Sidebar: 240px, Polaris navigation */}
        <aside
          className={cn(
            'app-sidebar fixed inset-y-0 left-0 z-[100] flex shrink-0 flex-col bg-sidebar transition-[width,transform] duration-200 ease-in-out md:static md:inset-y-auto',
            collapsed ? 'w-60 md:w-15' : 'w-60',
            mobileOpen ? 'translate-x-0 shadow-dialog' : '-translate-x-full md:translate-x-0',
          )}
        >
          <nav className="flex-1 overflow-y-auto px-3 pb-2 pt-3" aria-label="Main">
            {['', 'Work', 'Business'].map((g) => (
              <div key={g} className={cn(g && 'mt-3')}>
                {g && !collapsed && <div className="mb-1 flex h-5 items-center px-2 text-xs font-semibold text-text">{g}</div>}
                {g && collapsed && <div className="mx-2 mb-2 h-px bg-border-strong" />}
                {NAV.filter((n) => n.group === g).map((n) => <NavItem key={n.to} {...n} collapsed={collapsed} />)}
              </div>
            ))}
          </nav>
          <div className="px-3 pb-3">
            <NavItem to="/pricing" label="Plans & pricing" Icon={Tag} group="" collapsed={collapsed} />
            <ThemeMenu collapsed={collapsed} />
            <button
              onClick={useStore.getState().toggleSidebar}
              className={cn('hidden h-7 w-full items-center gap-2 rounded-control pl-2 pr-1 text-sm font-medium text-text transition-colors hover:bg-nav-hover md:flex', collapsed && 'justify-center px-0')}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="flex size-5 shrink-0 items-center justify-center text-icon">{collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}</span>
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>
        {mobileOpen && <div className="fixed inset-0 z-[99] bg-[var(--overlay)] md:hidden" onClick={() => setMobileOpen(false)} />}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden" id="main">
            <Outlet />
          </main>
        </div>
        </div>
        <MaxPanel />
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
        <Toaster position="bottom-right" toastOptions={{ className: '!rounded-card !border-0 !bg-[var(--btn-hover)] !text-white !text-sm !font-medium !shadow-tooltip', duration: 3500 }} />
      </div>
    </TooltipProvider>
  )
}

/** Does the current URL match a nav link, including any ?query it names? */
function useNavMatch() {
  const loc = useLocation()
  return React.useCallback((to: string, prefix = false) => {
    const [path, query] = to.split('?')
    const pathOk = prefix ? loc.pathname === path || loc.pathname.startsWith(path + '/') : loc.pathname === path
    if (!pathOk) return false
    if (!query) return true
    const want = new URLSearchParams(query), have = new URLSearchParams(loc.search)
    return Array.from(want.entries()).every(([k, v]) => have.get(k) === v)
  }, [loc.pathname, loc.search])
}

/** Polaris nav item: 28px, 20px icon slot, label at 36px. Parent 550, selected 650; children 450 grey. */
function NavItem({ to, label, Icon, collapsed, children }: NavDef & { collapsed: boolean }) {
  const match = useNavMatch()
  const needs = useStore((s) => (to === '/inbox' ? s.convos.filter((v) => v.unread).length : to === '/get-started' ? s.gs.filter((g) => !g.done).length : 0))
  const inSection = match(to, true)
  const activeChild = children?.find((c) => match(c.to))
  const selected = inSection && !activeChild
  const item = (
    <Link
      to={to}
      aria-current={selected ? 'page' : undefined}
      className={cn(
        'group relative flex h-7 items-center gap-2 rounded-control pl-2 pr-1 text-sm font-medium text-text transition-colors hover:bg-nav-hover hover:no-underline',
        selected && 'bg-nav-selected font-semibold hover:bg-nav-selected',
        collapsed && 'md:justify-center md:px-0',
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center text-icon"><Icon className="size-[18px]" strokeWidth={2} /></span>
      <span className={cn('truncate', collapsed && 'md:hidden')}>{label}</span>
      {needs > 0 && <Count n={needs} tone={to === '/inbox' ? 'red' : 'neutral'} className={cn('ml-auto', collapsed && 'md:hidden')} />}
      {collapsed && needs > 0 && <span className="absolute right-1.5 top-1.5 hidden size-1.5 rounded-full bg-danger md:block" />}
    </Link>
  )
  return (
    <>
      {collapsed ? <Tip content={label} side="right">{item}</Tip> : item}
      {children && inSection && !collapsed && children.map((c, i) => {
        const on = c === activeChild
        return (
          <Link
            key={c.to}
            to={c.to}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'relative flex h-7 items-center rounded-control pl-9 pr-1 text-sm transition-colors hover:bg-nav-hover hover:no-underline',
              on ? 'bg-nav-selected font-semibold text-text hover:bg-nav-selected' : 'text-muted hover:text-text',
            )}
          >
            {/* Connector from the parent icon down to the selected child */}
            {on && <span aria-hidden className="absolute bottom-1/2 left-[17px] w-3 rounded-bl-md border-b-2 border-l-2 border-disabled" style={{ height: i * 28 + 18 }} />}
            <span className="truncate">{c.label}</span>
          </Link>
        )
      })}
    </>
  )
}

function ThemeMenu({ collapsed }: { collapsed: boolean }) {
  const theme = useStore((s) => s.theme), setTheme = useStore((s) => s.setTheme)
  const cur = THEMES.find((t) => t.v === theme)!
  const trigger = (
    <button className={cn('flex h-7 w-full items-center gap-2 rounded-control pl-2 pr-1 text-sm font-medium text-text transition-colors hover:bg-nav-hover', collapsed && 'md:justify-center md:px-0')} aria-label="Theme">
      <span className="flex size-5 shrink-0 items-center justify-center text-icon"><cur.Icon className="size-[18px]" /></span>
      <span className={cn(collapsed && 'md:hidden')}>Theme: {cur.label}</span>
    </button>
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{collapsed ? <span><Tip content="Theme" side="right">{trigger}</Tip></span> : trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
          {THEMES.map((t) => <DropdownMenuRadioItem key={t.v} value={t.v}><t.Icon />{t.label}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** 56px top bar: brand, centred 36px search, utilities and account. */
function TopBar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const nav = useNavigate()
  const assignedN = useStore((s) => s.assigned.filter((a) => !a.done).length)
  const notifs = useStore((s) => s.notifs), markRead = useStore((s) => s.markNotifsRead)
  const live = useStore((s) => s.live), setLive = useStore((s) => s.setLive)
  const unread = notifs.filter((n) => !n.read).length
  const setMaxPanel = useStore((s) => s.setMaxPanel), maxOpen = useStore((s) => s.maxPanelOpen)
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-topbar px-3 text-white">
      <button className={cn(barBtn, 'w-8 px-0 md:hidden')} onClick={onMenu} aria-label="Menu"><Menu /></button>
      <div className="flex w-57 shrink-0 items-center gap-2 max-md:w-auto">
        <span className="flex size-7 items-center justify-center rounded-control bg-white text-sm font-bold text-black">C</span>
        <span className="text-[16px] font-bold leading-6 tracking-tight max-md:hidden">Crewline</span>
      </div>
      <div className="flex min-w-0 flex-1 justify-center">
        <button onClick={onSearch} className="flex h-9 w-full max-w-[544px] items-center gap-2 rounded-control border border-topbar-border bg-topbar-2 px-3 text-left text-sm text-white/75 transition-colors hover:border-white/25">
          <Search className="size-4 shrink-0" /><span className="flex-1 truncate">Search or ask Max</span>
          <span className="hidden items-center gap-1 sm:flex"><Kbd className="border-0 bg-topbar-border px-1.5 font-semibold text-white/80">CTRL</Kbd><Kbd className="border-0 bg-topbar-border px-1.5 font-semibold text-white/80">K</Kbd></span>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Tip content={live ? 'Live updates on: agents are working. Click to pause.' : 'Live updates paused'}>
          <button onClick={() => setLive(!live)} className={cn(barBtn, 'hidden sm:inline-flex')}>
            <span className={cn('size-2 rounded-full', live ? 'bg-success animate-[pulse-dot_2s_infinite]' : 'bg-faint')} />{live ? 'Live' : 'Paused'}
          </button>
        </Tip>
        <button onClick={() => nav('/assigned')} className={barBtn}><UserCheck /><span className="hidden md:inline">Assigned to me</span><Count n={assignedN} tone="red" /></button>
        <Popover onOpenChange={(o) => { if (!o) markRead() }}>
          <PopoverTrigger asChild>
            <button aria-label="Notifications" className={cn(barBtn, 'w-8 px-0')}><Bell />{unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-2xs font-semibold text-white">{unread}</span>}</button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex h-11 items-center justify-between border-b border-border px-3"><h3>Notifications</h3><span className="text-sm text-muted">{unread} new</span></div>
            <div className="max-h-[360px] overflow-y-auto p-1.5">
              {notifs.map((n) => (
                <button key={n.id} onClick={() => nav(n.go)} className="flex w-full gap-2 rounded-control px-2 py-1.5 text-left transition-colors hover:bg-subtle-2">
                  <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                  <span className="min-w-0"><span className="block text-sm">{n.text}</span><span className="text-xs text-muted">{n.time}</span></span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Tip content="Ask Max from any screen"><button aria-label="Open Max" onClick={() => setMaxPanel(!maxOpen)} className={cn(barBtn, 'hidden w-8 px-0 sm:inline-flex', maxOpen && 'bg-white/10')}><Sparkles /></button></Tip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="ml-1 flex h-9 items-center gap-2 rounded-control pl-1 pr-2 transition-colors hover:bg-white/10" aria-label="Account"><span className="flex size-7 items-center justify-center rounded-control bg-[#36c86b] text-xs font-bold text-[#0b2a16]">BN</span><span className="hidden text-sm font-semibold md:inline">Bilal’s Group</span></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel><span className="block text-sm text-text">Bilal Nasir</span><span className="font-normal">bilal@bilalsgroup.example</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => nav('/settings/business')}>Business settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => nav('/settings/team')}>Team</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => nav('/pricing')}>Plans & pricing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><LogOut />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
