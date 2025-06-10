import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.
    post("/extract", userController.extract)
    .post("/embeddings", userController.embeddings);



export default router;
