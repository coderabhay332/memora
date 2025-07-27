import asyncHandler  from "express-async-handler"
import * as chatService from "./chat.service";
import { IUser } from "../user/user.dto";


export const createChat = asyncHandler(async (req, res) => {

    const userId = (req.user as IUser)._id;
    console.log("form create chat",userId);
    const result = await chatService.createChat(userId);
    res.status(201).json(result);
});

export const getChat = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    const result = await chatService.getChat(req.params.id, userId);
    res.status(200).json(result);
});

export const deleteChat = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    const result = await chatService.deleteChat(req.params.id, userId);
    res.status(200).json(result);
});

export const addMessage = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    const {role} = req.body;
    const result = await chatService.addMessage(req.params.id, role, req.body.message, userId);
    res.status(201).json(result);
});

export const getAllChats = asyncHandler(async (req, res) => {
    const userId = (req.user as IUser)._id;
    const result = await chatService.getAllChats(userId);
    res.status(200).json(result);
});


