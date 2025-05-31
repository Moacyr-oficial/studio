"use client";

import { useState, type FormEvent } from 'react';
import { generateBedrockAddonCode, type GenerateBedrockAddonCodeInput } from '@/ai/flows/generate-bedrock-addon-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CodeGenerator() {
  const [description, setDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim()) {
      setError('Please enter a description for the addon.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCode('');

    try {
      const input: GenerateBedrockAddonCodeInput = { description };
      const result = await generateBedrockAddonCode(input);
      setGeneratedCode(result.code);
      toast({
        title: "Code Generated!",
        description: "The addon code has been successfully generated.",
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate code: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate code. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Wand2 className="mr-2 h-6 w-6 text-primary" />
            AI Addon Code Generator
          </CardTitle>
          <CardDescription>
            Describe the Minecraft Bedrock Edition addon you want to create, and our AI will generate the code for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="addon-description" className="text-base">Addon Description</Label>
              <Textarea
                id="addon-description"
                placeholder="e.g., A custom TNT block that explodes with a larger radius and blue particles."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] text-sm"
                rows={4}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-base py-3 px-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Code
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedCode && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedCode}
              readOnly
              className="min-h-[300px] font-code text-sm bg-muted/30"
              aria-label="Generated addon code"
            />
             <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  toast({ title: "Copied!", description: "Code copied to clipboard." });
                }}
              >
                Copy Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
