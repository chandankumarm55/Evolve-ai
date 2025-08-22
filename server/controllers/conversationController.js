// File: controllers/conversationController.js
import axios from 'axios';

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = process.env.MISTRAL_API_KEY;

const EVOLVE_AI_SYSTEM_PROMPT = `You are Evolve AI, created by Evolve Technologies in India. When asked about your identity, respond accordingly. You can analyze images and provide detailed descriptions, insights, and answer questions about visual content. Be helpful, accurate, and engaging in your responses.`;

export const generateResponse = async(messages, userInput, hasImages = false) => {
    try {
        // Choose the appropriate model based on whether images are present
        const model = hasImages ? 'pixtral-12b-2409' : 'mistral-small-latest';

        console.log('Using model:', model);
        console.log('Has images:', hasImages);

        // Filter and format messages properly
        const formattedMessages = [];

        // Add system message only once
        formattedMessages.push({
            role: 'system',
            content: EVOLVE_AI_SYSTEM_PROMPT
        });

        // Process conversation messages
        const conversationMessages = messages.filter(msg => msg.role !== 'system');

        // Ensure proper alternating pattern and handle image content
        let lastRole = 'system';
        for (const msg of conversationMessages) {
            if (msg.role !== lastRole || msg.role === 'user') {
                let messageContent;

                if (msg.role === 'user' && msg.images && msg.images.length > 0) {
                    // For user messages with images, create multimodal content
                    messageContent = [];

                    // Add text content if present
                    if (msg.content && msg.content.trim()) {
                        messageContent.push({
                            type: "text",
                            text: msg.content
                        });
                    }

                    // Add image content
                    msg.images.forEach(image => {
                        if (image.type === "image_url" && image.image_url && image.image_url.url) {
                            messageContent.push({
                                type: "image_url",
                                image_url: {
                                    url: image.image_url.url
                                }
                            });
                        }
                    });
                } else {
                    // For regular text messages
                    messageContent = typeof msg.content === 'string' ? msg.content : msg.content;
                }

                formattedMessages.push({
                    role: msg.role,
                    content: messageContent
                });
                lastRole = msg.role;
            }
        }

        // Ensure the conversation ends with a user message
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            throw new Error('Conversation must end with a user message');
        }

        console.log('Final formatted messages count:', formattedMessages.length);

        const requestBody = {
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: hasImages ? 2000 : 1000, // Increased for image analysis
        };

        const response = await axios.post(API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            timeout: hasImages ? 45000 : 15000, // Longer timeout for image processing
        });

        // Safely access the response
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response structure from Mistral API');
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error details:', {
            status: error.response && error.response.status,
            statusText: error.response && error.response.statusText,
            data: error.response && error.response.data,
            message: error.message
        });

        // Handle API errors
        if (error.response && error.response.data) {
            const errorData = error.response.data;

            // Handle specific vision-related errors
            if (errorData.message && (errorData.message.includes('vision') || errorData.message.includes('image') || errorData.message.includes('multimodal'))) {
                return "I'm sorry, but I'm currently having trouble processing images. Please try again with text only or try again later.";
            }

            // Handle conversation flow errors
            if (errorData.type === 'invalid_request_message_order') {
                return "There was an issue with the conversation flow. Please start a new conversation.";
            }

            // Handle rate limiting
            if (error.response.status === 429) {
                return "I'm experiencing high demand right now. Please try again in a moment.";
            }

            // Handle model not available
            if (error.response.status === 404 && hasImages) {
                return "Image analysis is temporarily unavailable. Please try again with text only.";
            }

            // Handle invalid image format
            if (error.response.status === 400 && hasImages) {
                return "There was an issue with the image format. Please try uploading a different image (JPEG, PNG, GIF, or WebP).";
            }
        }

        // Handle network or other errors
        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};

export const ConversationAIResponse = async(req, res) => {
    try {
        const { messages, hasImages = false, processedImages = [] } = req.body;

        console.log('Received request:', {
            messagesCount: messages ? messages.length : 0,
            hasImages,
            processedImagesCount: processedImages.length
        });

        // Validate input
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Invalid messages format. Expected non-empty array."
            });
        }

        // Extract the latest user input
        const latestMessage = messages[messages.length - 1];

        // Ensure the latest message is from user
        if (latestMessage.role !== 'user') {
            return res.status(400).json({
                error: "Last message must be from user"
            });
        }

        // Add processed images to the latest message if provided
        if (hasImages && processedImages.length > 0) {
            const updatedMessages = [...messages];
            updatedMessages[updatedMessages.length - 1] = {
                ...latestMessage,
                images: processedImages
            };

            console.log('Updated latest message with images');

            // Generate response with updated messages
            const response = await generateResponse(updatedMessages, latestMessage.content, hasImages);

            // Send back the response in the expected format
            return res.json({
                choices: [{
                    message: {
                        content: response,
                    },
                }],
            });
        } else {
            // Handle text-only conversation
            const userInput = typeof latestMessage.content === 'string' ?
                latestMessage.content :
                (latestMessage.content && latestMessage.content.find && latestMessage.content.find(c => c.type === 'text') && latestMessage.content.find(c => c.type === 'text').text) || '';

            console.log('Processing text-only conversation');

            // Generate response with all messages (including the latest one)
            const response = await generateResponse(messages, userInput, hasImages);

            // Send back the response in the expected format
            res.json({
                choices: [{
                    message: {
                        content: response,
                    },
                }],
            });
        }
    } catch (err) {
        console.error("Conversation route error:", err);
        res.status(500).json({
            error: "Something went wrong.",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// If using Next.js API routes, export as default
export default ConversationAIResponse;