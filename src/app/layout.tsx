
"use client"; // Required for useState and useEffect

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Code } from 'lucide-react'; // Import the Code icon

// Metadata is typically defined outside the component in Next.js 13+ App Router
// However, since we need client components for loading state, we keep it simple.
// For server-side metadata, it would usually be:
// export const metadata: Metadata = { ... }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading time or simply set to false after mount
    // For a real app, you might wait for certain data or scripts
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 500); // Adjust delay as needed, or remove if loading is instant after mount
    return () => clearTimeout(timer);
  }, []);

  // It's better to define metadata at the top level for static export or if not using client hooks directly influencing it.
  // If dynamic titles are needed based on client state, document.title in useEffect is an option.
  // For this exercise, we'll keep the static metadata approach separate conceptually.
  // You can create a separate component for dynamic metadata if needed.

  return (
    <html lang="en" className="dark">
      <head>
        <title>bedrock aí</title>
        <meta name="description" content="Generate Minecraft Bedrock Edition addons with AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        {isAppLoading ? (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
            <Code className="h-16 w-16 text-primary animate-pulse" />
            <p className="mt-4 text-lg text-muted-foreground">Loading bedrock aí...</p>
          </div>
        ) : (
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}

// If you want to ensure metadata is handled optimally, especially for SEO:
// export const metadata: Metadata = {
// title: 'bedrock aí',
// description: 'Generate Minecraft Bedrock Edition addons with AI',
// };
// And then manage any dynamic title changes via useEffect in specific pages or a utility.
// However, placing <title> and <meta> directly in <head> within a client component layout works for basic cases.
