
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Rabbit, ToyBrick, Map as MapIcon, Trash2, Menu, X, Settings } from 'lucide-react';
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
  SidebarTrigger, // Import SidebarTrigger
  useSidebar,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { AccountSettingsDialog } from '@/components/features/AccountSettingsDialog'; // For settings icon

interface ChatHistoryPanelProps {
  onNewChat: () => void;
}

const initialMockHistory = [
  {id: "1", title: "Create a flying pig"},
  {id: "2", title: "Explain behavior packs"},
  {id: "3", title: "How to add custom sounds?"},
  {id: "4", title: "Generate a simple sword item"},
];

export function ChatHistoryPanel({ onNewChat }: ChatHistoryPanelProps) {
  const { isMobile, setOpenMobile, state: sidebarState, open: isSidebarPCOpen } = useSidebar();
  const { toast } = useToast();
  const [historyItems, setHistoryItems] = useState(initialMockHistory);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);


  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      setOpenMobile(false);
    }
    // For PC, the sidebar state is handled by useSidebar default behavior or explicit user interaction
  };

  const handleDeleteItem = (id: string, title: string) => {
    setHistoryItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Chat Deleted",
      description: `"${title}" has been removed from history.`,
    });
  };

  const specializedChats = [
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
        className="z-40 rounded-r-2xl flex flex-col" 
      >
        <SidebarHeader className="px-3 pt-3 pb-2 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <h2 className="font-headline text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Bedrock AI
          </h2>
          <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto">
            {isSidebarPCOpen && !isMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </SidebarTrigger>
        </SidebarHeader>

        <div className="px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenuButton
              variant="default" // Make it more prominent
              className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-primary group-data-[collapsible=icon]:text-primary-foreground"
              onClick={handleNewChatClick}
              tooltip={sidebarState === 'collapsed' ? 'New Chat' : undefined}
          >
            <PlusCircle className="h-5 w-5 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </SidebarMenuButton>
        </div>
        
        {/* Hide specialized chats and recent history text when collapsed on PC */}
        <div className="group-data-[collapsible=icon]:hidden flex-grow overflow-y-auto">
            <div className="px-2 pb-1">
                <SidebarMenu>
                {specializedChats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={chat.action}
                    >
                        <chat.icon className="h-5 w-5 shrink-0" />
                        <span>{chat.title}</span>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </div>

            <SidebarSeparator />

            <SidebarContent className="p-0">
                <div className="px-2 pt-0 pb-1">
                <SidebarGroup>
                    <div className="px-2 pt-2 pb-1 text-xs font-normal tracking-wider text-sidebar-foreground/60">
                        RECENT
                    </div>
                    <SidebarMenu>
                        {historyItems.map((item) => (
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
                    </SidebarMenu>
                </SidebarGroup>
                </div>
            </SidebarContent>
        </div>
        
        {/* Footer for settings icon, visible always but styled for collapsed/expanded */}
        <SidebarFooter className="mt-auto p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
                variant="ghost"
                className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0"
                onClick={() => setIsAccountSettingsOpen(true)}
                tooltip={sidebarState === 'collapsed' ? 'Settings' : undefined}
            >
                <Settings className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <AccountSettingsDialog isOpen={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen} />
    </>
  );
}
