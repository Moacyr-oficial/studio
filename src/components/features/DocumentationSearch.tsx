"use client";

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, ExternalLink } from 'lucide-react';

interface DocResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
}

const mockResults: DocResult[] = [
  { id: '1', title: 'Introduction to Behavior Packs', snippet: 'Learn the basics of creating behavior packs for custom entities, items, and more...', url: '#' },
  { id: '2', title: 'Entity JSON Structure', snippet: 'Understand the JSON schema for defining custom entity behaviors and components.', url: '#' },
  { id: '3', title: 'Scripting API Overview', snippet: 'Explore the GameTest Framework and other scripting capabilities available for Bedrock Edition.', url: '#' },
  { id: '4', title: 'Creating Custom Blocks', snippet: 'A guide to defining new blocks with unique properties and appearances.', url: '#'},
];

export function DocumentationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DocResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    // Mock search logic
    const filteredResults = mockResults.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.snippet.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Documentation Explorer
          </CardTitle>
          <CardDescription>
            Search for Minecraft Bedrock Edition addon documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="e.g., custom entities, scripting API..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow text-sm"
              aria-label="Search documentation"
            />
            <Button type="submit" variant="default" size="icon" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && searchResults.length === 0 && (
        <p className="text-center text-muted-foreground">No results found for "{searchTerm}". Try a different query.</p>
      )}

      {searchResults.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {searchResults.map((doc) => (
            <Card key={doc.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="font-headline text-lg">{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{doc.snippet}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="p-0 h-auto text-primary">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    Read more <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {!hasSearched && (
         <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">Enter a search term to find documentation.</p>
          </div>
      )}
    </div>
  );
}
