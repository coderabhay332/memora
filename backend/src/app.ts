import express from 'express';
import cors from 'cors';
import passport from 'passport';

import userRoutes from './user/user.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Swagger documentation

// Routes

app.use('/api', userRoutes);

export default app; 