import { Router } from "express";
import * as contentController from "./content.controller";
import { roleAuth } from "../common/middleware/role-auth.middleware";
const router = Router();

router
  .post("/create", roleAuth(["USER"]), contentController.createContent)
  .get("/all", roleAuth(["USER"]), contentController.getAllContent)
  .post("/rag/:chatId", roleAuth(["USER"]), contentController.rag)
  .put("/:id", roleAuth(["USER"]), contentController.updateContent)
  .get("/:id", roleAuth(["USER"]), contentController.getContentById)
  .get("/source/:contentId", roleAuth(["USER"]), contentController.getRAGSource)
  .delete("/:id", roleAuth(["USER"]), contentController.deleteContent)
  .post("/search", roleAuth(["USER"]), contentController.searchPinecone)
  .post("/chat/:id", roleAuth(["USER"]), contentController.rag);

export default router;
    