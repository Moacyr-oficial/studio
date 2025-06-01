
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CodeBlockDisplayProps {
  code: string;
  language?: string;
}

export const CodeBlockDisplay: React.FC<CodeBlockDisplayProps> = ({ code, language }) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: 'Copied to clipboard!',
        description: 'The code has been copied.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy code to clipboard.',
      });
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    const filename = `bedrock_code.${language || 'txt'}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'Download Started',
      description: `Downloading ${filename}...`,
    });
  };

  const langClass = language ? `language-${language}` : 'language-plaintext';

  return (
    <div className="code-block-container relative group my-2">
      {/* The pre tag creates the visual "box" for the code block */}
      <pre className={cn(
        "p-3 rounded-md overflow-x-auto bg-muted/70 text-sm",
        langClass // Applies language-X for potential syntax highlighting by CSS/JS
      )}>
        <code className={cn(
          "font-code", // Ensures monospace font
          langClass
        )}>
          {code}
        </code>
      </pre>
      <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs bg-background/50 hover:bg-background/70 p-1"
          onClick={handleCopy}
          title="Copy code"
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs bg-background/50 hover:bg-background/70 p-1"
          onClick={handleDownload}
          title="Download code"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
