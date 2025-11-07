import { Chat } from "./chat.schema";
import { Message } from "./chat.schema";
export const createChat = async (userId: string) => {
  console.log("[CHAT_SERVICE][createChat] userId=", userId);
  const start = Date.now();  
    const chat = new Chat({
      userId,
      
      lastActive: new Date(),
    });

    const savedChat = await chat.save();
    
    // Create a starter message from the assistant
    const starterMessage = new Message({
      role: "assistant",
      message: "Hello! How can I help you today? Feel free to ask me anything, and I'll do my best to assist you."
    });
    
    await starterMessage.save();
    savedChat.messages.push(starterMessage._id);
    await savedChat.save();
    
    console.log("[CHAT_SERVICE][createChat] created chatId=", savedChat?._id, " with starter message in ", Date.now() - start, "ms");
    return savedChat;
}
export const getChat = async (chatId: string, userId: string) => {
    console.log("[CHAT_SERVICE][getChat] chatId=", chatId, " userId=", userId);
    const start = Date.now();
    const chat = await Chat.findOne({ _id: chatId, userId }).populate('messages');
    console.log("[CHAT_SERVICE][getChat] found=", !!chat, " messages=", chat?.messages?.length ?? 0, " in ", Date.now() - start, "ms");
    if (!chat) throw new Error("Chat not found or does not belong to user");
    return chat;
}

export const deleteChat = async (chatId: string, userId: string) => {
    console.log("[CHAT_SERVICE][deleteChat] chatId=", chatId, " userId=", userId);
    const start = Date.now();
    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
    console.log("[CHAT_SERVICE][deleteChat] deleted=", !!chat, " in ", Date.now() - start, "ms");
    if (!chat) throw new Error("Chat not found or does not belong to user");
    return chat;
}

export const getAllChats = async (userId: string) => {
    console.log("[CHAT_SERVICE][getAllChats] userId=", userId);
    const start = Date.now();
    const chats = await Chat.find({ userId }).populate('messages');
    console.log("[CHAT_SERVICE][getAllChats] count=", chats?.length ?? 0, " in ", Date.now() - start, "ms");
    return chats;
}

export const addMessage = async (chatId: string, role: string, message: string, userId: string) => {
   console.log("[CHAT_SERVICE][addMessage] chatId=", chatId, " role=", role, " userId=", userId);
   const start = Date.now();
   const chatExists = await Chat.findOne({ _id: chatId, userId });
   if (!chatExists) throw new Error("Chat not found or does not belong to user");

   const newMessage = new Message({

       role,
       message
   });

   await newMessage.save();
   chatExists.messages.push(newMessage._id);
   await chatExists.save();
   console.log("[CHAT_SERVICE][addMessage] newMessageId=", newMessage?._id, " totalMessages=", chatExists?.messages?.length ?? 0, " in ", Date.now() - start, "ms");
   return chatExists;
}