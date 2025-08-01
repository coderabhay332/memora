

import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { IMessage, IChat } from '../types/chat';
import { ArrowDown, ArrowUp, Sparkles, Bot, User, RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
  chat: IChat | null;
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  hasActiveChat: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chat, 
  onSendMessage, 
  isLoading = false,
  hasActiveChat 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const prevMessagesLength = useRef(0);

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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 4px;
      }
      .messages-container::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
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

  if (!hasActiveChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30 animate-bounce">
              <Bot className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Start a New Conversation
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Select a chat from the sidebar or create a new one to begin your AI-powered conversation.
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI-Powered</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 h-full">
      {/* Enhanced Chat Header */}
      {chat && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
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
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container with flex-shrink-0 to prevent squishing */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-6 relative messages-container ${!chat ? 'flex items-center justify-center' : ''}`}
        onScroll={handleScroll}
      >
        <div className="max-w-4xl w-full mx-auto">
          {chat ? (
            <div className="space-y-6">
              {chat.messages && chat.messages.length > 0 ? (
                chat.messages.map((message, index) => (
                  <MessageBubble 
                    key={message._id || index} 
                    message={message} 
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to chat!</h3>
                    <p className="text-gray-500 text-sm">Send a message to start the conversation.</p>
                  </div>
                </div>
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-xs lg:max-w-md items-end space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Start a New Conversation</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Select a chat from the sidebar or create a new one to begin your conversation.
              </p>
              <button
                onClick={() => {}}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                New Chat
              </button>
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
            className="fixed bottom-32 right-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-110 z-10 group"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        )}
      </div>

      {/* Chat Input - Always show when there's an active chat */}
      {hasActiveChat && (
        <div className="bg-white/80 backdrop-blur-xl border-t border-white/60 p-6">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSendMessage={onSendMessage} 
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;