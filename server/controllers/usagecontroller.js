// routes/usage.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check if user can perform transaction
const checkUsageLimit = async(req, res, next) => {
    const { clerkId } = req.body;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user has premium subscription, allow transaction
        if (user.subscriptionPlan !== 'Free') {
            return next();
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's usage
        const todayUsage = user.usage.find(
            u => new Date(u.date).setHours(0, 0, 0, 0) === today.getTime()
        );

        // If no usage today or under limit, allow transaction
        if (!todayUsage || todayUsage.transactionCount < 5) {
            return next();
        }

        return res.status(429).json({
            message: 'Daily transaction limit reached. Please upgrade to continue.'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Record usage
router.post('/track', checkUsageLimit, async(req, res) => {
    const { clerkId } = req.body;

    try {
        const user = await User.findOne({ clerkId });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If user has premium subscription, don't track usage
        if (user.subscriptionPlan !== 'Free') {
            return res.status(200).json({ message: 'Transaction recorded' });
        }

        // Find or create today's usage record
        let todayUsage = user.usage.find(
            u => new Date(u.date).setHours(0, 0, 0, 0) === today.getTime()
        );

        if (todayUsage) {
            todayUsage.transactionCount += 1;
        } else {
            user.usage.push({
                date: today,
                transactionCount: 1
            });
        }

        await user.save();
        res.status(200).json({ message: 'Usage tracked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current usage status
router.get('/status/:clerkId', async(req, res) => {
    const { clerkId } = req.params;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayUsage = user.usage.find(
            u => new Date(u.date).setHours(0, 0, 0, 0) === today.getTime()
        );

        res.status(200).json({
            subscriptionPlan: user.subscriptionPlan,
            todayCount: todayUsage ? todayUsage.transactionCount : 0,
            remainingCount: user.subscriptionPlan === 'Free' ?
                5 - (todayUsage ? todayUsage.transactionCount : 0) : 'unlimited'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;