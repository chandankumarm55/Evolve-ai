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
    const [streamingResponse, setStreamingResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const eventSourceRef = useRef(null);

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

    // Cleanup EventSource on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    // Filter function to remove code blocks
    const filterCodeBlocks = (text) => {
        return text
            .replace(/^```(?:python|py)?\n?/gm, '')
            .replace(/\n?```$/gm, '')
            .replace(/^```\n?/gm, '')
            .replace(/\n?```/gm, '');
    };

    // Function to format markdown text to JSX
    const formatMarkdownText = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        const formattedElements = [];
        let currentListItems = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('### ')) {
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
            } else if (/^\d+\.\s/.test(trimmedLine)) {
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
                const prevLine = index > 0 ? lines[index - 1].trim() : '';
                const isFirstItem = !(/^\d+\.\s/.test(prevLine));

                if (isFirstItem) {
                    formattedElements.push(
                        <ol key={ `ol-${index}` } className="list-decimal pl-6 mb-4 space-y-1">
                            <li>{ formattedListText }</li>
                        </ol>
                    );
                } else {
                    formattedElements.push(
                        <ol key={ `ol-${index}` } className="list-decimal pl-6 mb-1 space-y-1" start={ trimmedLine.match(/^(\d+)\./)[1] }>
                            <li>{ formattedListText }</li>
                        </ol>
                    );
                }
            } else if (/^[-*+•]\s/.test(trimmedLine)) {
                const listText = trimmedLine.replace(/^[-*+•]\s/, '');
                const formattedListText = formatInlineMarkdown(listText);
                currentListItems.push(
                    <li key={ `item-${index}` }>{ formattedListText }</li>
                );
            } else if (trimmedLine.startsWith('```')) {
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
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
            } else if (trimmedLine.includes('`') && !trimmedLine.startsWith('```')) {
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
            } else if (trimmedLine === '') {
                if (currentListItems.length > 0) {
                    formattedElements.push(
                        <ul key={ `list-${index}` } className="list-disc pl-6 mb-4 space-y-1">
                            { currentListItems }
                        </ul>
                    );
                    currentListItems = [];
                }
                formattedElements.push(<div key={ index } className="mb-2"></div>);
            } else {
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

        if (currentListItems.length > 0) {
            formattedElements.push(
                <ul key="final-list" className="list-disc pl-6 mb-4 space-y-1">
                    { currentListItems }
                </ul>
            );
        }

        return formattedElements;
    };

    const formatInlineMarkdown = (text) => {
        if (!text) return text;

        const parts = text.split('`');
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return (
                    <code key={ index } className={ `px-2 py-1 rounded text-sm font-mono font-bold ${isDark
                        ? 'bg-gray-700 text-blue-300'
                        : 'bg-gray-200 text-blue-700'
                        }` }>
                        { part }
                    </code>
                );
            } else {
                return formatBoldText(part);
            }
        });
    };

    const formatBoldText = (text) => {
        if (!text) return text;

        const parts = text.split('**');
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={ index } className="font-bold text-blue-600 dark:text-blue-400">{ part }</strong>;
            } else {
                return part;
            }
        });
    };

    const handleSubmit = async () => {
        if (!userInput.trim()) return;

        // Close any existing EventSource
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const newMessage = { role: 'user', content: userInput };
        const updatedConversations = [...conversations, newMessage];
        setConversations(updatedConversations);
        setUserInput('');
        setIsLoading(true);
        setIsStreaming(true);
        setStreamingResponse('');

        try {
            // Create a streaming request using fetch with POST data
            const response = await fetch(`${BACKEND_URL}/api/codewriter/pythoncodegenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ messages: updatedConversations }),
            });

            if (!response.ok) {
                throw new Error('Failed to start streaming');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'chunk') {
                                setStreamingResponse(prev => prev + data.content);

                                // Update code and info in real-time
                                const { code, info } = parseResponse(data.fullResponse);
                                const filteredCode = filterCodeBlocks(code);
                                setCurrentCode(filteredCode);
                                setCodeInfo(info);
                            } else if (data.type === 'complete') {
                                // Final update
                                const filteredCode = filterCodeBlocks(data.code);
                                setCurrentCode(filteredCode);
                                setCodeInfo(data.info);
                                setConversations([...updatedConversations, data.message]);
                                setIsStreaming(false);
                                setIsLoading(false);
                            } else if (data.type === 'error') {
                                console.error('Streaming error:', data.error);
                                setCodeInfo('❌ Failed to generate code. Please try again.');
                                setIsStreaming(false);
                                setIsLoading(false);
                            }
                        } catch (parseError) {
                            console.error('Failed to parse SSE data:', parseError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error with streaming:', error);
            setCodeInfo('❌ Failed to generate code. Please try again.');
            setIsStreaming(false);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
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
        // Close EventSource before navigating
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
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
                                { isStreaming && <span className="ml-2 text-blue-500">🔄 Generating...</span> }
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
                                { isStreaming && (
                                    <div className="flex items-center space-x-1 text-blue-500">
                                        <RefreshCw size={ 14 } className="animate-spin" />
                                        <span className="text-xs">Live Generation</span>
                                    </div>
                                ) }
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
                                { isStreaming && (
                                    <div className="flex items-center space-x-1 text-blue-500">
                                        <RefreshCw size={ 14 } className="animate-spin" />
                                        <span className="text-xs">Updating...</span>
                                    </div>
                                ) }
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
                                    <span>{ isStreaming ? 'Streaming...' : 'Generating...' }</span>
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
                        Press Enter to generate code • { isStreaming ? 'Real-time streaming enabled' : 'Support for data analysis, web scraping, APIs & more' }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PythonCodeWriter;