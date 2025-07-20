// File: pages/api/codewriter/conversation.js or similar
import axios from 'axios';

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = process.env.MISTRAL_API_KEY;

const EVOLVE_AI_SYSTEM_PROMPT = `You are Evolve AI, created by Evolve Technologies in India. When asked about your identity, respond accordingly. You can analyze images and provide detailed descriptions, insights, and answer questions about visual content. Be helpful, accurate, and engaging in your responses.`;

export const generateResponse = async(messages, userInput, hasImages = false) => {
    try {
        // Choose the appropriate model based on whether images are present
        const model = hasImages ? 'pixtral-12b-2409' : 'mistral-small-latest';

        const formattedMessages = [
            { role: 'system', content: EVOLVE_AI_SYSTEM_PROMPT },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        const requestBody = {
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: hasImages ? 1500 : 1000, // Increase tokens for image analysis
        };

        const response = await axios.post(
            API_URL,
            requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                timeout: hasImages ? 30000 : 15000, // Longer timeout for image processing
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);

        // Handle specific vision-related errors
        if (error.response.data.error.message.includes('vision') ||
            error.response.data.error.message.includes('image')) {
            return "I'm sorry, but I'm currently having trouble processing images. Please try again with text only or try again later.";
        }

        // Handle rate limiting
        if (error.response.status === 429) {
            return "I'm experiencing high demand right now. Please try again in a moment.";
        }

        // Handle model not available
        if (error.response.status === 404 && hasImages) {
            return "Image analysis is temporarily unavailable. Please try again with text only.";
        }

        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};

export const ConversationAIResponse = async(req, res) => {
    try {
        const { messages, hasImages = false } = req.body;

        // Extract the latest user input
        const latestMessage = messages[messages.length - 1];
        const userInput = typeof latestMessage.content === 'string' ?
            latestMessage.content :
            latestMessage.content.find(c => c.type === 'text').text || '';

        // Get all messages except the last one for context
        const contextMessages = messages.slice(0, -1);

        const response = await generateResponse(contextMessages, userInput, hasImages);

        // Send back a structure your frontend expects
        res.json({
            choices: [{
                message: {
                    content: response,
                },
            }],
        });
    } catch (err) {
        console.error("Conversation route error:", err);
        res.status(500).json({
            error: "Something went wrong.",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// If using Next.js API routes, export as default
export default ConversationAIResponse;