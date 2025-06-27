import { Router } from "express";
import * as userController from "./content.controller";

const router = Router();

router.
   post("/extract", userController.extract)
  .post("/search", userController.searchPinecone)
  .post("/rag", userController.rag);

export default router;
    