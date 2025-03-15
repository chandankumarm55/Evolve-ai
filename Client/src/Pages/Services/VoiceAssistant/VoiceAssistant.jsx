import React, { useState, useEffect, useRef } from 'react';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);


    const recognitionRef = useRef(null);
    const audioRef = useRef(new Audio());

    const voices = [
        { id: 'alloy', name: 'Alloy' },
        { id: 'echo', name: 'Echo' },
        { id: 'fable', name: 'Fable' },
        { id: 'onyx', name: 'Onyx' },
        { id: 'nova', name: 'Nova' },
        { id: 'shimmer', name: 'Shimmer' }
    ];

    // Initialize speech recognition
    // Update the speech recognition code to properly handle when a user stops speaking
    // Modified speech recognition setup to ensure API calls happen when speaking stops
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Change to false to get complete phrases
            recognitionRef.current.interimResults = true;

            let finalTranscriptText = '';

            recognitionRef.current.onresult = (event) => {
                const currentTranscript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                setTranscript(currentTranscript);

                // Check if this is a final result
                if (event.results[0].isFinal) {
                    finalTranscriptText = currentTranscript;
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setError(`Microphone error: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                console.log("Speech recognition ended");

                // Process the final transcript if we have one
                if (finalTranscriptText.trim()) {
                    console.log("Processing transcript:", finalTranscriptText);
                    processUserInput(finalTranscriptText);
                    finalTranscriptText = ''; // Reset after processing
                }

                // Restart recognition if we're still supposed to be listening
                if (isListening && !isAiSpeaking) {
                    setTimeout(() => {
                        try {
                            recognitionRef.current.start();
                            console.log("Restarted speech recognition");
                        } catch (e) {
                            console.error("Error restarting speech recognition:", e);
                        }
                    }, 500);
                }
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
    // Handle toggling the listening state
    useEffect(() => {
        if (isListening) {
            recognitionRef.current.start();
        } else if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    // Handle when AI is speaking - pause microphone
    useEffect(() => {
        if (isAiSpeaking) {
            if (isListening) {
                recognitionRef.current.stop();
            }
        } else {
            // Restart listening if it was on before
            if (isListening) {
                setTimeout(() => {
                    recognitionRef.current.start();
                }, 300);
            }
        }
    }, [isAiSpeaking]);

    // Function to handle processing user input
    const processUserInput = async (input) => {
        // Add user input to conversation history
        const updatedHistory = [...conversationHistory, { speaker: 'User', text: input }];
        setConversationHistory(updatedHistory);

        // Reset transcript for next input
        setTranscript('');

        try {
            // In a real application, you would send the user input to an AI API
            // For this example, we'll simulate an AI response
            setIsAiSpeaking(true);

            // Simulate API call to get AI response text (replace with your actual AI API)
            const aiResponseText = await simulateAiResponse(input);
            setAiResponse(aiResponseText);

            // Add AI response to conversation history
            setConversationHistory([...updatedHistory, { speaker: 'AI', text: aiResponseText }]);

            // Generate and play audio response
            await generateAndPlayAudio(aiResponseText);

            setIsAiSpeaking(false);
        } catch (error) {
            console.error('Error processing user input:', error);
            setError('Failed to process your request. Please try again.');
            setIsAiSpeaking(false);
        }
    };

    // Simulate AI response - replace with your actual AI endpoint
    const simulateAiResponse = async (userInput) => {
        // This is a placeholder - in a real app, you would call your AI API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simple echo response for demonstration
                resolve(`I heard you say: "${userInput}". How can I help with that?`);
            }, 1000);
        });
    };

    // Function to generate and play audio using pollinations.ai
    // Function to generate and play audio using pollinations.ai
    const generateAndPlayAudio = async (text) => {
        try {
            // Clear any previous errors
            setError(null);

            // Encode the text for URL - ensure proper URL encoding for special characters
            const encodedText = encodeURIComponent(text);

            // Create the URL for the pollinations.ai endpoint with appropriate parameters
            const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${selectedVoice}`;

            console.log("Generated audio URL:", audioUrl);

            // Set the audio source
            audioRef.current.src = audioUrl;

            // Setup event listeners for the audio
            audioRef.current.onloadedmetadata = () => {
                console.log('Audio duration:', audioRef.current.duration);
            };

            audioRef.current.onended = () => {
                console.log('Audio playback ended');
                setIsAiSpeaking(false);

                // Resume listening if it was enabled
                if (isListening && recognitionRef.current) {
                    setTimeout(() => {
                        recognitionRef.current.start();
                    }, 300);
                }
            };

            audioRef.current.onerror = (e) => {
                console.error('Audio playback error:', e);
                setError(`Failed to play audio response. Error code: ${audioRef.current.error?.code}`);
                setIsAiSpeaking(false);
            };

            // Add a timeout in case loading never completes
            const loadingTimeout = setTimeout(() => {
                if (audioRef.current && audioRef.current.readyState === 0) {
                    setError('Audio is taking too long to load. Check your connection or try again.');
                    setIsAiSpeaking(false);
                }
            }, 10000); // 10 seconds timeout

            // Play the audio
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        clearTimeout(loadingTimeout);
                        console.log("Audio playback started successfully");
                    })
                    .catch(error => {
                        clearTimeout(loadingTimeout);
                        console.error('Audio play error:', error);
                        // More specific error based on the error code
                        const errorMessage = error.name === 'NotAllowedError'
                            ? 'Browser blocked audio playback. Try clicking the interface first.'
                            : 'Failed to play audio. Check your connection and try again.';
                        setError(errorMessage);
                        setIsAiSpeaking(false);
                    });
            }
        } catch (error) {
            console.error('Error generating audio:', error);
            setError('Failed to generate audio response: ' + error.message);
            setIsAiSpeaking(false);
        }
    };

    // Toggle microphone on/off
    const toggleListening = () => {
        if (isAiSpeaking) return; // Don't allow toggling while AI is speaking

        setIsListening(prevState => !prevState);
        if (!isListening) {
            setTranscript('');
            setError(null);
        }
    };

    // Stop AI from speaking
    const stopAiSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsAiSpeaking(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">Voice Assistant</h1>

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

            <div className="flex justify-center mb-6">
                <button
                    onClick={ toggleListening }
                    disabled={ isAiSpeaking }
                    className={ `p-4 rounded-full ${isListening
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                        } ${isAiSpeaking ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}` }
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
                        className="ml-4 p-4 rounded-full bg-yellow-500 text-white hover:bg-opacity-80"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                ) }
            </div>

            <div className="mb-6">
                <div className="p-4 h-24 bg-gray-100 rounded overflow-auto">
                    { isListening ? (
                        <p className="animate-pulse">{ transcript || "Listening..." }</p>
                    ) : (
                        <p className="text-gray-500">{ transcript || "Click the microphone to start speaking..." }</p>
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
                        <p>AI is speaking...</p>
                    </div>
                </div>
            ) }

            <div className="border rounded p-4 max-h-64 overflow-auto">
                <h2 className="font-bold mb-2">Conversation History</h2>
                { conversationHistory.length === 0 ? (
                    <p className="text-gray-500">No conversation yet. Start speaking to interact with the assistant.</p>
                ) : (
                    conversationHistory.map((entry, index) => (
                        <div key={ index } className={ `mb-2 p-2 rounded ${entry.speaker === 'User' ? 'bg-gray-100' : 'bg-blue-100'}` }>
                            <strong>{ entry.speaker }:</strong> { entry.text }
                        </div>
                    ))
                ) }
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>Using pollinations.ai for text-to-speech with the { selectedVoice } voice.</p>
            </div>
        </div>
    );
};

export default VoiceAssistant;  // This line is important to export the component so it can be used in other files1