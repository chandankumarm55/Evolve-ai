import express from "express";
import { continueConversation, downloadFiles, generateCode } from "../controllers/htmlCssJsWriterController.js";
import { ConversationAIResponse } from "../controllers/conversationController.js";
import { pythonCodeGenerator } from "../controllers/pythonCodeController.js";
import sqlController from "../controllers/sqlCodeWriterController.js";

const router = express.Router();

// Middleware for request validation
const validateRequest = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        next();
    };
};

// Existing routes
router.post("/htmlcssjscodegenerate", generateCode);
router.post('/continue', continueConversation);
router.post('/download', downloadFiles);
router.post("/conversation", ConversationAIResponse);
router.post("/pythoncodegenerate", pythonCodeGenerator);

// SQL Code Writer routes
router.post("/sqlcodegenerate", validateRequest(['prompt']), sqlController.generateSQL.bind(sqlController));
router.post("/sqlschema", validateRequest(['description']), sqlController.generateSchema.bind(sqlController));
router.post("/sqloptimize", validateRequest(['sqlQuery']), sqlController.optimizeSQL.bind(sqlController));
router.post("/sqlerdiagram", validateRequest(['tables', 'relationships']), sqlController.generateERDiagram.bind(sqlController));
router.post("/sqltips", validateRequest(['databaseType', 'scenario']), sqlController.getDatabaseTips.bind(sqlController));
router.get("/sqlhealth", sqlController.healthCheck.bind(sqlController));

export default router;