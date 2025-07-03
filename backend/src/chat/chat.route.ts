import Router from "express"
const router = Router()
import { roleAuth } from "../common/middleware/role-auth.middleware";
import * as chatController from "./chat.controller"

router
  .post("/create", roleAuth(["USER"]), chatController.createChat)
  .post("/:id/message", roleAuth(["USER"]), chatController.addMessage)

  .get("/:id", roleAuth(["USER"]), chatController.getChat)
  .delete("/:id", roleAuth(["USER"]), chatController.deleteChat);

export default router; 
   