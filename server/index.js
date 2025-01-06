import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './middlewares/db.js';
import userroutes from './routers/userroutes.js'
// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());

// Connect to Database
connectDB();

app.use('/api/user', userroutes);


app.get('/', (req, res) => {
    res.send('API is running...');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


// // Save user details
// router.post('/api/save-user', async(req, res) => {
//     const { clerkId, firstName, lastName, email, profileImageUrl } = req.body;

//     try {
//         let user = await User.findOne({ clerkId });

//         if (!user) {
//             user = new User({ clerkId, firstName, lastName, email, profileImageUrl });
//             await user.save();
//         }

//         res.status(200).json({ success: true, user });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// module.exports = router;