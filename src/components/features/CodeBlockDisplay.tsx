
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

  const langClass = language ? `language-${language.toLowerCase()}` : 'language-text';

  return (
    <div className="my-3 bg-popover rounded-lg shadow-sm overflow-hidden">
      {/* Code display area */}
      <div className="p-4 overflow-x-auto text-sm">
        <pre className={cn("bg-transparent p-0 font-code whitespace-pre text-popover-foreground", langClass)}>
          <code className={langClass}>
            {code}
          </code>
        </pre>
      </div>
      {/* Footer area */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-background/20 bg-popover"> {/* Footer shares popover bg or can be slightly different */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-popover-foreground/70 hover:text-popover-foreground hover:bg-background/10"
            onClick={handleCopy}
            title="Copy code"
          >
            <ClipboardCopy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-popover-foreground/70 hover:text-popover-foreground hover:bg-background/10"
            onClick={handleDownload}
            title="Download code"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-xs text-popover-foreground/60">
          Use code with caution.
        </span>
        <span className="text-xs font-medium text-popover-foreground/70 uppercase">
          {language || 'TEXT'}
        </span>
      </div>
    </div>
  );
};
