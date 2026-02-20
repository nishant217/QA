import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
  isLatest?: boolean;
}

// Simple markdown-like formatting
const formatMessage = (content: string) => {
  // Split by lines to handle different formatting
  const lines = content.split('\n');
  const formattedLines: React.ReactNode[] = [];
  
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        formattedLines.push(
          <pre key={`code-${i}`} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 my-2 overflow-x-auto">
            <code className="text-sm font-mono text-[var(--text-primary)]">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Handle list items
    if (line.trim().match(/^[-*•]\s/)) {
      listItems.push(line.trim().substring(2));
      continue;
    } else if (listItems.length > 0) {
      // End of list, add it
      formattedLines.push(
        <ul key={`list-${i}`} className="list-disc list-inside space-y-1 my-2 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[var(--text-primary)]">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    
    // Handle numbered lists
    if (line.trim().match(/^\d+\.\s/)) {
      const match = line.match(/^\d+\.\s(.+)/);
      if (match) {
        listItems.push(match[1]);
        continue;
      }
    } else if (listItems.length > 0) {
      // End numbered list
      formattedLines.push(
        <ol key={`numlist-${i}`} className="list-decimal list-inside space-y-1 my-2 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[var(--text-primary)]">
              {formatInlineText(item)}
            </li>
          ))}
        </ol>
      );
      listItems = [];
    }
    
    // Handle headings
    if (line.startsWith('### ')) {
      formattedLines.push(
        <h3 key={`h3-${i}`} className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
      continue;
    }
    
    if (line.startsWith('## ')) {
      formattedLines.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold text-[var(--text-primary)] mt-4 mb-3">
          {line.substring(3)}
        </h2>
      );
      continue;
    }
    
    if (line.startsWith('# ')) {
      formattedLines.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold text-[var(--text-primary)] mt-4 mb-3">
          {line.substring(2)}
        </h1>
      );
      continue;
    }
    
    // Regular paragraphs
    if (line.trim() === '') {
      formattedLines.push(<br key={`br-${i}`} />);
    } else {
      formattedLines.push(
        <p key={`p-${i}`} className="text-[var(--text-primary)] leading-relaxed mb-2">
          {formatInlineText(line)}
        </p>
      );
    }
  }
  
  // Handle remaining list items
  if (listItems.length > 0) {
    formattedLines.push(
      <ul key="final-list" className="list-disc list-inside space-y-1 my-2 ml-4">
        {listItems.map((item, idx) => (
          <li key={idx} className="text-[var(--text-primary)]">
            {formatInlineText(item)}
          </li>
        ))}
      </ul>
    );
  }
  
  return formattedLines;
};

// Format inline text (bold, italic, code, etc.)
const formatInlineText = (text: string): React.ReactNode => {
  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-[var(--bg-surface)] px-1.5 py-0.5 rounded text-sm font-mono border border-[var(--border)]">$1</code>');
  
  // Handle bold text
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>');
  
  // Handle italic text
  text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-[var(--text-primary)]">$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em class="italic text-[var(--text-primary)]">$1</em>');
  
  // Handle currency symbols
  text = text.replace(/₹([\d,]+(?:\.\d{2})?)/g, '<span class="font-mono text-[var(--accent)] font-medium">₹$1</span>');
  text = text.replace(/\$([\d,]+(?:\.\d{2})?)/g, '<span class="font-mono text-[var(--accent)] font-medium">$$$1</span>');
  
  // Handle percentages
  text = text.replace(/([\d.]+)%/g, '<span class="font-mono text-green-500 font-medium">$1%</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={isLatest ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-[var(--accent)] text-white' 
          : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`group relative max-w-[85%] ${
          isUser 
            ? 'bg-[var(--accent)] text-white rounded-2xl rounded-tr-md' 
            : 'bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl rounded-tl-md'
        } p-4 shadow-sm`}>
          {/* Message Header */}
          <div className={`flex items-center justify-between mb-2 ${isUser ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
            <span className="text-xs font-medium">
              {isUser ? 'You' : 'NyneOS AI'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {!isUser && (
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-hover)] rounded"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Message Content */}
          <div className={`prose prose-sm max-w-none ${
            isUser 
              ? 'text-white [&_strong]:text-white [&_em]:text-white/90' 
              : 'text-[var(--text-primary)]'
          }`}>
            {isUser ? (
              <p className="leading-relaxed">{message.content}</p>
            ) : (
              <div className="space-y-1">
                {formatMessage(message.content)}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ChatMessage;