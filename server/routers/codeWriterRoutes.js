import express from "express";
import axios from "axios";
import cors from "cors";
import { BASE_PROMPT, getSystemPrompt } from "../utils/prompts.js";
import { basePrompt as reactBasePrompt } from "../defaults/react.js";
import { MODIFICATIONS_TAG_NAME, WORK_DIR, allowedHTMLElements } from '../utils/constants.js';
import { stripIndents } from "../utils/stripindents.js";

// Mistral AI API URL and key
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_API_KEY = "Dqa6NVB3wtarl5hNrI9tsbSt97GW0BGe"

// Define Mistral system prompt
const BOLT_AI_SYSTEM_PROMPT = `You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.`;

const router = express.Router();

// Helper function to generate response using Mistral AI
const generateMistralResponse = async(messages, maxTokens = 12000, systemPrompt = BOLT_AI_SYSTEM_PROMPT) => {
    try {
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        const response = await axios.post(
            MISTRAL_API_URL, {
                model: 'mistral-large-latest',
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: maxTokens,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                },
                timeout: 100000, // 60 second timeout
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating response from Mistral AI:', error.response.data || error.message);
        throw new Error('Failed to generate response from Mistral AI');
    }
};

// Template endpoint
router.post("/template", async(req, res) => {
    try {
        const prompt = req.body.prompt;

        // Simple system prompt to classify as node or react
        const templateSystemPrompt = "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra";

        const answer = await generateMistralResponse(
            [{ role: 'user', content: prompt }],
            200,
            templateSystemPrompt
        );

        const cleanAnswer = answer.trim().toLowerCase();

        if (cleanAnswer.includes("react")) {
            res.json({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            });
            return;
        }



        res.status(403).json({ message: "You cant access this" });
    } catch (error) {
        console.error("Template endpoint error:", error);
        res.status(500).json({ error: "Failed to process template request" });
    }
});

// Chat endpoint
router.post("/chat", async(req, res) => {
    try {
        const messages = req.body.messages;
        const response = await generateMistralResponse(messages, 8000, getSystemPrompt());

        res.json({
            response: response
        });
    } catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
});
export default router;