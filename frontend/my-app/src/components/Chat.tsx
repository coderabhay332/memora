
// components/Chat.tsx

import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatInterface from './ChatInterface';
import { IChat } from '../types/chat';
import {
  useGetAllChatsQuery,
  useCreateChatMutation,
  useDeleteChatMutation,
  useAddMessageMutation
} from '../services/api';

const Chat: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const {
    data: chatsData,
    error: chatsError,
    isLoading: isChatsLoading,
    refetch: refetchChats
  } = useGetAllChatsQuery();

  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [addMessage, { isLoading: isSendingMessage }] = useAddMessageMutation();

  const chats = React.useMemo(() => {
    let result: IChat[];
    if (Array.isArray(chatsData)) {
      result = chatsData;
    } else if (chatsData?.data && Array.isArray(chatsData.data)) {
      result = chatsData.data;
    } else {
      result = [];
    }
    return result;
  }, [chatsData]);

  const activeChat = React.useMemo(() => {
    return chats.find(chat => chat._id === activeChatId) || null;
  }, [chats, activeChatId]);

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0]._id);
    }
  }, [chats, activeChatId]);

  const handleNewChat = async () => {
    try {
      const newChat = await createChat().unwrap();
      await refetchChats();

      // IMPORTANT: Now that the local chat list is updated, set the new chat as active
      if (newChat && newChat._id) {
        setActiveChatId(newChat._id);
      }
    } catch (err) {
      console.error('Failed to create new chat:', err);
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
    if (!activeChatId) return;
    try {
      await addMessage({
        chatId: activeChatId,
        query: message
      }).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const error = chatsError;

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isLoading={isChatsLoading || isCreatingChat}
      />
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{'message' in error ? error.message : 'An unknown error occurred'}</p>
          </div>
        )}
        <ChatInterface
          chat={activeChat}
          onSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
          hasActiveChat={!!activeChatId}
        />
      </div>
    </div>
  );
};

export default Chat;