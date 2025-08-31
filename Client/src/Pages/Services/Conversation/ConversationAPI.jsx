import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const generateResponse = async (messages, userInput, images = [], onChunk = null) => {
    try {
        console.log('ConversationAPI - generateResponse called with:', {
            userInput: userInput?.substring(0, 50) + '...',
            imagesCount: images.length,
            messagesCount: messages.length,
            streaming: !!onChunk
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
            imagesCount: images.length,
            streaming: !!onChunk
        });

        // If streaming is requested
        if (onChunk) {
            return await handleStreamingRequest(formattedMessages, images, onChunk);
        } else {
            // Non-streaming request (fallback)
            const response = await axios.post(`${BACKEND_URL}/api/codewriter/conversation`, {
                messages: formattedMessages,
                hasImages: images && images.length > 0,
                processedImages: images
            });

            return response.data.choices[0].message.content;
        }
    } catch (error) {
        console.error('ConversationAPI Error:', error);

        if (error.response?.data?.error?.includes('vision') || error.response?.data?.error?.includes('image')) {
            throw new Error("I'm sorry, but I'm currently having trouble processing images. Please try again with text only or try again later.");
        }

        if (error.response?.status === 413) {
            throw new Error("The request is too large. Please try with smaller images or fewer images at once.");
        }

        if (error.response?.status === 429) {
            throw new Error("You have reached your daily limit. Please upgrade to continue using our services. [USAGE_LIMIT]");
        }

        throw new Error("I apologize, but I'm having trouble processing your request. Please try again.");
    }
};

// FIXED streaming request handler
const handleStreamingRequest = async (formattedMessages, images, onChunk) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/codewriter/conversation-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: formattedMessages,
                hasImages: images && images.length > 0,
                processedImages: images
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response is actually streaming (SSE)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/event-stream')) {
            // Handle non-streaming response
            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const content = data.choices[0].message.content;
                // Simulate streaming for better UX
                simulateStreaming(content, onChunk);
                return content;
            }
            throw new Error('Invalid response format');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            return fullContent;
                        }

                        if (data) {
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                                    const content = parsed.choices[0].delta.content;
                                    if (content) {
                                        fullContent += content;
                                        onChunk(content, fullContent);
                                    }
                                }
                            } catch (parseError) {
                                console.warn('Failed to parse SSE data:', data);
                            }
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return fullContent;
    } catch (error) {
        console.error('Streaming request error:', error);
        throw error;
    }
};

// Helper function to simulate streaming for non-streaming responses
const simulateStreaming = (content, onChunk) => {
    const words = content.split(' ');
    let currentContent = '';

    words.forEach((word, index) => {
        setTimeout(() => {
            currentContent += (index > 0 ? ' ' : '') + word;
            onChunk(word + ' ', currentContent);
        }, index * 50); // 50ms delay between words
    });
};