
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Rabbit, ToyBrick, Map as MapIcon, Trash2, Menu, Settings, ExternalLink } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarSeparator,
  // SidebarTrigger, // We'll use a custom button for "Close Menu"
  useSidebar,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { AccountSettingsDialog } from '@/components/features/AccountSettingsDialog';

interface ChatHistoryPanelProps {
  onNewChat: () => void;
}

const initialMockHistory = [
  {id: "1", title: "Create a flying pig"},
  {id: "2", title: "Explain behavior packs"},
  {id: "3", title: "How to add custom sounds?"},
  {id: "4", title: "Generate a simple sword item"},
  {id: "5", title: "My adventure map ideas"},
  {id: "6", title: "Custom mob behavior logic"},
];

export function ChatHistoryPanel({ onNewChat }: ChatHistoryPanelProps) {
  const { isMobile, setOpenMobile, setOpen, open: isSidebarOpen, state: sidebarState } = useSidebar();
  const { toast } = useToast();
  const [historyItems, setHistoryItems] = useState(initialMockHistory);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      setOpenMobile(false);
    }
    // On PC, if the sidebar is collapsed to icons, starting a new chat should expand it.
    // if (!isMobile && sidebarState === 'collapsed') { // This logic was moved to page.tsx
    //   setOpen(true);
    // }
  };

  const handleCloseMenuClick = () => {
    if (!isMobile) {
      setOpen(false); // Collapse to icons on PC
    } else {
      setOpenMobile(false); // Close sheet on mobile
    }
  };
  
  const handleDeleteItem = (id: string, title: string) => {
    setHistoryItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Chat Deleted",
      description: `"${title}" has been removed from history.`,
    });
  };

  const features = [
    { id: "entity-gen", title: "Entity Generator", icon: Rabbit, action: handleNewChatClick },
    { id: "behavior-helper", title: "Behavior Pack Helper", icon: ToyBrick, action: handleNewChatClick },
    { id: "world-builder", title: "World Builder", icon: MapIcon, action: handleNewChatClick },
  ];

  return (
    <>
      <Sidebar
        side="left"
        collapsible="icon" 
        variant="sidebar"
        className="z-40 rounded-r-none flex flex-col border-r border-sidebar-border"
      >
        <SidebarHeader className="p-2">
          {/* "Close Menu" button - visible when sidebar is expanded */}
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuButton
                variant="ghost"
                className="w-full justify-start gap-2 text-sm"
                onClick={handleCloseMenuClick}
            >
                <Menu className="h-5 w-5" />
                <span>Close Menu</span>
            </SidebarMenuButton>
          </div>
           {/* Hamburger icon - visible only when sidebar is collapsed to icons (PC) */}
          <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0.5">
             <SidebarMenuButton
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(true)} // This button re-expands the sidebar
                tooltip="Open Menu"
             >
                <Menu className="h-5 w-5" />
             </SidebarMenuButton>
          </div>
        </SidebarHeader>

        <div className="p-2 group-data-[collapsible=icon]:p-0.5 group-data-[collapsible=icon]:pt-2">
          <SidebarMenuButton
              variant="default"
              className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-primary group-data-[collapsible=icon]:text-primary-foreground"
              onClick={handleNewChatClick}
              tooltip={sidebarState === 'collapsed' && !isMobile ? 'New Chat' : undefined}
          >
            <PlusCircle className="h-5 w-5 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">New Conversation</span>
          </SidebarMenuButton>
        </div>
        
        <SidebarContent className="flex-grow p-0 group-data-[collapsible=icon]:pt-1">
            {/* Features Section */}
            <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
                <div className="px-2 pt-3 pb-1 text-xs font-medium tracking-wider text-sidebar-foreground/70">
                    FEATURES
                </div>
                <SidebarMenu>
                {features.map((feature) => (
                    <SidebarMenuItem key={feature.id}>
                    <SidebarMenuButton
                        variant="ghost"
                        className="w-full justify-start gap-2 text-sm font-normal"
                        onClick={feature.action}
                    >
                        <feature.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <span>{feature.title}</span>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </div>
            
            {/* Removed SidebarSeparator from here */}

            {/* Recents Section */}
            <div className="px-2 pt-1 pb-1 group-data-[collapsible=icon]:hidden">
              <div className="px-2 pt-2 pb-1 text-xs font-medium tracking-wider text-sidebar-foreground/70">
                  RECENTS
              </div>
              <SidebarMenu>
                  {historyItems.slice(0, 5).map((item) => ( // Show limited items initially
                  <SidebarMenuItem key={item.id} className="group/item">
                      <SidebarMenuButton
                          className="font-normal text-sm h-auto py-1.5 px-2 w-full justify-start"
                          variant="ghost"
                      >
                      <span className="truncate flex-grow">{item.title}</span>
                      </SidebarMenuButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleDeleteItem(item.id, item.title);
                        }}
                        aria-label={`Delete chat: ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </SidebarMenuItem>
                  ))}
                  {historyItems.length > 5 && (
                    <SidebarMenuItem>
                        <SidebarMenuButton variant="ghost" className="w-full justify-start text-sm font-normal">
                            Show more...
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
              </SidebarMenu>
            </div>
        </SidebarContent>
        
        <SidebarSeparator />
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0.5 group-data-[collapsible=icon]:pb-2">
            <SidebarMenuButton
                variant="ghost"
                className="w-full justify-start gap-2 text-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0"
                onClick={() => setIsAccountSettingsOpen(true)}
                tooltip={sidebarState === 'collapsed' && !isMobile ? 'Settings & Help' : undefined}
            >
                <Settings className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Settings & Help</span>
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <AccountSettingsDialog isOpen={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen} />
    </>
  );
}
