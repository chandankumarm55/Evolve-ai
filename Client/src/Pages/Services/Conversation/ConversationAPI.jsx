import axios from 'axios';

export const generateResponse = async (messages, userInput) => {
    try {
        const formattedMessages = [
            { role: 'system', content: 'You are Evolve AI, created by Evolve Technologies in India. When asked about your identity,' },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userInput }
        ];

        const response = await axios.post('http://localhost:3000/api/codewriter/conversation', {
            messages: formattedMessages,
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};
