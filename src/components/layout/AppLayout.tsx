import type { ReactNode } from 'react';
import { Header } from './Header';
import { SidebarInset } from '@/components/ui/sidebar';
import { ChatHistoryPanel } from '@/components/features/ChatHistoryPanel';

interface AppLayoutProps {
  children: ReactNode;
  onNewChat: () => void;
}

export function AppLayout({ children, onNewChat }: AppLayoutProps) {
  return (
    <div className="flex flex-row min-h-screen w-full"> {/* Changed to flex-row for sidebar */}
      <ChatHistoryPanel onNewChat={onNewChat} />
      <SidebarInset className="flex-grow"> {/* SidebarInset wraps main content */}
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}
