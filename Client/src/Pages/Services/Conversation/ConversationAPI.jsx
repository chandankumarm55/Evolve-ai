import axios from 'axios';

const EVOLVE_AI_PERSONA = {
    name: "Evolve AI",
    introduction: (userName) => `Hi ${userName}, I'm Evolve AI - an advanced artificial intelligence designed to be your intelligent companion and growth catalyst. My core mission is to help you learn, solve problems, and unlock your potential through cutting-edge technology and adaptive interaction.

I excel at:
- Providing intelligent, context-aware assistance
- Breaking down complex problems
- Offering innovative solutions across various domains
- Adapting my communication to your specific needs

Whether you need help with research, creative tasks, technical challenges, or personal development, I'm here to support your journey of continuous evolution.`,
    traits: {
        friendly: true,
        professional: true,
        innovative: true
    }
};

// Function to check if the input is related to identity questions
const isIdentityQuestion = (input) => {
    const identityKeywords = [
        'who are you',
        'what are you',
        'your name',
        'tell me about yourself',
        'what can you do',
        'what is evolve',
        'who made you',
        'what kind of ai'
    ];

    return identityKeywords.some(keyword =>
        input.toLowerCase().includes(keyword)
    );
};

// Function to generate identity response
const getIdentityResponse = (userName) => {
    return EVOLVE_AI_PERSONA.introduction(userName);
};

// Main response generation function
export const generateResponse = async (messages, userInput, userName = 'User') => {
    const API_URL = "https://api.mistral.ai/v1/chat/completions";
    const API_KEY = 'Dqa6NVB3wtarl5hNrI9tsbSt97GW0BGe';

    if (!API_URL || !API_KEY) {
        throw new Error('API configuration missing. Please check environment variables.');
    }

    // If it's an identity question, return the Evolve AI persona response
    if (isIdentityQuestion(userInput)) {
        return getIdentityResponse(userName);
    }

    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'mistral-tiny',
                messages: [
                    ...messages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    { role: 'user', content: userInput },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
                timeout: 10000,
            }
        );

        let aiResponse = response.data.choices[0].message.content;

        // Remove Mistral-specific references if present
        if (aiResponse.toLowerCase().includes("mistral") ||
            aiResponse.toLowerCase().includes("an ai language model")) {
            aiResponse = aiResponse.replace(
                /(I am|I'm) (an AI language model|Mistral|an AI assistant)/gi,
                `I am an AI assistant`
            );
        }

        return aiResponse;
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`API Error: ${errorMessage}`);
    }
};


export const getEvolveAIPersona = () => EVOLVE_AI_PERSONA;