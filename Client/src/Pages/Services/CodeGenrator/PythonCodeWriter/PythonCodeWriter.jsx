import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Copy, Check } from 'lucide-react';

const PythonCodeWriter = () => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [currentCode, setCurrentCode] = useState('# Your Python code will appear here');
    const [codeInfo, setCodeInfo] = useState('Enter a prompt to generate Python code.');
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState('light');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInput.trim()) return;

        // Add user message to conversation
        const newMessage = { role: 'user', content: userInput };
        const updatedConversations = [...conversations, newMessage];
        setConversations(updatedConversations);

        // Clear input field
        setUserInput('');

        // Set loading state
        setIsLoading(true);

        try {
            // Call the backend API instead of the simulate function
            const response = await fetchCodeFromBackend(updatedConversations);

            // Parse the response to separate code and info
            const { code, info } = parseResponse(response);

            // Update state with response
            setCurrentCode(code);
            setCodeInfo(info);

            // Add AI response to conversation
            setConversations([...updatedConversations, {
                role: 'assistant',
                content: response
            }]);
        } catch (error) {
            console.error('Error generating code:', error);
            setCodeInfo('Failed to generate code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCodeFromBackend = async (conversationHistory) => {
        try {
            const response = await fetch('http://localhost:3000/api/codewriter/pythoncodegenerate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: conversationHistory }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate code');
            }

            const data = await response.json();
            return data.fullResponse; // Or you can use data.code and data.info separately
        } catch (error) {
            console.error('Error calling API:', error);
            throw error;
        }
    };

    const parseResponse = (response) => {
        // Split the response into code and info sections based on the "INFO:" keyword
        const parts = response.split("INFO:");
        return {
            code: parts[0].trim(),
            info: parts.length > 1 ? "INFO:" + parts[1].trim() : "No information provided."
        };
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={ `flex mt-20 pt-10 flex-col h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}` }>
            {/* Header */ }
            <div className={ `p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}` }>
                <h1 className="text-xl font-bold">Python Code Generator</h1>
                <button
                    onClick={ toggleTheme }
                    className={ `px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}` }
                >
                    { theme === 'light' ? 'Dark Mode' : 'Light Mode' }
                </button>
            </div>

            {/* Main content */ }
            <div className="flex flex-1 overflow-hidden">
                {/* Code section */ }
                <div className={ `flex-1 flex flex-col border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}` }>
                    <div className={ `p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}` }>
                        <h2 className="font-medium">Generated Python Code</h2>
                        <button
                            onClick={ copyToClipboard }
                            className={ `flex items-center gap-1 px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}` }
                        >
                            { copied ? <Check size={ 16 } /> : <Copy size={ 16 } /> }
                            { copied ? 'Copied!' : 'Copy' }
                        </button>
                    </div>
                    <div className={ `flex-1 overflow-auto p-4 font-mono text-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}` }>
                        <pre className="whitespace-pre-wrap">{ currentCode }</pre>
                    </div>
                </div>

                {/* Info section */ }
                <div className={ `w-2/5 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}` }>
                    <div className={ `p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}` }>
                        <h2 className="font-medium">Code Information</h2>
                    </div>
                    <div className={ `flex-1 overflow-auto p-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}` }>
                        <pre className="whitespace-pre-wrap">{ codeInfo }</pre>
                    </div>
                </div>
            </div>

            {/* Conversation history */ }
            <div className={ `p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}` }>
                <h2 className="font-medium mb-2">Conversation</h2>
                <div className={ `max-h-40 overflow-y-auto mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}` }>
                    { conversations.map((msg, index) => (
                        <div
                            key={ index }
                            className={ `mb-2 p-2 rounded-lg ${msg.role === 'user'
                                ? theme === 'dark' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800'
                                : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                                }` }
                        >
                            <strong>{ msg.role === 'user' ? 'You: ' : 'AI: ' }</strong>
                            { msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content }
                        </div>
                    )) }
                </div>

                {/* Input form */ }
                <form onSubmit={ handleSubmit } className="flex gap-2">
                    <input
                        type="text"
                        value={ userInput }
                        onChange={ (e) => setUserInput(e.target.value) }
                        placeholder="Ask for Python code or request changes..."
                        className={ `flex-1 px-4 py-2 rounded-md ${theme === 'dark'
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                            } border` }
                    />
                    <button
                        type="submit"
                        disabled={ isLoading }
                        className={ `px-4 py-2 rounded-md flex items-center gap-2 ${theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}` }
                    >
                        { isLoading ? <RefreshCw size={ 18 } className="animate-spin" /> : <ArrowRight size={ 18 } /> }
                        { isLoading ? 'Generating...' : 'Send' }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PythonCodeWriter;