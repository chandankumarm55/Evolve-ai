// Conversation.jsx
import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { generateResponse } from './ConversationAPI';
import { useTheme } from '../../../contexts/ThemeContext';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import RandomQuestions from './RandomQuestions';

const Conversation = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (message) => {
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        try {
            setIsTyping(true);
            const response = await generateResponse(messages, message);
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
            };
            setInput('');
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
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
        <ServiceContainer className={ `${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} flex flex-col h-screen` }>
            <div className="flex-1 overflow-y-auto">
                { messages.length === 0 ? (
                    <RandomQuestions onQuestionSelect={ handleQuestionSelect } />
                ) : (
                    <MessageList messages={ messages } isTyping={ isTyping } messagesEndRef={ messagesEndRef } />
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