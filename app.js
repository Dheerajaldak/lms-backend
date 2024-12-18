// Use ES module syntax
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js'
import { config } from 'dotenv';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';
import courseRoutes from './routes/course.routes.js'

// Load environment variables
config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
}));

app.use(cookieParser());
// morgan is used used to log requests, errors, and more to the console 
app.use(morgan('dev'))

app.use('/ping', (req, res) => {
    res.send('pong');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);

// Handle 404 errors
app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found');
});
app.use(errorMiddleware);

export default app;
