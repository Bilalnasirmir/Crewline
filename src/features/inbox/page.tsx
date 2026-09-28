import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Inbox, MessageSquare, Mail, Phone, ChevronDown, PenLine } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/app/page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Count } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChatView } from './chat'
import { EmailView, Composer } from './email'
import { CallsView } from './calls'
import { NewMessageDialog } from './dialogs'

type Kind = 'chat' | 'email' | 'calls'

/** One inbox for every platform: Chat · Email · Calls. Only the conversation pane scrolls. */
export function InboxPage() {
  const [sp, setSp] = useSearchParams(); const s = useStore()
  const kind = (sp.get('kind') as Kind) || 'chat'
  const setKind = (k: Kind) => setSp(k === 'chat' ? {} : { kind: k }, { replace: true })
  const [newMsg, setNewMsg] = React.useState(false); const [mail, setMail] = React.useState(false)
  const unread = s.convos.filter((v) => v.unread).length; const mailUnread = s.emails.filter((e) => e.box === 'inbox' && e.unread).length; const missed = s.calls.filter((l) => l.status === 'missed').length
  const tabs = (
    <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
      <Segmented value={kind} onChange={setKind} options={[
        { value: 'chat', label: <>Chat<Count n={unread} tone="blue" /></>, icon: <MessageSquare /> },
        { value: 'email', label: <>Email<Count n={mailUnread} tone="blue" /></>, icon: <Mail /> },
        { value: 'calls', label: <>Calls<Count n={missed} tone="red" /></>, icon: <Phone /> },
      ]} />
    </div>
  )
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Inbox" icon={<Inbox />} sub="Every platform in one place"
        actions={<DropdownMenu><DropdownMenuTrigger asChild><Button variant="primary"><PenLine />New<ChevronDown /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setNewMsg(true)}><MessageSquare />New message</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { setKind('email'); setMail(true) }}><Mail />New email</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setKind('calls')}><Phone />New call</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu>} />
      <div className="flex min-h-0 flex-1 px-4 pb-4">
        <Card className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {kind === 'chat' ? <ChatView key="chat" kindTabs={tabs} /> : kind === 'email' ? <EmailView key="email" kindTabs={tabs} /> : <CallsView key="calls" kindTabs={tabs} />}
        </Card>
      </div>
      <NewMessageDialog open={newMsg} onOpenChange={setNewMsg} />
      <Composer draft={mail ? {} : null} onClose={() => setMail(false)} />
    </div>
  )
}
