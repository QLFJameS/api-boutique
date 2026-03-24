/**
 * API REST principale PlayForge (Express, port 9090).
 * Données : Drizzle ORM / MySQL. CORS autorisé pour l’application Angular (4200) et le service upload (9091).
 */
import cors from "cors";
import express from "express";
import { userRoutes } from './routes/user.routes.js';
import { gameRoutes } from './routes/game.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { commentRoutes } from './routes/comment.routes.js';

const app = express();
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:9091'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/game', gameRoutes);
app.use('/comment', commentRoutes);
app.use('/', categoryRoutes);

app.listen(9090, () => {
    console.log("✅ Server running on port 9090");
    console.log("✅ Routes Drizzle activées");
});