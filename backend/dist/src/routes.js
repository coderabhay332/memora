"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./user/user.route"));
const content_routes_1 = __importDefault(require("./content/content.routes"));
const chat_route_1 = __importDefault(require("./chat/chat.route"));
const router = express_1.default.Router();
router.use("/users", user_route_1.default);
router.use("/content", content_routes_1.default);
router.use("/chat", chat_route_1.default);
exports.default = router;
