import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const generateResponse = async (messages, userInput, images = []) => {
    try {
        console.log('ConversationAPI - generateResponse called with:', {
            userInput: userInput?.substring(0, 50) + '...',
            imagesCount: images.length,
            messagesCount: messages.length
        });

        // Format the messages for the backend
        const formattedMessages = [
            {
                role: 'system',
                content: 'You are Evolve AI, created by Evolve Technologies in India. When asked about your identity, respond accordingly. You can analyze images and provide detailed descriptions, insights, and answer questions about visual content.'
            },
            ...messages.filter(msg => msg.role !== 'system') // Remove any existing system messages
        ];

        // Add the new user message
        const userMessage = {
            role: 'user',
            content: userInput || "Please analyze this image."
        };

        // If there are images, add them to the user message
        if (images && images.length > 0) {
            userMessage.images = images;
        }

        formattedMessages.push(userMessage);

        console.log('Sending to backend:', {
            messagesCount: formattedMessages.length,
            hasImages: images && images.length > 0,
            imagesCount: images.length
        });

        const response = await axios.post(`${BACKEND_URL}/api/codewriter/conversation`, {
            messages: formattedMessages,
            hasImages: images && images.length > 0,
            processedImages: images // Send processed images separately
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('ConversationAPI Error:', error);
        if (error.response?.data?.error?.includes('vision') || error.response?.data?.error?.includes('image')) {
            return "I'm sorry, but I'm currently having trouble processing images. Please try again with text only or try again later.";
        }
        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};