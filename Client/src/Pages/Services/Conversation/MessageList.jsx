import React from 'react';
import Message from './Message';
import { Loader2 } from 'lucide-react';

const MessageList = ({ messages, isTyping, messagesEndRef, onRepeat }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            { messages.map((message, index) => (
                <Message
                    key={ index }
                    message={ message }
                    onRepeat={ onRepeat }
                />
            )) }
            { isTyping && (
                <div className="flex items-center text-gray-500">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>AI is typing...</span>
                </div>
            ) }
            <div ref={ messagesEndRef } />
        </div>
    );
};

export default MessageList;
