"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Code2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExampleAddon {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  sourceCodeUrl: string; 
  downloadUrl?: string;
}

const mockExamples: ExampleAddon[] = [
  { id: '1', title: 'Custom Lucky Block', description: 'A block that drops random items or triggers events when broken.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'minecraft lucky block', sourceCodeUrl: '#', downloadUrl: '#' },
  { id: '2', title: 'Rideable Dragon Mount', description: 'Adds a tamable dragon that players can ride.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'minecraft dragon ride', sourceCodeUrl: '#', downloadUrl: '#' },
  { id: '3', title: 'Advanced Farming Tools', description: 'New tools that help with large-scale farming, like a scythe or watering can.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'minecraft farming tools', sourceCodeUrl: '#'},
  { id: '4', title: 'More Furniture Pack', description: 'Adds a variety of chairs, tables, and other decorative furniture.', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'minecraft furniture decor', sourceCodeUrl: '#', downloadUrl: '#' },
];

export function ExamplesDisplay() {
  const { toast } = useToast();

  const handleViewCode = (example: ExampleAddon) => {
    toast({
      title: `Viewing code for ${example.title}`,
      description: `Opening source code... (Functionality not implemented)`,
    });
    // In a real app, this would navigate or open a modal: window.open(example.sourceCodeUrl, '_blank');
  };

  const handleDownload = (example: ExampleAddon) => {
    if (!example.downloadUrl) return;
    toast({
      title: `Downloading ${example.title}`,
      description: `Starting download... (Functionality not implemented)`,
    });
     // In a real app: window.location.href = example.downloadUrl;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" />
            Example Addons
          </CardTitle>
          <CardDescription>
            Explore these example addon packs to learn and get inspired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockExamples.length === 0 ? (
            <p className="text-center text-muted-foreground">No examples available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockExamples.map((example) => (
                <Card key={example.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <CardHeader>
                    <div className="relative w-full h-40 mb-4 rounded-t-md overflow-hidden">
                      <Image 
                        src={example.imageUrl} 
                        alt={example.title} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={example.imageHint}
                      />
                    </div>
                    <CardTitle className="font-headline text-lg">{example.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <Button variant="outline" size="sm" onClick={() => handleViewCode(example)} className="flex-grow">
                      <Code2 className="mr-2 h-4 w-4" /> View Code
                    </Button>
                    {example.downloadUrl && (
                      <Button variant="default" size="sm" onClick={() => handleDownload(example)} className="flex-grow">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
