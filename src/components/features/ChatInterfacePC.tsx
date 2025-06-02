
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
import { useSidebar } from '@/components/ui/sidebar';

interface ChatInterfacePCProps {
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
  setShowWelcome: (value: boolean) => void;

  handleSubmit: (eventOrMessage?: FormEvent<HTMLFormElement> | string) => Promise<void>;
  handleSuggestionClick: (suggestion: string) => void;
  handleImageButtonClick: () => void;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearImageSelection: () => void;
  handleFeedback: (feedbackType: 'positive' | 'negative', messageId: string) => void;

  promptSuggestions: string[];
}

const CHAT_AREA_MAX_WIDTH_CLASSES_PC = "md:max-w-screen-xl xl:max-w-screen-2xl";

export function ChatInterfacePC({
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
  setShowWelcome,
  handleSubmit,
  handleSuggestionClick,
  handleImageButtonClick,
  handleImageChange,
  clearImageSelection,
  handleFeedback,
  promptSuggestions,
}: ChatInterfacePCProps) {
  const { state: sidebarState, isMobile } = useSidebar();

  const inputBarContainerHeight = imagePreview ? "pb-[152px]" : "pb-[90px]";
  const errorBottomOffset = imagePreview ? 152 : 90;

  const fixedElementLeftOffsetClass = isMobile
    ? "left-0"
    : sidebarState === 'expanded'
    ? "left-[var(--sidebar-width)]"
    : "left-[var(--sidebar-width-icon)]";

  return (
    <div className={cn(
      "flex flex-col h-full flex-grow w-full mx-auto bg-transparent", // Ensure background is transparent
      inputBarContainerHeight
    )}>
      {showWelcome && messages.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 text-center">
          <div className="flex-grow flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 md:mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--primary)), #db2777, hsl(var(--primary)), #f97316, hsl(var(--primary)), #db2777, hsl(var(--primary)), hsl(var(--muted-foreground)))' }}
              >
                Hello, {userName || 'Developer'}!
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-12">How can I help you with Minecraft Bedrock addons today?</p>
          </div>
        </div>
      )}

      {!showWelcome && (
         <div className="flex-grow flex flex-col overflow-hidden bg-transparent"> {/* Ensure background is transparent */}
            <div className="flex-grow overflow-hidden my-0 rounded-none border-none bg-transparent">
                <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
                {messages.map((message) => (
                    <div key={message.id} className="mb-6 max-w-3xl mx-auto">
                    <div
                        className={cn(
                        "flex w-full items-start",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'model' && <Bot className="h-8 w-8 mr-3 mt-1 text-primary flex-shrink-0" />}
                        <div
                        className={cn(
                            "max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed",
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
                                data-ai-hint="user upload"
                            />
                            </div>
                        )}
                        <ChatMessageContent content={message.content} />
                        </div>
                        {message.role === 'user' && (
                        <Avatar className="h-8 w-8 ml-3 mt-1 flex-shrink-0 border border-border">
                            <AvatarImage src={userAvatar || undefined} alt={userName} data-ai-hint="profile person"/>
                            <AvatarFallback>{userName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                    {message.role === 'model' && message.content.length > 0 &&  (
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
                    <div className="flex justify-start items-start mt-6 max-w-3xl mx-auto">
                        <Bot className="h-8 w-8 mr-3 mt-1 text-primary flex-shrink-0" />
                        <div className="max-w-[85%] p-3.5 rounded-2xl shadow-sm bg-secondary text-secondary-foreground rounded-bl-none flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Thinking...
                        </div>
                    </div>
                    )}
                </ScrollArea>
            </div>
         </div>
      )}

      {error && (
        <div
            className={cn(
                "p-4 fixed right-0 transform w-auto z-20",
                fixedElementLeftOffsetClass,
                CHAT_AREA_MAX_WIDTH_CLASSES_PC, // Ensure this also respects the overall max width
                "mx-auto" // Center it within the available offset space
            )}
            style={{ bottom: `${errorBottomOffset}px` }}
        >
          <div className="max-w-3xl mx-auto"> {/* Inner container for alert content max-width */}
            <Alert variant="destructive" className="shadow-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      <div className={cn(
        "fixed bottom-0 right-0 bg-transparent z-10", // Ensure background is transparent
        fixedElementLeftOffsetClass
      )}>
        <div className={cn(
            "w-full p-4 pt-2",
            CHAT_AREA_MAX_WIDTH_CLASSES_PC,
            "mx-auto"
        )}>
          {showWelcome && messages.length === 0 && (
            <div className="flex flex-row gap-2 justify-center mb-3 overflow-x-auto no-scrollbar pb-1 md:max-w-3xl lg:max-w-4xl mx-auto">
              {promptSuggestions.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="bg-secondary/80 hover:bg-secondary text-secondary-foreground border-border rounded-lg text-xs whitespace-nowrap px-3 py-1.5 h-auto"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {imagePreview && (
            <div className="relative mb-2 w-20 h-20 ml-2">
              <Image
                src={imagePreview}
                alt="Selected preview"
                fill
                objectFit="cover"
                className="rounded-md border border-border"
                data-ai-hint="image preview"
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

          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-secondary p-2 rounded-xl shadow-lg max-w-3xl mx-auto">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
              <PlusCircle className="h-5 w-5" />
            </Button>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" onClick={handleImageButtonClick}>
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask bedrock aí..."
              className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground h-9 px-2"
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
            {inputValue.trim() || isLoading || imageFile ? (
              <Button type="submit" disabled={isLoading || (!inputValue.trim() && !imageFile)} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9">
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
