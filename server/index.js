import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './middlewares/db.js';
import userroutes from './routers/userroutes.js';
import usageroutes from './routers/usageroute.js';
import subscriptionroutes from './routers/subscriptionrouters.js';
// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS with options
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).json({
            body: "OK"
        });
    }

    next();
});

// Connect to Database
connectDB();

// Routes
app.use('/api/user', userroutes);
app.use('/api/usage', usageroutes);
app.use('/api/subscription', subscriptionroutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;