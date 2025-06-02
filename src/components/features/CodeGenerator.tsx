
"use client";

import { useState, type FormEvent, useRef, useEffect, useCallback } from 'react';
import { invokeChat, type ChatInput } from '@/ai/flows/generate-bedrock-addon-code';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatInterfacePC } from './ChatInterfacePC';
import { ChatInterfaceMobile } from './ChatInterfaceMobile';

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
  onChatStart?: (firstUserMessageContent: string) => void;
}

export function ChatInterface({ resetKey, onChatStart }: ChatInterfaceContainerProps) {
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

  const clearImageSelection = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, []);

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
      if (initialMessages.length > 0 && onChatStart && initialMessages.some(m => m.role === 'user')) {
        const firstUserMsg = initialMessages.find(m => m.role === 'user');
        if (firstUserMsg) {
            onChatStart(firstUserMsg.content);
        }
      }


      const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
      const storedName = localStorage.getItem('bedrockAIUserName');
      setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
      setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
      
      if (initialMessages.length > 0 && inputRef.current) {
         setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // onChatStart dependency removed to avoid issues with it changing on page.tsx re-renders

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
      clearImageSelection(); 
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bedrockAIChatMessages');
        const storedAvatar = localStorage.getItem('bedrockAIUserAvatar');
        const storedName = localStorage.getItem('bedrockAIUserName');
        setUserAvatar(storedAvatar || DEFAULT_AVATAR_FALLBACK);
        setUserName(storedName || DEFAULT_USER_NAME_FALLBACK);
      }
    }
  }, [resetKey, clearImageSelection]); 


  const handleSubmit = useCallback(async (eventOrMessage?: FormEvent<HTMLFormElement> | string) => {
    let currentMessageText = '';
    if (typeof eventOrMessage === 'string') {
      currentMessageText = eventOrMessage;
    } else {
      eventOrMessage?.preventDefault();
      currentMessageText = inputValue;
    }

    if (!currentMessageText.trim() && !imageFile) return;
    
    const isFirstUserMessageInSession = messages.filter(m => m.role === 'user').length === 0;

    if (showWelcome) setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessageText,
      ...(imagePreview && { imageDataUri: imagePreview }),
    };

    if (isFirstUserMessageInSession && onChatStart) {
      onChatStart(userMessage.content);
    }

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
  }, [inputValue, imageFile, imagePreview, showWelcome, messages, toast, clearImageSelection, onChatStart]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (inputRef.current) inputRef.current.focus();
    // setShowWelcome is handled by handleSubmit logic if showWelcome is true
    handleSubmit(suggestion);
  }, [handleSubmit]); 

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
    // setMessages, // Not directly passed; managed internally or via callbacks
    handleSubmit,
    handleSuggestionClick,
    handleImageButtonClick,
    handleImageChange,
    clearImageSelection,
    handleFeedback,
    promptSuggestions,
    setShowWelcome, // Passed to allow direct manipulation if needed by children
  };

  return isMobile ? <ChatInterfaceMobile {...displayProps} /> : <ChatInterfacePC {...displayProps} />;
}

// Loader2 icon import needed for the loading state above
import { Loader2 } from 'lucide-react';
