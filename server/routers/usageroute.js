// routes/usage.js
import express from 'express';
import { checkUsageLimit, trackUsage, getUsageStatus } from '../controllers/usagecontroller.js';

const usageRouter = express.Router();

usageRouter.post('/track', checkUsageLimit, trackUsage);
usageRouter.get('/status/:clerkId', getUsageStatus);

export default usageRouter;