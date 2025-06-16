import express from "express";
import { continueConversation, downloadFiles, generateCode } from "../controllers/htmlCssJsWriterController.js";
import { ConversationAIResponse } from "../controllers/conversationController.js";
import { pythonCodeGenerator } from "../controllers/pythonCodeController.js";

const router = express.Router();

// Define routes
router.post("/htmlcssjscodegenerate", generateCode);
router.post('/continue', continueConversation);

// Download files as zip
router.post('/download', downloadFiles);


router.post("/conversation", ConversationAIResponse);
router.post("/pythoncodegenerate", pythonCodeGenerator);

export default router;