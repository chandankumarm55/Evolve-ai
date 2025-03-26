import dotenv from 'dotenv';
import axios from 'axios';
import { BASE_PROMPT, getSystemPrompt, CONTINUE_PROMPT } from '../utils/prompts.js';
import { basePrompt as reactBasePrompt } from '../defaults/react.js';

dotenv.config();

// OpenAI API URL and key (you should move this to .env file)
const AI_API_URL = "https://api.mistral.ai/v1/chat/completions";
const AI_API_KEY = 'Dqa6NVB3wtarl5hNrI9tsbSt97GW0BGe';

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
                model: 'mistral-medium', // Updated model name
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

        // Detailed logging
        console.log('API Response:', response.data);

        // Additional check for response structure
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Unexpected API response structure');
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        // More comprehensive error logging
        console.error('Full error object:', error);

        // Check if it's an axios error with response
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);

            throw new Error(`API Error: ${error.response.data.message || 'Unknown error'}`);
        }
        // Check for network or other errors
        else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('No response received from the server');
        }
        // Other errors
        else {
            console.error('Error setting up request:', error.message);
            throw new Error(`Request setup error: ${error.message}`);
        }
    }
};

// Controller functions remain the same
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
            return res.status(400).json({
                error: "Valid messages array is required",
                details: "Messages should be an array of message objects"
            });
        }

        const response = await generateAIResponse(messages, 12000, getSystemPrompt());

        res.json({
            response: response,
            rawContent: response // Optional: send raw content for debugging
        });
    } catch (error) {
        console.error("Comprehensive Chat Endpoint Error:", {
            message: error.message,
            stack: error.stack
        });

        res.status(500).json({
            error: "Failed to process chat request",
            details: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
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

        const response = await generateAIResponse(messagesWithContinue, 12000, getSystemPrompt());

        res.json({
            response: response
        });
    } catch (error) {
        console.error("Continue chat endpoint error:", error);
        res.status(500).json({ error: error.message || "Failed to process continue request" });
    }
};

export default {
    getTemplate,
    generateChat,
    continueChat
};