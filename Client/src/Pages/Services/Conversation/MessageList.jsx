import React from 'react';
import Message from './Message';

const MessageList = ({ messages, isTyping, messagesEndRef }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            { messages.map((message, index) => (
                <Message key={ index } message={ message } />
            )) }
            { isTyping && (
                <div className="flex items-center text-gray-500">
                    <span className="animate-spin mr-2">⏳</span> AI is typing...
                </div>
            ) }
            <div ref={ messagesEndRef } />
        </div>
    );
};

export default MessageList;
