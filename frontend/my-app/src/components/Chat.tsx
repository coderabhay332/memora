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
  // State to track the ID of the currently active chat
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // RTK Query hook for fetching all chats
  const { data: chatsData, error: chatsError, isLoading: isChatsLoading } = useGetAllChatsQuery();

  // RTK Query mutation for creating a new chat
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

  // RTK Query mutation for deleting a chat
  const [deleteChat] = useDeleteChatMutation();

  // RTK Query mutation for adding a message
  const [addMessage, { isLoading: isSendingMessage }] = useAddMessageMutation();

  // Debug logging
  console.log('Chat component - chatsData:', chatsData);
  console.log('Chat component - chatsError:', chatsError);
  console.log('Chat component - isChatsLoading:', isChatsLoading);

  // Memoize chats array to prevent unnecessary re-renders
  const chats = React.useMemo(() => {
    // Handle both possible response structures
    let result: IChat[];
    if (Array.isArray(chatsData)) {
      // Direct array response
      result = chatsData;
    } else if (chatsData?.data && Array.isArray(chatsData.data)) {
      // Wrapped response with data property
      result = chatsData.data;
    } else {
      result = [];
    }
    console.log('Chat component - processed chats:', result);
    return result;
  }, [chatsData]);

  // Find the active chat object from the chats list based on the activeChatId
  const activeChat = React.useMemo(() => {
    const result = chats.find(chat => chat._id === activeChatId) || null;
    console.log('Chat component - activeChatId:', activeChatId);
    console.log('Chat component - activeChat:', result);
    return result;
  }, [chats, activeChatId]);
  
  // Automatically select the first chat if none is active
  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0]._id);
    }
  }, [chats, activeChatId]);


  const handleNewChat = async () => {
    try {
      // The `createChat` trigger returns a promise, which we can unwrap
      const newChat = await createChat();
      console.log("Full newChat response:", newChat);
      console.log("newChat.data:", newChat.data);
      
      // RTK Query response structure: newChat.data contains the chat object directly
      if (newChat.data && newChat.data._id) {
        const chatId = newChat.data._id;
        console.log("New chat ID:", chatId);
        setActiveChatId(chatId);
      } else {
        console.error('Unexpected response structure:', newChat);
      }
    } catch (err) { 
      console.error('Failed to create new chat:', err);
    }
  };

  const handleChatSelect = (chat: IChat) => {
    // Simply set the active chat ID. RTK query handles the data fetching.
    setActiveChatId(chat._id);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      // If the deleted chat was active, reset the active chat
      if (activeChatId === chatId) {
        // Find the next chat to make active, or null if it's the last one
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
      // The `addMessage` trigger takes a single argument object
      await addMessage({ 
        chatId: activeChatId, 
        query: message 
      }).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
  
  // Combine potential errors from different hooks for display
  const error = chatsError; // You can expand this to combine other errors if needed

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
        />
      </div>
    </div>
  );
};

export default Chat;