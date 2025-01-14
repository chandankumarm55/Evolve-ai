import React from 'react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Send } from "lucide-react";

const MessageInput = ({ input, setInput, onSubmit, isTyping }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input);
            setInput('');
        }
    };

    return (
        <div className="  w-full bg-background">
            <div className="w-full shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="bg-background/95 w-full">
                    <form onSubmit={ handleSubmit } className="flex items-center space-x-2 p-4">
                        <Input
                            type="text"
                            value={ input }
                            onChange={ (e) => setInput(e.target.value) }
                            placeholder="Type your message..."
                            className="flex-1"
                            disabled={ isTyping }
                        />
                        <Button
                            type="submit"
                            disabled={ isTyping }
                            size="icon"
                            className="h-10 w-10"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;