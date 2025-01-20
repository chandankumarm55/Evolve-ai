// models/User.js
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
        default: 'Free'
    },
    subscriptionDetails: {
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active'
        }
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

const User = mongoose.model('User', userSchema);
export default User;