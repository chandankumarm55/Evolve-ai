import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const dispatch = useDispatch();
    const clerkId = localStorage.getItem('clerkId');

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
            const response = await axios.post(UsageTrackUrl, {
                clerkId,
            });

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

    const handleRegenerateResponse = async (originalPrompt) => {
        setIsTyping(true);
        try {
            await trackUsage();
            const response = await generateResponse(messages, originalPrompt);
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
                originalPrompt,
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

    const handleSubmit = async (message) => {
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            await trackUsage();
            const response = await generateResponse(messages, message);
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
                originalPrompt: message,
            };
            setInput('');
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

    const handleQuestionSelect = (question) => {
        setInput(question);
        handleSubmit(question);
    };

    return (
        <ServiceContainer
            className={ `${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} 
            flex flex-col h-screen`}
        >
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