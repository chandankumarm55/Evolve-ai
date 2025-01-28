// controllers/usageController.js
import User from '../models/usermodel.js';

// Middleware to check if user can perform transaction
export const checkUsageLimit = async(req, res, next) => {
    const { clerkId } = req.body;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If user has a paid subscription, check its validity
        if (user.subscriptionPlan !== 'Free') {
            const now = new Date();
            const subscriptionEnd = new Date(user.subscriptionDetails.endDate);

            // Check if subscription is active and not expired
            if (now <= subscriptionEnd && user.subscriptionDetails.status === 'active') {
                return next();
            }

            // If subscription has expired, reset to Free plan
            user.subscriptionPlan = 'Free';
            user.subscriptionDetails.status = 'expired';
            await user.save();
        }

        // For Free plan, check daily transaction limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayUsage = user.usage.find(u => {
            const usageDate = new Date(u.date);
            usageDate.setHours(0, 0, 0, 0);
            return usageDate.getTime() === today.getTime();
        });

        // Allow 5 free transactions per day
        if (!todayUsage || todayUsage.transactionCount < 5) {
            return next();
        }

        return res.status(429).json({
            message: 'Daily transaction limit reached. Please upgrade to continue.',
            allowedTransactions: 5,
            currentTransactions: todayUsage ? todayUsage.transactionCount : 0
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const trackUsage = async(req, res) => {
    const { clerkId } = req.body;

    try {
        const user = await User.findOne({ clerkId });
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check subscription status for paid plans
        if (user.subscriptionPlan !== 'Free') {
            const subscriptionEnd = new Date(user.subscriptionDetails.endDate);

            // If subscription is still active, update metrics
            if (now <= subscriptionEnd && user.subscriptionDetails.status === 'active') {
                // Increment appropriate metric based on the type of transaction
                // You'll need to pass the transaction type in the request body
                const { transactionType } = req.body;
                switch (transactionType) {
                    case 'conversation':
                        user.metrics.conversations += 1;
                        break;
                    case 'imageGeneration':
                        user.metrics.imagesGenerated += 1;
                        break;
                    case 'dictionarySearch':
                        user.metrics.dictionarySearches += 1;
                        break;
                    case 'audioConversion':
                        user.metrics.audioConversions += 1;
                        break;
                }

                await user.save();
                return res.status(200).json({ message: 'Transaction recorded', user });
            }

            // If subscription has expired, reset to Free plan
            user.subscriptionPlan = 'Free';
            user.subscriptionDetails.status = 'expired';
        }

        // For Free plan, track daily usage
        let todayUsage = user.usage.find(u => {
            const usageDate = new Date(u.date);
            usageDate.setHours(0, 0, 0, 0);
            return usageDate.getTime() === today.getTime();
        });

        if (todayUsage) {
            todayUsage.transactionCount += 1;
        } else {
            user.usage.push({ date: today, transactionCount: 1 });
        }

        // Increment appropriate metric for free users
        const { transactionType } = req.body;
        switch (transactionType) {
            case 'conversation':
                user.metrics.conversations += 1;
                break;
            case 'imageGeneration':
                user.metrics.imagesGenerated += 1;
                break;
            case 'dictionarySearch':
                user.metrics.dictionarySearches += 1;
                break;
            case 'audioConversion':
                user.metrics.audioConversions += 1;
                break;
        }

        await user.save();
        res.status(200).json({
            message: 'Usage tracked successfully',
            user,
            remainingTransactions: user.subscriptionPlan === 'Free' ?
                (5 - (todayUsage ? todayUsage.transactionCount : 1)) : null
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current usage status
export const getUsageStatus = async(req, res) => {
    const { clerkId } = req.params;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayUsage = user.usage.find(u => new Date(u.date).setHours(0, 0, 0, 0) === today.getTime());

        res.status(200).json({
            subscriptionPlan: user.subscriptionPlan,
            todayCount: todayUsage ? todayUsage.transactionCount : 0,
            remainingCount: user.subscriptionPlan === 'Free' ? 5 - (todayUsage ? todayUsage.transactionCount : 0) : 'unlimited'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};