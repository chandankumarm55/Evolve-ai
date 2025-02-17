import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

const InteractiveVoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const lastSpeechTime = useRef(Date.now());
    const silenceTimeout = useRef(null);
    const recognition = useRef(null);
    const currentAudio = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setTranscript(transcript);
                lastSpeechTime.current = Date.now();

                if (event.results[current].isFinal) {
                    handleUserInput(transcript);
                    setTranscript('');
                }
            };

            recognition.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };

            recognition.current.onend = () => {
                if (isListening) {
                    recognition.current.start();
                }
            };
        }

        return () => {
            if (recognition.current) {
                recognition.current.stop();
            }
        };
    }, [isListening]);

    // Check for silence and prompt user
    useEffect(() => {
        if (isListening) {
            const checkSilence = () => {
                const timeSinceLastSpeech = Date.now() - lastSpeechTime.current;
                if (timeSinceLastSpeech > 10000 && !isSpeaking && !isLoading) {
                    handleSilence();
                }
            };

            silenceTimeout.current = setInterval(checkSilence, 10000);
            return () => clearInterval(silenceTimeout.current);
        }
    }, [isListening, isSpeaking, isLoading]);

    // Welcome message when starting
    useEffect(() => {
        if (isListening && messages.length === 0) {
            const welcomeMessage = "Hello! I'm your AI assistant. How can I help you today?";
            addMessage('assistant', welcomeMessage);
            speak(welcomeMessage);
        }
    }, [isListening]);

    // Enhanced speak function with better audio handling
    const speak = useCallback(async (text) => {
        if (!text) return;

        try {
            setIsSpeaking(true);

            // Stop any currently playing audio
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }

            // Create new audio with Pollinations TTS
            const audio = new Audio(`https://tts.pollinations.ai/tts?text=${encodeURIComponent(text)}`);
            currentAudio.current = audio;

            // Set up audio event handlers
            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                setIsSpeaking(false);
                currentAudio.current = null;
            };

            audio.onended = () => {
                setIsSpeaking(false);
                currentAudio.current = null;
            };

            // Ensure audio is fully loaded before playing
            await new Promise((resolve, reject) => {
                audio.oncanplaythrough = resolve;
                audio.onerror = reject;

                // Timeout if loading takes too long
                const timeout = setTimeout(() => {
                    reject(new Error('Audio loading timeout'));
                }, 5000);

                audio.oncanplaythrough = () => {
                    clearTimeout(timeout);
                    resolve();
                };
            });

            // Play the audio
            await audio.play();

        } catch (error) {
            console.error('TTS Error:', error);
            setIsSpeaking(false);
            currentAudio.current = null;
        }
    }, []);

    const handleSilence = async () => {
        const silencePrompts = [
            "Are you still there?",
            "I'm here if you need anything.",
            "Feel free to ask me any questions.",
            "Should we continue our conversation?",
        ];
        const prompt = silencePrompts[Math.floor(Math.random() * silencePrompts.length)];

        addMessage('assistant', prompt);
        await speak(prompt);
    };

    const addMessage = (role, content) => {
        setMessages(prev => [...prev, { role, content, timestamp: new Date().toISOString() }]);
    };

    const handleUserInput = async (text) => {
        if (!text.trim()) return;

        addMessage('user', text);
        setIsLoading(true);

        try {
            // Immediate acknowledgment
            await speak("Let me think about that.");

            // Call the AI API for response
            const response = await fetch(
                `https://text.pollinations.ai/${encodeURIComponent(text)}`
            );

            if (!response.ok) {
                throw new Error('API response was not ok');
            }

            const aiResponse = await response.text();
            addMessage('assistant', aiResponse);
            await speak(aiResponse);
        } catch (error) {
            console.error('AI API Error:', error);
            const errorMessage = "I'm having trouble right now, but I'm still listening.";
            addMessage('assistant', errorMessage);
            await speak(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleListening = async () => {
        if (isListening) {
            recognition.current.stop();
            setIsListening(false);
            clearInterval(silenceTimeout.current);

            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
                setIsSpeaking(false);
            }

            await speak("Goodbye for now!");
        } else {
            recognition.current.start();
            setIsListening(true);
            lastSpeechTime.current = Date.now();

            await speak("I'm listening. What can I help you with?");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Voice Assistant</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={ toggleListening }
                    className={ `px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2
            ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
            ${(isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    disabled={ isSpeaking }
                >
                    { isListening ?
                        <><MicOff className="w-5 h-5" /> Stop Listening</> :
                        <><Mic className="w-5 h-5" /> Start Listening</>
                    }
                </button>
            </div>

            <div className="w-full max-w-md space-y-4 bg-white rounded-lg shadow-md p-6 max-h-[600px] overflow-y-auto">
                { messages.map((message, index) => (
                    <div
                        key={ index }
                        className={ `p-4 rounded-lg ${message.role === 'user'
                            ? 'bg-blue-50 border border-blue-200 ml-8'
                            : 'bg-green-50 border border-green-200 mr-8'
                            }` }
                    >
                        <p className={ `text-sm font-medium ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'
                            }` }>
                            { message.role === 'user' ? 'You' : 'Assistant' }:
                        </p>
                        <p className={ `mt-1 ${message.role === 'user' ? 'text-blue-800' : 'text-green-800'
                            }` }>
                            { message.content }
                        </p>
                    </div>
                )) }

                { isLoading && (
                    <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) }

                { transcript && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">Listening:</p>
                        <p className="text-gray-800 mt-1">{ transcript }</p>
                    </div>
                ) }
            </div>

            { isSpeaking && (
                <div className="mt-4 flex items-center gap-2 text-blue-500">
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>Speaking...</span>
                </div>
            ) }
        </div>
    );
};

export default InteractiveVoiceAssistant;