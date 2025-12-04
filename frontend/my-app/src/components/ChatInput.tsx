import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, Mic, Square, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      await onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Add voice recording logic here
  };

  const quickPrompts = [
    "Explain this concept",
    "Help me brainstorm", 
    "Summarize this",
    "What do you think?"
  ];

  return (
    <div className="space-y-4">
      {/* Quick Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap flex items-center space-x-1">
          <Sparkles className="w-3 h-3" />
          <span>Quick:</span>
        </span>
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => setMessage(prompt)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:text-black hover:bg-gray-50 transition-all duration-200 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-gray-500/20 focus-within:border-black">
          {/* Input Field */}
          <div className="flex items-end space-x-3 p-4">
            {/* Attachment Button */}
            <button
              type="button"
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full text-sm bg-transparent border-none resize-none focus:outline-none placeholder-gray-400 text-gray-700 max-h-[120px] min-h-[24px] leading-6 py-1"
                rows={1}
                disabled={isLoading}
                style={{ height: '40px', minHeight: '40px' }}
              />
              
              {/* Character Counter */}
              {message.length > 0 && (
                <div className={`absolute bottom-0 right-0 text-xs transition-colors duration-200 ${
                  message.length > 1000 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {message.length}/2000
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Voice Recording Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${
                  isRecording
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? (
                  <Square className="w-5 h-5 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`flex-shrink-0 p-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center min-w-[48px] ${
                  message.trim() && !isLoading
                    ? 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-900 hover:to-black transform hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gray-800 to-black animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="absolute -top-12 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">Recording...</span>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <button
              onClick={toggleRecording}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              Stop
            </button>
          </div>
        )}

        {/* Emoji Picker Placeholder */}
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 w-80 max-h-60 overflow-y-auto">
            <div className="text-sm text-gray-500 text-center py-8">
              Emoji picker would go here
            </div>
          </div>
        )}
      </form>

      {/* Input Hints */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send</span>
          <span>Shift + Enter for new line</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>AI Ready</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;