
"use client"; 

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Code } from 'lucide-react'; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <head>
        <title>Bedrock aí</title>
        <meta name="description" content="Generate Minecraft Bedrock Edition addons with AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground overscroll-none">
        {isAppLoading ? (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
            <Code className="h-16 w-16 text-primary animate-pulse" />
          </div>
        ) : (
          <SidebarProvider defaultOpen={true}> {/* Sidebar open by default on PC */}
            {children}
            <Toaster />
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}
