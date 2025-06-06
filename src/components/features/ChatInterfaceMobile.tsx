
"use client";

import type { FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, AlertTriangle, Bot, PlusCircle, Image as ImageIcon, Mic, Sparkles, ThumbsUp, ThumbsDown, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessageContent } from './ChatMessageContent';
import type { Message } from './CodeGenerator';

// Props interface for Mobile specific chat display
interface ChatInterfaceMobileProps {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  error: string | null;
  showWelcome: boolean;
  imagePreview: string | null;
  imageFile: File | null;
  userAvatar: string;
  userName: string;

  inputRef: React.RefObject<HTMLInputElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  imageInputRef: React.RefObject<HTMLInputElement>;
  
  setInputValue: (value: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setShowWelcome: (value: boolean) => void;

  handleSubmit: (eventOrMessage?: FormEvent<HTMLFormElement> | string) => Promise<void>;
  handleSuggestionClick: (suggestion: string) => void; 
  handleImageButtonClick: () => void;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearImageSelection: () => void;
  handleFeedback: (feedbackType: 'positive' | 'negative', messageId: string) => void;
  
  promptSuggestions: string[];
}

// Mobile typically uses full width, so max-width classes are less restrictive or not applied at top level here.
const CHAT_AREA_MAX_WIDTH_CLASSES_MOBILE = "w-full";


export function ChatInterfaceMobile({
  messages,
  inputValue,
  isLoading,
  error,
  showWelcome,
  imagePreview,
  imageFile,
  userAvatar,
  userName,
  inputRef,
  scrollAreaRef,
  imageInputRef,
  setInputValue,
  // setMessages, // Not directly used by this component's JSX
  setShowWelcome,
  handleSubmit,
  // handleSuggestionClick, // Handled by parent
  handleImageButtonClick,
  handleImageChange,
  clearImageSelection,
  handleFeedback,
  promptSuggestions,
}: ChatInterfaceMobileProps) {

  const handleLocalSuggestionClick = (suggestion: string) => {
    setShowWelcome(false);
    handleSubmit(suggestion);
    if (inputRef.current) inputRef.current.focus();
  };
  
  const inputBarHeight = "pb-[72px]";
  const inputBarHeightWithPreview = "pb-[152px]";
  const errorBottomOffset = parseInt((imagePreview ? inputBarHeightWithPreview : inputBarHeight).replace('pb-[','').replace('px]',''));


  return (
    <div className={cn("flex flex-col h-full flex-grow mx-auto", CHAT_AREA_MAX_WIDTH_CLASSES_MOBILE, imagePreview ? inputBarHeightWithPreview : inputBarHeight)}>
      {showWelcome && messages.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-bold mb-3">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #7c3aed, #db2777)' }}
            >
              Hello!
            </span>
          </h1>
          <p className="text-muted-foreground text-base mb-8">How can I help you with Minecraft Bedrock addons today?</p>
          {/* Mobile specific: 1-column suggestions */}
          <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
            {promptSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                className="bg-secondary hover:bg-muted text-secondary-foreground text-left justify-start p-4 h-auto text-sm rounded-xl whitespace-normal"
                onClick={() => handleLocalSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!showWelcome && (
         <div className="flex-grow flex flex-col overflow-hidden">
            {/* Mobile specific styling: uses page background, no card */}
            <div className="flex-grow overflow-hidden"> {/* Potentially remove bg-card and my-4 for mobile */}
                <ScrollArea ref={scrollAreaRef} className="h-full p-4">
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
                            "prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent prose-code:text-sm",
                            message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-secondary text-secondary-foreground rounded-bl-none'
                        )}
                        >
                        {message.imageDataUri && (
                            <div className="my-2">
                            <Image
                                src={message.imageDataUri}
                                alt="Uploaded image"
                                width={200}
                                height={200}
                                className="rounded-md object-contain max-h-48"
                            />
                            </div>
                        )}
                        <ChatMessageContent content={message.content} />
                        </div>
                        {message.role === 'user' && (
                        <Avatar className="h-8 w-8 ml-3 mt-1 flex-shrink-0 border border-border">
                            <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="profile person" />
                            <AvatarFallback>{userName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                    {message.role === 'model' && message.content.length > 0 && ( 
                        <div className="flex items-center gap-1 mt-2 ml-11">
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
            </div>
         </div>
      )}

      {error && (
        <div className={cn("p-4 fixed left-1/2 transform -translate-x-1/2 w-full z-10", CHAT_AREA_MAX_WIDTH_CLASSES_MOBILE)} style={{ bottom: `${errorBottomOffset}px` }}>
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className={cn("fixed bottom-0 left-0 right-0 bg-background z-10")}>
        <div className={cn("w-full mx-auto p-3", CHAT_AREA_MAX_WIDTH_CLASSES_MOBILE)}>
          {imagePreview && (
            <div className="relative mb-2 w-20 h-20">
              <Image
                src={imagePreview}
                alt="Selected preview"
                fill 
                objectFit="cover"
                className="rounded-md border border-border"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80"
                onClick={clearImageSelection}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          {!showWelcome && messages.length > 0 && messages.length < 10 && !isLoading && !imagePreview && ( 
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
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" onClick={handleImageButtonClick}>
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
            {inputValue.trim() || isLoading || imageFile ? (
              <Button type="submit" disabled={isLoading || (!inputValue.trim() && !imageFile)} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8">
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

