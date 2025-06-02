
import type { ReactNode } from 'react';
import { Header } from './Header';
import { SidebarInset } from '@/components/ui/sidebar';
import { ChatHistoryPanel } from '@/components/features/ChatHistoryPanel';

interface AppLayoutProps {
  children: ReactNode;
  onNewChat: () => void;
  pageTitle?: string | null;
}

export function AppLayout({ children, onNewChat, pageTitle }: AppLayoutProps) {
  return (
    <div className="flex flex-row min-h-screen w-full">
      <ChatHistoryPanel onNewChat={onNewChat} />
      <SidebarInset className="flex-grow">
        <div className="flex flex-col min-h-screen w-full">
          <Header pageTitle={pageTitle} />
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}
