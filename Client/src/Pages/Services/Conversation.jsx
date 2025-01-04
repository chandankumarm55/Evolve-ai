import { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer'
import { MessageBubble } from '../../components/ui/MessageBubble';
import { InputBox } from '../../components/ui/InputBox';

export const Conversation = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hello! How can I assist you today?",
            isBot: true,
            timestamp: new Date().toLocaleTimeString(),
        },
    ]);

    const handleSendMessage = (message) => {
        const newMessage = {
            text: message,
            isBot: false,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, newMessage]);

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: "I'm processing your request. This is a demo response.",
                isBot: true,
                timestamp: new Date().toLocaleTimeString(),
            }]);
        }, 1000);
    };

    return (
        <ServiceContainer title="AI Conversation">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                { messages.map((message, index) => (
                    <MessageBubble
                        key={ index }
                        message={ message.text }
                        isBot={ message.isBot }
                        timestamp={ message.timestamp }
                    />
                )) }
            </div>
            <InputBox onSubmit={ handleSendMessage } />
        </ServiceContainer>
    );
};