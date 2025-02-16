// routes/subscription.js
import express from 'express';
import User from '../models/usermodel.js';


export const updateSubscription = async(req, res) => {
    const { clerkId, subscriptionPlan, startDate, endDate, paymentId, priceAtPurchase } = req.body;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate subscription plan
        if (!['Free', 'Starter', 'Pro'].includes(subscriptionPlan)) {
            return res.status(400).json({ message: 'Invalid subscription plan' });
        }

        // Update subscription details
        user.subscriptionPlan = subscriptionPlan;
        user.subscriptionDetails = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: 'active',
            paymentId,
            priceAtPurchase
        };

        // Reset usage metrics for paid plans
        if (subscriptionPlan !== 'Free') {
            user.usage = [];
            user.metrics = {
                conversations: 0,
                imagesGenerated: 0,
                dictionarySearches: 0,
                audioConversions: 0
            };
        }

        await user.save();
        res.status(200).json({
            message: 'Subscription updated successfully',
            user
        });
    } catch (error) {
        console.error('Subscription update error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getSubscriptionStatus = async(req, res) => {
    const { clerkId } = req.params;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            subscriptionPlan: user.subscriptionPlan,
            subscriptionDetails: user.subscriptionDetails
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}