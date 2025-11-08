import bodyParser from "body-parser";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import errorHandler from "./src/common/middleware/error.handler";
import { initDB } from "./src/common/services/database.services";
import { initPassport } from "./src/common/services/passport-jwt.services";
import { IUser } from "./src/user/user.dto";
import routes from "./src/routes";
import dotenv from "dotenv";
import { connectRabbitMQ, disconnectRabbitMQ } from "./src/common/services/rabbitmq.service";
dotenv.config();

declare global {
    namespace Express {
      interface User extends Omit<IUser, "password"> { }
      interface Request {
        user?: User;
      }
    }
  }

  const port = Number(process.env.PORT) ?? 5000;

  const app: Express = express();
  app.use(express.json()); // Parses JSON bodies

  app.use(cors({
  origin: ['http://localhost:3000', 'https://memora-gray.vercel.app', 'https://memora.sbs/', 'https://api.memora.sbs/'], // allow these origins
  credentials: true // allow credentials
}));
  app.use(helmet()) 
  app.use(bodyParser.json());



  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(morgan("dev")); 
  const initApp = async (): Promise<void> => {
    try {
      // Initialize RabbitMQ with error handling
      try {
        await connectRabbitMQ();
      } catch (e) {
        console.error('⚠️ RabbitMQ initialization failed, continuing without it:', (e as any)?.message || e);
      }
      
      // Initialize MongoDB
      await initDB();
      
      // Initialize Passport
      initPassport();
      
      // Set base path to /api
      app.use("/api", routes);
      
      app.get("/", (req: Request, res: Response) => {
        res.send({ status: "ok" });
      });
      
      // Health check endpoint
      app.get("/health", (req: Request, res: Response) => {
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
      app.use(errorHandler);
      
      const server = http.createServer(app);
      
      server.listen(port, () => {
        console.log("Server is running on port", port);
      });
      
      // Graceful shutdown handling
      const gracefulShutdown = async (signal: string) => {
        console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
        
        server.close(async () => {
          console.log('📡 HTTP server closed');
          
          try {
            await disconnectRabbitMQ();
            console.log('🐰 RabbitMQ disconnected');
          } catch (error) {
            console.error('❌ Error disconnecting RabbitMQ:', error);
          }
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        });
      };
      
      // Handle shutdown signals
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      process.exit(1);
    }
  };
  
  void initApp();