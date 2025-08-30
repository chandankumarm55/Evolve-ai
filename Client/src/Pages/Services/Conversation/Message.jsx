import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Repeat } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import FormattedMessage from './FormattedMessage';

// Typing indicator component for streaming messages
const TypingIndicator = () => {
    return (
        <div className="flex items-center space-x-1 p-2">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={ { animationDelay: '0.1s' } }
                ></div>
                <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={ { animationDelay: '0.2s' } }
                ></div>
            </div>
            <span className="text-sm text-gray-500 ml-2">AI is typing...</span>
        </div>
    );
};

// Streaming text component with typing effect
const StreamingText = ({ content, isComplete }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (content.length === 0) {
            setDisplayedContent('');
            setCurrentIndex(0);
            return;
        }

        // If content changed and we're not at the end, update immediately
        if (content !== displayedContent) {
            setDisplayedContent(content);
            setCurrentIndex(content.length);
        }
    }, [content, displayedContent]);

    const shouldShowCursor = !isComplete;

    return (
        <div className="streaming-text">
            <FormattedMessage content={ displayedContent } />
            { shouldShowCursor && (
                <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse">|</span>
            ) }
        </div>
    );
};

// Image gallery component for user messages
const ImageGallery = ({ images }) => {
    if (!images || images.length === 0) return null;

    return (
        <div className="mb-2 flex flex-wrap gap-2">
            { images.map((image, index) => {
                const imageSrc = image.preview ||
                    (image.image_url && image.image_url.url) ||
                    (typeof image === 'string' ? image : '');

                return (
                    <div key={ index } className="relative">
                        <img
                            src={ imageSrc }
                            alt={ image.name || `Image ${index + 1}` }
                            className="h-32 w-32 object-cover rounded-lg border shadow-sm"
                            onError={ (e) => {
                                console.error('Failed to load image:', image);
                                e.target.style.display = 'none';
                            } }
                        />
                    </div>
                );
            }) }
        </div>
    );
};

// Feedback and action buttons for assistant messages
const MessageActions = ({ message, liked, onFeedback, onRepeat }) => {
    if (message.isStreaming) return null;

    return (
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 border-t pt-2">
            {/* Feedback buttons */ }
            <div className="flex items-center gap-2">
                <button
                    onClick={ () => onFeedback(true) }
                    className={ `p-1 rounded hover:bg-gray-100 transition-colors
                        ${liked === true ? 'text-green-500' : ''}` }
                    title="Like"
                >
                    <ThumbsUp size={ 16 } />
                </button>
                <button
                    onClick={ () => onFeedback(false) }
                    className={ `p-1 rounded hover:bg-gray-100 transition-colors
                        ${liked === false ? 'text-red-500' : ''}` }
                    title="Dislike"
                >
                    <ThumbsDown size={ 16 } />
                </button>
            </div>

            {/* Regenerate button */ }
            { message.originalPrompt && (
                <>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button
                        onClick={ onRepeat }
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Regenerate response"
                    >
                        <Repeat size={ 16 } />
                    </button>
                </>
            ) }
        </div>
    );
};

// Usage limit error component
const UsageLimitError = ({ content }) => {
    const displayContent = content.replace('[USAGE_LIMIT]', '');

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between text-red-500">
                { displayContent }
                <Link
                    to="/pricing"
                    className="ml-2 text-blue-500 hover:text-blue-700 underline"
                >
                    Upgrade your plan
                </Link>
            </AlertDescription>
        </Alert>
    );
};

// Main message component
const Message = ({ message, onRepeat, isStreaming = false }) => {
    const [liked, setLiked] = useState(null);

    const isAssistant = message.role === 'assistant';
    const messageContainerStyle = isAssistant
        ? 'items-start text-left'
        : 'items-end text-right';

    // Check for usage limit error
    const isUsageLimitError = message.content && message.content.includes('[USAGE_LIMIT]');

    // Event handlers
    const handleFeedback = (isPositive) => {
        setLiked(isPositive);
        // TODO: Add API call to track feedback
    };

    const handleRepeat = () => {
        if (onRepeat && message.originalPrompt) {
            onRepeat(message.originalPrompt, message.originalImages);
        }
    };

    // Show typing indicator for empty streaming assistant messages
    if (isAssistant && message.isStreaming && !message.content) {
        return (
            <div className={ `flex flex-col max-w-[95%] ${messageContainerStyle}` }>
                <div className="text-xs opacity-70 mb-1">
                    { message.timestamp }
                </div>
                <div className="rounded-lg p-2 shadow max-w-max bg-white dark:bg-gray-800">
                    <TypingIndicator />
                </div>
            </div>
        );
    }

    return (
        <div className={ `flex flex-col max-w-[95%] ${messageContainerStyle}` }>
            {/* Timestamp */ }
            <div className="text-xs opacity-70 mb-1">
                { message.timestamp }
            </div>

            {/* User images */ }
            { !isAssistant && <ImageGallery images={ message.images } /> }

            {/* Message content */ }
            { isUsageLimitError ? (
                <UsageLimitError content={ message.content } />
            ) : (
                <div
                    className={ `rounded-lg p-2 shadow max-w-max ${isAssistant
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-blue-500 text-white'
                        }` }
                    style={ { textAlign: 'justify' } }
                >
                    {/* Message text content */ }
                    { isAssistant && message.isStreaming ? (
                        <StreamingText
                            content={ message.content }
                            isComplete={ !message.isStreaming }
                        />
                    ) : (
                        <FormattedMessage content={ message.content } />
                    ) }

                    {/* Assistant message actions */ }
                    { isAssistant && (
                        <MessageActions
                            message={ message }
                            liked={ liked }
                            onFeedback={ handleFeedback }
                            onRepeat={ handleRepeat }
                        />
                    ) }
                </div>
            ) }
        </div>
    );
};

export default Message;