import { Router } from "express";
import passport from "passport";
import { catchError } from "../common/middleware/catch-error";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { limiter } from "../common/helper/rate-limiter";


const router = Router();
router
            .post("/register", limiter, userValidator.createUser, catchError, userController.createUser)
            .post("/login", limiter, userValidator.login, catchError, passport.authenticate('login', { session: false }), userController.login)
            .get("/me", limiter, roleAuth(["USER", "ADMIN"]), catchError, userController.getMe);

            export default router;