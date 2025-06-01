
"use client";

import { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react'; // Import Menu icon
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; // Import useSidebar
import { AccountSettingsDialog } from '@/components/features/AccountSettingsDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DEFAULT_USER_NAME_FALLBACK = "User";
const DEFAULT_AVATAR_FALLBACK = ""; 

export function Header() {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR_FALLBACK);
  const [userName, setUserName] = useState<string>(DEFAULT_USER_NAME_FALLBACK);

  const { open: sidebarOpen, openMobile: sidebarOpenMobile, isMobile: isSidebarMobile } = useSidebar(); // Get sidebar state

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
      const storedName = localStorage.getItem('bedrockAIUserName');
      setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
      setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
    }
  }, [isAccountSettingsOpen]); 

  const isCurrentPanelOpen = isSidebarMobile ? sidebarOpenMobile : sidebarOpen;

  return (
    <>
      <header className="py-3 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <div className="container mx-auto flex items-center justify-between max-w-3xl">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
              {isCurrentPanelOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </SidebarTrigger>
            <h1 className="text-xl font-headline font-semibold tracking-tight">
              bedrock <span className="text-primary">aí</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Avatar
              className="h-7 w-7 text-muted-foreground hover:ring-2 hover:ring-primary ring-offset-background ring-offset-2 transition-all cursor-pointer"
              onClick={() => setIsAccountSettingsOpen(true)}
            >
              <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="profile person" />
              <AvatarFallback className="text-xs">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <AccountSettingsDialog isOpen={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen} />
    </>
  );
}

