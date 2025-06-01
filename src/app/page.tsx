
"use client"; // Required for useState

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/features/CodeGenerator';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar

export default function HomePage() {
  const [resetKey, setResetKey] = useState(0);
  const { setOpen: setSidebarPcOpen, isMobile, open: isSidebarPcOpen } = useSidebar(); // Get sidebar controls

  const handleNewChat = () => {
    setResetKey(prev => prev + 1);
    if (!isMobile && isSidebarPcOpen) { // If on PC and the sidebar is currently open
        setSidebarPcOpen(false); // Explicitly close it
    }
    // The ChatHistoryPanel's internal logic already handles closing the mobile sidebar sheet.
  };

  return (
    <AppLayout onNewChat={handleNewChat}>
      <ChatInterface resetKey={resetKey} />
    </AppLayout>
  );
}
