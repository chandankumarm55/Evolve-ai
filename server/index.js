import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './middlewares/db.js';
import userroutes from './routers/userroutes.js'
import serviceroutes from './routers/serviceroutes.js'
// Load environment variables
dotenv.config();

console.log("GIMINI API", process.env.GIMINI_API)
    // Initialize Express App
const app = express();

// Middleware
app.use(express.json());

// Connect to Database
connectDB();

app.use('/api/user', userroutes);
app.use('/api/service', serviceroutes);


app.get('/', (req, res) => {
    res.send('API is running...');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});