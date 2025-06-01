
"use client";

import { useState, type FormEvent, useRef, useEffect, useCallback } from 'react';
import { invokeChat, type ChatInput } from '@/ai/flows/generate-bedrock-addon-code';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatInterfacePC } from './ChatInterfacePC';
import { ChatInterfaceMobile } from './ChatInterfaceMobile';

// Keep Message interface and other constants here if they are shared or move to a types file
export interface Message {
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
const DEFAULT_AVATAR_FALLBACK = "";

interface ChatInterfaceContainerProps {
  resetKey?: number;
}

export function ChatInterface({ resetKey }: ChatInterfaceContainerProps) {
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

  const isMobile = useIsMobile();

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
      
      if (initialMessages.length > 0 && inputRef.current) {
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
    if (showWelcome && inputRef.current) {
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
      clearImageSelection(); // Uses the clearImageSelection from this scope
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bedrockAIChatMessages');
        const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
        const storedName = localStorage.getItem('bedrockAIUserName');
        setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
        setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
      }
    }
  }, [resetKey]); // Added clearImageSelection to dependencies if it were memoized, but it's fine here.

  const clearImageSelection = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, []);


  const handleSubmit = useCallback(async (eventOrMessage?: FormEvent<HTMLFormElement> | string) => {
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
    const currentImagePreview = imagePreview; // Capture before clearing
    
    // Clear image selection after capturing its current state for the message
    // but before the AI call, so UI updates promptly.
    // This was previously inside the ChatInterface component, now centralized here.
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
  }, [inputValue, imageFile, imagePreview, showWelcome, messages, toast, clearImageSelection]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (inputRef.current) inputRef.current.focus();
    setShowWelcome(false); // Ensure welcome screen is hidden
    handleSubmit(suggestion);
  }, [handleSubmit]); // Add inputRef to dependencies if its focus changes

  const handleImageButtonClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handleFeedback = useCallback((feedbackType: 'positive' | 'negative', messageId: string) => {
    toast({
      title: "Feedback Received",
      description: `Thank you for your ${feedbackType} feedback on message ${messageId}!`,
    });
  }, [toast]);

  if (isMobile === undefined) {
    // Optional: Render a loading spinner or null while determining client type
    return <div className="flex-grow flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const displayProps = {
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
    setMessages, 
    handleSubmit,
    handleSuggestionClick,
    handleImageButtonClick,
    handleImageChange,
    clearImageSelection,
    handleFeedback,
    promptSuggestions,
    setIsLoading, // Pass down if child needs to manipulate it directly (e.g. cancelling a stream)
    setError, // Same as above
    setShowWelcome, // For suggestion click inside child
  };

  return isMobile ? <ChatInterfaceMobile {...displayProps} /> : <ChatInterfacePC {...displayProps} />;
}

// Loader2 icon import needed for the loading state above
import { Loader2 } from 'lucide-react';
