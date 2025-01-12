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
import { Mic, Copy, StopCircle, Volume2, Languages, Download } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

// Enhanced language selector with more Indian languages
const LanguageSelector = ({ selectedLanguage, onLanguageChange, languages }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="mb-4">
            <Select value={ selectedLanguage } onValueChange={ onLanguageChange }>
                <SelectTrigger
                    className={ `w-full md:w-[250px] ${isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200'
                        }` }
                >
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className={ `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
                    }` }>
                    { languages.map((lang) => (
                        <SelectItem
                            key={ lang.code }
                            value={ lang.code }
                            className={ `${isDark
                                ? 'text-gray-200 hover:bg-gray-700'
                                : 'hover:bg-gray-50'
                                }` }
                        >
                            { lang.name }
                        </SelectItem>
                    )) }
                </SelectContent>
            </Select>
        </div>
    );
};

const TranscriptCard = ({ text, isListening }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            className={ `min-h-[200px] p-4 rounded-lg border ${isDark
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-200'
                }` }
        >
            <div className="relative">
                { text ? (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                        { text }
                    </p>
                ) : (
                    <p className={ `text-muted-foreground ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }` }>
                        { isListening ? 'Listening...' : 'Your spoken text will appear here...' }
                    </p>
                ) }
                { isListening && (
                    <motion.div
                        className={ `inline-block w-2 h-4 ml-1 ${isDark ? 'bg-purple-400' : 'bg-purple-600'
                            }` }
                        animate={ { opacity: [1, 0] } }
                        transition={ { duration: 0.8, repeat: Infinity } }
                    />
                ) }
            </div>
        </motion.div>
    );
};

const SpeechToText = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    const [isCopied, setIsCopied] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Enhanced language list with more Indian languages
    const languages = [
        { code: 'en-US', name: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)' },
        { code: 'en-IN', name: 'English (India)' },
        { code: 'hi-IN', name: 'Hindi' },
        { code: 'kn-IN', name: 'Kannada' },
        { code: 'ta-IN', name: 'Tamil' },
        { code: 'te-IN', name: 'Telugu' },
        { code: 'mr-IN', name: 'Marathi' },
        { code: 'gu-IN', name: 'Gujarati' },
        { code: 'bn-IN', name: 'Bengali' },
        { code: 'ml-IN', name: 'Malayalam' },
        { code: 'es-ES', name: 'Spanish' },
        { code: 'fr-FR', name: 'French' },
        { code: 'de-DE', name: 'German' },
        { code: 'it-IT', name: 'Italian' },
        { code: 'ja-JP', name: 'Japanese' },
        { code: 'ko-KR', name: 'Korean' },
        { code: 'zh-CN', name: 'Chinese (Simplified)' },
    ];

    useEffect(() => {
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

    const handleDownload = () => {
        if (transcript) {
            const blob = new Blob([transcript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `transcript-${new Date().toISOString()}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    if (!window.webkitSpeechRecognition) {
        return (
            <Card className={ `p-4 text-center ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white'
                }` }>
                <h2 className="text-lg font-semibold mb-2">Browser Not Supported</h2>
                <p>Sorry, your browser doesn't support speech recognition.</p>
            </Card>
        );
    }

    return (
        <ServiceContainer >
            <div className="flex-1 overflow-y-auto space-y-2">
                <Card className={ `p-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }` }>
                    <div className="mb-6">
                        <h2 className={ `text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'
                            }` }>
                            Voice Recognition
                        </h2>
                        <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }` }>
                            Speak clearly into your microphone to convert speech to text.
                            Select your preferred language below.
                        </p>
                    </div>

                    <LanguageSelector
                        selectedLanguage={ selectedLanguage }
                        onLanguageChange={ setSelectedLanguage }
                        languages={ languages }
                    />

                    <TranscriptCard
                        text={ transcript }
                        isListening={ isListening }
                    />

                    <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                            onClick={ isListening ? stopListening : startListening }
                            variant={ isListening ? "destructive" : "default" }
                            className={ `${!isListening && isDark ? 'bg-purple-600 hover:bg-purple-700' : ''
                                }` }
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
                        <Button
                            onClick={ handleCopy }
                            variant="outline"
                            className={ isDark ? 'border-gray-700 hover:bg-gray-700' : '' }
                            disabled={ !transcript }
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            { isCopied ? 'Copied!' : 'Copy' }
                        </Button>
                        <Button
                            onClick={ handleDownload }
                            variant="outline"
                            className={ isDark ? 'border-gray-700 hover:bg-gray-700' : '' }
                            disabled={ !transcript }
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </Card>
            </div>
        </ServiceContainer>
    );
};

export default SpeechToText;