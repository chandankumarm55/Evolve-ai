import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImageUrl: {
        type: String
    },
    subscriptionPlan: {
        type: String,
        default: 'Free'
    },
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