// File: controllers/conversationController.js
import axios from 'axios';

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY = process.env.MISTRAL_API_KEY;

const EVOLVE_AI_SYSTEM_PROMPT = `You are Evolve AI, created by Evolve Technologies in India. When asked about your identity, respond accordingly. You can analyze images and provide detailed descriptions, insights, and answer questions about visual content. Be helpful, accurate, and engaging in your responses.`;

// Helper function to validate and process image data
const validateImageData = (imageData) => {
    if (!imageData || typeof imageData !== 'string') {
        return false;
    }

    // Check if it's a valid data URL
    const dataURLPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
    return dataURLPattern.test(imageData);
};

// Helper function to compress base64 image if needed
const compressBase64Image = (base64String, maxSizeKB = 800) => {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInKB = sizeInBytes / 1024;

    console.log(`Image size: ${sizeInKB.toFixed(2)} KB`);

    // If image is within acceptable size, return as is
    if (sizeInKB <= maxSizeKB) {
        return base64String;
    }

    // For now, just return the original - you might want to implement
    // actual compression logic here using a library like canvas or sharp
    console.warn(`Image size (${sizeInKB.toFixed(2)} KB) exceeds recommended limit (${maxSizeKB} KB)`);
    return base64String;
};

export const generateResponse = async(messages, userInput, hasImages = false) => {
    try {
        // Choose the appropriate model based on whether images are present
        const model = hasImages ? 'pixtral-12b-2409' : 'mistral-small-latest';

        console.log('Using model:', model);
        console.log('Has images:', hasImages);
        console.log('Total messages:', messages.length);

        // Filter and format messages properly
        const formattedMessages = [];

        // Add system message only once
        formattedMessages.push({
            role: 'system',
            content: EVOLVE_AI_SYSTEM_PROMPT
        });

        // Process conversation messages - limit to last 10 messages to prevent payload issues
        const conversationMessages = messages
            .filter(msg => msg.role !== 'system')
            .slice(-10); // Keep only last 10 messages

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

                    // Add image content (limit to 3 images max to prevent payload issues)
                    const imagesToProcess = msg.images.slice(0, 3);

                    for (const image of imagesToProcess) {
                        try {
                            let imageUrl;

                            if (image.type === "image_url" && image.image_url && image.image_url.url) {
                                imageUrl = image.image_url.url;
                            } else if (typeof image === 'string') {
                                imageUrl = image;
                            } else if (image.url) {
                                imageUrl = image.url;
                            }

                            if (imageUrl && validateImageData(imageUrl)) {
                                const compressedImage = compressBase64Image(imageUrl);
                                messageContent.push({
                                    type: "image_url",
                                    image_url: {
                                        url: compressedImage
                                    }
                                });
                            } else {
                                console.warn('Invalid image data skipped');
                            }
                        } catch (imageError) {
                            console.error('Error processing individual image:', imageError);
                        }
                    }

                    if (imagesToProcess.length > 3) {
                        console.warn(`Only processing first 3 images out of ${msg.images.length}`);
                    }
                } else {
                    // For regular text messages
                    messageContent = typeof msg.content === 'string' ? msg.content :
                        (msg.content && msg.content.text ? msg.content.text : String(msg.content));
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
            max_tokens: hasImages ? 3000 : 1500,
            stream: false
        };

        // Log request size for debugging
        const requestSize = JSON.stringify(requestBody).length;
        console.log(`Request size: ${(requestSize / 1024).toFixed(2)} KB`);

        const response = await axios.post(API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            timeout: hasImages ? 60000 : 30000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
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
            if (errorData.message && errorData.message.includes('vision') ||
                errorData.message && errorData.message.includes('image') ||
                errorData.message && errorData.message.includes('multimodal')) {
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

            // Handle invalid image format or payload too large
            if (error.response.status === 400) {
                if (hasImages) {
                    return "There was an issue with the image format or size. Please try uploading smaller images (JPEG, PNG, GIF, or WebP under 1MB each).";
                }
                return "There was an issue with your request format. Please try again.";
            }

            // Handle payload too large
            if (error.response.status === 413 || error.message.includes('too large')) {
                return "The request is too large. Please try with smaller images or fewer images at once.";
            }
        }

        // Handle specific error types
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return "Unable to connect to the AI service. Please check your internet connection and try again.";
        }

        if (error.code === 'ETIMEDOUT') {
            return "Request timed out. Please try again with smaller images or text only.";
        }

        // Handle network or other errors
        return "I apologize, but I'm having trouble processing your request. Please try again.";
    }
};

