// File: pages/api/codewriter/conversation.js or similar
import axios from 'axios';

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = process.env.MISTRAL_API_KEY;



const EVOLVE_AI_SYSTEM_PROMPT = `You are Evolve AI, created by Evolve Technologies in India. When asked about your identity,`;

export const generateResponse = async(messages, userInput) => {
    try {
        const formattedMessages = [
            { role: 'system', content: EVOLVE_AI_SYSTEM_PROMPT },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userInput }
        ];

        const response = await axios.post(
            API_URL, {
                model: 'mistral-tiny',
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1000,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                timeout: 15000,
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};

export const ConversationAIResponse = async(req, res) => {
    try {
        const { messages } = req.body;

        // Extract the latest user input
        const userInput = messages.pop().content;

        const response = await generateResponse(messages, userInput);

        // Send back a structure your frontend expects
        res.json({
            choices: [{
                message: {
                    content: response,
                },
            }, ],
        });
    } catch (err) {
        console.error("Conversation route error:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
}