import React from 'react';
import CodeBlock from './CodeBlock';
import { formatMessageContent } from './formatMessageContent';

const FormattedMessage = ({ content }) => {
    const formattedParts = formatMessageContent(content);

    return formattedParts.map((part, index) => {
        if (part.type === 'codeBlock') {
            return <CodeBlock key={ index } language={ part.language } content={ part.content } />;
        }
        if (part.type === 'inlineCode') {
            return <code key={ index } className="bg-gray-800 text-gray-100 px-1 rounded">{ part.content }</code>;
        }
        return <span key={ index }>{ part.content }</span>;
    });
};

export default FormattedMessage;
