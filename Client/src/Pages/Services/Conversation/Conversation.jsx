import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageCircle, Send, Loader2, Copy, Check } from 'lucide-react';
import { generateResponse } from './ConversationAPI';
import { useTheme } from '../../../contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';

const Conversation = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle code copy functionality
    const handleCopyCode = async (code, index) => {
        await navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Function to parse and format message content
    const formatMessageContent = (content) => {
        // Handle both triple and single backticks for code blocks
        const tripleCodeRegex = /```([\w]*)\n([\s\S]*?)```/g;
        const singleCodeRegex = /`([^`]+)`/g;
        let match;
        const parts = [];
        let lastIndex = 0;

        // First handle triple backtick code blocks
        while ((match = tripleCodeRegex.exec(content)) !== null) {
            const [fullMatch, language, code] = match;
            const textBeforeCode = content.slice(lastIndex, match.index);

            if (textBeforeCode) {
                parts.push({ type: 'text', content: textBeforeCode });
            }
            parts.push({
                type: 'codeBlock',
                language: language || 'plaintext',
                content: code.trim()
            });
            lastIndex = match.index + fullMatch.length;
        }

        // Add remaining text and process it for inline code
        let remainingText = content.slice(lastIndex);
        if (remainingText) {
            let inlineLastIndex = 0;
            const inlineParts = [];

            while ((match = singleCodeRegex.exec(remainingText)) !== null) {
                const [fullMatch, code] = match;
                const textBeforeCode = remainingText.slice(inlineLastIndex, match.index);

                if (textBeforeCode) {
                    inlineParts.push({ type: 'text', content: textBeforeCode });
                }
                inlineParts.push({ type: 'inlineCode', content: code });
                inlineLastIndex = match.index + fullMatch.length;
            }

            if (inlineLastIndex < remainingText.length) {
                inlineParts.push({
                    type: 'text',
                    content: remainingText.slice(inlineLastIndex)
                });
            }

            parts.push(...inlineParts);
        }

        return parts;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        try {
            setIsTyping(true);
            const response = await generateResponse(messages, input);
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString(),
            };
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

    // Render formatted message parts with enhanced styling
    const renderFormattedMessage = (message) => {
        const formattedParts = formatMessageContent(message.content);
        return formattedParts.map((part, index) => {
            if (part.type === 'codeBlock') {
                return (
                    <div key={ index } className={ `relative rounded-md overflow-hidden my-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
                            <span className="text-sm text-gray-400">{ part.language }</span>
                            <button
                                onClick={ () => handleCopyCode(part.content, index) }
                                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-200"
                            >
                                { copiedIndex === index ? (
                                    <><Check size={ 16 } /> Copied!</>
                                ) : (
                                    <><Copy size={ 16 } /> Copy code</>
                                ) }
                            </button>
                        </div>
                        <SyntaxHighlighter
                            language={ part.language }
                            style={ isDark ? oneDark : tomorrow }
                            customStyle={ {
                                margin: 0,
                                padding: '1rem',
                                backgroundColor: 'transparent'
                            } }
                        >
                            { part.content }
                        </SyntaxHighlighter>
                    </div>
                );
            } else if (part.type === 'inlineCode') {
                return (
                    <code
                        key={ index }
                        className={ `px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'
                            }` }
                    >
                        { part.content }
                    </code>
                );
            } else {
                return (
                    <ReactMarkdown
                        key={ index }
                        className={ `prose ${isDark ? 'prose-invert' : ''} max-w-none` }
                    >
                        { part.content }
                    </ReactMarkdown>
                );
            }
        });
    };

    return (
        <div className={ `flex flex-col h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
            }` }>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                { messages.map((message, index) => (
                    <div
                        key={ index }
                        className={ `flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'
                            }` }
                    >
                        <div
                            className={ `max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : isDark
                                    ? 'bg-gray-800 text-gray-100'
                                    : 'bg-white text-gray-800'
                                } shadow` }
                        >
                            <div className="text-xs opacity-70 mb-1">{ message.timestamp }</div>
                            { renderFormattedMessage(message) }
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

            <form onSubmit={ handleSubmit } className={ `p-4 ${isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-lg` }>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={ input }
                        onChange={ (e) => setInput(e.target.value) }
                        placeholder="Type your message..."
                        className={ `flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                            ? 'bg-gray-700 text-gray-100 border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                            } border` }
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        disabled={ isTyping }
                    >
                        <Send size={ 16 } className="mr-2" />
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Conversation;