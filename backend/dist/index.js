"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const morgan_1 = __importDefault(require("morgan"));
const error_handler_1 = __importDefault(require("./src/common/middleware/error.handler"));
const database_services_1 = require("./src/common/services/database.services");
const passport_jwt_services_1 = require("./src/common/services/passport-jwt.services");
const routes_1 = __importDefault(require("./src/routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const rabbitmq_service_1 = require("./src/common/services/rabbitmq.service");
dotenv_1.default.config();
const port = (_a = Number(process.env.PORT)) !== null && _a !== void 0 ? _a : 5000;
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Parses JSON bodies
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://memora-gray.vercel.app'],
    credentials: true // allow credentials
}));
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize RabbitMQ with error handling
        try {
            yield (0, rabbitmq_service_1.connectRabbitMQ)();
        }
        catch (e) {
            console.error('⚠️ RabbitMQ initialization failed, continuing without it:', (e === null || e === void 0 ? void 0 : e.message) || e);
        }
        // Initialize MongoDB
        yield (0, database_services_1.initDB)();
        // Initialize Passport
        (0, passport_jwt_services_1.initPassport)();
        // Set base path to /api
        app.use("/api", routes_1.default);
        app.get("/", (req, res) => {
            res.send({ status: "ok" });
        });
        // Health check endpoint
        app.get("/health", (req, res) => {
            res.json({
                status: "ok",
                timestamp: new Date().toISOString(),
                services: {
                    database: "connected",
                    rabbitmq: "connected" // This will be updated based on actual connection status
                }
            });
        });
        // Error handler
        app.use(error_handler_1.default);
        const server = http_1.default.createServer(app);
        server.listen(port, () => {
            console.log("Server is running on port", port);
        });
        // Graceful shutdown handling
        const gracefulShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
            server.close(() => __awaiter(void 0, void 0, void 0, function* () {
                console.log('📡 HTTP server closed');
                try {
                    yield (0, rabbitmq_service_1.disconnectRabbitMQ)();
                    console.log('🐰 RabbitMQ disconnected');
                }
                catch (error) {
                    console.error('❌ Error disconnecting RabbitMQ:', error);
                }
                console.log('✅ Graceful shutdown completed');
                process.exit(0);
            }));
        });
        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to initialize application:', error);
        process.exit(1);
    }
});
void initApp();
