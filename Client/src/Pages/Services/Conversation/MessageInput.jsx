import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const MessageInput = ({ input, setInput, onSubmit, isTyping, className }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textareaRef = useRef(null);
    const [rows, setRows] = useState(1);
    const maxRows = 6; // Maximum number of rows before scrolling

    // Handle input change and auto-resize
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isTyping) {
            onSubmit(input.trim());
            setInput('');
            // Reset height after submitting
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                setRows(1);
            }
        }
    };

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to get the correct scrollHeight
        textarea.style.height = 'auto';

        // If the input is empty, set to minimum height and exit early
        if (!input.trim()) {
            setRows(1);
            textarea.style.height = 'auto';
            textarea.style.overflowY = 'hidden';
            return;
        }

        // Calculate the number of rows based on scrollHeight and lineHeight
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
        const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);
        const borderTop = parseInt(getComputedStyle(textarea).borderTopWidth);
        const borderBottom = parseInt(getComputedStyle(textarea).borderBottomWidth);

        const totalHeight = textarea.scrollHeight;
        const contentHeight = totalHeight - paddingTop - paddingBottom - borderTop - borderBottom;

        // Calculate number of rows (with a minimum of 1)
        const calculatedRows = Math.max(1, Math.min(maxRows, Math.floor(contentHeight / lineHeight)));

        setRows(calculatedRows);

        // Set the height based on content, with a max-height based on maxRows
        if (calculatedRows < maxRows) {
            textarea.style.height = `${textarea.scrollHeight}px`;
            textarea.style.overflowY = 'hidden';
        } else {
            textarea.style.height = `${lineHeight * maxRows + paddingTop + paddingBottom + borderTop + borderBottom}px`;
            textarea.style.overflowY = 'auto';
        }
    }, [input]);

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        // Submit on Enter without Shift key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className={ `${className} p-2 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}` }>
            <form onSubmit={ handleSubmit } className="flex items-end gap-2">
                <textarea
                    ref={ textareaRef }
                    value={ input }
                    onChange={ handleInputChange }
                    onKeyDown={ handleKeyDown }
                    placeholder="Type a message..."
                    disabled={ isTyping }
                    className={ `flex-1 p-3 rounded-l-lg resize-none ${isDark
                        ? 'bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                        } border ${isDark ? 'border-gray-600' : 'border-gray-300'} focus:outline-none` }
                    style={ { minHeight: '44px' } }
                    rows={ rows }
                />
                <button
                    type="submit"
                    disabled={ !input.trim() || isTyping }
                    className={ `${!input.trim() || isTyping
                        ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`
                        : `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                        } p-3 rounded-r-lg transition-colors duration-200 flex items-center justify-center` }
                    style={ { minHeight: '44px' } }
                >
                    <SendHorizontal className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;