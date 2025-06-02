
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Highlight, themes, type Language } from 'prism-react-renderer';

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

  const defaultLanguage: Language = 'plaintext';
  const currentLanguage = (language?.toLowerCase() || defaultLanguage) as Language;

  return (
    <div className="my-3 bg-popover rounded-lg shadow-sm overflow-hidden text-sm">
      <Highlight
        theme={themes.vsDark}
        code={code.trimEnd()} // Trim trailing newlines for cleaner rendering
        language={currentLanguage}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(highlightClassName, "p-4 overflow-x-auto font-code")}
            style={style} // Apply theme styles
          >
            {tokens.map((line, i) => {
              const {key: lineKey, ...restLineProps} = getLineProps({ line, key: i });
              return (
                <div key={lineKey} {...restLineProps}>
                  {line.map((token, key) => {
                    const {key: tokenKey, ...restTokenProps} = getTokenProps({ token, key });
                     return <span key={tokenKey} {...restTokenProps} />
                  }
                  )}
                </div>
              )
            })}
          </pre>
        )}
      </Highlight>
      <div className="flex items-center justify-between px-4 py-2 border-t border-background/20 bg-popover">
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
          {language?.toUpperCase() || 'TEXT'}
        </span>
      </div>
    </div>
  );
};
