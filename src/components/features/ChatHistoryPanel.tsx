
"use client";

import { Button } from '@/components/ui/button';
import { PlusCircle, History, Settings2, LogOut, Rabbit, ToyBrick, MapIcon as Map } from 'lucide-react'; // Added Rabbit, ToyBrick, Map
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

interface ChatHistoryPanelProps {
  onNewChat: () => void;
}

export function ChatHistoryPanel({ onNewChat }: ChatHistoryPanelProps) {
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar();

  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const mockHistory = [
    {id: "1", title: "Create a flying pig"},
    {id: "2", title: "Explain behavior packs"},
    {id: "3", title: "How to add custom sounds?"},
    {id: "4", title: "Generate a simple sword item"},
  ];

  const specializedChats = [
    { id: "entity-gen", title: "Entity Generator", icon: Rabbit, action: handleNewChatClick },
    { id: "behavior-helper", title: "Behavior Pack Helper", icon: ToyBrick, action: handleNewChatClick },
    { id: "world-builder", title: "World Builder", icon: Map, action: handleNewChatClick },
  ];

  return (
    <Sidebar 
      side="left" 
      collapsible="icon" 
      variant="sidebar" 
      className="z-40 border-r-0 rounded-r-2xl" // Updated to rounded-r-2xl
    >
      <SidebarHeader className="p-3 text-center group-data-[collapsible=icon]:hidden">
        <h2 className="font-headline text-lg font-semibold">Conversation</h2> 
      </SidebarHeader>
      
      <div className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
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

      {/* Specialized Chat Options */}
      <div className="px-2 group-data-[collapsible=icon]:p-0">
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
        <div className="px-2 py-1">
          <SidebarGroup>
             <SidebarGroupLabel className="px-2 mb-1 text-xs uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
                RECENT
             </SidebarGroupLabel>
            <SidebarMenu>
                {mockHistory.map((item) => (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                        className="font-normal text-sm h-auto py-1.5 px-2 w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0" 
                        variant="ghost"
                        tooltip={sidebarState === 'collapsed' ? item.title : undefined}
                    >
                    <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    <span className="hidden group-data-[collapsible=icon]:inline-block text-xs">
                        {item.title.substring(0,2).toUpperCase()}
                    </span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
      
      <SidebarSeparator className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:my-2 group-data-[collapsible=icon]:w-5/6"/>
      
      <SidebarFooter className="p-2 flex flex-col gap-1">
         <SidebarMenuButton variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0" tooltip={sidebarState === 'collapsed' ? 'Settings' : undefined}>
            <Settings2 className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
        </SidebarMenuButton>
        <SidebarMenuButton variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0" tooltip={sidebarState === 'collapsed' ? 'Log out' : undefined}>
            <LogOut className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Log out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
