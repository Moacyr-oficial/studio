
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Rabbit, ToyBrick, Map as MapIcon, Trash2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

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
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar();
  const { toast } = useToast();
  const [historyItems, setHistoryItems] = useState(initialMockHistory);

  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      setOpenMobile(false);
    }
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
    <Sidebar
      side="left"
      collapsible="icon"
      variant="sidebar"
      className="z-40 rounded-r-2xl" // Removed border-r-0 to allow default sidebar border
    >
      <SidebarHeader className="px-3 pt-3 pb-2 text-center group-data-[collapsible=icon]:hidden">
        <h2 className="font-headline text-lg font-semibold">Conversation</h2>
      </SidebarHeader>

      <div className="px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <SidebarMenuButton
            variant="ghost"
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0"
            onClick={handleNewChatClick}
            tooltip={sidebarState === 'collapsed' ? 'New Chat' : undefined}
        >
           <PlusCircle className="h-5 w-5 shrink-0" />
           <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
        </SidebarMenuButton>
      </div>

      <div className="px-2 pb-1 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          {specializedChats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                variant="ghost"
                className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-0"
                onClick={chat.action}
                tooltip={sidebarState === 'collapsed' ? chat.title : undefined}
              >
                <chat.icon className="h-5 w-5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">{chat.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>

      <SidebarSeparator className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:my-2 group-data-[collapsible=icon]:w-5/6" />

      <SidebarContent className="flex-grow p-0">
        <div className="px-2 pt-0 pb-1">
          <SidebarGroup>
             <div className="px-2 pt-2 pb-1 text-xs font-normal tracking-wider text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                RECENT
             </div>
            <SidebarMenu>
                {historyItems.map((item) => (
                <SidebarMenuItem key={item.id} className="group/item">
                    <SidebarMenuButton
                        className="font-normal text-sm h-auto py-1.5 px-2 w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0"
                        variant="ghost"
                        tooltip={sidebarState === 'collapsed' ? item.title : undefined}
                        // If history items were to load chats and close panel:
                        // onClick={isMobile ? () => setOpenMobile(false) : () => { /* load chat */ if(useSidebar().open) useSidebar().setOpen(false); }}
                    >
                      <span className="truncate group-data-[collapsible=icon]:hidden flex-grow">{item.title}</span>
                      <span className="hidden group-data-[collapsible=icon]:inline-block text-xs">
                          {item.title.substring(0,2).toUpperCase()}
                      </span>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 group-data-[collapsible=icon]:hidden text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent SidebarMenuButton click
                        handleDeleteItem(item.id, item.title);
                      }}
                      aria-label={`Delete chat: ${item.title}`}
                      tooltip={sidebarState === 'collapsed' ? `Delete: ${item.title}` : undefined}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

