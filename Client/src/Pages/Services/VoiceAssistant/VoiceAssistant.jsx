import React, { useState, useEffect, useRef } from 'react';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());
    const isProcessingRef = useRef(false);
    const finalTranscriptRef = useRef('');

    const voices = [
        { id: 'alloy', name: 'Alloy' },
        { id: 'echo', name: 'Echo' },
        { id: 'fable', name: 'Fable' },
        { id: 'onyx', name: 'Onyx' },
        { id: 'nova', name: 'Nova' },
        { id: 'shimmer', name: 'Shimmer' }
    ];

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // Changed to true for better continuous listening
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                setTranscript(finalTranscript + interimTranscript);

                // Process final transcript
                if (finalTranscript && !isProcessingRef.current && !isAiSpeaking) {
                    const trimmedTranscript = finalTranscript.trim();
                    if (trimmedTranscript.length > 2) {
                        finalTranscriptRef.current = trimmedTranscript;
                        processUserInput(trimmedTranscript);
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
                    setError(`Microphone error: ${event.error}`);
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                console.log("Speech recognition ended");

                // Restart recognition if we should be listening and AI is not speaking
                if (isListening && !isAiSpeaking && !isProcessingRef.current) {
                    setTimeout(() => {
                        startRecognition();
                    }, 100);
                }
            };

            recognitionRef.current.onstart = () => {
                console.log("Speech recognition started");
                setError(null);
            };
        } else {
            setError('Speech recognition is not supported in this browser.');
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error("Error stopping recognition on cleanup:", e);
                }
            }
        };
    }, []);

    // Start speech recognition
    const startRecognition = () => {
        if (recognitionRef.current && !isAiSpeaking && !isProcessingRef.current) {
            try {
                recognitionRef.current.start();
                console.log("Started speech recognition");
            } catch (e) {
                if (e.name === 'InvalidStateError') {
                    // Recognition is already started, ignore
                    console.log("Recognition already started");
                } else {
                    console.error("Error starting speech recognition:", e);
                    setError('Failed to start microphone. Please try again.');
                    setIsListening(false);
                }
            }
        }
    };

    // Stop speech recognition
    const stopRecognition = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                console.log("Stopped speech recognition");
            } catch (e) {
                console.error("Error stopping speech recognition:", e);
            }
        }
    };

    // Handle listening state changes
    useEffect(() => {
        if (isListening && !isAiSpeaking && !isProcessingRef.current) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [isListening, isAiSpeaking]);

    // Process user input
    const processUserInput = async (input) => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        stopRecognition(); // Stop listening while processing

        const updatedHistory = [...conversationHistory, { speaker: 'User', text: input }];
        setConversationHistory(updatedHistory);
        setTranscript('');

        try {
            setIsAiSpeaking(true);

            const aiResponseText = await simulateAiResponse(input);
            setAiResponse(aiResponseText);
            setConversationHistory([...updatedHistory, { speaker: 'AI', text: aiResponseText }]);

            await generateAndPlayAudio(aiResponseText);
        } catch (error) {
            console.error('Error processing user input:', error);
            setError('Failed to process your request. Please try again.');
        } finally {
            setIsAiSpeaking(false);
            isProcessingRef.current = false;

            // Clear any audio errors when processing completes
            setTimeout(() => {
                if (audioRef.current && audioRef.current.error) {
                    setError(null);
                }
            }, 500);

            // Restart listening after AI finishes speaking
            if (isListening) {
                setTimeout(() => {
                    startRecognition();
                }, 500);
            }
        }
    };

    // Simulate AI response
    const simulateAiResponse = async (userInput) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = [
                    `I heard you say: "${userInput}". How can I help you with that?`,
                    `That's interesting! You mentioned "${userInput}". Tell me more about it.`,
                    `Thank you for sharing that. Regarding "${userInput}", what would you like to know?`,
                    `I understand you said "${userInput}". Is there anything specific you'd like me to explain?`
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                resolve(randomResponse);
            }, 1000);
        });
    };

    // Generate and play audio
    const generateAndPlayAudio = async (text) => {
        try {
            setError(null);
            const encodedText = encodeURIComponent(text);
            const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${selectedVoice}`;
            console.log("Generated audio URL:", audioUrl);

            return new Promise((resolve, reject) => {
                // Clear any existing event listeners and reset audio
                const audio = audioRef.current;
                audio.onloadedmetadata = null;
                audio.onended = null;
                audio.onerror = null;
                audio.oncanplaythrough = null;

                let isResolved = false;
                let loadingTimeout;

                const cleanup = () => {
                    if (loadingTimeout) {
                        clearTimeout(loadingTimeout);
                    }
                    // Don't clear src here as it might cause the error
                };

                const resolveOnce = (result) => {
                    if (!isResolved) {
                        isResolved = true;
                        cleanup();
                        resolve(result);
                    }
                };

                const rejectOnce = (error) => {
                    if (!isResolved) {
                        isResolved = true;
                        cleanup();
                        // Only clear src if we're rejecting due to a real error, not interruption
                        if (audio.src && !audio.src.includes('blob:')) {
                            audio.src = '';
                        }
                        reject(error);
                    }
                };

                audio.onloadedmetadata = () => {
                    console.log('Audio duration:', audio.duration);
                };

                audio.onended = () => {
                    console.log('Audio playback ended naturally');
                    audio.src = '';
                    resolveOnce();
                };

                audio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    // Only show error if it's not due to intentional stopping
                    if (audio.error && audio.error.code !== 1) { // Ignore MEDIA_ERR_ABORTED (code 1)
                        setError(`Failed to play audio response. Error code: ${audio.error.code}`);
                    }
                    rejectOnce(e);
                };

                // Set up timeout for loading
                loadingTimeout = setTimeout(() => {
                    if (audio && audio.readyState === 0 && !isResolved) {
                        setError('Audio is taking too long to load. Check your connection or try again.');
                        rejectOnce(new Error('Audio loading timeout'));
                    }
                }, 10000);

                // Set source and attempt to play
                audio.src = audioUrl;

                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            if (loadingTimeout) {
                                clearTimeout(loadingTimeout);
                            }
                            console.log("Audio playback started successfully");
                        })
                        .catch(error => {
                            console.error('Audio play error:', error);
                            if (!isResolved) {
                                const errorMessage = error.name === 'NotAllowedError'
                                    ? 'Browser blocked audio playback. Try clicking the interface first.'
                                    : error.name === 'AbortError'
                                        ? '' // Don't show error for intentional abortion
                                        : 'Failed to play audio. Check your connection and try again.';

                                if (errorMessage) {
                                    setError(errorMessage);
                                }
                                rejectOnce(error);
                            }
                        });
                }
            });
        } catch (error) {
            console.error('Error generating audio:', error);
            setError('Failed to generate audio response: ' + error.message);
            throw error;
        }
    };

    // Toggle microphone
    const toggleListening = () => {
        if (isAiSpeaking || isProcessingRef.current) return;

        const newListeningState = !isListening;
        setIsListening(newListeningState);

        if (!newListeningState) {
            setTranscript('');
            setError(null);
            stopRecognition();
        } else {
            setTranscript('');
            setError(null);
            setTimeout(() => startRecognition(), 100);
        }
    };

    // Stop AI speaking
    const stopAiSpeaking = () => {
        if (audioRef.current) {
            try {
                const audio = audioRef.current;

                // Pause the audio first
                if (!audio.paused) {
                    audio.pause();
                }

                // Reset current time
                if (audio.currentTime > 0) {
                    audio.currentTime = 0;
                }

                // Clear event listeners to prevent error callbacks
                audio.onended = null;
                audio.onerror = null;
                audio.onloadedmetadata = null;

                // Clear the source after a small delay to prevent interruption errors
                setTimeout(() => {
                    if (audio.src) {
                        audio.src = '';
                        audio.load(); // Reset the audio element
                    }
                }, 100);

                setIsAiSpeaking(false);
                isProcessingRef.current = false;
                console.log("Audio stopped successfully");

                // Clear any existing error when successfully stopping
                setError(null);

                // Restart listening if it was enabled
                if (isListening) {
                    setTimeout(() => startRecognition(), 300);
                }
            } catch (e) {
                console.error("Error stopping audio:", e);
                // Don't show error to user for stopping audio
                setIsAiSpeaking(false);
                isProcessingRef.current = false;
            }
        }
    };

    // Clear conversation
    const clearConversation = () => {
        setConversationHistory([]);
        setTranscript('');
        setAiResponse('');
        setError(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">Voice Assistant - Continuous Conversation</h1>

            { error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    { error }
                </div>
            ) }

            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Voice:</label>
                <select
                    value={ selectedVoice }
                    onChange={ (e) => setSelectedVoice(e.target.value) }
                    className="w-full p-2 border rounded"
                    disabled={ isAiSpeaking }
                >
                    { voices.map(voice => (
                        <option key={ voice.id } value={ voice.id }>{ voice.name }</option>
                    )) }
                </select>
            </div>

            <div className="flex justify-center mb-6 space-x-4">
                <button
                    onClick={ toggleListening }
                    disabled={ isAiSpeaking || isProcessingRef.current }
                    className={ `p-4 rounded-full ${isListening
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                        } ${(isAiSpeaking || isProcessingRef.current) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}` }
                >
                    { isListening ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    ) }
                </button>

                { isAiSpeaking && (
                    <button
                        onClick={ stopAiSpeaking }
                        className="p-4 rounded-full bg-yellow-500 text-white hover:bg-opacity-80"
                        title="Stop AI Speaking"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M6 4h12v16L12 16l-6 4V4z" />
                        </svg>
                    </button>
                ) }

                <button
                    onClick={ clearConversation }
                    className="p-4 rounded-full bg-gray-500 text-white hover:bg-opacity-80"
                    title="Clear Conversation"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="mb-6">
                <div className="p-4 h-24 bg-gray-100 rounded overflow-auto">
                    { isListening ? (
                        <p className={ `${transcript ? '' : 'animate-pulse'}` }>
                            { transcript || "Listening... Speak now" }
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            { transcript || "Click the microphone to start speaking..." }
                        </p>
                    ) }
                </div>
            </div>

            { isAiSpeaking && (
                <div className="mb-6">
                    <div className="p-4 bg-blue-100 rounded flex items-center">
                        <div className="mr-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                        <p>AI is speaking... (Microphone is paused)</p>
                    </div>
                </div>
            ) }

            <div className="border rounded p-4 max-h-64 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold">Conversation History</h2>
                    <span className="text-sm text-gray-500">
                        { conversationHistory.length > 0 && `${conversationHistory.length} messages` }
                    </span>
                </div>
                { conversationHistory.length === 0 ? (
                    <p className="text-gray-500">No conversation yet. Start speaking to interact with the assistant.</p>
                ) : (
                    conversationHistory.map((entry, index) => (
                        <div key={ index } className={ `mb-2 p-2 rounded ${entry.speaker === 'User' ? 'bg-gray-100' : 'bg-blue-100'
                            }` }>
                            <strong>{ entry.speaker }:</strong> { entry.text }
                        </div>
                    ))
                ) }
            </div>

            <div className="mt-4 text-sm text-gray-500 space-y-1">
                <p>
                    Status: { isListening ? (isAiSpeaking ? 'Listening paused (AI speaking)' : 'Listening...') : 'Not listening' }
                </p>
                <p>Using pollinations.ai for text-to-speech with the { selectedVoice } voice.</p>
                <p>💡 Tip: Use headphones to prevent feedback loops. The microphone automatically pauses when AI speaks.</p>
                <p>🎯 For best results: Speak clearly and wait for the AI to finish before speaking again.</p>
            </div>
        </div>
    );
};

export default VoiceAssistant;