import * as React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Rocket, Home, Sparkles, Inbox, Users, Megaphone, Kanban, CalendarDays, Bot, Receipt, BarChart3, Settings, Tag,
  PanelLeftClose, PanelLeftOpen, Search, Bell, UserCheck, Menu, SunMedium, Moon, MoonStar, Contrast, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, type Theme } from '@/store'
import { Tip, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/controls'
import { Count } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toaster } from 'sonner'
import { CommandPalette } from './command-palette'
import { MaxPanel } from '@/features/max/panel'

const NAV = [
  { to: '/get-started', label: 'Get Started', Icon: Rocket, group: '' },
  { to: '/home', label: 'Home', Icon: Home, group: '' },
  { to: '/max', label: 'Max', Icon: Sparkles, group: '' },
  { to: '/inbox', label: 'Inbox', Icon: Inbox, group: 'Work' },
  { to: '/contacts', label: 'Contacts', Icon: Users, group: 'Work' },
  { to: '/campaigns', label: 'Campaigns', Icon: Megaphone, group: 'Work' },
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
        {/* Sidebar */}
        <aside
          className={cn(
            'app-sidebar fixed inset-y-0 left-0 z-[100] flex shrink-0 flex-col bg-sidebar transition-[width,transform] duration-200 ease-in-out md:static md:inset-y-auto',
            collapsed ? 'w-[56px]' : 'w-[240px]',
            mobileOpen ? 'translate-x-0 shadow-dialog' : '-translate-x-full md:translate-x-0',
          )}
        >
          <nav className="flex-1 overflow-y-auto px-2 pb-2 pt-3" aria-label="Main">
            {['', 'Work', 'Business'].map((g) => (
              <div key={g} className={cn(g && 'mt-3')}>
                {g && !collapsed && <div className="px-2 pb-1 pt-1 text-xs font-semibold text-muted">{g}</div>}
                {g && collapsed && <div className="mx-2 my-2 h-px bg-border" />}
                {NAV.filter((n) => n.group === g).map((n) => <NavItem key={n.to} {...n} collapsed={collapsed} />)}
              </div>
            ))}
          </nav>
          <div className="p-2">
            <NavItem to="/pricing" label="Plans & pricing" Icon={Tag} collapsed={collapsed} />
            <ThemeMenu collapsed={collapsed} />
            <button
              onClick={useStore.getState().toggleSidebar}
              className="mt-1 flex h-8 w-full items-center gap-2.5 rounded-control px-2 text-sm text-muted hover:bg-subtle hover:text-text"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="size-4 shrink-0" /> : <><PanelLeftClose className="size-4 shrink-0" /><span>Collapse</span></>}
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
        <Toaster position="bottom-right" toastOptions={{ className: '!rounded-card !border !border-border !bg-[#1c1d21] !text-white !text-sm !shadow-menu', duration: 3500 }} />
      </div>
    </TooltipProvider>
  )
}

function NavItem({ to, label, Icon, collapsed }: { to: string; label: string; Icon: React.ComponentType<any>; collapsed: boolean }) {
  const needs = useStore((s) => (to === '/inbox' ? s.convos.filter((v) => v.unread).length : to === '/get-started' ? s.gs.filter((g) => !g.done).length : 0))
  const item = (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'group relative flex h-8 items-center gap-2.5 rounded-control px-2 text-base font-semibold text-text-2 transition-colors hover:bg-[#e3e3e3] hover:text-text hover:no-underline',
        isActive && 'bg-surface text-text shadow-[0_1px_0_rgba(0,0,0,.05)] hover:bg-surface',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={2} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && needs > 0 && <Count n={needs} tone={to === '/inbox' ? 'red' : 'neutral'} className="ml-auto" />}
      {collapsed && needs > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />}
    </NavLink>
  )
  return collapsed ? <Tip content={label} side="right">{item}</Tip> : item
}