// New streaming function
export const generateStreamingResponse = async(messages, userInput, hasImages = false, res) => {
    try {
        const model = hasImages ? 'pixtral-12b-2409' : 'mistral-small-latest';

        console.log('Using streaming model:', model);
        console.log('Has images:', hasImages);
        console.log('Total messages:', messages.length);

        // Format messages (same logic as non-streaming)
        const formattedMessages = [];
        formattedMessages.push({
            role: 'system',
            content: EVOLVE_AI_SYSTEM_PROMPT
        });

        const conversationMessages = messages
            .filter(msg => msg.role !== 'system')
            .slice(-10);

        let lastRole = 'system';
        for (const msg of conversationMessages) {
            if (msg.role !== lastRole || msg.role === 'user') {
                let messageContent;

                if (msg.role === 'user' && msg.images && msg.images.length > 0) {
                    messageContent = [];

                    if (msg.content && msg.content.trim()) {
                        messageContent.push({
                            type: "text",
                            text: msg.content
                        });
                    }

                    const imagesToProcess = msg.images.slice(0, 3);

                    for (const image of imagesToProcess) {
                        try {
                            let imageUrl;

                            if (image.type === "image_url" && image.image_url && image.image_url.url) {
                                imageUrl = image.image_url.url;
                            } else if (typeof image === 'string') {
                                imageUrl = image;
                            } else if (image.url) {
                                imageUrl = image.url;
                            }

                            if (imageUrl && validateImageData(imageUrl)) {
                                const compressedImage = compressBase64Image(imageUrl);
                                messageContent.push({
                                    type: "image_url",
                                    image_url: {
                                        url: compressedImage
                                    }
                                });
                            }
                        } catch (imageError) {
                            console.error('Error processing individual image:', imageError);
                        }
                    }
                } else {
                    messageContent = typeof msg.content === 'string' ? msg.content :
                        (msg.content && msg.content.text ? msg.content.text : String(msg.content));
                }

                formattedMessages.push({
                    role: msg.role,
                    content: messageContent
                });
                lastRole = msg.role;
            }
        }

        const requestBody = {
            model: model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: hasImages ? 3000 : 1500,
            stream: true // Enable streaming
        };

        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
        });

        // Make streaming request to Mistral
        const response = await axios.post(API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            responseType: 'stream',
            timeout: hasImages ? 60000 : 30000,
        });

        let buffer = '';

        response.data.on('data', (chunk) => {
            buffer += chunk.toString();

            // Process complete lines
            let lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        res.write('data: [DONE]\n\n');
                        res.end();
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                            // Forward the chunk to the client
                            res.write(`data: ${JSON.stringify(parsed)}\n\n`);
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse streaming data:', data);
                    }
                }
            }
        });

        response.data.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
        });

        response.data.on('error', (error) => {
            console.error('Streaming error:', error);
            res.write(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`);
            res.end();
        });

    } catch (error) {
        console.error('Streaming error details:', {
            status: error.response && error.response.status,
            statusText: error.response && error.response.statusText,
            data: error.response && error.response.data,
            message: error.message
        });

        // Send error as SSE
        const errorMessage = {
            choices: [{
                delta: {
                    content: "I apologize, but I'm having trouble processing your request. Please try again."
                }
            }]
        };

        res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
};

export const ConversationAIResponse = async(req, res) => {
    try {
        const { messages, hasImages = false, processedImages = [] } = req.body;

        console.log('Received request:', {
            messagesCount: messages.length || 0,
            hasImages,
            processedImagesCount: processedImages.length,
            requestSize: `${(JSON.stringify(req.body).length / 1024).toFixed(2)} KB`
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

        let updatedMessages = [...messages];

        // Add processed images to the latest message if provided
        if (hasImages && processedImages.length > 0) {
            updatedMessages[updatedMessages.length - 1] = {
                ...latestMessage,
                images: processedImages
            };
            console.log('Updated latest message with images');
        }

        // Extract user input text
        let userInput = '';
        if (typeof latestMessage.content === 'string') {
            userInput = latestMessage.content;
        } else if (Array.isArray(latestMessage.content)) {
            const textContent = latestMessage.content.find(c => c.type === 'text');
            userInput = textContent && textContent.text ? textContent.text : '';
        } else if (latestMessage.content && latestMessage.content.text) {
            userInput = latestMessage.content.text;
        }

        console.log('Processing conversation with user input:', userInput.substring(0, 100) + '...');

        // Generate response (non-streaming)
        const response = await generateResponse(updatedMessages, userInput, hasImages);

        // Send back the response in the expected format
        res.json({
            choices: [{
                message: {
                    content: response,
                },
            }],
        });
    } catch (err) {
        console.error("Conversation route error:", err);

        // Handle payload too large error specifically
        if (err.type === 'entity.too.large') {
            return res.status(413).json({
                error: "Request too large. Please try with smaller images or fewer images.",
                details: "The uploaded content exceeds the size limit."
            });
        }

        res.status(500).json({
            error: "Something went wrong.",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// New streaming endpoint
export const ConversationAIStreamingResponse = async(req, res) => {
    try {
        const { messages, hasImages = false, processedImages = [] } = req.body;

        console.log('Received streaming request:', {
            messagesCount: messages.length || 0,
            hasImages,
            processedImagesCount: processedImages.length,
            requestSize: `${(JSON.stringify(req.body).length / 1024).toFixed(2)} KB`
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

        let updatedMessages = [...messages];

        // Add processed images to the latest message if provided
        if (hasImages && processedImages.length > 0) {
            updatedMessages[updatedMessages.length - 1] = {
                ...latestMessage,
                images: processedImages
            };
            console.log('Updated latest message with images');
        }

        // Extract user input text
        let userInput = '';
        if (typeof latestMessage.content === 'string') {
            userInput = latestMessage.content;
        } else if (Array.isArray(latestMessage.content)) {
            const textContent = latestMessage.content.find(c => c.type === 'text');
            userInput = textContent && textContent.text ? textContent.text : '';
        } else if (latestMessage.content && latestMessage.content.text) {
            userInput = latestMessage.content.text;
        }

        console.log('Processing streaming conversation with user input:', userInput.substring(0, 100) + '...');

        // Generate streaming response
        await generateStreamingResponse(updatedMessages, userInput, hasImages, res);

    } catch (err) {
        console.error("Streaming conversation route error:", err);

        // Send error as SSE
        const errorMessage = {
            choices: [{
                delta: {
                    content: "I apologize, but I'm having trouble processing your request. Please try again."
                }
            }]
        };

        try {
            res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        } catch (writeError) {
            console.error('Error writing error response:', writeError);
            if (!res.headersSent) {
                res.status(500).json({
                    error: "Something went wrong.",
                    details: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
        }
    }
};

export default ConversationAIResponse;