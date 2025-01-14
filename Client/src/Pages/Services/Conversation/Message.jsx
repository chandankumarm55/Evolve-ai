import React from 'react';
import FormattedMessage from './FormattedMessage';

const Message = ({ message }) => {
    const isUser = message.role === 'assistant';
    const messageContainerStyle = isUser
        ? 'items-start text-left '
        : ' items-end text-right';

    // const messageStyle = isUser
    //     ? 'bg-blue-600 text-white'
    //     : 'bg-gray-800 text-gray-100';

    return (
        <div className={ `flex flex-col  max-w-[95%] ${messageContainerStyle} ` }>

            <div className="text-xs opacity-70 mb-1">
                { message.timestamp }
            </div>

            <div
                className={ `rounded-lg p-2 shadow max-w-max` }
                style={ { textAlign: 'justify' } }
            >
                <FormattedMessage content={ message.content } />
            </div>
        </div>
    );
};

export default Message;