function ThemeMenu({ collapsed }: { collapsed: boolean }) {
  const theme = useStore((s) => s.theme), setTheme = useStore((s) => s.setTheme)
  const cur = THEMES.find((t) => t.v === theme)!
  const trigger = (
    <button className={cn('flex h-8 w-full items-center gap-2.5 rounded-control px-2 text-sm text-muted hover:bg-subtle hover:text-text', collapsed && 'justify-center px-0')} aria-label="Theme">
      <cur.Icon className="size-4 shrink-0" />{!collapsed && <span>Theme: {cur.label}</span>}
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

function TopBar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const nav = useNavigate()
  const assignedN = useStore((s) => s.assigned.filter((a) => !a.done).length)
  const notifs = useStore((s) => s.notifs), markRead = useStore((s) => s.markNotifsRead)
  const live = useStore((s) => s.live), setLive = useStore((s) => s.setLive)
  const unread = notifs.filter((n) => !n.read).length
  const setMaxPanel = useStore((s) => s.setMaxPanel), maxOpen = useStore((s) => s.maxPanelOpen)
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-topbar px-3 text-white md:px-4">
      <Button variant="ghost" size="icon" className="text-white hover:bg-topbar-2 hover:text-white md:hidden" onClick={onMenu} aria-label="Menu"><Menu /></Button>
      <div className="flex w-[240px] shrink-0 items-center gap-2 max-md:w-auto"><span className="flex size-7 items-center justify-center rounded-[7px] bg-white text-[13px] font-bold text-black">C</span><span className="text-[17px] font-bold tracking-tight max-md:hidden">Crewline</span></div>
      <div className="flex min-w-0 flex-1 justify-center">
        <button onClick={onSearch} className="flex h-9 w-full max-w-[640px] items-center gap-2 rounded-control bg-topbar-2 px-3 text-left text-base text-[#b5b5b5] hover:bg-[#3a3a3a]">
          <Search className="size-4 shrink-0" /><span className="flex-1 truncate text-white/90">Search or ask Max</span><span className="hidden items-center gap-1 sm:flex"><Kbd className="border-0 bg-[#4a4a4a] text-[10px] text-[#e3e3e3]">CTRL</Kbd><Kbd className="border-0 bg-[#4a4a4a] text-[10px] text-[#e3e3e3]">K</Kbd></span>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 md:gap-1 [&_button]:text-white [&_button:hover]:bg-topbar-2 [&_button:hover]:text-white">
        <Tip content={live ? 'Live updates on — agents are working. Click to pause.' : 'Live updates paused'}>
          <button onClick={() => setLive(!live)} className="hidden h-8 items-center gap-1.5 rounded-control px-2 text-sm text-[#b5b5b5] hover:bg-topbar-2 sm:flex">
            <span className={cn('size-2 rounded-full', live ? 'bg-success animate-[pulse-dot_2s_infinite]' : 'bg-faint')} />{live ? 'Live' : 'Paused'}
          </button>
        </Tip>
        <Button variant="ghost" size="sm" onClick={() => nav('/assigned')} className="gap-1.5 px-2 sm:px-2.5"><UserCheck /><span className="hidden md:inline">Assigned to me</span><Count n={assignedN} tone="red" /></Button>
        <Popover onOpenChange={(o) => { if (!o) markRead() }}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell />{unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{unread}</span>}</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex h-10 items-center justify-between border-b border-border px-3"><span className="text-sm font-medium">Notifications</span><span className="text-xs text-muted">{unread} new</span></div>
            <div className="max-h-[360px] overflow-y-auto p-1">
              {notifs.map((n) => (
                <button key={n.id} onClick={() => nav(n.go)} className="flex w-full gap-2 rounded-[6px] px-2 py-2 text-left hover:bg-subtle">
                  <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                  <span className="min-w-0"><span className="block text-sm leading-[18px]">{n.text}</span><span className="text-xs text-muted">{n.time}</span></span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Tip content="Ask Max from any screen"><Button variant="ghost" size="icon" aria-label="Open Max" onClick={() => setMaxPanel(!maxOpen)} className={cn('hidden sm:inline-flex', maxOpen && '!bg-topbar-2')}><Sparkles /></Button></Tip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="ml-1 flex h-8 items-center gap-2 rounded-control pr-2 hover:bg-topbar-2" aria-label="Account"><span className="flex size-7 items-center justify-center rounded-[7px] bg-[#36c86b] text-[11px] font-bold text-[#0b2a16]">BN</span><span className="hidden text-base font-semibold md:inline">Bilal’s Group</span></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel><span className="block text-text">Bilal Nasir</span><span className="font-normal">bilal@bilalsgroup.example</span></DropdownMenuLabel>
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
