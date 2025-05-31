"use client"; // Required for useState

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/features/CodeGenerator';

export default function HomePage() {
  const [resetKey, setResetKey] = useState(0);

  const handleNewChat = () => {
    setResetKey(prev => prev + 1);
    // The sidebar can close itself using useSidebar hook internally
  };

  return (
    <AppLayout onNewChat={handleNewChat}>
      <ChatInterface resetKey={resetKey} />
    </AppLayout>
  );
}
