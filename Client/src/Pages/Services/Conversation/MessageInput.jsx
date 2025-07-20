import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Plus, X, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const MessageInput = ({ input, setInput, onSubmit, isTyping, className }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [rows, setRows] = useState(1);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const maxRows = 6; // Maximum number of rows before scrolling

    // Handle input change and auto-resize
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    // Handle image file selection
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const validImages = files.filter(file => file.type.startsWith('image/'));

        if (validImages.length > 0) {
            const imagePromises = validImages.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            id: Date.now() + Math.random(),
                            file: file,
                            preview: e.target.result,
                            name: file.name
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises).then(images => {
                setSelectedImages(prev => [...prev, ...images]);
            });
        }

        setShowAttachMenu(false);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove selected image
    const removeImage = (imageId) => {
        setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if ((input.trim() || selectedImages.length > 0) && !isTyping) {
            // Create message object with text and images
            const messageData = {
                text: input.trim(),
                images: selectedImages
            };

            onSubmit(messageData);
            setInput('');
            setSelectedImages([]);

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
            {/* Image previews */ }
            { selectedImages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    { selectedImages.map(image => (
                        <div key={ image.id } className="relative">
                            <img
                                src={ image.preview }
                                alt={ image.name }
                                className="h-16 w-16 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={ () => removeImage(image.id) }
                                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                style={ { width: '20px', height: '20px' } }
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )) }
                </div>
            ) }

            <form onSubmit={ handleSubmit } className="flex items-end gap-2">
                {/* Plus button with attach menu */ }
                <div className="relative">
                    <button
                        type="button"
                        onClick={ () => setShowAttachMenu(!showAttachMenu) }
                        disabled={ isTyping }
                        className={ `p-3 rounded-lg transition-colors duration-200 flex items-center justify-center ${isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                            }` }
                        style={ { minHeight: '44px' } }
                    >
                        <Plus className="h-5 w-5" />
                    </button>

                    {/* Attach menu */ }
                    { showAttachMenu && (
                        <div className={ `absolute bottom-full mb-2 left-0 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                            } border rounded-lg shadow-lg py-2 min-w-40` }>
                            <button
                                type="button"
                                onClick={ () => fileInputRef.current?.click() }
                                className={ `w-full px-4 py-2 text-left flex items-center gap-2 hover:${isDark ? 'bg-gray-600' : 'bg-gray-100'
                                    } transition-colors` }
                            >
                                <ImageIcon className="h-4 w-4" />
                                Upload Image
                            </button>
                        </div>
                    ) }
                </div>

                {/* Hidden file input */ }
                <input
                    ref={ fileInputRef }
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={ handleImageSelect }
                    className="hidden"
                />

                <textarea
                    ref={ textareaRef }
                    value={ input }
                    onChange={ handleInputChange }
                    onKeyDown={ handleKeyDown }
                    placeholder="Type a message..."
                    disabled={ isTyping }
                    className={ `flex-1 p-3 rounded-lg resize-none ${isDark
                        ? 'bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                        } border ${isDark ? 'border-gray-600' : 'border-gray-300'} focus:outline-none` }
                    style={ { minHeight: '44px' } }
                    rows={ rows }
                />
                <button
                    type="submit"
                    disabled={ (!input.trim() && selectedImages.length === 0) || isTyping }
                    className={ `${(!input.trim() && selectedImages.length === 0) || isTyping
                        ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`
                        : `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                        } p-3 rounded-lg transition-colors duration-200 flex items-center justify-center` }
                    style={ { minHeight: '44px' } }
                >
                    <SendHorizontal className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;