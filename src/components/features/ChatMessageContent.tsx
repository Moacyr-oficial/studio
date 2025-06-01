
"use client";

import React from 'react';
import { CodeBlockDisplay } from './CodeBlockDisplay';

interface ChatMessageContentProps {
  content: string;
}

// This regex aims to capture code blocks including those with no language specified
// or with languages containing characters like hyphen (e.g., "objective-c")
// ```lang\ncode``` or ```\ncode```
const parseMessageSegments = (rawContent: string): Array<{ type: 'text' | 'code'; lang?: string; value: string }> => {
  const segments: Array<{ type: 'text' | 'code'; lang?: string; value: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9\-_]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(rawContent)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: rawContent.substring(lastIndex, match.index) });
    }
    // Code block
    const lang = match[1] || undefined; // if language is empty string, treat as undefined
    let codeContent = match[2];
    
    // Trim trailing newline if it's the only thing on the last line of the code block
    // This prevents an extra empty line often added by LLMs inside the ```
    if (codeContent.endsWith('\n')) {
        codeContent = codeContent.substring(0, codeContent.length -1);
    }

    segments.push({ type: 'code', lang, value: codeContent });
    lastIndex = codeBlockRegex.lastIndex;
  }

  // Remaining text after last code block or if no code blocks
  if (lastIndex < rawContent.length) {
    segments.push({ type: 'text', value: rawContent.substring(lastIndex) });
  }
  
  // Handle cases where the entire content might be just a code block or just text
  // or empty content
  if (segments.length === 0) {
    if (rawContent.trim() === '') {
      // If content is truly empty or only whitespace
      segments.push({ type: 'text', value: rawContent });
    } else if (!rawContent.includes('```')) {
      // If no code blocks were found, the whole thing is text
      segments.push({ type: 'text', value: rawContent });
    }
    // If it was supposed to be a code block but regex failed, it will be treated as text.
    // This is a fallback. More robust parsing might be needed for malformed inputs.
  }


  return segments;
};

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content }) => {
  const segments = parseMessageSegments(content);

  if (segments.length === 0 || (segments.length === 1 && segments[0].type === 'text' && segments[0].value.trim() === '')) {
    return <div className="whitespace-pre-wrap"></div>; // Render empty div for effectively empty content
  }

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'code') {
          return <CodeBlockDisplay key={index} code={segment.value} language={segment.lang} />;
        } else {
          // For text segments, handle newlines by rendering each line.
          // Using whitespace-pre-wrap on a parent or here ensures newlines are respected.
          return (
            <span key={index} className="whitespace-pre-wrap">
              {segment.value}
            </span>
          );
        }
      })}
    </>
  );
};

