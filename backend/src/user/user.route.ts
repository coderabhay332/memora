import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.
  post("/create", userController.createUser);

export default router;
