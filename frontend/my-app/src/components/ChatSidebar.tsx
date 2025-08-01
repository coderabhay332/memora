import React, { useState } from 'react';
import { IChat } from '../types/chat';

interface ChatSidebarProps {
  chats: IChat[];
  activeChat: IChat | null;  // Expects the whole chat object, not just ID
  onChatSelect: (chat: IChat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isLoading?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isLoading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setShowDeleteConfirm(chatId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onDeleteChat(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const formatChatTitle = (chat: IChat) => {
    if (chat.title) return chat.title;
    if (chat.messages && chat.messages.length > 0) {
      const firstMessage = chat.messages[0];
      return firstMessage.message.substring(0, 30) + (firstMessage.message.length > 30 ? '...' : '');
    }
    return 'New Chat';
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
          <button
            onClick={onNewChat}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No chats yet</p>
            <p className="text-gray-400 text-xs mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeChat?._id === chat._id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {formatChatTitle(chat)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {chat.messages?.length || 0} messages • {formatLastActive(chat.lastActive)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteClick(e, chat._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Delete Chat</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
