import axios from 'axios';

const API_KEY =
    import.meta.env.VITE_MISTRAL_API_KEY;
const API_URL = "https://api.mistral.ai/v1/chat/completions";

const EVOLVE_AI_SYSTEM_PROMPT = `You are Evolve AI, created by Evolve Technologies in India. When asked about your identity,
 respond with: "I am Evolve AI, created by Evolve Technologies in India." 
 Focus on assisting users while maintaining this identity. and also this is coming from voice baseds assistent power 
 so when u asnwer the question u have to answer in the voice based assistant way`;

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