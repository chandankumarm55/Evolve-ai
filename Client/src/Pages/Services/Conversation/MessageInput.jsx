import React, { useState, useRef, useEffect } from 'react';
import {
    SendHorizontal,
    Plus,
    X,
    Image as ImageIcon,
    Camera,
    Upload,
    FileText,
    Mic
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const MessageInput = ({ input, setInput, onSubmit, isTyping, className }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [rows, setRows] = useState(1);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const maxRows = 6;

    // Handle input change and auto-resize
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    // Handle image file selection from gallery
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        processImageFiles(files);
        setShowAttachMenu(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle camera capture
    const handleCameraCapture = (e) => {
        const files = Array.from(e.target.files);
        processImageFiles(files);
        setShowAttachMenu(false);
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    // Process image files
    const processImageFiles = (files) => {
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
                            name: file.name,
                            type: "image_url",
                            image_url: {
                                url: e.target.result
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises).then(images => {
                setSelectedImages(prev => [...prev, ...images]);
            });
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
            const messageData = {
                text: input.trim(),
                images: selectedImages
            };

            onSubmit(messageData);
            setInput('');
            setSelectedImages([]);

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                setRows(1);
            }
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAttachMenu && !event.target.closest('.attach-menu-container')) {
                setShowAttachMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAttachMenu]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';

        if (!input.trim()) {
            setRows(1);
            textarea.style.height = 'auto';
            textarea.style.overflowY = 'hidden';
            return;
        }

        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
        const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);
        const borderTop = parseInt(getComputedStyle(textarea).borderTopWidth);
        const borderBottom = parseInt(getComputedStyle(textarea).borderBottomWidth);

        const totalHeight = textarea.scrollHeight;
        const contentHeight = totalHeight - paddingTop - paddingBottom - borderTop - borderBottom;
        const calculatedRows = Math.max(1, Math.min(maxRows, Math.floor(contentHeight / lineHeight)));

        setRows(calculatedRows);

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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const attachmentOptions = [
        {
            icon: Upload,
            label: 'Upload from device',
            description: 'Choose files from your device',
            action: () => fileInputRef.current?.click(),
            color: 'text-blue-500'
        },
        {
            icon: Camera,
            label: 'Use camera',
            description: 'Take a photo with your camera',
            action: () => cameraInputRef.current?.click(),
            color: 'text-green-500'
        },
        {
            icon: ImageIcon,
            label: 'Add photos',
            description: 'Upload images to analyze',
            action: () => fileInputRef.current?.click(),
            color: 'text-purple-500'
        },
        {
            icon: FileText,
            label: 'Add documents',
            description: 'Coming soon',
            action: () => console.log('Documents coming soon'),
            color: 'text-orange-500',
            disabled: true
        }
    ];

    return (
        <div className={ `${className} p-3 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}` }>
            {/* Image previews */ }
            { selectedImages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    { selectedImages.map(image => (
                        <div key={ image.id } className="relative group">
                            <img
                                src={ image.preview }
                                alt={ image.name }
                                className="h-20 w-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-200 group-hover:shadow-md"
                            />
                            <button
                                type="button"
                                onClick={ () => removeImage(image.id) }
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                            >
                                <X className="h-3 w-3" />
                            </button>
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-xl transition-all duration-200"></div>
                        </div>
                    )) }
                </div>
            ) }

            <form onSubmit={ handleSubmit } className="flex items-end gap-3">
                {/* Enhanced attachment menu */ }
                <div className="relative attach-menu-container">
                    <button
                        type="button"
                        onClick={ () => setShowAttachMenu(!showAttachMenu) }
                        disabled={ isTyping }
                        className={ `p-3 rounded-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105 ${showAttachMenu
                            ? isDark
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-blue-500 text-white shadow-lg'
                            : isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }` }
                        style={ { minHeight: '48px', minWidth: '48px' } }
                    >
                        <Plus className={ `h-5 w-5 transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}` } />
                    </button>

                    {/* Enhanced attachment menu */ }
                    { showAttachMenu && (
                        <div className={ `absolute bottom-full mb-3 left-0 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                            } border rounded-2xl shadow-2xl py-3 min-w-72 backdrop-blur-sm` }>
                            <div className="px-4 pb-2 mb-2 border-b border-gray-200">
                                <h3 className={ `text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}` }>
                                    Add to conversation
                                </h3>
                            </div>

                            { attachmentOptions.map((option, index) => {
                                const IconComponent = option.icon;
                                return (
                                    <button
                                        key={ index }
                                        type="button"
                                        onClick={ option.action }
                                        disabled={ option.disabled }
                                        className={ `w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${option.disabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : `hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} active:${isDark ? 'bg-gray-600' : 'bg-gray-100'}`
                                            }` }
                                    >
                                        <div className={ `p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}` }>
                                            <IconComponent className={ `h-4 w-4 ${option.color}` } />
                                        </div>
                                        <div className="flex-1">
                                            <div className={ `font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}` }>
                                                { option.label }
                                            </div>
                                            <div className={ `text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                                                { option.description }
                                            </div>
                                        </div>
                                    </button>
                                );
                            }) }
                        </div>
                    ) }
                </div>

                {/* Hidden file inputs */ }
                <input
                    ref={ fileInputRef }
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={ handleImageSelect }
                    className="hidden"
                />
                <input
                    ref={ cameraInputRef }
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={ handleCameraCapture }
                    className="hidden"
                />

                {/* Enhanced textarea */ }
                <textarea
                    ref={ textareaRef }
                    value={ input }
                    onChange={ handleInputChange }
                    onKeyDown={ handleKeyDown }
                    placeholder="Message Evolve AI..."
                    disabled={ isTyping }
                    className={ `flex-1 p-4 rounded-2xl resize-none transition-all duration-200 ${isDark
                        ? 'bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        } border ${isDark ? 'border-gray-600' : 'border-gray-300'} focus:outline-none shadow-sm` }
                    style={ { minHeight: '48px' } }
                    rows={ rows }
                />

                {/* Enhanced send button */ }
                <button
                    type="submit"
                    disabled={ (!input.trim() && selectedImages.length === 0) || isTyping }
                    className={ `rounded-2xl transition-all duration-200 flex items-center justify-center transform hover:scale-105 ${(!input.trim() && selectedImages.length === 0) || isTyping
                        ? isDark
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                        } p-3` }
                    style={ { minHeight: '48px', minWidth: '48px' } }
                >
                    <SendHorizontal className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;