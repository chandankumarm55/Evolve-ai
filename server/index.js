// index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './middlewares/db.js';
import userroutes from './routers/userroutes.js';
import usageroutes from './routers/usageroute.js';
import subscriptionroutes from './routers/subscriptionrouters.js';
import codewriterRoutes from './routers/codeWriterRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS with options
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Headers Middleware
app.use((req, res, next) => {
    // Set security headers
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ message: 'OK' });
    }
    next();
});

// Connect to Database
try {
    await connectDB();
    console.log('Database connected successfully');
} catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
}

// API Routes
app.use('/api/user', userroutes);
app.use('/api/usage', usageroutes);
app.use('/api/subscription', subscriptionroutes);
app.use('/api/codewriter', codewriterRoutes); // Fixed route to use codewriterRoutes

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'API is running...', status: 'healthy' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async() => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;