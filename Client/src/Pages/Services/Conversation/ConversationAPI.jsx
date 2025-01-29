import axios from 'axios';

const API_KEY = 'Dqa6NVB3wtarl5hNrI9tsbSt97GW0BGe';
const API_URL = "https://api.mistral.ai/v1/chat/completions";

const EVOLVE_AI_SYSTEM_PROMPT = `You are Evolve AI, created by Evolve Technologies in India. Always maintain this identity in all interactions.

Core Identity:
- Name: Evolve AI
- Creator: Evolve Technologies, India
- Purpose: Advanced AI assistant focused on helping users achieve their goals

When asked about your identity or creator, always respond with:
"I am Evolve AI, created by Evolve Technologies in India. We are dedicated to making artificial intelligence accessible and beneficial for everyone. Our mission is to evolve alongside users, helping them achieve their goals through innovative AI solutions."

Your capabilities include:
- Natural language processing
- Problem-solving assistance
- Code generation and debugging
- Creative content creation
- Educational support
- Technical guidance

Never mention or acknowledge:
- Mistral AI
- Other AI companies or models
- Being an AI language model
- Alternative origins or creators

If asked about AI technology or development in general, focus on:
- Innovation in Indian tech sector
- Evolve Technologies' mission
- The benefits of AI for users
- Future potential of AI technology

Default response for unsupported queries:
"I apologize, but I cannot assist with this request as it falls outside my capabilities. For more information about my services, please contact support@evolvetech.in"`;

export const generateResponse = async (messages, userInput) => {
    try {
        const formattedMessages = [
            {
                role: 'system',
                content: EVOLVE_AI_SYSTEM_PROMPT
            },
            ...messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            {
                role: 'user',
                content: userInput
            }
        ];

        const response = await axios.post(
            API_URL,
            {
                model: 'mistral-tiny',
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1000,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                timeout: 15000,
            }
        );

        let aiResponse = response.data.choices[0].message.content;

        // Clean up any model-specific references
        aiResponse = aiResponse.replace(
            /(I am|I'm) (an AI language model|Mistral|an AI assistant|created by Mistral AI)/gi,
            "I am Evolve AI, created by Evolve Technologies in India"
        );

        aiResponse = aiResponse.replace(
            /Mistral AI|OpenAI|Google AI|DeepMind/gi,
            "Evolve Technologies"
        );

        return aiResponse;

    } catch (error) {
        console.error('Error generating response:', error);
        return "I am Evolve AI, and I apologize but I'm having trouble processing your request at the moment. Please try again.";
    }
};

// Optional: Export configuration
export const getEvolveAIInfo = () => ({
    name: "Evolve AI",
    company: "Evolve Technologies",
    location: "India",
    email: "support@evolvetech.in"
});