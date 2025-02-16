import React from 'react';
import FormattedMessage from './FormattedMessage';
import { ThumbsUp, ThumbsDown, Repeat } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Link } from 'react-router-dom';

const Message = ({ message, onRepeat }) => {
    const isAssistant = message.role === 'assistant';
    const messageContainerStyle = isAssistant
        ? 'items-start text-left'
        : 'items-end text-right';

    const [liked, setLiked] = React.useState(null);

    const handleFeedback = (isPositive) => {
        setLiked(isPositive);
        // Here you can add API call to track feedback
    };

    const handleRepeat = () => {
        if (onRepeat && message.originalPrompt) {
            onRepeat(message.originalPrompt);
        }
    };

    const isUsageLimitError = message.content.includes('[USAGE_LIMIT]');
    const displayContent = isUsageLimitError
        ? message.content.replace('[USAGE_LIMIT]', '')
        : message.content;

    return (
        <div className={ `flex flex-col max-w-[95%] ${messageContainerStyle}` }>
            <div className="text-xs opacity-70 mb-1">
                { message.timestamp }
            </div>

            { isUsageLimitError ? (
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
            ) : (
                <div className="rounded-lg p-2 shadow max-w-max" style={ { textAlign: 'justify' } }>
                    <FormattedMessage content={ displayContent } />
                    { isAssistant && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 border-t pt-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={ () => handleFeedback(true) }
                                    className={ `p-1 rounded hover:bg-gray-100 transition-colors
                                        ${liked === true ? 'text-green-500' : ''}` }
                                    title="Like"
                                >
                                    <ThumbsUp size={ 16 } />
                                </button>
                                <button
                                    onClick={ () => handleFeedback(false) }
                                    className={ `p-1 rounded hover:bg-gray-100 transition-colors
                                        ${liked === false ? 'text-red-500' : ''}` }
                                    title="Dislike"
                                >
                                    <ThumbsDown size={ 16 } />
                                </button>
                            </div>
                            { message.originalPrompt && (
                                <>
                                    <div className="h-6 w-px bg-gray-200"></div>
                                    <button
                                        onClick={ handleRepeat }
                                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                                        title="Regenerate response"
                                    >
                                        <Repeat size={ 16 } />
                                    </button>
                                </>
                            ) }
                        </div>
                    ) }
                </div>
            ) }
        </div>
    );
};

export default Message;