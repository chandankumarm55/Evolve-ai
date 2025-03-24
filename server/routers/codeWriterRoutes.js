// routers/codewriter.js
import express from 'express';
import { getTemplate, generateChat, continueChat } from '../controllers/codeWriterController.js';

const router = express.Router();

// Public routes
router.post('/template', getTemplate);

// Protected routes (requiring authentication)
router.post('/chat', generateChat);
router.post('/continue', continueChat);

export default router;