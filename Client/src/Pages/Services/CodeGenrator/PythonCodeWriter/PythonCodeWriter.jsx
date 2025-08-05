import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RefreshCw, Copy, Check, Code, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import * as monaco from 'monaco-editor';

const PythonCodeWriter = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [currentCode, setCurrentCode] = useState('# Your Python code will appear here\n# Start by describing what you want to build!');
    const [codeInfo, setCodeInfo] = useState('💡 Enter a prompt to generate Python code.\n\n✨ Try asking for:\n• Data analysis scripts\n• Web scraping tools\n• API integrations\n• Machine learning models\n• Automation scripts');
    const [copied, setCopied] = useState(false);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // Initialize Monaco Editor
    useEffect(() => {
        if (editorRef.current && !monacoRef.current) {
            monacoRef.current = monaco.editor.create(editorRef.current, {
                value: currentCode,
                language: 'python',
                theme: isDark ? 'vs-dark' : 'vs-light',
                automaticLayout: true,
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", consolas, "source-code-pro", monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                minimap: { enabled: true },
                wordWrap: 'on',
                folding: true,
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                automaticLayout: true,
            });

            // Listen for content changes
            monacoRef.current.onDidChangeModelContent(() => {
                setCurrentCode(monacoRef.current.getValue());
            });
        }

        return () => {
            if (monacoRef.current) {
                monacoRef.current.dispose();
                monacoRef.current = null;
            }
        };
    }, []);

    // Update editor content when currentCode changes
    useEffect(() => {
        if (monacoRef.current && monacoRef.current.getValue() !== currentCode) {
            monacoRef.current.setValue(currentCode);
        }
    }, [currentCode]);

    // Update editor theme when theme changes
    useEffect(() => {
        if (monacoRef.current) {
            monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs-light');
        }
    }, [isDark]);

    // Filter function to remove code blocks
    const filterCodeBlocks = (text) => {
        // Remove ```python, ```py, or ``` at the beginning and end
        return text
            .replace(/^```(?:python|py)?\n?/gm, '')
            .replace(/\n?```$/gm, '')
            .replace(/^```\n?/gm, '')
            .replace(/\n?```/gm, '');
    };

    // Function to format markdown text to JSX
    const formatMarkdownText = (text) => {
        if (!text) return null;

        // Split text into lines
        const lines = text.split('\n');
        const formattedElements = [];
        let currentListItems = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Handle headers
            if (trimmedLine.startsWith('### ')) {
                // Flush any pending list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(
                    <h3 key={ index } className="text-lg font-bold mb-3 mt-4">
                        { trimmedLine.replace('### ', '') }
                    </h3>
                );
            } else if (trimmedLine.startsWith('## ')) {
                // Flush any pending list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(
                    <h2 key={ index } className="text-xl font-bold mb-3 mt-4">
                        { trimmedLine.replace('## ', '') }
                    </h2>
                );
            } else if (trimmedLine.startsWith('# ')) {
                // Flush any pending list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(
                    <h1 key={ index } className="text-2xl font-bold mb-3 mt-4">
                        { trimmedLine.replace('# ', '') }
                    </h1>
                );
            }
            // Handle numbered lists
            else if (/^\d+\.\s/.test(trimmedLine)) {
                // Flush any pending unordered list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }

                const listText = trimmedLine.replace(/^\d+\.\s/, '');
                const formattedListText = formatInlineMarkdown(listText);

                // Check if this is the start of a new numbered list
                const prevLine = index > 0 ? lines[index - 1].trim() : '';
                const isFirstItem = !(/^\d+\.\s/.test(prevLine));

                if (isFirstItem) {
                    // Start new ordered list
                    formattedElements.push(
                        <ol key={ `ol-${index}` } className="list-decimal pl-6 mb-4 space-y-1">
                            <li>{ formattedListText }</li>
                        </ol>
                    );
                } else {
                    // Continue previous ordered list - we need to handle this differently
                    // For now, we'll create individual items
                    formattedElements.push(
                        <ol key={ `ol-${index}` } className="list-decimal pl-6 mb-1 space-y-1" start={ trimmedLine.match(/^(\d+)\./)[1] }>
                            <li>{ formattedListText }</li>
                        </ol>
                    );
                }
            }
            // Handle unordered lists (-, *, +, or •)
            else if (/^[-*+•]\s/.test(trimmedLine)) {
                const listText = trimmedLine.replace(/^[-*+•]\s/, '');
                const formattedListText = formatInlineMarkdown(listText);
                currentListItems.push(
                    <li key={ `item-${index}` }>{ formattedListText }</li>
                );
            }
            // Handle code blocks
            else if (trimmedLine.startsWith('```')) {
                // Flush any pending list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                // Handle code blocks (simplified - you might want to improve this)
                const codeContent = trimmedLine.replace(/```\w*/, '');
                if (codeContent) {
                    formattedElements.push(
                        <code key={ index } className={ `px-2 py-1 rounded text-sm font-mono font-bold ${isDark
                            ? 'bg-gray-700 text-blue-300'
                            : 'bg-gray-200 text-blue-700'
                            }` }>
                            { codeContent }
                        </code>
                    );
                }
            }
            // Handle inline code
            else if (trimmedLine.includes('`') && !trimmedLine.startsWith('```')) {
                // Flush any pending list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(
                    <p key={ index } className="mb-3 leading-relaxed">
                        { formatInlineMarkdown(trimmedLine) }
                    </p>
                );
            }
            // Handle empty lines
            else if (trimmedLine === '') {
                // Flush any pending list items before adding space
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(<div key={ index } className="mb-2"></div>);
            }
            // Handle regular paragraphs
            else {
                // Flush any pending list items
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(
                    <p key={ index } className="mb-3 leading-relaxed">
                        { formatInlineMarkdown(trimmedLine) }
                    </p>
                );
            }
        });

        // Flush any remaining list items
        if (currentListItems.length > 0) {
            formattedElements.push(
                <ul key="final-list" className="list-disc pl-6 mb-4 space-y-1">
                    { currentListItems }
                </ul>
            );
        }

        return formattedElements;
    };

    // Function to handle inline markdown formatting
    const formatInlineMarkdown = (text) => {
        if (!text) return text;

        // Split by backticks for inline code
        const parts = text.split('`');
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                // This is inside backticks - render as code with theme-aware styling
                return (
                    <code key={ index } className={ `px-2 py-1 rounded text-sm font-mono font-bold ${isDark
                        ? 'bg-gray-700 text-blue-300'
                        : 'bg-gray-200 text-blue-700'
                        }` }>
                        { part }
                    </code>
                );
            } else {
                // This is regular text - handle bold formatting
                return formatBoldText(part);
            }
        });
    };

    // Function to handle bold text
    const formatBoldText = (text) => {
        if (!text) return text;

        // Split by ** for bold text
        const parts = text.split('**');
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                // This is inside ** - render as bold
                return <strong key={ index } className="font-bold text-blue-600 dark:text-blue-400">{ part }</strong>;
            } else {
                return part;
            }
        });
    };

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

            // Filter the code to remove code blocks
            const filteredCode = filterCodeBlocks(code);

            // Update state with response
            setCurrentCode(filteredCode);
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
            const response = await fetch(`${BACKEND_URL}/api/codewriter/pythoncodegenerate`, {
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

    const handleBackNavigation = () => {
        navigate('/dashboard/codegenerator/');
    };

    return (
        <div className="h-screen pt-12 overflow-hidden">
            <div className="h-full flex flex-col">
                {/* Header */ }
                <div className="px-3 py-2 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={ handleBackNavigation }
                            className="p-2 bg-gray-500/80 hover:bg-gray-600/80 rounded-lg backdrop-blur-sm transition-all"
                        >
                            <ArrowLeft size={ 20 } className="text-white" />
                        </button>
                        <div className="p-2 bg-blue-500/80 rounded-lg backdrop-blur-sm">
                            <Code size={ 20 } className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Python Code Generator
                            </h1>
                            <p className="text-sm">
                                AI-powered Python development assistant
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */ }
                <div className="flex-1 flex overflow-hidden pb-32">
                    {/* Code Section */ }
                    <div className="flex-1 flex flex-col border-r/30">
                        <div className="px-6 py-3 flex justify-between items-center backdrop-blur-sm">
                            <h2 className="font-semibold flex items-center space-x-2">
                                <Code size={ 18 } />
                                <span>Generated Code</span>
                            </h2>
                            <button
                                onClick={ copyToClipboard }
                                className={ `flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all backdrop-blur-sm ${copied
                                    ? 'bg-green-500/80 text-white'
                                    : 'hover:bg-opacity-80'
                                    }` }
                            >
                                { copied ? <Check size={ 16 } /> : <Copy size={ 16 } /> }
                                <span className="text-sm">{ copied ? 'Copied!' : 'Copy' }</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {/* Monaco Editor */ }
                            <div
                                ref={ editorRef }
                                className="w-full h-full"
                                style={ { height: '100%' } }
                            />
                        </div>
                    </div>

                    {/* Info Section */ }
                    <div className="w-2/5 flex flex-col">
                        <div className="px-6 py-3 backdrop-blur-sm">
                            <h2 className="font-semibold flex items-center space-x-2">
                                <MessageSquare size={ 18 } />
                                <span>Code Information</span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <div className="p-6">
                                { formatMarkdownText(codeInfo) }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Input Section at Bottom */ }
                <div className="fixed bottom-0 left-0 right-0 px-6 py-4 backdrop-blur-md shadow-2xl">
                    <div className="flex space-x-3 max-w-7xl mx-auto">
                        <div className={ `flex-1 relative ${isDark ? 'border-white-800' : 'bg-white'}` }>
                            <input
                                type="text"
                                value={ userInput }
                                onChange={ (e) => setUserInput(e.target.value) }
                                onKeyPress={ handleKeyPress }
                                placeholder="Describe the Python code you want to generate..."
                                className="w-full px-4 py-3 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all backdrop-blur-sm"
                                disabled={ isLoading }
                            />
                        </div>
                        <button
                            onClick={ handleSubmit }
                            disabled={ isLoading || !userInput.trim() }
                            className={ `px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 backdrop-blur-sm ${isLoading || !userInput.trim()
                                ? 'bg-gray-300/50 cursor-not-allowed'
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