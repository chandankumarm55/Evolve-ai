

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Send, Code, Loader2 } from 'lucide-react';
import { generateResponse } from './ConversationAPI'; // Import utility function
import { ServiceContainer } from "../../../components/ui/ServiceContainer";
import { MessageBubble } from "../../../components/ui/MessageBubble";
import { InputBox } from "../../../components/ui/InputBox";


// Import necessary modules


const Conversation = () => {
    const [messages, setMessages] = useState([]); // Message state
    const [input, setInput] = useState(''); // Input state
    const [isTyping, setIsTyping] = useState(false); // Typing indicator
    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    // Scroll to the bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle message submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return; // Ignore empty input

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, userMessage]); // Add user message
        setInput(''); // Clear input

        try {
            setIsTyping(true); // Show typing indicator
            const response = await generateResponse(messages, input); // Fetch AI response
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages((prev) => [...prev, aiMessage]); // Add AI response
        } catch (error) {
            // Add error message
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        } finally {
            setIsTyping(false); // Hide typing indicator
        }
    };

    // Format messages to handle text and code blocks
    const formatMessage = (content) => {
        const parts = content.split('```');
        return parts.map((part, index) =>
            index % 2 === 1 ? (
                <div
                    key={ index }
                    className="bg-gray-800 rounded-md p-4 my-2 overflow-x-auto"
                >
                    <Code className="inline-block mr-2" size={ 16 } />
                    <code className="text-sm font-mono text-gray-100">{ part }</code>
                </div>
            ) : (
                <p key={ index } className="whitespace-pre-wrap">
                    { part }
                </p>
            )
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Chat Header */ }
            <div className="bg-white shadow-sm p-4 flex items-center">
                <MessageCircle className="text-blue-500 mr-2" />
                <h1 className="text-xl font-semibold">AI Chat Assistant</h1>
            </div>

            {/* Chat Messages */ }
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                { messages.map((message, index) => (
                    <div
                        key={ index }
                        className={ `flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'
                            }` }
                    >
                        <div
                            className={ `max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-800'
                                } shadow` }
                        >
                            <div className="text-xs opacity-70 mb-1">
                                { message.timestamp }
                            </div>
                            { formatMessage(message.content) }
                        </div>
                    </div>
                )) }
                { isTyping && (
                    <div className="flex items-center text-gray-500">
                        <Loader2 className="animate-spin mr-2" size={ 16 } />
                        AI is typing...
                    </div>
                ) }
                <div ref={ messagesEndRef } />
            </div>

            {/* Input Form */ }
            <form onSubmit={ handleSubmit } className="p-4 bg-white shadow-lg">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={ input }
                        onChange={ (e) => setInput(e.target.value) }
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        disabled={ isTyping }
                    >
                        <Send size={ 16 } className="mr-2" />
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Conversation