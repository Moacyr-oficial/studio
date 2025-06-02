
"use client";

import { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react'; 
import { useSidebar } from '@/components/ui/sidebar'; 
import { AccountSettingsDialog } from '@/components/features/AccountSettingsDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DEFAULT_USER_NAME_FALLBACK = "User";
const DEFAULT_AVATAR_FALLBACK = "";

export function Header() {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR_FALLBACK);
  const [userName, setUserName] = useState<string>(DEFAULT_USER_NAME_FALLBACK);

  // const { open: sidebarOpen, openMobile: sidebarOpenMobile, isMobile: isSidebarMobile } = useSidebar(); // No longer needed here

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
      const storedName = localStorage.getItem('bedrockAIUserName');
      setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
      setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
    }
  }, [isAccountSettingsOpen]);

  // const isCurrentPanelOpen = isSidebarMobile ? sidebarOpenMobile : sidebarOpen; // No longer needed here

  return (
    <>
      <header className="py-3 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border">
        <div className="w-full mx-auto flex items-center justify-between md:max-w-screen-xl xl:max-w-screen-2xl">
          {/* SidebarTrigger is removed from here */}
          <div className="flex items-center gap-2">
            {/* Placeholder for potential future elements if sidebar trigger is not in panel */}
          </div>
          <h1 className="text-xl font-headline font-semibold tracking-tight invisible md:visible"> {/* Hidden on mobile, visible on PC */}
            bedrock <span className="text-primary">aí</span>
          </h1>
          <div className="flex items-center gap-3">
            <Avatar
              className="h-7 w-7 text-muted-foreground hover:ring-2 hover:ring-primary ring-offset-background ring-offset-2 transition-all cursor-pointer"
              onClick={() => setIsAccountSettingsOpen(true)}
            >
              <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="profile person"/>
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

