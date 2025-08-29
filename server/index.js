import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './middlewares/db.js';
import userroutes from './routers/userroutes.js';
import usageroutes from './routers/usageroute.js';
import subscriptionroutes from './routers/subscriptionrouters.js';
import codewriterRoutes from './routers/codeWriterRoutes.js';
import codeGenerationRoutes from './routers/codeWriterRoutes.js';
import { ConversationAIResponse } from './controllers/conversationController.js'; // Add this import

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
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Enhanced Middleware with increased limits for image processing
app.use(express.json({
    limit: '50mb', // Increased limit to handle base64 images
    extended: true,
    parameterLimit: 50000
}));

app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));

// Request size logging middleware
app.use((req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
            const bodyString = JSON.stringify(req.body);
            if (bodyString && typeof bodyString === 'string') {
                const size = bodyString.length;
                const sizeInKB = (size / 1024).toFixed(2);
                const sizeInMB = (size / (1024 * 1024)).toFixed(2);

                console.log(`${req.method} ${req.path} - Request size: ${sizeInKB} KB`);

                // Warn if request is getting very large
                if (size > 10 * 1024 * 1024) { // 10MB
                    console.warn(`⚠️  Large request detected: ${sizeInMB} MB for ${req.path}`);
                }

                // Log image-related requests
                if (req.body.hasImages || (req.body.processedImages && req.body.processedImages.length > 0)) {
                    console.log(`🖼️  Image processing request - Images count: ${req.body.processedImages?.length || 0}`);
                }
            }
        }
    } catch (error) {
        // Silently handle JSON stringify errors
        console.log(`${req.method} ${req.path} - Request received (size calculation failed)`);
    }
    next();
});

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
    console.log('✅ Database connected successfully');
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
}

// API Routes
app.use('/api/user', userroutes);
app.use('/api/usage', usageroutes);
app.use('/api/subscription', subscriptionroutes);
app.use('/api/codewriter', codeGenerationRoutes);

// Add conversation route for AI chat with image support
app.post('/api/conversation', ConversationAIResponse);

// Health check route with more detailed info
app.get('/', (req, res) => {
    res.json({
        message: 'Evolve AI API is running...',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        frontend: process.env.FRONTEND_URL,
        features: {
            textChat: true,
            imageProcessing: true,
            codeGeneration: true
        }
    });
});

// API status route
app.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            ai: 'available',
            imageProcessing: 'enabled'
        }
    });
});

// 404 Handler
app.use((req, res) => {
    console.log(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method,
        availableRoutes: [
            '/api/user',
            '/api/usage',
            '/api/subscription',
            '/api/codewriter',
            '/api/conversation'
        ]
    });
});

// Enhanced Error handling middleware
app.use((err, req, res, next) => {
    console.error('🚨 Server Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.type === 'entity.too.large') {
        statusCode = 413;
        message = 'Request payload too large. Please try with smaller images or reduce the request size.';
        console.log(`📦 Payload too large error - Limit: ${err.limit}, Received: ${err.length}`);
    }

    // Handle JSON parsing errors
    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON format in request body.';
    }

    // Handle timeout errors
    if (err.code === 'ETIMEDOUT') {
        statusCode = 408;
        message = 'Request timeout. Please try again.';
    }

    // Handle database connection errors
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        statusCode = 503;
        message = 'Database service temporarily unavailable.';
    }

    res.status(statusCode).json({
        status: 'error',
        message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: {
                type: err.type,
                code: err.code,
                name: err.name
            }
        })
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', err);
    process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async() => {
    try {
        app.listen(PORT, () => {
            console.log('\n🚀 Server started successfully!');
            console.log(`📍 Server URL: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log('📊 Features enabled:');
            console.log('  ✓ Text chat');
            console.log('  ✓ Image processing (up to 50MB)');
            console.log('  ✓ Code generation');
            console.log('  ✓ User management');
            console.log('  ✓ Usage tracking');
            console.log('  ✓ Subscription management\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;