import User from '../models/usermodel.js';

// login and creating the user in backend
export const Login = async(req, res) => {
    try {
        const { clerkId } = req.body;
        console.log('User data:', req.body);
        if (!clerkId) {
            return res.status(400).json({ message: 'ClerkID is required. Please login.' });
        }
        const existingUser = await User.findOne({ clerkId });

        if (existingUser) {
            return res.status(200).json({ message: 'Login Successful', user: existingUser });
        }
        const user = await User.create({
            clerkId,

        });

        return res.status(201).json({ message: 'User created successfully', user });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};