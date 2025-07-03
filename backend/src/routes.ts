import express from "express"
import userRoutes from "./user/user.route";
import contentRoutes from "./content/content.routes";
import chatRoutes from "./chat/chat.route";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/content", contentRoutes);
router.use("/chat", chatRoutes);
export default router;
