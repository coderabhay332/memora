// components/Chat.tsx

import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatInterface from './ChatInterface';
import ViewContentModal from './ViewContentModal';
import { IChat } from '../types/chat';
import { ContentItem } from '../types';
import {
  useGetAllChatsQuery,
  useCreateChatMutation,
  useDeleteChatMutation,
  useAddMessageMutation,
  useGetContentByIdQuery,
  useUpdateContentMutation
} from '../services/api';

const Chat: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewingContentId, setViewingContentId] = useState<string | null>(null);

  const {
    data: chatsData,
    error: chatsError,
    isLoading: isChatsLoading,
    refetch: refetchChats
  } = useGetAllChatsQuery();

  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [addMessage, { isLoading: isSendingMessage }] = useAddMessageMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  
  const { data: contentData, isLoading: isLoadingContent, error: contentError } = useGetContentByIdQuery(
    viewingContentId || '',
    { skip: !viewingContentId }
  );

  // Extract chats array from response
  const chats = React.useMemo(() => {
    if (Array.isArray(chatsData)) {
      return chatsData;
    } else if (chatsData?.data && Array.isArray(chatsData.data)) {
      return chatsData.data;
    }
    return [];
  }, [chatsData]);

  // Find active chat object
  const activeChat = React.useMemo(() => {
    if (!activeChatId) return null;
    return chats.find(chat => chat._id === activeChatId) || null;
  }, [chats, activeChatId]);

  // Auto-select most recent chat if none selected
  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[chats.length - 1]._id);
    }
  }, [chats, activeChatId]);

  // Handle creating new chat
  const handleNewChat = async () => {
    try {
      const result = await createChat().unwrap();
      console.debug('[CHAT] createChat response=', result);
      
      // Extract chat ID from response
      const newChatId = result?._id;
      
      if (newChatId) {
        // Set active chat ID immediately
        setActiveChatId(newChatId);
        // Refetch to update the list
        await refetchChats();
      } else {
        // Fallback: refetch and select newest
        const refreshed = await refetchChats();
        const refreshedData = refreshed?.data;
        const chatList = refreshedData && Array.isArray(refreshedData.data) 
          ? refreshedData.data 
          : Array.isArray(refreshedData) 
            ? refreshedData 
            : [];
        if (chatList.length > 0) {
          const newestChat = chatList[chatList.length - 1] as IChat;
          setActiveChatId(newestChat._id);
        }
      }
    } catch (err) {
      console.error('Failed to create new chat:', err);
      // On error, try to select the most recent chat if available
      if (chats.length > 0) {
        setActiveChatId(chats[chats.length - 1]._id);
      }
    }
  };

  const handleChatSelect = (chat: IChat) => {
    setActiveChatId(chat._id);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      if (activeChatId === chatId) {
        const currentIndex = chats.findIndex(c => c._id === chatId);
        if (chats.length > 1) {
          const nextIndex = currentIndex > 0 ? currentIndex - 1 : 1;
          setActiveChatId(chats[nextIndex]._id);
        } else {
          setActiveChatId(null);
        }
      }
      await deleteChat(chatId).unwrap();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!activeChatId) {
      console.warn('Cannot send message: no active chat');
      return;
    }
    
    try {
      await addMessage({
        chatId: activeChatId,
        query: message
      }).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleNavigateToSource = (contentId: string) => {
    setViewingContentId(contentId);
  };

  const handleViewClose = () => {
    setViewingContentId(null);
  };

  const handleViewSave = async (id: string, content: string) => {
    try {
      await updateContent({ id, content: { content } }).unwrap();
    } catch (error) {
      console.error('Failed to update content from modal:', error);
      throw error;
    }
  };

  const viewingItem: ContentItem | null = React.useMemo(() => {
    if (!contentData || !contentData.success) return null;
    // Backend returns content directly in data, not nested
    const data = contentData.data;
    if (data && typeof data === 'object' && '_id' in data) {
      return data as ContentItem;
    }
    return null;
  }, [contentData]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isLoading={isChatsLoading || isCreatingChat}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
        {chatsError && (
          <div className="flex-shrink-0 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{'message' in chatsError ? chatsError.message : 'An unknown error occurred'}</p>
          </div>
        )}
        <ChatInterface
          chat={activeChat}
          onSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
          hasActiveChat={!!activeChatId}
          onNavigateToSource={handleNavigateToSource}
        />
      </div>

      {viewingContentId && (
        <ViewContentModal
          show={!!viewingContentId}
          item={isLoadingContent ? null : viewingItem}
          error={contentError ? 'Content not found or you do not have access to it.' : null}
          onClose={handleViewClose}
          onSave={handleViewSave}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
};

export default Chat;
