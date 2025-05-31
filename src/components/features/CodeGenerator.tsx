"use client";

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { invokeChat, type ChatInput } from '@/ai/flows/generate-bedrock-addon-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle, Bot, PlusCircle, Image as ImageIcon, Mic, Sparkles, UserCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const promptSuggestions = [
  "Create a flying pig",
  "Explain behavior packs",
  "How to add custom sounds?",
  "Generate a simple sword item",
];

export function ChatInterface() { // Renamed from CodeGenerator to ChatInterface
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };
  
  const handleSubmit = async (event?: FormEvent<HTMLFormElement> | string) => {
    if (typeof event !== 'string') {
      event?.preventDefault();
    }
    
    const currentMessage = typeof event === 'string' ? event : inputValue;

    if (!currentMessage.trim()) return;
    if (showWelcome) setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    if (typeof event !== 'string') setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(msg => ({ // Use current messages array before adding userMessage for history
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
    <div className="flex flex-col h-full flex-grow w-full max-w-3xl mx-auto pb-[88px]"> {/* Added pb for input bar */}
      {showWelcome && messages.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #7c3aed, #db2777)' }}
            >
              Hello!
            </span>
          </h1>
          <p className="text-muted-foreground text-lg mb-12">How can I help you with Minecraft Bedrock addons today?</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {promptSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                className="bg-secondary hover:bg-muted text-left justify-start p-4 h-auto text-sm rounded-xl border-muted"
                onClick={() => {
                  setShowWelcome(false);
                  handleSubmit(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!showWelcome && (
         <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 md:p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full items-start",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && <Bot className="h-8 w-8 mr-3 mt-1 text-primary flex-shrink-0" />}
              <div
                className={cn(
                  "max-w-[80%] p-3.5 rounded-2xl shadow-sm whitespace-pre-wrap text-sm leading-relaxed",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary text-secondary-foreground rounded-bl-none',
                   "prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-pre:bg-muted/50 prose-pre:p-3 prose-pre:rounded-md"
                )}
                dangerouslySetInnerHTML={{ __html: message.content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
                  const languageClass = lang ? `language-${lang}` : '';
                  return `<pre class="${languageClass}"><code class="${languageClass}">${code.trim()}</code></pre>`;
                }).replace(/\n/g, '<br />') }}
              />
              {message.role === 'user' && <UserCircle className="h-8 w-8 ml-3 mt-1 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
           {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex justify-start items-start">
                <Bot className="h-8 w-8 mr-3 mt-1 text-primary flex-shrink-0" />
                <div className="max-w-[80%] p-3.5 rounded-2xl shadow-sm bg-secondary text-secondary-foreground rounded-bl-none flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Thinking...
                </div>
            </div>
            )}
        </ScrollArea>
      )}


      {error && (
        <div className="p-4 fixed bottom-[88px] left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-10">
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-muted z-10">
        <div className="max-w-3xl mx-auto p-3 md:p-4">
          {!showWelcome && messages.length > 0 && messages.length < 3 && ( // Show suggestions only if chat started and not too long
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
              {promptSuggestions.slice(0,2).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="bg-secondary hover:bg-muted text-xs whitespace-nowrap rounded-full border-muted px-3 py-1 h-auto"
                  onClick={() => {
                     handleSubmit(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-secondary p-2 rounded-xl shadow-sm">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask bedrock aí..."
              className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground h-9 px-2"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
              <Mic className="h-5 w-5" />
            </Button>
            {inputValue.trim() || isLoading ? (
              <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
                <Sparkles className="h-5 w-5" />
              </Button>
            )}
          </form>
        </div>
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
    </div>
  );
}
