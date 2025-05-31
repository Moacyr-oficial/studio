import { MinecraftIcon } from '@/components/icons/MinecraftIcon';

export function Header() {
  return (
    <header className="py-4 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex items-center gap-3">
        <MinecraftIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold tracking-tight">
          bedrock <span className="text-primary">aí</span>
        </h1>
      </div>
    </header>
  );
}
