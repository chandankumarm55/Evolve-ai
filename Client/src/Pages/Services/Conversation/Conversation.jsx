import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { generateResponse } from './ConversationAPI';
import { useTheme } from '../../../contexts/ThemeContext';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import RandomQuestions from './RandomQuestions';
import { updateUser } from '../../../redux/userSlice';
import axios from 'axios';
import { UsageTrackUrl } from '../../../Utilities/constant';

const Conversation = () => {
    const location = useLocation();
    const initialPrompt = location.state?.initialPrompt || '';
    const hasSubmittedInitialPrompt = useRef(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();
    const clerkId = localStorage.getItem('clerkId');
    const [hasPromptBeenHandled, setHasPromptBeenHandled] = useState(false);
    const streamingMessageRef = useRef(null);

    useEffect(() => {
        if (initialPrompt && !hasSubmittedInitialPrompt.current) {
            hasSubmittedInitialPrompt.current = true;
            handleSubmit({ text: initialPrompt, images: [] });
        }
    }, [initialPrompt]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const trackUsage = async () => {
        if (!clerkId) {
            throw new Error('No user ID found. Please log in again.');
        }

        try {
            const response = await axios.post(UsageTrackUrl, { clerkId });
            if (response.data.user) {
                dispatch(updateUser(response.data.user));
            }
            return true;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                throw new Error('You have reached your daily limit. Please upgrade to continue using our services. [USAGE_LIMIT]');
            }
            throw error;
        }
    };

    // Enhanced image processing function
    const processImages = async (images) => {
        if (!images || images.length === 0) return [];

        console.log('Processing images:', images.length);

        const processedImages = await Promise.all(
            images.map(async (image) => {
                try {
                    // If it's already in the correct format with base64 URL
                    if (image.type === "image_url" && image.image_url && image.image_url.url) {
                        return image;
                    }

                    // If it's already base64 string
                    if (typeof image.preview === 'string' && image.preview.startsWith('data:')) {
                        return {
                            type: "image_url",
                            image_url: {
                                url: image.preview
                            }
                        };
                    }

                    // If it's a File object, convert to base64
                    if (image.file || image instanceof File) {
                        const fileToProcess = image.file || image;
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                resolve({
                                    type: "image_url",
                                    image_url: {
                                        url: e.target.result
                                    }
                                });
                            };
                            reader.onerror = () => reject(new Error('Failed to read image file'));
                            reader.readAsDataURL(fileToProcess);
                        });
                    }

                    // If it's a direct image object with preview
                    if (image.preview) {
                        return {
                            type: "image_url",
                            image_url: {
                                url: image.preview
                            }
                        };
                    }

                    console.warn('Unknown image format:', image);
                    return null;
                } catch (error) {
                    console.error('Error processing image:', error);
                    return null;
                }
            })
        );

        // Filter out null values and return valid processed images
        const validImages = processedImages.filter(img => img !== null);
        console.log('Successfully processed images:', validImages.length);

        return validImages;
    };

    const handleSubmit = async (messageData) => {
        let text, images;

        if (typeof messageData === 'string') {
            text = messageData;
            images = [];
        } else {
            text = messageData.text || '';
            images = messageData.images || [];
        }

        if (!text.trim() && (!images || images.length === 0)) {
            return; // Don't submit empty messages
        }

        setInput('');

        // Create user message for display
        const userMessage = {
            role: 'user',
            content: text,
            images: images, // Store original images for display
            timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);
        setIsStreaming(true);
        setStreamingContent('');

        // Create a temporary streaming message
        const streamingMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toLocaleTimeString(),
            originalPrompt: text,
            originalImages: await processImages(images),
            isStreaming: true
        };

        streamingMessageRef.current = streamingMessage;
        setMessages((prev) => [...prev, streamingMessage]);

        try {
            await trackUsage();

            // Process images for API
            const processedImages = await processImages(images);

            console.log('Submitting message:', {
                text,
                imagesCount: images.length,
                processedImagesCount: processedImages.length
            });

            // Handle streaming chunks
            const handleChunk = (chunk, fullContent) => {
                setStreamingContent(fullContent);

                // Update the streaming message in the messages array
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.length - 1;
                    if (newMessages[lastMessageIndex] && newMessages[lastMessageIndex].isStreaming) {
                        newMessages[lastMessageIndex] = {
                            ...newMessages[lastMessageIndex],
                            content: fullContent
                        };
                    }
                    return newMessages;
                });
            };

            const response = await generateResponse(messages, text, processedImages, handleChunk);

            // Finalize the message
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessageIndex = newMessages.length - 1;
                if (newMessages[lastMessageIndex] && newMessages[lastMessageIndex].isStreaming) {
                    newMessages[lastMessageIndex] = {
                        ...newMessages[lastMessageIndex],
                        content: response,
                        isStreaming: false
                    };
                }
                return newMessages;
            });

        } catch (error) {
            console.error('Error in handleSubmit:', error);

            let errorMessage = 'Sorry, I encountered an error. Please try again.';

            if (error.message.includes('[USAGE_LIMIT]')) {
                errorMessage = error.message.replace(' [USAGE_LIMIT]', '');
            } else if (error.message.includes('image')) {
                errorMessage = 'There was an issue processing your image. Please try with a different image or text only.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            // Remove the streaming message and add error message
            setMessages((prev) => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.isStreaming) {
                    newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: errorMessage,
                        timestamp: new Date().toLocaleTimeString(),
                        isError: true
                    };
                } else {
                    newMessages.push({
                        role: 'assistant',
                        content: errorMessage,
                        timestamp: new Date().toLocaleTimeString(),
                        isError: true
                    });
                }
                return newMessages;
            });
        } finally {
            setIsTyping(false);
            setIsStreaming(false);
            setStreamingContent('');
            streamingMessageRef.current = null;
        }
    };

    const handleRegenerateResponse = async (originalPrompt, originalImages = []) => {
        setIsTyping(true);
        setIsStreaming(true);
        setStreamingContent('');

        // Create a new streaming message
        const streamingMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toLocaleTimeString(),
            originalPrompt,
            originalImages,
            isStreaming: true
        };

        streamingMessageRef.current = streamingMessage;
        setMessages((prev) => [...prev, streamingMessage]);

        try {
            await trackUsage();

            console.log('Regenerating response with:', {
                originalPrompt,
                originalImagesCount: originalImages.length
            });

            // Handle streaming chunks for regeneration
            const handleChunk = (chunk, fullContent) => {
                setStreamingContent(fullContent);

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.length - 1;
                    if (newMessages[lastMessageIndex] && newMessages[lastMessageIndex].isStreaming) {
                        newMessages[lastMessageIndex] = {
                            ...newMessages[lastMessageIndex],
                            content: fullContent
                        };
                    }
                    return newMessages;
                });
            };

            const response = await generateResponse(messages, originalPrompt, originalImages, handleChunk);

            // Finalize the regenerated message
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessageIndex = newMessages.length - 1;
                if (newMessages[lastMessageIndex] && newMessages[lastMessageIndex].isStreaming) {
                    newMessages[lastMessageIndex] = {
                        ...newMessages[lastMessageIndex],
                        content: response,
                        isStreaming: false
                    };
                }
                return newMessages;
            });

        } catch (error) {
            console.error('Error in handleRegenerateResponse:', error);

            let errorMessage = 'Sorry, I encountered an error while regenerating.';

            if (error.message.includes('[USAGE_LIMIT]')) {
                errorMessage = error.message.replace(' [USAGE_LIMIT]', '');
            }

            // Remove the streaming message and add error message
            setMessages((prev) => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.isStreaming) {
                    newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: errorMessage,
                        timestamp: new Date().toLocaleTimeString(),
                        isError: true
                    };
                } else {
                    newMessages.push({
                        role: 'assistant',
                        content: errorMessage,
                        timestamp: new Date().toLocaleTimeString(),
                        isError: true
                    });
                }
                return newMessages;
            });
        } finally {
            setIsTyping(false);
            setIsStreaming(false);
            setStreamingContent('');
            streamingMessageRef.current = null;
        }
    };

    const handleQuestionSelect = (question) => {
        setInput(question);
        handleSubmit({ text: question, images: [] });
    };

    return (
        <ServiceContainer className={ `${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} flex flex-col h-screen` }>
            <div className="flex-1 overflow-y-auto">
                { messages.length === 0 ? (
                    <RandomQuestions onQuestionSelect={ handleQuestionSelect } />
                ) : (
                    <MessageList
                        messages={ messages }
                        isTyping={ isTyping }
                        isStreaming={ isStreaming }
                        streamingContent={ streamingContent }
                        messagesEndRef={ messagesEndRef }
                        onRepeat={ handleRegenerateResponse }
                    />
                ) }
            </div>
            <MessageInput
                input={ input }
                setInput={ setInput }
                onSubmit={ handleSubmit }
                isTyping={ isTyping || isStreaming }
                className="sticky bottom-0"
            />
        </ServiceContainer>
    );
};

export default Conversation;