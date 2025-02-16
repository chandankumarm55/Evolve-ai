import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    transactionCount: {
        type: Number,
        default: 0
    }
});

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    profileImageUrl: {
        type: String
    },
    subscriptionPlan: {
        type: String,
        enum: ['Free', 'Starter', 'Pro'], // Explicitly define available plans
        default: 'Free'
    },
    subscriptionDetails: {
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active'
        },
        paymentId: String, // Store Razorpay payment ID
        priceAtPurchase: Number, // Store price at time of purchase
    },
    usage: [usageSchema],
    metrics: {
        conversations: {
            type: Number,
            default: 0
        },
        imagesGenerated: {
            type: Number,
            default: 0
        },
        dictionarySearches: {
            type: Number,
            default: 0
        },
        audioConversions: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Add method to check if subscription is expired
userSchema.methods.isSubscriptionExpired = function() {
    if (this.subscriptionPlan === 'Free') return false;
    return new Date() > new Date(this.subscriptionDetails.endDate);
};

const User = mongoose.model('User', userSchema);
export default User;