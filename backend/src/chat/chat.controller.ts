import asyncHandler  from "express-async-handler"
import * as chatService from "./chat.service";
import { IUser } from "../user/user.dto";


export const createChat = asyncHandler(async (req, res) => {

    const userId = (req.user as IUser)._id;
    console.log("[CHAT][createChat] userId=", userId);
    console.time("[CHAT][createChat] duration");
    const result = await chatService.createChat(userId);
    console.timeEnd("[CHAT][createChat] duration");
    console.log("[CHAT][createChat] created chatId=", result?._id);
    res.status(201).json(result);
});

export const getChat = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    console.log("[CHAT][getChat] userId=", userId, " chatId=", req.params.id);
    console.time("[CHAT][getChat] duration");
    const result = await chatService.getChat(req.params.id, userId);
    console.timeEnd("[CHAT][getChat] duration");
    console.log("[CHAT][getChat] messages=", result?.messages?.length ?? 0);
    res.status(200).json(result);
});

export const deleteChat = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    console.log("[CHAT][deleteChat] userId=", userId, " chatId=", req.params.id);
    console.time("[CHAT][deleteChat] duration");
    const result = await chatService.deleteChat(req.params.id, userId);
    console.timeEnd("[CHAT][deleteChat] duration");
    console.log("[CHAT][deleteChat] deleted chatId=", result?._id);
    res.status(200).json(result);
});

export const addMessage = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    const {role} = req.body;
    console.log("[CHAT][addMessage] userId=", userId, " chatId=", req.params.id, " role=", role);
    console.time("[CHAT][addMessage] duration");
    const result = await chatService.addMessage(req.params.id, role, req.body.message, userId);
    console.timeEnd("[CHAT][addMessage] duration");
    console.log("[CHAT][addMessage] total messages=", result?.messages?.length ?? 0);
    res.status(201).json(result);
});

export const getAllChats = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    console.log("[CHAT][getAllChats] userId=", userId);
    console.time("[CHAT][getAllChats] duration");
    const result = await chatService.getAllChats(userId);
    console.timeEnd("[CHAT][getAllChats] duration");
    console.log("[CHAT][getAllChats] count=", Array.isArray(result) ? result.length : 0);
    res.status(200).json(result);
});


