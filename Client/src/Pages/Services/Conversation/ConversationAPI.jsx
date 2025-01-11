import axios from 'axios';

export const generateResponse = async (messages, userInput) => {
    const API_URL = "https://api.mistral.ai/v1/chat/completions";
    const API_KEY = 'Dqa6NVB3wtarl5hNrI9tsbSt97GW0BGe';

    if (!API_URL || !API_KEY) {
        throw new Error('API configuration missing. Please check environment variables.');
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
                timeout: 10000, // Timeout of 10 seconds
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`API Error: ${errorMessage}`);
    }
};
