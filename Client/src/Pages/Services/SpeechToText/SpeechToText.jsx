import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Copy, StopCircle, Volume2, Languages } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

// Language selector component
const LanguageSelector = ({ selectedLanguage, onLanguageChange, languages }) => {
    return (
        <div className="mb-4">
            <Select value={ selectedLanguage } onValueChange={ onLanguageChange }>
                <SelectTrigger className="w-full md:w-[200px]">
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                    { languages.map((lang) => (
                        <SelectItem key={ lang.code } value={ lang.code }>
                            { lang.name }
                        </SelectItem>
                    )) }
                </SelectContent>
            </Select>
        </div>
    );
};

// Typing effect component
const TypingEffect = ({ text, isListening }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            className={ `min-h-[200px] p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }` }
        >
            <div className="relative">
                { text ? (
                    <p className="whitespace-pre-wrap break-words">{ text }</p>
                ) : (
                    <p className="text-muted-foreground">
                        { isListening ? 'Listening...' : 'Your spoken text will appear here...' }
                    </p>
                ) }
                { isListening && (
                    <motion.div
                        className="inline-block w-2 h-4 bg-current ml-1"
                        animate={ { opacity: [1, 0] } }
                        transition={ { duration: 0.8, repeat: Infinity } }
                    />
                ) }
            </div>
        </motion.div>
    );
};

// Main component
const SpeechToText = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    const [isCopied, setIsCopied] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const languages = [
        { code: 'en-US', name: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)' },
        { code: 'es-ES', name: 'Spanish' },
        { code: 'fr-FR', name: 'French' },
        { code: 'de-DE', name: 'German' },
        { code: 'it-IT', name: 'Italian' },
        { code: 'ja-JP', name: 'Japanese' },
        { code: 'ko-KR', name: 'Korean' },
        { code: 'zh-CN', name: 'Chinese (Simplified)' },
        { code: 'hi-IN', name: 'Hindi' },
    ];

    useEffect(() => {
        // Initialize speech recognition
        if (window.webkitSpeechRecognition) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript + interimTranscript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            setRecognition(recognition);
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            recognition.lang = selectedLanguage;
            recognition.start();
            setTranscript('');
        }
    }, [recognition, selectedLanguage]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    const handleCopy = () => {
        if (transcript) {
            navigator.clipboard.writeText(transcript);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    if (!window.webkitSpeechRecognition) {
        return (
            <Card className="p-4 text-center">
                <h2 className="text-lg font-semibold mb-2">Browser Not Supported</h2>
                <p>Sorry, your browser doesn't support speech recognition.</p>
            </Card>
        );
    }

    return (
        <ServiceContainer title="Speech to Text Converter">
            <div className={ `p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}` }>
                <div className="max-w-4xl mx-auto space-y-4">
                    <Card className="p-4">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">Voice Recognition</h2>
                            <p className="text-sm text-muted-foreground">
                                Speak clearly into your microphone to convert speech to text.
                                Select your preferred language below.
                            </p>
                        </div>

                        <LanguageSelector
                            selectedLanguage={ selectedLanguage }
                            onLanguageChange={ setSelectedLanguage }
                            languages={ languages }
                        />

                        <TypingEffect
                            text={ transcript }
                            isListening={ isListening }
                        />

                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={ isListening ? stopListening : startListening }
                                variant={ isListening ? "destructive" : "default" }
                            >
                                { isListening ? (
                                    <>
                                        <StopCircle className="w-4 h-4 mr-2" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-4 h-4 mr-2" />
                                        Start
                                    </>
                                ) }
                            </Button>
                            <Button onClick={ handleCopy } variant="outline">
                                <Copy className="w-4 h-4 mr-2" />
                                { isCopied ? 'Copied!' : 'Copy' }
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </ServiceContainer>
    );
};

export default SpeechToText;