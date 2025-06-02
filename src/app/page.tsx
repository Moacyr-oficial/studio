
"use client"; 

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/features/CodeGenerator';
import { useSidebar } from '@/components/ui/sidebar';

export default function HomePage() {
  const [resetKey, setResetKey] = useState(0);
  const { setOpen: setSidebarPcOpen, isMobile, open: isSidebarPcOpen } = useSidebar();
  const [headerTitle, setHeaderTitle] = useState<string | null>("Bedrock aí");

  const handleNewChat = () => {
    setResetKey(prev => prev + 1);
    setHeaderTitle("Bedrock aí"); // Reset title on new chat
    if (!isMobile && isSidebarPcOpen) { 
        setSidebarPcOpen(false); 
    }
  };

  const handleChatStart = (firstUserMessage: string) => {
    // Use a simple title, e.g., the first few words of the first message
    const title = firstUserMessage.split(' ').slice(0, 5).join(' ');
    setHeaderTitle(title.length > 0 ? title : "Chat");
  };

  return (
    <AppLayout onNewChat={handleNewChat} pageTitle={headerTitle}>
      <ChatInterface resetKey={resetKey} onChatStart={handleChatStart} />
    </AppLayout>
  );
}
