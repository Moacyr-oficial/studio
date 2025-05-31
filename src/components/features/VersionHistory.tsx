"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Eye, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Version {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  codeSnippet: string;
}

const mockVersions: Version[] = [
  { id: '3', name: 'v0.3 - Super Creeper', timestamp: '2023-10-28 10:00 AM', description: 'Added exploding creepers with custom particle effects.', codeSnippet: '{\n  "format_version": "1.16.0",\n  "minecraft:entity": {\n    "description": {\n      "identifier": "custom:super_creeper",\n ...' },
  { id: '2', name: 'v0.2 - Flying Pig', timestamp: '2023-10-27 03:15 PM', description: 'Implemented a pig that can fly.', codeSnippet: '{\n  "format_version": "1.16.0",\n  "minecraft:entity": {\n    "description": {\n      "identifier": "custom:flying_pig",\n ...' },
  { id: '1', name: 'v0.1 - Initial Addon', timestamp: '2023-10-26 09:00 AM', description: 'Basic structure for a custom item.', codeSnippet: '{\n  "format_version": "1.16.0",\n  "minecraft:item": {\n    "description": {\n      "identifier": "custom:my_item"\n ...' },
];

export function VersionHistory() {
  const { toast } = useToast();

  const handleView = (version: Version) => {
    toast({
      title: `Viewing ${version.name}`,
      description: `Displaying code for version created on ${version.timestamp}. (Functionality not implemented)`,
    });
  };

  const handleRevert = (version: Version) => {
     toast({
      title: `Reverting to ${version.name}`,
      description: `Attempting to revert to version from ${version.timestamp}. (Functionality not implemented)`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <History className="mr-2 h-6 w-6 text-primary" />
            Version History
          </CardTitle>
          <CardDescription>
            Review and revert to previous versions of your generated addons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockVersions.length === 0 ? (
            <p className="text-center text-muted-foreground">No versions saved yet.</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {mockVersions.map((version) => (
                  <Card key={version.id} className="shadow-md">
                    <CardHeader>
                      <CardTitle className="font-headline text-lg">{version.name}</CardTitle>
                      <CardDescription>Saved on: {version.timestamp}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{version.description}</p>
                      <details>
                        <summary className="text-xs text-primary cursor-pointer hover:underline">Show code snippet</summary>
                        <pre className="mt-2 p-2 bg-muted/50 rounded-md text-xs font-code overflow-x-auto">
                          <code>{version.codeSnippet}</code>
                        </pre>
                      </details>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(version)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleRevert(version)}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Revert to this version
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
