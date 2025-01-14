import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../../contexts/ThemeContext';

const CodeBlock = ({ language, content }) => {
    const [copied, setCopied] = useState(false);

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={ `relative rounded-md overflow-hidden my-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
            <div className={ `flex justify-between items-center px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}` }>
                <span className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}` }>{ language }</span>
                <button
                    onClick={ handleCopy }
                    className={ `text-sm ${copied ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-gray-400' : 'text-gray-600')}` }
                >
                    { copied ? 'Copied!' : 'Copy' }
                </button>
            </div>
            <div className="overflow-x-auto">
                <SyntaxHighlighter language={ language } style={ isDark ? oneDark : tomorrow }>
                    { content }
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlock;
