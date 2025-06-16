import dotenv from 'dotenv';
import axios from 'axios';
import { BASE_PROMPT, getSystemPrompt, CONTINUE_PROMPT } from '../utils/prompts.js';
import { basePrompt as reactBasePrompt } from '../defaults/react.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


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


import { dirname } from 'path';

// Get directory name
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

// Define files directory
const FILES_DIR = path.join(__dirname, '../files');

// Make sure the files directory exists
const ensureFilesDir = async() => {
    try {
        await fs.access(FILES_DIR);
    } catch (error) {
        await fs.mkdir(FILES_DIR, { recursive: true });
    }
};

ensureFilesDir();

// Function to generate AI response for HTML/CSS/JS
const generateAiresponseHtmlCss = async(conversation) => {
    try {
        // Configure your AI API endpoint and key
        const API_URL = process.env.AI_API_URL || 'https://api.mistral.ai/v1/chat/completions';
        const API_KEY = process.env.AI_API_KEY;

        if (!API_KEY) {
            throw new Error('AI API key is not configured');
        }

        // Prepare the system message to guide AI to generate separate HTML, CSS, and JS
        const systemMessage = {
            role: 'system',
            content: `You are an expert web developer. Generate HTML, CSS, and JavaScript code based on user requests. 
            Always organize your response with clear sections for each file type.
            Format your response as follows:
            
            <!-- HTML -->
            <!DOCTYPE html>
            <html>
            ...
            </html>
            
            /* CSS */
            <style>
            ...
            </style>
            
            /* JavaScript */
            <script>
            ...
            </script>
            
            Only generate code - no explanations unless specifically requested. Ensure the CSS and JavaScript are properly linked in the HTML.`
        };

        // Create full conversation with system message
        const fullConversation = [systemMessage, ...conversation];

        // Call the AI API
        const response = await axios.post(
            API_URL, {
                model: 'mistral-large-latest', // Use the appropriate model name
                messages: fullConversation,
                temperature: 0.7,
                max_tokens: 4000
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract the generated code from the response
        const generatedCode = response.data.choices[0].message.content;
        return generatedCode;
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`Failed to generate code: ${error.message}`);
    }
};

// Controller methods
export const generateCode = async(req, res) => {
    try {
        const { prompt, conversation = [] } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Add current prompt to conversation
        const updatedConversation = [
            ...conversation,
            { role: 'user', content: prompt }
        ];

        // Generate code using AI
        const generatedCode = await generateAiresponseHtmlCss(updatedConversation);

        // Add AI response to conversation
        updatedConversation.push({ role: 'assistant', content: generatedCode });

        // Create a record but don't split the files
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
        const filename = `generated_${timestamp}.html`;

        // Optionally save the complete code for reference
        await fs.writeFile(path.join(FILES_DIR, filename), generatedCode);

        res.status(201).json({
            message: 'Code generated successfully',
            filename,
            content: generatedCode,
            conversation: updatedConversation
        });
    } catch (error) {
        console.error('Error in generateCode:', error);
        res.status(500).json({ message: error.message });
    }
};

export const continueConversation = async(req, res) => {
    try {
        const { prompt, conversation = [] } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Add new prompt to conversation
        const updatedConversation = [
            ...conversation,
            { role: 'user', content: prompt }
        ];

        // Generate updated code
        const generatedCode = await generateAiresponseHtmlCss(updatedConversation);

        // Add AI response to conversation
        updatedConversation.push({ role: 'assistant', content: generatedCode });

        // Optionally save for reference
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
        const filename = `generated_${timestamp}.html`;
        await fs.writeFile(path.join(FILES_DIR, filename), generatedCode);

        res.status(200).json({
            message: 'Code updated successfully',
            filename,
            content: generatedCode,
            conversation: updatedConversation
        });
    } catch (error) {
        console.error('Error in continueConversation:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all files
export const getFiles = async(req, res) => {
    try {
        await ensureFilesDir();
        const files = await fs.readdir(FILES_DIR);

        const fileData = files
            .filter(file => !file.startsWith('.')) // Filter out hidden files
            .map(file => ({
                name: file,
                path: `/api/files/${file}`
            }));

        res.status(200).json(fileData);
    } catch (error) {
        console.error('Error getting files:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get file content
export const getFileContent = async(req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(FILES_DIR, fileName);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({ message: 'File not found' });
        }

        const content = await fs.readFile(filePath, 'utf-8');

        res.status(200).json({
            name: fileName,
            content
        });
    } catch (error) {
        console.error('Error getting file content:', error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    generateCode,
    continueConversation,
    getTemplate,
    generateChat,
    continueChat,

};