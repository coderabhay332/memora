import React, { useState } from 'react';
import { IMessage } from '../types/chat';
import { Copy, Check, Bot, User, Sparkles, Clock, FileText, ExternalLink } from 'lucide-react';
import SourceLink from './SourceLink';

interface MessageBubbleProps {
  message: IMessage;
  onNavigateToSource?: (contentId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onNavigateToSource }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === 'user';
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex max-w-xs lg:max-w-2xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3`}>
        {/* Enhanced Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 ${
          isUser 
            ? 'bg-gradient-to-br from-black to-gray-800 hover:from-gray-900 hover:to-black' 
            : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 hover:from-emerald-500 hover:to-blue-600'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
        </div>
        
        {/* Message Content */}
        <div className="flex flex-col space-y-1">
          {/* Message Bubble */}
          <div className={`relative px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
            isUser 
              ? 'bg-gradient-to-br from-black to-gray-800 text-white ml-4' 
              : 'bg-white border border-gray-200 text-gray-800 mr-4 hover:border-gray-300'
          }`}>
            {/* AI Sparkle Effect */}
            {!isUser && (
              <div className="absolute -top-1 -left-1">
                <div className={`w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full transition-all duration-300 ${
                  isHovered ? 'scale-110 animate-pulse' : ''
                }`}>
                  <Sparkles className="w-2 h-2 text-white absolute top-0.5 left-0.5" />
                </div>
              </div>
            )}
            
            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}>
              {message.message}
            </p>

            {/* Fallback clickable Content ID if sourceInfo is missing */}
            {!isUser && !message.sourceInfo && message.contentId && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onNavigateToSource && onNavigateToSource(message.contentId as string)}
                  className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  title={message.contentId as string}
                >
                  ID: {String(message.contentId)}
                </button>
              </div>
            )}
            
            {/* Source Information for AI messages */}
            {!isUser && message.sourceInfo && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <SourceLink 
                  sourceInfo={message.sourceInfo}
                  onNavigate={onNavigateToSource}
                  showPreview={true}
                  showContentIdLink={true}
                  compact={false}
                />
              </div>
            )}
            
            {/* Context Stats for AI messages */}
            {!isUser && message.contextStats && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{message.contextStats.relevantChunks} sources</span>
                </span>
                <span className="text-gray-400">•</span>
                <span>{message.contextStats.queryIntent}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{message.contextStats.queryComplexity}</span>
              </div>
            )}
            
            {/* Message Actions */}
            <div className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isUser 
                    ? 'text-white/70 hover:text-white hover:bg-white/10' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          
          {/* Message Metadata */}
          <div className={`flex items-center space-x-2 text-xs text-gray-400 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } ${isUser ? 'justify-end mr-4' : 'justify-start ml-4'}`}>
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.createdAt)}</span>
            {copied && (
              <>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-green-500 font-medium">Copied!</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;