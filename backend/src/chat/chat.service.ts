import { Chat } from "./chat.schema";
import { Message } from "./chat.schema";
export const createChat = async (userId: string) => {
  
    const chat = new Chat({
      userId,
      
      lastActive: new Date(),
    });

    const savedChat = await chat.save();
    
    return savedChat;
}
export const getChat = async (chatId: string, userId: string) => {
    const chat = await Chat.findOne({ _id: chatId, userId }).populate('messages');
    if (!chat) throw new Error("Chat not found or does not belong to user");
    return chat;
}

export const deleteChat = async (chatId: string, userId: string) => {
    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!chat) throw new Error("Chat not found or does not belong to user");
    return chat;
}

export const getAllChats = async (userId: string) => {
    const chats = await Chat.find({ userId }).populate('messages');
    return chats;
}

export const addMessage = async (chatId: string, role: string, message: string, userId: string) => {
   const chatExists = await Chat.findOne({ _id: chatId, userId });
   if (!chatExists) throw new Error("Chat not found or does not belong to user");

   const newMessage = new Message({

       role,
       message
   });

   await newMessage.save();
   chatExists.messages.push(newMessage._id);
   await chatExists.save();

   return chatExists;
}