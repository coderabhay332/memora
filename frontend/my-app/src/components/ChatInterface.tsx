// Corrected version of ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { IMessage, IChat } from '../types/chat';

interface ChatInterfaceProps {
  chat: IChat | null;
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chat, 
  onSendMessage, 
  isLoading = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .messages-container::-webkit-scrollbar {
        width: 8px;
      }
      .messages-container::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .messages-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .messages-container::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsNearBottom(true);
      setShowScrollButton(false);
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      const isAtTop = scrollTop < 50;

      setIsNearBottom(isAtBottom);
      setShowScrollButton(!isAtBottom && scrollHeight > clientHeight);
      setShowScrollToTopButton(!isAtTop && scrollHeight > clientHeight);
    }
  };

  // Handle scroll behavior when messages change
  useEffect(() => {
    if (chat?.messages) {
      const container = messagesContainerRef.current;
      if (!container) return;

      const wasNearBottom = isNearBottom;
      
      if (chat.messages.length > prevMessagesLength.current && wasNearBottom) {
        scrollToBottom();
      }
      
      if (prevMessagesLength.current === 0 && chat.messages.length > 0) {
        scrollToBottom();
      }
      
      prevMessagesLength.current = chat.messages.length;
    }
  }, [chat?.messages, isNearBottom]);

  // Set up scroll listener and initial scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (chat?.messages?.length) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [chat?._id]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Start a New Conversation</h3>
          <p className="text-gray-600">Select a chat from the sidebar or create a new one to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4">
        {/* Header content... */}
      </div>

      {/* Messages Container -- MODIFICATION HERE */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 relative messages-container"
        onScroll={handleScroll}
        // The inline style has been REMOVED
      >
        <div className="space-y-4">
        {chat.messages && chat.messages.length > 0 ? (
          chat.messages.map((message, index) => (
            <MessageBubble 
              key={message._id || index} 
              message={message} 
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            {/* Empty chat placeholder... */}
          </div>
        )}
        </div>
        <div ref={messagesEndRef} />
        
        {/* Scroll to Top Button */}
        {showScrollToTopButton && (
          <button
            onClick={scrollToTop}
            className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-10"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v17" />
            </svg>
          </button>
        )}

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-10"
            aria-label="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInterface;