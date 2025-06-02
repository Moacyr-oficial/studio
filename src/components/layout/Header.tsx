
"use client";

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react'; 
import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar'; 
import { AccountSettingsDialog } from '@/components/features/AccountSettingsDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const DEFAULT_USER_NAME_FALLBACK = "User";
const DEFAULT_AVATAR_FALLBACK = "";

interface HeaderProps {
  pageTitle?: string | null;
}

export function Header({ pageTitle }: HeaderProps) {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR_FALLBACK);
  const [userName, setUserName] = useState<string>(DEFAULT_USER_NAME_FALLBACK);
  const { isMobile, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
      const storedName = localStorage.getItem('bedrockAIUserName');
      setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
      setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
    }
  }, [isAccountSettingsOpen]); // Re-fetch if settings dialog was open, in case avatar/name changed

  const displayTitle = pageTitle || "Bedrock aí";
  const truncatedTitle = displayTitle.length > 30 ? `${displayTitle.substring(0, 27)}...` : displayTitle;


  return (
    <>
      <header className="py-3 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <div className="w-full mx-auto flex items-center justify-between md:max-w-screen-xl xl:max-w-screen-2xl">
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
            )}
             <h1 className="text-lg md:text-xl font-headline font-semibold tracking-tight truncate">
              {isMobile ? truncatedTitle : displayTitle}
            </h1>
          </div>
         
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
