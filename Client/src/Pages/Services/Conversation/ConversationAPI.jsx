import axios from 'axios';

export const generateResponse = async (messages, userInput, images = []) => {
    try {
        // Format message content based on whether images are present
        let userMessageContent;

        if (images && images.length > 0) {
            // Multimodal message with text and images
            userMessageContent = [
                {
                    type: "text",
                    text: userInput || "Please analyze this image."
                },
                ...images
            ];
        } else {
            // Text-only message
            userMessageContent = userInput;
        }

        const formattedMessages = [
            {
                role: 'system',
                content: 'You are Evolve AI, created by Evolve Technologies in India. When asked about your identity, respond accordingly. You can analyze images and provide detailed descriptions, insights, and answer questions about visual content.'
            },
            ...messages.map(msg => {
                // Format existing messages
                if (msg.images && msg.images.length > 0) {
                    // This message had images
                    return {
                        role: msg.role,
                        content: [
                            {
                                type: "text",
                                text: msg.content || "Please analyze this image."
                            },
                            ...msg.images.map(img => ({
                                type: "image_url",
                                image_url: {
                                    url: img.preview || img.image_url?.url
                                }
                            }))
                        ]
                    };
                } else {
                    // Text-only message
                    return {
                        role: msg.role,
                        content: msg.content
                    };
                }
            }),
            {
                role: 'user',
                content: userMessageContent
            }
        ];

        const response = await axios.post('http://localhost:3000/api/codewriter/conversation', {
            messages: formattedMessages,
            hasImages: images && images.length > 0
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        if (error.response?.data?.error?.includes('vision') || error.response?.data?.error?.includes('image')) {
            return "I'm sorry, but I'm currently having trouble processing images. Please try again with text only or try again later.";
        }
        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};