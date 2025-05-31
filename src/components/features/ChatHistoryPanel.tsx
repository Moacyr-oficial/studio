
"use client";

import { Button } from '@/components/ui/button';
import { PlusCircle, History, Settings2, LogOut } from 'lucide-react';
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
  // SidebarGroupContent, // Not used directly if SidebarMenu is inside SidebarGroup
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
// import { MinecraftIcon } from '@/components/icons/MinecraftIcon'; // Optional: if you want a logo

interface ChatHistoryPanelProps {
  onNewChat: () => void;
}

export function ChatHistoryPanel({ onNewChat }: ChatHistoryPanelProps) {
  const { setOpen, isMobile, setOpenMobile, state: sidebarState } = useSidebar();

  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      setOpenMobile(false);
    } else {
      // Optionally keep desktop sidebar open or close it:
      // setOpen(false); 
    }
  };

  const mockHistory = [
    {id: "1", title: "Create a flying pig"},
    {id: "2", title: "Explain behavior packs"},
    {id: "3", title: "How to add custom sounds?"},
    {id: "4", title: "Generate a simple sword item"},
  ];

  return (
    <Sidebar side="left" collapsible="icon" variant="sidebar" className="z-40"> {/* Removed border-r */}
      <SidebarHeader className="p-3 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
        {/* <MinecraftIcon className="h-7 w-7 text-primary group-data-[collapsible=icon]:hidden" /> */}
        <h2 className="font-headline text-lg font-semibold group-data-[collapsible=icon]:hidden">History</h2>
        {/* Tooltip might be needed for icon-only state */}
        <SidebarMenuButton 
            variant="ghost" 
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center" 
            onClick={handleNewChatClick}
            tooltip={sidebarState === 'collapsed' ? 'New Chat' : undefined}
        >
           <PlusCircle className="h-5 w-5 shrink-0" />
           <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarSeparator className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:my-2 group-data-[collapsible=icon]:w-5/6" />
      <SidebarContent className="p-0">
        <SidebarMenu className="px-2 py-2">
          <SidebarGroup>
             <SidebarGroupLabel className="flex items-center gap-2 px-2 text-xs uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
                {/* <History className="h-4 w-4" /> */}
                <span>Recent</span>
             </SidebarGroupLabel>
            {/* <SidebarGroupContent> */}
                {mockHistory.map((item) => (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                        className="font-normal text-sm h-auto py-1.5 px-2 justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0" 
                        variant="ghost"
                        tooltip={sidebarState === 'collapsed' ? item.title : undefined}
                        // onClick={() => { /* Future: load this chat */ }}
                    >
                    {/* Minimalist look, no icons per item or a very subtle one */}
                    <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    <span className="hidden group-data-[collapsible=icon]:inline">{item.title.substring(0,1)}</span>

                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            {/* </SidebarGroupContent> */}
          </SidebarGroup>
        </SidebarMenu>
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
