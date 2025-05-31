import { UserCircle, MessageSquare } from 'lucide-react';

export function Header() {
  return (
    <header className="py-3 px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-headline font-semibold tracking-tight">
            bedrock <span className="text-primary">aí</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Model selector placeholder */}
          {/* <span className="text-sm text-muted-foreground">2.5 Pro (preview)</span> */}
          <UserCircle className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
        </div>
      </div>
    </header>
  );
}
