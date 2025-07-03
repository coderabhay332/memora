import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.helper";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";
import { createUserTokens } from "../common/services/passport-jwt.services";
import { IUser } from "./user.dto";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  res.send(createResponse(result, "User created sucssefully"));
});
export const me = asyncHandler(async (req: Request, res: Response) => {
  console.log("req.user", req.user);
  const result = await userService.me(req.user as IUser);
  res.send(createResponse(result, "User fetched sucssefully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req.params.id, req.body);
  res.send(createResponse(result, "User updated sucssefully"));
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.editUser(req.params.id, req.body);
  res.send(createResponse(result, "User updated sucssefully"));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id);
  res.send(createResponse(result, "User deleted sucssefully"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  res.send(createResponse(result));
});

export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUser();
  res.send(createResponse(result));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const tokens = createUserTokens(req.user as IUser)
  console.log(req.user);
  const updateUserToken = await userService.updateUserToken(req.user as IUser, tokens.refreshToken)
  res.send(createResponse({...tokens, user: req.user}, "Login successful"))
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.refreshToken(req.body.refreshToken);
  res.send(createResponse(result, "Token refreshed sucssefully"));
});
