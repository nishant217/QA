import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>
      
      {/* Typing Animation */}
      <div className="flex-1">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl rounded-tl-md p-4 shadow-sm max-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)]">NyneOS AI is typing</span>
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-[var(--accent)] rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-2 h-2 bg-[var(--accent)] rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0.3,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-2 h-2 bg-[var(--accent)] rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0.6,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
          
          {/* Subtle pulse effect on the message bubble */}
          <motion.div
            className="absolute inset-0 rounded-2xl rounded-tl-md border border-[var(--accent)]/30"
            animate={{ 
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;