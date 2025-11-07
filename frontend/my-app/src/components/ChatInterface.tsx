// components/ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { IChat } from '../types/chat';
import { ArrowDown, ArrowUp, Sparkles, Bot } from 'lucide-react';

interface ChatInterfaceProps {
  chat: IChat | null;
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  hasActiveChat: boolean;
  onNavigateToSource?: (contentId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chat, 
  onSendMessage, 
  isLoading = false,
  hasActiveChat,
  onNavigateToSource
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .messages-container::-webkit-scrollbar {
        width: 8px;
      }
      .messages-container::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
      }
      .messages-container::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #1f2937 0%, #000000 100%);
        border-radius: 4px;
      }
      .messages-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #111827 0%, #000000 100%);
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

  // Auto-scroll when messages change
  useEffect(() => {
    if (chat?.messages && chat.messages.length > 0 && isNearBottom) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [chat?.messages?.length, isNearBottom]);

  // Set up scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50 overflow-hidden min-h-0">
      {/* Chat Header */}
      {chat && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {chat.title || 'AI Assistant'}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Online</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span>{chat.messages?.length || 0} messages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden p-6 relative messages-container min-h-0 ${!chat ? 'flex items-center justify-center' : ''}`}
        onScroll={handleScroll}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-4xl w-full mx-auto">
          {chat ? (
            <div className="space-y-6">
              {chat.messages && chat.messages.length > 0 ? (
                chat.messages.map((message, index) => (
                  <MessageBubble 
                    key={message._id || index} 
                    message={message}
                    onNavigateToSource={onNavigateToSource}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to chat!</h3>
                    <p className="text-gray-500 text-sm">Send a message to start the conversation.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Start a New Conversation</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Select a chat from the sidebar or create a new one to begin your conversation.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll Buttons */}
        {showScrollToTopButton && (
          <button
            onClick={scrollToTop}
            className="fixed top-24 right-8 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-gray-800 p-3 rounded-2xl shadow-lg border border-white/60 transition-all duration-200 transform hover:scale-110 z-10 group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        )}

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 right-8 bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white p-3 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-110 z-10 group"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        )}
      </div>

      {/* Chat Input - ALWAYS RENDER - Input box should always be visible */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-white/60 p-6">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSendMessage={onSendMessage} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
