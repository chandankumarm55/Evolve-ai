import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Copy, Check, Code, MessageSquare } from 'lucide-react';

const PythonCodeWriter = () => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [currentCode, setCurrentCode] = useState('# Your Python code will appear here\n# Start by describing what you want to build!');
    const [codeInfo, setCodeInfo] = useState('💡 Enter a prompt to generate Python code.\n\n✨ Try asking for:\n• Data analysis scripts\n• Web scraping tools\n• API integrations\n• Machine learning models\n• Automation scripts');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async () => {
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
            setCodeInfo('❌ Failed to generate code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
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
            return data.fullResponse;
        } catch (error) {
            console.error('Error calling API:', error);
            throw error;
        }
    };

    const parseResponse = (response) => {
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

    return (
        <div className="h-screen pt-16 overflow-hidden">
            {/* Fixed container with no scrolling */ }
            <div className="h-full flex flex-col">
                {/* Header */ }
                <div className="border-b px-6 py-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/80 rounded-lg backdrop-blur-sm">
                            <Code size={ 20 } className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold ">
                                Python Code Generator
                            </h1>
                            <p className="text-sm text-gray-800">
                                AI-powered Python development assistant
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */ }
                <div className="flex-1 flex overflow-hidden pb-32">
                    {/* Code Section */ }
                    <div className="flex-1 flex flex-col  border-r/30">
                        <div className=" border-b px-6 py-3 flex justify-between items-center backdrop-blur-sm">
                            <h2 className="font-semibold text-gray-800 flex items-center space-x-2">
                                <Code size={ 18 } />
                                <span>Generated Code</span>
                            </h2>
                            <button
                                onClick={ copyToClipboard }
                                className={ `flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all backdrop-blur-sm ${copied
                                    ? 'bg-green-500/80 text-white'
                                    : 'bg-white/80  border hover:bg-opacity-80 text-gray-800'
                                    }` }
                            >
                                { copied ? <Check size={ 16 } /> : <Copy size={ 16 } /> }
                                <span className="text-sm">{ copied ? 'Copied!' : 'Copy' }</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto ">
                            <pre className="p-6 font-mono text-sm  whitespace-pre-wrap leading-relaxed">
                                { currentCode }
                            </pre>
                        </div>
                    </div>

                    {/* Info Section */ }
                    <div className="w-2/5 flex flex-col">
                        <div className="border-b px-6 py-3 backdrop-blur-sm">
                            <h2 className="font-semibold flex items-center space-x-2">
                                <MessageSquare size={ 18 } />
                                <span>Code Information</span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-auto ">
                            <div className="p-6  whitespace-pre-wrap leading-relaxed">
                                { codeInfo }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversation History */ }
                { conversations.length > 0 && (
                    <div className=" border-t px-6 py-4 backdrop-blur-sm">
                        <h3 className="font-medium  mb-3 flex items-center space-x-2">
                            <MessageSquare size={ 16 } />
                            <span>Recent Conversation</span>
                        </h3>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            { conversations.slice(-4).map((msg, index) => (
                                <div
                                    key={ index }
                                    className={ `p-3 rounded-lg backdrop-blur-sm ${msg.role === 'user'
                                        ? 'bg-blue-100/60 text-blue-800'
                                        : 'bg-gray-100/60 text-gray-700'
                                        }` }
                                >
                                    <div className="font-medium text-xs uppercase tracking-wider mb-1">
                                        { msg.role === 'user' ? 'You' : 'AI Assistant' }
                                    </div>
                                    <div className="text-sm">
                                        { msg.content.length > 120 ?
                                            msg.content.substring(0, 120) + '...' :
                                            msg.content
                                        }
                                    </div>
                                </div>
                            )) }
                        </div>
                    </div>
                ) }

                {/* Fixed Input Section at Bottom */ }
                <div className="fixed bottom-0 left-0 right-0  border-t px-6 py-4 backdrop-blur-md shadow-2xl">
                    <div className="flex space-x-3 max-w-7xl mx-auto">
                        <div className="flex-1 relative ">
                            <input
                                type="text"
                                value={ userInput }
                                onChange={ (e) => setUserInput(e.target.value) }
                                onKeyPress={ handleKeyPress }
                                placeholder="Describe the Python code you want to generate..."
                                className="w-full px-4 py-3 rounded-xl bg-transparent border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all backdrop-blur-sm "
                                disabled={ isLoading }
                            />
                        </div>
                        <button
                            onClick={ handleSubmit }
                            disabled={ isLoading || !userInput.trim() }
                            className={ `px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 backdrop-blur-sm ${isLoading || !userInput.trim()
                                ? 'bg-gray-300/50  cursor-not-allowed'
                                : 'bg-blue-500/80 hover:bg-blue-600/80 shadow-lg hover:shadow-xl transform hover:scale-105'
                                }` }
                        >
                            { isLoading ? (
                                <>
                                    <RefreshCw size={ 18 } className="animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate</span>
                                    <ArrowRight size={ 18 } />
                                </>
                            ) }
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 text-center max-w-7xl mx-auto">
                        Press Enter to generate code • Support for data analysis, web scraping, APIs & more
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PythonCodeWriter;