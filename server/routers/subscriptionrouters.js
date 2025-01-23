import express from 'express';
import { getSubscriptionStatus, updateSubscription } from '../controllers/subscriptioncontroller.js';

const router = express.Router();

router.post('/update', updateSubscription);
router.post('/status/:clerkId', getSubscriptionStatus);

export default router;