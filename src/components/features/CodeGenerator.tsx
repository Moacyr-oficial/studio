
"use client";

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { invokeChat, type ChatInput } from '@/ai/flows/generate-bedrock-addon-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, AlertTriangle, Bot, PlusCircle, Image as ImageIcon, Mic, Sparkles, UserCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChatMessageContent } from './ChatMessageContent';

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

interface ChatInterfaceProps {
  resetKey?: number; // Prop to trigger chat reset
}

export function ChatInterface({ resetKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem('bedrockAIChatMessages');
      let initialMessages: Message[] = [];
      if (storedMessages) {
        try {
          initialMessages = JSON.parse(storedMessages);
        } catch (e) {
          console.error("Failed to parse messages from localStorage", e);
          localStorage.removeItem('bedrockAIChatMessages');
        }
      }
      setMessages(initialMessages);
      setShowWelcome(initialMessages.length === 0);
      if (initialMessages.length > 0) {
         setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bedrockAIChatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (showWelcome) {
        inputRef.current?.focus();
    }
  }, [showWelcome]);

  useEffect(() => {
    if (resetKey !== undefined && resetKey > 0) {
      setMessages([]);
      setInputValue('');
      setIsLoading(false);
      setError(null);
      setShowWelcome(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bedrockAIChatMessages');
      }
    }
  }, [resetKey]);

  const handleSuggestionClick = (suggestion: string) => {
    setShowWelcome(false);
    handleSubmit(suggestion);
    inputRef.current?.focus();
  };

  const handleSubmit = async (eventOrMessage?: FormEvent<HTMLFormElement> | string) => {
    let currentMessage = '';
    if (typeof eventOrMessage === 'string') {
      currentMessage = eventOrMessage;
    } else {
      eventOrMessage?.preventDefault();
      currentMessage = inputValue;
    }

    if (!currentMessage.trim()) return;
    if (showWelcome) setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (typeof eventOrMessage !== 'string') {
      setInputValue('');
    }
    setIsLoading(true);
    setError(null);

    try {
      const historyForAI = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const input: ChatInput = {
        history: historyForAI.slice(0, -1), 
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
      if (typeof eventOrMessage !== 'string' || messages.length === 0) {
        inputRef.current?.focus();
      }
    }
  };
  
  const handleFeedback = (feedbackType: 'positive' | 'negative', messageId: string) => {
    toast({
      title: "Feedback Received",
      description: `Thank you for your ${feedbackType} feedback on message ${messageId}!`,
    });
    // Here you could add logic to send this feedback to a server
  };

  const inputBarHeight = "pb-[72px]";

  return (
    <div className={cn("flex flex-col h-full flex-grow w-full max-w-3xl mx-auto", inputBarHeight)}>
      {showWelcome && messages.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 sm:mb-4">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #7c3aed, #db2777)' }}
            >
              Hello!
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-12">How can I help you with Minecraft Bedrock addons today?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            {promptSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                className="bg-secondary hover:bg-muted text-secondary-foreground text-left justify-start p-4 h-auto text-sm rounded-xl whitespace-normal"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!showWelcome && (
         <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 md:p-6">
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              <div
                className={cn(
                  "flex w-full items-start",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && <Bot className="h-8 w-8 mr-3 mt-1 text-primary flex-shrink-0" />}
                <div
                  className={cn(
                    "max-w-[80%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed",
                    // Tailwind Typography prose classes for rich text formatting.
                    // prose-pre:p-0 and prose-pre:bg-transparent ensure that CodeBlockDisplay takes full control of pre formatting.
                    "prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent prose-code:text-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary text-secondary-foreground rounded-bl-none'
                  )}
                >
                  <ChatMessageContent content={message.content} />
                </div>
                {message.role === 'user' && <UserCircle className="h-8 w-8 ml-3 mt-1 text-muted-foreground flex-shrink-0" />}
              </div>
              {message.role === 'model' && (
                <div className="flex items-center gap-1 mt-2 ml-11"> {/* Aligns with Bot icon + margin */}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleFeedback('positive', message.id)}>
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleFeedback('negative', message.id)}>
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
           {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex justify-start items-start mt-6">
                <Bot className="h-8 w-8 mr-3 mt-1 text-primary flex-shrink-0" />
                <div className="max-w-[80%] p-3.5 rounded-2xl shadow-sm bg-secondary text-secondary-foreground rounded-bl-none flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Thinking...
                </div>
            </div>
            )}
        </ScrollArea>
      )}

      {error && (
        <div className={cn("p-4 fixed left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-10", `bottom-[${parseInt(inputBarHeight.replace('pb-[','').replace('px]',''))}px]` )}>
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background z-10">
        <div className="max-w-3xl mx-auto p-3 md:p-4">
          {!showWelcome && messages.length > 0 && messages.length < 10 && !isLoading && ( 
            <div className="flex gap-2 mt-6 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {promptSuggestions.filter(s => !messages.some(m => m.content === s)).slice(0,3).map((suggestion) => ( 
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
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-secondary p-1.5 rounded-xl shadow-sm">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask bedrock aí..."
              className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground h-8 px-2"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <Mic className="h-4 w-4" />
            </Button>
            {inputValue.trim() || isLoading ? (
              <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                <Sparkles className="h-4 w-4" />
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
