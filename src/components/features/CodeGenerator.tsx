"use client";

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { invokeChat, type ChatInput } from '@/ai/flows/generate-bedrock-addon-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function CodeGenerator() { // Filename kept as CodeGenerator, but functionality is ChatBot
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'model', content: 'Hello! How can I help you with Minecraft Bedrock addon development today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
      
      const input: ChatInput = { 
        history: history,
        message: userMessage.content 
      };
      const result = await invokeChat(input);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.response,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get response. ${errorMessage}`,
      });
       const aiErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      };
      setMessages((prevMessages) => [...prevMessages, aiErrorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Card className="shadow-lg w-full h-[calc(100vh-200px)] flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Bot className="mr-2 h-6 w-6 text-primary" />
          AI Chat Assistant
        </CardTitle>
        <CardDescription>
          Chat with the AI to generate Minecraft Bedrock addons, get explanations, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-grow p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] p-3 rounded-lg shadow whitespace-pre-wrap",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
           {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Thinking...
                </div>
            </div>
            )}
        </ScrollArea>

        {error && (
          <div className="p-4">
            <Alert variant="destructive" className="shadow-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow text-sm"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
