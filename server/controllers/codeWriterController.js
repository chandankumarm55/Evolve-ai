//React Code Writer

// codeWriterController.js
import dotenv from 'dotenv';
import axios from 'axios';
import { BASE_PROMPT, getSystemPrompt, CONTINUE_PROMPT } from '../utils/prompts.js';
import { basePrompt as reactBasePrompt } from '../defaults/react.js';

dotenv.config();

// OpenAI API URL and key (you should move this to .env file)
const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_API_KEY = process.env.AI_API_KEY;

// Define AI system prompt
const REACT_AI_SYSTEM_PROMPT = `You are React Expert, an AI assistant and exceptional senior React developer with vast knowledge of React, JavaScript, TypeScript, and modern frontend development best practices.`;

// Helper function to generate response using AI service
const generateAIResponse = async(messages, maxTokens = 12000, systemPrompt = REACT_AI_SYSTEM_PROMPT) => {
    try {
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        const response = await axios.post(
            AI_API_URL, {
                model: process.env.AI_MODEL || 'gpt-4-turbo', // Use your preferred model
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: maxTokens,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_API_KEY}`,
                },
                timeout: 100000, // 100 second timeout
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating AI response:', error.response.data || error.message);
        throw new Error('Failed to generate AI response');
    }
};

// Controller functions
export const getTemplate = async(req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        });
    } catch (error) {
        console.error("Template endpoint error:", error);
        res.status(500).json({ error: "Failed to process template request" });
    }
};

export const generateChat = async(req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Valid messages array is required" });
        }

        // Check if the user has enough credits/usage available (you can implement this)
        // const hasCredits = await checkUserCredits(req.user.id);
        // if (!hasCredits) {
        //     return res.status(403).json({ error: "Insufficient credits" });
        // }

        const response = await generateAIResponse(messages, 8000, getSystemPrompt());

        // Update user usage/credits (you can implement this)
        // await updateUserUsage(req.user.id);

        res.json({
            response: response
        });
    } catch (error) {
        console.error("Chat endpoint error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
};

export const continueChat = async(req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Valid messages array is required" });
        }

        // Add the continue prompt
        const messagesWithContinue = [
            ...messages,
            { role: 'user', content: CONTINUE_PROMPT }
        ];

        const response = await generateAIResponse(messagesWithContinue, 8000, getSystemPrompt());

        res.json({
            response: response
        });
    } catch (error) {
        console.error("Continue chat endpoint error:", error);
        res.status(500).json({ error: "Failed to process continue request" });
    }
};

export default {
    getTemplate,
    generateChat,
    continueChat
};