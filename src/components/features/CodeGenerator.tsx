
"use client";

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { invokeChat, type ChatInput } from '@/ai/flows/generate-bedrock-addon-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, AlertTriangle, Bot, PlusCircle, Image as ImageIcon, Mic, Sparkles, ThumbsUp, ThumbsDown, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChatMessageContent } from './ChatMessageContent';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageDataUri?: string;
}

const promptSuggestions = [
  "Create a flying pig",
  "Explain behavior packs",
  "How to add custom sounds?",
  "Generate a simple sword item",
];

const DEFAULT_USER_NAME_FALLBACK = "User";
const DEFAULT_AVATAR_FALLBACK = ""; // Or a placeholder URL

interface ChatInterfaceProps {
  resetKey?: number;
}

const CHAT_AREA_MAX_WIDTH_CLASSES = "md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-screen-xl";

export function ChatInterface({ resetKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [userAvatar, setUserAvatar] = useState<string>(DEFAULT_AVATAR_FALLBACK);
  const [userName, setUserName] = useState<string>(DEFAULT_USER_NAME_FALLBACK);

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

      const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
      const storedName = localStorage.getItem('bedrockAIUserName');
      setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
      setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
      
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
      clearImageSelection();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bedrockAIChatMessages');
        const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
        const storedName = localStorage.getItem('bedrockAIUserName');
        setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
        setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
      }
    }
  }, [resetKey]);

  const handleSuggestionClick = (suggestion: string) => {
    setShowWelcome(false);
    handleSubmit(suggestion);
    inputRef.current?.focus();
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const clearImageSelection = () => {
    setImagePreview(null);
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (eventOrMessage?: FormEvent<HTMLFormElement> | string) => {
    let currentMessageText = '';
    if (typeof eventOrMessage === 'string') {
      currentMessageText = eventOrMessage;
    } else {
      eventOrMessage?.preventDefault();
      currentMessageText = inputValue;
    }

    if (!currentMessageText.trim() && !imageFile) return;
    if (showWelcome) setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessageText,
      ...(imagePreview && { imageDataUri: imagePreview }),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (typeof eventOrMessage !== 'string') {
      setInputValue('');
    }
    setIsLoading(true);
    setError(null);
    const currentImagePreview = imagePreview;
    clearImageSelection();

    try {
      const historyForAI = messages
        .filter(msg => msg.id !== userMessage.id) 
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
      }));

      const input: ChatInput = {
        history: historyForAI,
        message: userMessage.content,
        ...(currentImagePreview && { imageDataUri: currentImagePreview }),
      };
      
      const responseStream = await invokeChat(input);
      const reader = responseStream.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      const aiMessageId = (Date.now() + 1).toString();

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: aiMessageId, role: 'model', content: '' }, 
      ]);
      setIsLoading(false); 

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        streamedContent += chunkText;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: streamedContent } : msg
          )
        );
      }

    } catch (e) {
      setIsLoading(false);
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
    }
  };
  
  const handleFeedback = (feedbackType: 'positive' | 'negative', messageId: string) => {
    toast({
      title: "Feedback Received",
      description: `Thank you for your ${feedbackType} feedback on message ${messageId}!`,
    });
  };

  const inputBarHeight = "pb-[72px]";
  const inputBarHeightWithPreview = "pb-[152px]";
  const errorBottomOffset = parseInt((imagePreview ? inputBarHeightWithPreview : inputBarHeight).replace('pb-[','').replace('px]',''));


  return (
    <div className={cn("flex flex-col h-full flex-grow w-full mx-auto", CHAT_AREA_MAX_WIDTH_CLASSES, imagePreview ? inputBarHeightWithPreview : inputBarHeight)}>
      {showWelcome && messages.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #7c3aed, #db2777)' }}
            >
              Hello!
            </span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-12">How can I help you with Minecraft Bedrock addons today?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
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
         <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow overflow-hidden md:bg-card md:my-4 md:rounded-xl md:border md:border-border">
                <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
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
        <div className={cn("p-4 fixed left-1/2 transform -translate-x-1/2 w-full z-10", CHAT_AREA_MAX_WIDTH_CLASSES)} style={{ bottom: `${errorBottomOffset}px` }}>
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background z-10 md:border-t md:border-border">
        <div className={cn("w-full mx-auto p-3 md:p-4", CHAT_AREA_MAX_WIDTH_CLASSES)}>
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

    

    