
"use client";

import React from 'react';
import { CodeBlockDisplay } from './CodeBlockDisplay';

interface ChatMessageContentProps {
  content: string;
}

const parseMessageSegments = (rawContent: string): Array<{ type: 'text' | 'code'; lang?: string; value: string }> => {
  const segments: Array<{ type: 'text' | 'code'; lang?: string; value: string }> = [];
  // Regex to find code blocks and capture language and content
  // It handles optional language tags.
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(rawContent)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: rawContent.substring(lastIndex, match.index) });
    }
    // Code block
    const lang = match[1] || undefined; // if language is empty string, treat as undefined
    const codeContent = match[2]; // Content between ```
    segments.push({ type: 'code', lang, value: codeContent.trimEnd() }); // Trim trailing newline from capture
    lastIndex = codeBlockRegex.lastIndex;
  }

  // Remaining text after last code block or if no code blocks
  if (lastIndex < rawContent.length) {
    segments.push({ type: 'text', value: rawContent.substring(lastIndex) });
  }
  
  // If content is empty or only whitespace, return empty array or a single text segment
  if (segments.length === 0 && rawContent.trim() === '') {
      segments.push({ type: 'text', value: rawContent });
  } else if (segments.length === 0 && rawContent) {
      segments.push({ type: 'text', value: rawContent });
  }


  return segments;
};

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content }) => {
  const segments = parseMessageSegments(content);

  if (segments.length === 0) {
    return <div className="whitespace-pre-wrap"></div>; // Render empty div for empty content
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
