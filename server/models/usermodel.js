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

// Simple history schema with key-value pairs
const historySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['conversation', 'image_generation', 'dictionary_search', 'audio_conversion', 'translation', 'code_generation'],
        required: true
    },
    // Key-value pairs for storing any necessary details
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for better query performance
historySchema.index({ type: 1, createdAt: -1 });

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
        enum: ['Free', 'Starter', 'Pro'],
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
    history: [historySchema], // Added simple history array
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

// Method to add history item with key-value data
userSchema.methods.addHistoryItem = function(type, data) {
    this.history.unshift({
        type: type,
        data: data,
        createdAt: new Date()
    });

    // Optional: Limit history size (keep last 1000 items)
    if (this.history.length > 1000) {
        this.history = this.history.slice(0, 1000);
    }

    return this.save();
};

// Method to get history by type
userSchema.methods.getHistoryByType = function(type, limit = 50) {
    return this.history
        .filter(item => item.type === type)
        .slice(0, limit);
};

// Method to get all history with optional limit
userSchema.methods.getAllHistory = function(limit = 100) {
    return this.history.slice(0, limit);
};

// Method to delete specific history item
userSchema.methods.deleteHistoryItem = function(historyItemId) {
    this.history = this.history.filter(item => item._id.toString() !== historyItemId);
    return this.save();
};

// Method to clear all history
userSchema.methods.clearAllHistory = function() {
    this.history = [];
    return this.save();
};

// Method to clear history by type
userSchema.methods.clearHistoryByType = function(type) {
    this.history = this.history.filter(item => item.type !== type);
    return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;