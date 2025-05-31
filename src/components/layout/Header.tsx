import { UserCircle, Code } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="py-3 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
      <div className="container mx-auto flex items-center justify-between max-w-3xl">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
            <Code className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="text-xl font-headline font-semibold tracking-tight">
            bedrock <span className="text-primary">aí</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <UserCircle className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
        </div>
      </div>
    </header>
  );
}
