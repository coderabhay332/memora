import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);


const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New Chat" },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);
