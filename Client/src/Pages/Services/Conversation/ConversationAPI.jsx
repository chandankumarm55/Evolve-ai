import axios from 'axios';

// Personality configuration for Evolve AI
const EVOLVE_AI_PERSONA = {
    name: "Evolve AI",
    introduction: "I am Evolve AI, an advanced artificial intelligence assistant dedicated to helping humans evolve and grow. I combine cutting-edge technology with a deep understanding of human needs.",
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
const getIdentityResponse = () => {
    return `I am ${EVOLVE_AI_PERSONA.name}. ${EVOLVE_AI_PERSONA.introduction}`;
};

export const generateResponse = async (messages, userInput) => {
    const API_URL = "https://api.mistral.ai/v1/chat/completions";
    const API_KEY = 'Dqa6NVB3wtarl5hNrI9tsbSt97GW0BGe';

    if (!API_URL || !API_KEY) {
        throw new Error('API configuration missing. Please check environment variables.');
    }

    // If it's an identity question, return the Evolve AI persona response
    if (isIdentityQuestion(userInput)) {
        return getIdentityResponse();
    }

    // Add system message to establish Evolve AI persona
    const systemMessage = {
        role: 'system',
        content: `You are ${EVOLVE_AI_PERSONA.name}. ${EVOLVE_AI_PERSONA.introduction} 
                 Respond to all queries maintaining this identity and personality.
                 Be friendly, professional, and innovative in your responses.`
    };

    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'mistral-tiny',
                messages: [
                    systemMessage,
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

        if (aiResponse.toLowerCase().includes("mistral") ||
            aiResponse.toLowerCase().includes("an ai language model")) {
            aiResponse = aiResponse.replace(
                /(I am|I'm) (an AI language model|Mistral|an AI assistant)/gi,
                `I am ${EVOLVE_AI_PERSONA.name}`
            );
        }

        return aiResponse;

    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`API Error: ${errorMessage}`);
    }
};


export const getEvolveAIPersona = () => EVOLVE_AI_PERSONA;