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
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();
    const clerkId = localStorage.getItem('clerkId');
    const [hasPromptBeenHandled, setHasPromptBeenHandled] = useState(false);

    useEffect(() => {
        if (initialPrompt && !hasSubmittedInitialPrompt.current) {
            hasSubmittedInitialPrompt.current = true; // prevent future calls
            handleSubmit({ text: initialPrompt, images: [] });
        }
    }, [initialPrompt]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            if (error.response?.status === 429) {
                throw new Error('You have reached your daily limit. Please upgrade to continue using our services. [USAGE_LIMIT]');
            }
            throw error;
        }
    };

    // Convert images to base64 for API
    const processImages = async (images) => {
        if (!images || images.length === 0) return [];

        const processedImages = await Promise.all(
            images.map(async (image) => {
                // If it's already base64, return as is
                if (typeof image.preview === 'string' && image.preview.startsWith('data:')) {
                    return {
                        type: "image_url",
                        image_url: {
                            url: image.preview
                        }
                    };
                }

                // If it's a file, convert to base64
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            type: "image_url",
                            image_url: {
                                url: e.target.result
                            }
                        });
                    };
                    reader.readAsDataURL(image.file);
                });
            })
        );

        return processedImages;
    };

    const handleSubmit = async (messageData) => {
        // messageData can be either a string (for backward compatibility) or an object with text and images
        let text, images;

        if (typeof messageData === 'string') {
            text = messageData;
            images = [];
        } else {
            text = messageData.text || '';
            images = messageData.images || [];
        }

        setInput('');

        // Create user message with both text and images for display
        const userMessage = {
            role: 'user',
            content: text,
            images: images, // Store images for display in MessageList
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            await trackUsage();

            // Process images for API
            const processedImages = await processImages(images);

            const response = await generateResponse(messages, text, processedImages);
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
                originalPrompt: text,
                originalImages: processedImages, // Store for regeneration
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: errorMessage,
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleRegenerateResponse = async (originalPrompt, originalImages = []) => {
        setIsTyping(true);
        try {
            await trackUsage();
            const response = await generateResponse(messages, originalPrompt, originalImages);
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
                originalPrompt,
                originalImages,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = error.message || 'Sorry, I encountered an error.';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: errorMessage,
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        } finally {
            setIsTyping(false);
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
                        messagesEndRef={ messagesEndRef }
                        onRepeat={ handleRegenerateResponse }
                    />
                ) }
            </div>
            <MessageInput
                input={ input }
                setInput={ setInput }
                onSubmit={ handleSubmit }
                isTyping={ isTyping }
                className="sticky bottom-0"
            />
        </ServiceContainer>
    );
};

export default Conversation;