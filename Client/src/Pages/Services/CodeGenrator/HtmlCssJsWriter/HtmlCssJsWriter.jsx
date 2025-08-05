import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, Code, Layers, Eye, Moon, Sun, ArrowLeft, Download, Plus, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const CodeExplorer = () => {
    const [files, setFiles] = useState({});
    const [activeFile, setActiveFile] = useState('');
    const [prompt, setPrompt] = useState('');
    const [featurePrompt, setFeaturePrompt] = useState('');
    const [conversation, setConversation] = useState([]);
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('code');
    const [downloadStatus, setDownloadStatus] = useState('');
    const [streamingContent, setStreamingContent] = useState('');
    const [showStreamingPreview, setShowStreamingPreview] = useState(false);
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const eventSourceRef = useRef(null);

    // Get backend URL from environment variables or use default
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    useEffect(() => {
        // Cleanup event source on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    const parseAiResponse = (responseContent) => {
        try {
            console.log("Raw AI response:", responseContent);

            // More flexible HTML extraction
            const htmlMatch = responseContent.match(/<!--\s*HTML\s*-->([\s\S]*?)(?=\/\*\s*CSS\s*\*\/|<!--\s*CSS\s*-->|$)/i);
            let htmlContent = htmlMatch ? htmlMatch[1].trim() : '';

            // More flexible CSS extraction
            const cssMatch = responseContent.match(/\/\*\s*CSS\s*\*\/\s*<style>([\s\S]*?)<\/style>/i) ||
                responseContent.match(/<!--\s*CSS\s*-->\s*<style>([\s\S]*?)<\/style>/i) ||
                responseContent.match(/<style>([\s\S]*?)<\/style>/i);
            let cssContent = cssMatch ? cssMatch[1].trim() : '';

            // More flexible JavaScript extraction
            const jsMatch = responseContent.match(/\/\*\s*JavaScript\s*\*\/\s*<script>([\s\S]*?)<\/script>/i) ||
                responseContent.match(/<!--\s*JavaScript\s*-->\s*<script>([\s\S]*?)<\/script>/i) ||
                responseContent.match(/<script>([\s\S]*?)<\/script>/i);
            let jsContent = jsMatch ? jsMatch[1].trim() : '';

            // If HTML includes full document, extract body content
            if (htmlContent.includes('<!DOCTYPE html>') || htmlContent.includes('<html>')) {
                const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                if (bodyMatch) {
                    const fullHtml = htmlContent;
                    htmlContent = bodyMatch[1].trim();

                    // If no separate CSS found, try to extract from head
                    if (!cssContent) {
                        const headCssMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                        if (headCssMatch) {
                            cssContent = headCssMatch[1].trim();
                        }
                    }

                    // If no separate JS found, try to extract from body
                    if (!jsContent) {
                        const bodyJsMatch = fullHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                        if (bodyJsMatch) {
                            jsContent = bodyJsMatch[1].trim();
                        }
                    }
                }
            }

            // Fallback: if still no content found, try to extract any code blocks
            if (!htmlContent && !cssContent && !jsContent) {
                // Try to extract from code blocks
                const codeBlocks = responseContent.match(/```[\s\S]*?```/g);
                if (codeBlocks) {
                    codeBlocks.forEach(block => {
                        const content = block.replace(/```[a-zA-Z]*\n?|\n?```/g, '').trim();
                        if (content.includes('<') && content.includes('>')) {
                            htmlContent = content;
                        } else if (content.includes('{') && content.includes('}') && !content.includes('function')) {
                            cssContent = content;
                        } else if (content.includes('function') || content.includes('const') || content.includes('let')) {
                            jsContent = content;
                        }
                    });
                }
            }

            console.log("Parsed HTML:", htmlContent);
            console.log("Parsed CSS:", cssContent);
            console.log("Parsed JS:", jsContent);

            const parsedFiles = {};
            if (htmlContent) parsedFiles['index.html'] = htmlContent;
            if (cssContent) parsedFiles['styles.css'] = cssContent;
            if (jsContent) parsedFiles['app.js'] = jsContent;

            return parsedFiles;
        } catch (err) {
            console.error('Error parsing AI response:', err);
            setError('Failed to parse AI response');
            return {};
        }
    };

    const handleStreamingResponse = (endpoint, data, isFeature = false) => {
        setIsLoading(true);
        setError('');
        setStreamingContent('');
        setShowStreamingPreview(true);

        // Close any existing event source
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        // Create new event source using fetch for POST requests
        const controller = new AbortController();

        fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                const readStream = () => {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            setIsLoading(false);
                            setShowStreamingPreview(false);
                            return;
                        }

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        lines.forEach(line => {
                            if (line.startsWith('data: ')) {
                                try {
                                    const eventData = JSON.parse(line.slice(6));

                                    if (eventData.type === 'chunk') {
                                        setStreamingContent(eventData.accumulated);
                                        setSessionId(eventData.sessionId);
                                    } else if (eventData.type === 'complete') {
                                        setConversation(eventData.conversation || []);
                                        setSessionId(eventData.sessionId);

                                        const parsedFiles = parseAiResponse(eventData.content);
                                        if (Object.keys(parsedFiles).length === 0) {
                                            setError('No valid code was generated. Please try a different prompt.');
                                            return;
                                        }

                                        setFiles(parsedFiles);
                                        const firstFile = Object.keys(parsedFiles)[0];
                                        if (!parsedFiles[activeFile]) {
                                            setActiveFile(firstFile);
                                        }

                                        if (isFeature) {
                                            setFeaturePrompt('');
                                        } else {
                                            setPrompt('');
                                        }

                                        setStreamingContent('');
                                        setShowStreamingPreview(false);
                                        setIsLoading(false);
                                    } else if (eventData.type === 'error') {
                                        setError(eventData.message);
                                        setIsLoading(false);
                                        setShowStreamingPreview(false);
                                    }
                                } catch (e) {
                                    console.error('Error parsing event data:', e);
                                }
                            }
                        });

                        readStream();
                    });
                };

                readStream();
            })
            .catch(err => {
                console.error('Streaming error:', err);
                setError(err.message || 'Failed to connect to streaming endpoint');
                setIsLoading(false);
                setShowStreamingPreview(false);
            });

        // Store the controller for cleanup
        eventSourceRef.current = { close: () => controller.abort() };
    };

    const handleGenerateCode = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        handleStreamingResponse('/api/codewriter/htmlcssjscodegenerate', {
            prompt,
            conversation
        });
    };

    const handleAddFeature = async (e) => {
        e.preventDefault();
        if (!featurePrompt.trim() || !sessionId) {
            setError('Please enter a feature description and ensure you have an active session');
            return;
        }

        handleStreamingResponse('/api/codewriter/continue', {
            prompt: featurePrompt,
            conversation,
            sessionId
        }, true);
    };

    // Fallback to synchronous method if streaming fails
    const handleGenerateCodeSync = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${BACKEND_URL}/api/codewriter/htmlcssjscodegenerate-sync`, {
                prompt,
                conversation
            }, {
                timeout: 300000, // 5 minutes timeout
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data && response.data.content) {
                setConversation(response.data.conversation || []);
                setSessionId(response.data.sessionId || Date.now().toString());
                const parsedFiles = parseAiResponse(response.data.content);

                if (Object.keys(parsedFiles).length === 0) {
                    setError('No valid code was generated. Please try a different prompt.');
                    return;
                }

                setFiles(parsedFiles);
                const firstFile = Object.keys(parsedFiles)[0];
                setActiveFile(firstFile);
                setPrompt('');
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            console.error('Error generating code:', err);
            if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
                setError(`Cannot connect to backend server at ${BACKEND_URL}. Please check if the server is running.`);
            } else if (err.response) {
                setError(err.response?.data?.message || `Server error: ${err.response.status}`);
            } else if (err.request) {
                setError('No response from server. Please check your network connection.');
            } else {
                setError(err.message || 'Failed to generate code');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (Object.keys(files).length === 0) {
            setError('No files to download');
            return;
        }

        setDownloadStatus('Preparing download...');

        try {
            const response = await axios.post(`${BACKEND_URL}/api/codewriter/download`, {
                files
            }, {
                responseType: 'blob',
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `generated_code_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setDownloadStatus('Download completed!');
            setTimeout(() => setDownloadStatus(''), 3000);
        } catch (err) {
            console.error('Error downloading files:', err);
            if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
                setError(`Cannot connect to backend server at ${BACKEND_URL}. Please check if the server is running.`);
            } else {
                setError(err.response?.data?.message || 'Failed to download files');
            }
            setDownloadStatus('');
        }
    };

    const handleNewPrompt = () => {
        // Close any active streaming
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setFiles({});
        setActiveFile('');
        setPrompt('');
        setFeaturePrompt('');
        setConversation([]);
        setSessionId('');
        setError('');
        setDownloadStatus('');
        setViewMode('code');
        setStreamingContent('');
        setShowStreamingPreview(false);
        setIsLoading(false);
    };

    const getFileIcon = (filename) => {
        if (filename.endsWith('.html')) return <FileText size={ 16 } />;
        if (filename.endsWith('.css')) return <Layers size={ 16 } />;
        if (filename.endsWith('.js')) return <Code size={ 16 } />;
        return <FileText size={ 16 } />;
    };

    const getCombinedHtml = () => {
        if (!files['index.html']) return '';

        let html = files['index.html'];

        // Ensure proper HTML structure
        if (!html.includes('<!DOCTYPE html>')) {
            html = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated App</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
        }

        // Inject CSS
        if (files['styles.css']) {
            if (html.includes('</head>')) {
                html = html.replace('</head>', `<style>\n${files['styles.css']}\n</style>\n</head>`);
            } else {
                html = html.replace('<body>', `<style>\n${files['styles.css']}\n</style>\n<body>`);
            }
        }

        // Inject JavaScript
        if (files['app.js']) {
            if (html.includes('</body>')) {
                html = html.replace('</body>', `<script>\n${files['app.js']}\n</script>\n</body>`);
            } else {
                html = `${html}\n<script>\n${files['app.js']}\n</script>`;
            }
        }

        return html;
    };

    const getStreamingPreviewHtml = () => {
        if (!streamingContent) return '';

        const parsedFiles = parseAiResponse(streamingContent);
        let html = parsedFiles['index.html'] || '';

        if (!html) return '';

        // Ensure proper HTML structure
        if (!html.includes('<!DOCTYPE html>')) {
            html = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated App</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
        }

        // Inject CSS
        if (parsedFiles['styles.css']) {
            if (html.includes('</head>')) {
                html = html.replace('</head>', `<style>\n${parsedFiles['styles.css']}\n</style>\n</head>`);
            } else {
                html = html.replace('<body>', `<style>\n${parsedFiles['styles.css']}\n</style>\n<body>`);
            }
        }

        // Inject JavaScript
        if (parsedFiles['app.js']) {
            if (html.includes('</body>')) {
                html = html.replace('</body>', `<script>\n${parsedFiles['app.js']}\n</script>\n</body>`);
            } else {
                html = `${html}\n<script>\n${parsedFiles['app.js']}\n</script>`;
            }
        }

        return html;
    };

    const handleFileClick = (filename) => {
        setActiveFile(filename);
        if (viewMode === 'preview') {
            setViewMode('code');
        }
    };

    return (
        <div className={ `pt-16 flex flex-col w-full min-h-screen overflow-hidden ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'}` }>
            <div className={ `w-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} p-4 border-b sticky top-0 z-10` }>
                <form onSubmit={ handleGenerateCode } className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        type="button"
                        onClick={ () => navigate('/dashboard/codegenerator') }
                        className={ `
                            px-4 py-3 rounded-lg font-medium transition-all duration-200
                            flex items-center justify-center gap-2 text-sm
                            ${isDark
                                ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm'
                            }
                        `}
                    >
                        <ArrowLeft size={ 16 } />
                    </button>

                    <input
                        type="text"
                        value={ prompt }
                        onChange={ (e) => setPrompt(e.target.value) }
                        placeholder="Enter your initial prompt (e.g., 'create a todo app with add, delete functionality')"
                        className={ `
                            flex-1 p-3 border rounded-lg transition-all duration-200
                            ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                            }
                        `}
                        disabled={ isLoading }
                    />

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={ isLoading || !prompt.trim() }
                            className={ `
                                px-6 py-3 rounded-lg font-medium transition-all duration-200
                                flex items-center justify-center gap-2 text-white min-w-[120px]
                                ${isLoading || !prompt.trim()
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                }
                            `}
                        >
                            { isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate (Stream)
                                    <span>→</span>
                                </>
                            ) }
                        </button>

                        <button
                            type="button"
                            onClick={ handleGenerateCodeSync }
                            disabled={ isLoading || !prompt.trim() }
                            className={ `
                                px-4 py-3 rounded-lg font-medium transition-all duration-200
                                flex items-center justify-center gap-2 text-sm
                                ${isLoading || !prompt.trim()
                                    ? 'bg-gray-500 cursor-not-allowed text-white'
                                    : isDark
                                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                            `}
                            title="Fallback non-streaming method"
                        >
                            Sync
                        </button>
                    </div>
                </form>

                { Object.keys(files).length > 0 && (
                    <form onSubmit={ handleAddFeature } className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
                        <input
                            type="text"
                            value={ featurePrompt }
                            onChange={ (e) => setFeaturePrompt(e.target.value) }
                            placeholder="Add feature (e.g., 'add dark mode toggle', 'add user authentication')"
                            className={ `
                                flex-1 p-3 border rounded-lg transition-all duration-200
                                ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                    : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }
                            `}
                            disabled={ isLoading }
                        />
                        <button
                            type="submit"
                            disabled={ isLoading || !featurePrompt.trim() || !sessionId }
                            className={ `
                                px-6 py-3 rounded-lg font-medium transition-all duration-200
                                flex items-center justify-center gap-2 text-white min-w-[120px]
                                ${isLoading || !featurePrompt.trim() || !sessionId
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                                }
                            `}
                        >
                            { isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    Add Feature
                                    <span>→</span>
                                </>
                            ) }
                        </button>
                    </form>
                ) }

                { error && (
                    <div className="mt-3 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 flex items-center gap-2">
                        <AlertCircle size={ 16 } />
                        { error }
                    </div>
                ) }

                { downloadStatus && (
                    <div className="mt-3 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700">
                        { downloadStatus }
                    </div>
                ) }
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                { (Object.keys(files).length > 0 || showStreamingPreview) && (
                    <div className={ `w-full md:w-64 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} p-4 border-r` }>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Files</h2>
                            <div className="flex space-x-1">
                                <button
                                    onClick={ () => setViewMode('code') }
                                    className={ `
                                        p-2 rounded-lg transition-all duration-200
                                        ${viewMode === 'code'
                                            ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                                            : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300')
                                        }
                                    `}
                                    aria-label="Code view"
                                >
                                    <Code size={ 16 } />
                                </button>
                                <button
                                    onClick={ () => setViewMode('preview') }
                                    className={ `
                                        p-2 rounded-lg transition-all duration-200
                                        ${viewMode === 'preview'
                                            ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                                            : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300')
                                        }
                                    `}
                                    aria-label="Preview"
                                >
                                    <Eye size={ 16 } />
                                </button>
                                <button
                                    onClick={ handleDownload }
                                    disabled={ downloadStatus === 'Preparing download...' || Object.keys(files).length === 0 }
                                    className={ `
                                        p-2 rounded-lg transition-all duration-200
                                        ${downloadStatus === 'Preparing download...' || Object.keys(files).length === 0
                                            ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                                            : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300')
                                        }
                                    `}
                                    aria-label="Download files"
                                >
                                    <Download size={ 16 } />
                                </button>
                                <button
                                    onClick={ handleNewPrompt }
                                    className={ `
                                        p-2 rounded-lg transition-all duration-200
                                        ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'}
                                    `}
                                    aria-label="New prompt"
                                >
                                    <Plus size={ 16 } />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            { showStreamingPreview && (
                                <div className={ `flex items-center p-3 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700 text-yellow-300' : 'bg-yellow-100 border border-yellow-300 text-yellow-800'}` }>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-3"></div>
                                    <span className="text-sm">Streaming...</span>
                                </div>
                            ) }
                            { Object.keys(files).map(filename => (
                                files[filename] && (
                                    <div
                                        key={ filename }
                                        onClick={ () => handleFileClick(filename) }
                                        className={ `
                                            flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                                            ${activeFile === filename
                                                ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                                                : (isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200')
                                            }
                                        `}
                                    >
                                        <span className="mr-3">{ getFileIcon(filename) }</span>
                                        { filename }
                                    </div>
                                )
                            )) }
                        </div>
                    </div>
                ) }

                <div className="flex-1 overflow-auto">
                    { Object.keys(files).length === 0 && !isLoading && !showStreamingPreview && (
                        <div className="flex h-full items-center justify-center p-4">
                            <div className="text-center p-8">
                                <div className={ `w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                                    <Code size={ 32 } className={ isDark ? 'text-gray-400' : 'text-gray-500' } />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">Enter a prompt to generate code</h2>
                                <p className={ isDark ? "text-gray-400" : "text-gray-600" }>
                                    Create web applications with HTML, CSS, and JavaScript using AI
                                </p>
                                <div className="mt-4 text-sm">
                                    <p className={ isDark ? "text-gray-500" : "text-gray-500" }>
                                        Example prompts:
                                    </p>
                                    <ul className={ `mt-2 text-left max-w-md mx-auto space-y-1 ${isDark ? "text-gray-400" : "text-gray-600"}` }>
                                        <li>• "Create a todo app with add and delete functionality"</li>
                                        <li>• "Build a calculator with basic operations"</li>
                                        <li>• "Make a weather app with search functionality"</li>
                                        <li>• "Create a timer application with start/stop buttons"</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) }

                    { isLoading && !showStreamingPreview && (
                        <div className="flex h-full items-center justify-center p-4">
                            <div className="text-center">
                                <div className={ `animate-spin rounded-full h-12 w-12 border-4 ${isDark ? 'border-gray-600 border-t-white' : 'border-gray-300 border-t-blue-500'} mx-auto mb-4` }></div>
                                <p className="text-lg font-medium mb-2">
                                    { sessionId ? 'Adding feature...' : 'Generating code...' }
                                </p>
                                <p className={ isDark ? "text-gray-400" : "text-gray-600" }>
                                    This may take a few moments
                                </p>
                            </div>
                        </div>
                    ) }

                    { showStreamingPreview && streamingContent && (
                        <div className="p-4 h-full">
                            <div className={ `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm h-full flex flex-col` }>
                                <div className={ `flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4` }>
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                        <h3 className="font-medium">Live Streaming Preview</h3>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        AI is generating code...
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[500px]">
                                    <iframe
                                        srcDoc={ getStreamingPreviewHtml() }
                                        title="Streaming Preview"
                                        className="w-full h-full border-0 rounded-b-lg"
                                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                    />
                                </div>
                            </div>
                        </div>
                    ) }

                    { !isLoading && !showStreamingPreview && Object.keys(files).length > 0 && viewMode === 'code' && activeFile && (
                        <div className="p-4">
                            <div className={ `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm` }>
                                <div className={ `flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4` }>
                                    <div className="flex items-center gap-2">
                                        { getFileIcon(activeFile) }
                                        <h3 className="font-medium">{ activeFile }</h3>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        { files[activeFile].split('\n').length } lines
                                    </div>
                                </div>
                                <pre className={ `p-4 overflow-auto text-sm min-h-[400px] max-h-[600px] ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}` }>
                                    <code>{ files[activeFile] }</code>
                                </pre>
                            </div>
                        </div>
                    ) }

                    { !isLoading && !showStreamingPreview && Object.keys(files).length > 0 && viewMode === 'preview' && (
                        <div className="p-4 h-full">
                            <div className={ `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm h-full flex flex-col` }>
                                <div className={ `flex items-center justify-between border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4` }>
                                    <div className="flex items-center gap-2">
                                        <Eye size={ 16 } />
                                        <h3 className="font-medium">Live Preview</h3>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Combined HTML, CSS & JS
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[500px]">
                                    <iframe
                                        srcDoc={ getCombinedHtml() }
                                        title="Live Preview"
                                        className="w-full h-full border-0 rounded-b-lg"
                                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                    />
                                </div>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default CodeExplorer;