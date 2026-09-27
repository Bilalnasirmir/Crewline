import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from 'radix-ui'
import { Sparkles, Users, Megaphone, Kanban, CalendarDays, Bot, Inbox, Settings, Receipt, BarChart3, Home, Rocket, Search } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Avatar, AgentAvatar } from '@/components/ui/avatar'
import { useStore } from '@/store'
import { Kbd } from '@/components/ui/controls'

const PAGES = [
  ['Home', '/home', Home], ['Get Started', '/get-started', Rocket], ['Max', '/max', Sparkles], ['Inbox', '/inbox', Inbox], ['Contacts', '/contacts', Users],
  ['Campaigns', '/campaigns', Megaphone], ['Stages', '/stages', Kanban], ['Bookings', '/bookings', CalendarDays], ['AI Agents', '/agents', Bot],
  ['Expenses', '/expenses', Receipt], ['Reports', '/reports', BarChart3], ['Settings', '/settings', Settings],
] as const

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const nav = useNavigate()
  const [q, setQ] = React.useState('')
  const contacts = useStore((s) => s.contacts), agents = useStore((s) => s.agents), campaigns = useStore((s) => s.campaigns)
  const go = (to: string) => { onOpenChange(false); setQ(''); nav(to) }
  const ql = q.toLowerCase()
  const people = ql ? contacts.filter((c) => c.name.toLowerCase().includes(ql) || c.phone.includes(ql) || c.email.includes(ql)).slice(0, 5) : []
  const askMax = q.trim().length > 2
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-[var(--overlay)] anim-fade" />
        <Dialog.Content className="fixed left-1/2 top-[12vh] z-[1001] w-[calc(100vw-32px)] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-card border border-border bg-bg shadow-dialog outline-none anim-pop">
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <Command loop shouldFilter={!askMax || true}>
            <CommandInput placeholder="Search people, campaigns, agents — or tell Max what to do" value={q} onValueChange={setQ} autoFocus />
            <CommandList>
              <CommandEmpty>No matches. Press Enter to ask Max.</CommandEmpty>
              {askMax && (
                <CommandGroup heading="Ask Max">
                  <CommandItem value={`ask ${q}`} onSelect={() => go(`/max?q=${encodeURIComponent(q)}`)}><Sparkles className="!text-ai" /><span className="truncate">“{q}”</span><span className="ml-auto text-xs text-faint">Enter</span></CommandItem>
                </CommandGroup>
              )}
              {people.length > 0 && (
                <CommandGroup heading="People">
                  {people.map((c) => <CommandItem key={c.id} value={`${c.name} ${c.phone}`} onSelect={() => go(`/contacts/${c.id}`)}><Avatar name={c.name || '?'} size={20} />{c.name || 'Name missing'}<span className="ml-auto text-xs text-faint">{c.phone}</span></CommandItem>)}
                </CommandGroup>
              )}
              <CommandGroup heading="Campaigns">
                {campaigns.map((c) => <CommandItem key={c.id} value={c.name} onSelect={() => go(`/campaigns/${c.id}`)}><Megaphone />{c.name}</CommandItem>)}
              </CommandGroup>
              <CommandGroup heading="AI agents">
                {agents.slice(0, 6).map((a) => <CommandItem key={a.id} value={`${a.name} agent`} onSelect={() => go(`/agents/${a.id}`)}><AgentAvatar name={a.name} size={20} />{a.name}<span className="ml-auto text-xs text-faint">{a.type}</span></CommandItem>)}
              </CommandGroup>
              <CommandGroup heading="Go to">
                {PAGES.map(([l, to, I]) => <CommandItem key={to} value={`go ${l}`} onSelect={() => go(to)}><I />{l}</CommandItem>)}
              </CommandGroup>
              <CommandGroup heading="Quick actions">
                <CommandItem value="new campaign" onSelect={() => go('/campaigns/new')}><Megaphone />New campaign</CommandItem>
                <CommandItem value="new agent" onSelect={() => go('/agents?new=1')}><Bot />New AI agent</CommandItem>
                <CommandItem value="new booking" onSelect={() => go('/bookings?new=1')}><CalendarDays />New booking</CommandItem>
                <CommandItem value="import contacts" onSelect={() => go('/contacts?import=1')}><Users />Import contacts</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="flex h-9 items-center gap-3 border-t border-border px-3 text-xs text-muted"><Search className="size-3.5" />Type to search<span className="ml-auto flex items-center gap-1"><Kbd>↑↓</Kbd> move <Kbd>↵</Kbd> open <Kbd>esc</Kbd> close</span></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
