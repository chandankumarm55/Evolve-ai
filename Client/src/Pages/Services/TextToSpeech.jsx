import { useState, useEffect, useRef } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Pause, Download, Volume2, Settings2, Save, Wand2, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip";
import { useTheme } from '../../contexts/ThemeContext';

// Comprehensive language options with Indian languages
const languageOptions = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'or-IN', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
    { code: 'as-IN', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
    { code: 'ur-IN', name: 'اردو (Urdu)', flag: '🇮🇳' },
    { code: 'sa-IN', name: 'संस्कृत (Sanskrit)', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français (French)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch (German)', flag: '🇩🇪' },
    { code: 'ja-JP', name: '日本語 (Japanese)', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'ko-KR', name: '한국어 (Korean)', flag: '🇰🇷' },
    { code: 'ar-SA', name: 'العربية (Arabic)', flag: '🇸🇦' },
    { code: 'ru-RU', name: 'Русский (Russian)', flag: '🇷🇺' },
    { code: 'pt-BR', name: 'Português (Portuguese)', flag: '🇧🇷' },
    { code: 'it-IT', name: 'Italiano (Italian)', flag: '🇮🇹' }
];

export const TextToSpeech = () => {
    const [entries, setEntries] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [text, setText] = useState('');
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    const [playingIndex, setPlayingIndex] = useState(null);

    // Advanced controls
    const [speechRate, setSpeechRate] = useState(1);
    const [speechPitch, setSpeechPitch] = useState(1);
    const [volume, setVolume] = useState(1);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Audio recording states
    const [recordingStatus, setRecordingStatus] = useState('idle');

    // Refs
    const audioRef = useRef(new Audio());
    const currentUtteranceRef = useRef(null);

    // Enhanced voice loading with better fallback system
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);

                // Enhanced voice selection logic
                const findBestVoice = (langCode) => {
                    // Try exact match first (e.g., hi-IN)
                    let voice = availableVoices.find(v => v.lang === langCode);
                    if (voice) return voice;

                    // Try language code without region (e.g., hi)
                    const baseLang = langCode.split('-')[0];
                    voice = availableVoices.find(v => v.lang.startsWith(baseLang));
                    if (voice) return voice;

                    // For Indian languages, try to find any Indian English voice
                    if (langCode.includes('-IN')) {
                        voice = availableVoices.find(v => v.lang === 'en-IN');
                        if (voice) return voice;
                    }

                    // Try to find any English voice as fallback
                    voice = availableVoices.find(v => v.lang.startsWith('en'));
                    if (voice) return voice;

                    // Return default or first available voice
                    return availableVoices.find(v => v.default) || availableVoices[0];
                };

                const bestVoice = findBestVoice(selectedLanguage);
                if (bestVoice) {
                    setSelectedVoice(bestVoice.voiceURI);
                }
            }
        };

        // Load voices immediately and on voices changed
        loadVoices();

        // Set up event listener for when voices are loaded
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup
        return () => {
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [selectedLanguage]);

    // Create audio blob from speech synthesis using a different approach
    const createAudioFromSpeech = (text, voice, rate, pitch, vol, lang) => {
        return new Promise((resolve, reject) => {
            try {
                const utterance = new SpeechSynthesisUtterance(text);

                // Set voice parameters
                if (voice) {
                    utterance.voice = voice;
                }
                utterance.rate = rate;
                utterance.pitch = pitch;
                utterance.volume = vol;
                utterance.lang = lang;

                // Store reference for potential cancellation
                currentUtteranceRef.current = utterance;

                let audioData = [];
                let isRecording = false;

                utterance.onstart = () => {
                    console.log('Speech synthesis started');
                    isRecording = true;
                };

                utterance.onend = () => {
                    console.log('Speech synthesis ended');
                    isRecording = false;

                    // Since we can't directly capture browser's speech synthesis audio,
                    // we'll create a simple indicator that audio was generated
                    // In a real implementation, you might need a server-side solution
                    // or use a different TTS API that provides audio files

                    // For now, we'll mark it as having audio available
                    resolve(true);
                };

                utterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event);
                    reject(event.error);
                };

                // Start speech synthesis
                window.speechSynthesis.speak(utterance);

            } catch (error) {
                reject(error);
            }
        });
    };

    // Enhanced text to speech generation
    const handleGenerateAudio = async (e) => {
        e.preventDefault();
        if (!text.trim() || isGenerating) return;

        setIsGenerating(true);
        setRecordingStatus('processing');

        try {
            // Find the best voice for the selected language
            const findVoiceForLanguage = (langCode) => {
                // Try exact match
                let voice = voices.find(v => v.lang === langCode);
                if (voice) return voice;

                // Try base language
                const baseLang = langCode.split('-')[0];
                voice = voices.find(v => v.lang.startsWith(baseLang));
                if (voice) return voice;

                // For Indian languages, fallback to English
                if (langCode.includes('-IN')) {
                    voice = voices.find(v => v.lang === 'en-IN') ||
                        voices.find(v => v.lang === 'en-US');
                    if (voice) return voice;
                }

                // Default fallback
                return voices.find(v => v.default) || voices[0];
            };

            const voiceToUse = findVoiceForLanguage(selectedLanguage);

            const newEntry = {
                id: Date.now(),
                text: text.trim(),
                timestamp: new Date().toLocaleTimeString(),
                voice: voiceToUse?.voiceURI || selectedVoice,
                voiceName: voiceToUse?.name || 'System Voice',
                language: selectedLanguage,
                isPlaying: false,
                hasAudio: false, // Will be set to true after successful generation
                speechRate,
                speechPitch,
                volume
            };

            // Add entry to list first
            setEntries(prev => [newEntry, ...prev]);
            setText('');

            // Generate speech and try to create audio
            try {
                await createAudioFromSpeech(
                    newEntry.text,
                    voiceToUse,
                    speechRate,
                    speechPitch,
                    volume,
                    selectedLanguage
                );

                // Update entry to show audio is available
                setEntries(prev => prev.map(entry =>
                    entry.id === newEntry.id
                        ? { ...entry, hasAudio: true }
                        : entry
                ));

            } catch (error) {
                console.error('Error generating audio:', error);
                // Audio generation failed, but we still have the text entry
            }

        } catch (error) {
            console.error('Error in handleGenerateAudio:', error);
        } finally {
            setIsGenerating(false);
            setRecordingStatus('idle');
        }
    };

    // Enhanced speech function with better error handling
    const speakText = (entry, index) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
        }

        try {
            const utterance = new SpeechSynthesisUtterance(entry.text);

            // Find the best voice for this entry
            const findVoiceForEntry = (entry) => {
                // Try to find the exact voice used when creating the entry
                let voice = voices.find(v => v.voiceURI === entry.voice);
                if (voice) return voice;

                // Fallback to finding voice by language
                voice = voices.find(v => v.lang === entry.language);
                if (voice) return voice;

                // Try base language
                const baseLang = entry.language.split('-')[0];
                voice = voices.find(v => v.lang.startsWith(baseLang));
                if (voice) return voice;

                // Final fallback
                return voices.find(v => v.default) || voices[0];
            };

            const voiceToUse = findVoiceForEntry(entry);

            if (voiceToUse) {
                utterance.voice = voiceToUse;
                console.log(`Using voice: ${voiceToUse.name} (${voiceToUse.lang}) for text: "${entry.text}"`);
            } else {
                console.warn('No suitable voice found, using system default');
            }

            // Use saved settings or current settings
            utterance.rate = entry.speechRate || speechRate;
            utterance.pitch = entry.speechPitch || speechPitch;
            utterance.volume = entry.volume || volume;
            utterance.lang = entry.language;

            utterance.onstart = () => {
                console.log('Speech started for:', entry.text);
                setPlayingIndex(index);
            };

            utterance.onend = () => {
                console.log('Speech ended for:', entry.text);
                setPlayingIndex(null);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setPlayingIndex(null);

                // Try with a fallback voice
                if (event.error === 'voice-unavailable' || event.error === 'language-unavailable') {
                    console.log('Retrying with fallback voice...');
                    const fallbackUtterance = new SpeechSynthesisUtterance(entry.text);
                    防护Utterance.lang = 'en-US'; // Fallback to English
                    fallbackUtterance.rate = utterance.rate;
                    fallbackUtterance.pitch = utterance.pitch;
                    fallbackUtterance.volume = utterance.volume;

                    fallbackUtterance.onend = () => setPlayingIndex(null);
                    fallbackUtterance.onerror = () => setPlayingIndex(null);

                    window.speechSynthesis.speak(fallbackUtterance);
                }
            };

            currentUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('Error in speakText:', error);
            setPlayingIndex(null);
        }
    };

    const togglePlay = (index) => {
        if (playingIndex === index) {
            // Stop current playback
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setPlayingIndex(null);
        } else {
            // Start playback
            speakText(entries[index], index);
        }
    };

    // Enhanced download function - creates a text file with speech settings
    const handleDownload = (entry) => {
        try {
            // Since we can't capture the actual audio from browser's speech synthesis,
            // we'll create a comprehensive text file with all the information
            // that can be used to recreate the speech

            const speechData = {
                text: entry.text,
                language: entry.language,
                languageName: languageOptions.find(lang => lang.code === entry.language)?.name || entry.language,
                voice: entry.voiceName || 'System Voice',
                settings: {
                    rate: entry.speechRate || 1,
                    pitch: entry.speechPitch || 1,
                    volume: entry.volume || 1
                },
                timestamp: entry.timestamp,
                generatedAt: new Date().toISOString()
            };

            const content = `Text to Speech Export
=====================

Text: ${speechData.text}
Language: ${speechData.languageName} (${speechData.language})
Voice: ${speechData.voice}
Speech Rate: ${speechData.settings.rate}x
Pitch: ${speechData.settings.pitch}
Volume: ${Math.round(speechData.settings.volume * 100)}%
Generated: ${speechData.timestamp}
Exported: ${new Date().toLocaleString()}

Instructions:
To recreate this speech, use any text-to-speech system with the above settings.
Original text: "${speechData.text}"
`;

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;

            // Create filename
            const langCode = entry.language.split('-')[0];
            const cleanText = entry.text.slice(0, 20).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

            link.download = `tts-${langCode}-${cleanText}-${timestamp}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading file. Please try again.');
        }
    };

    // Voice presets
    const presetStyles = {
        natural: { rate: 0.9, pitch: 1, volume: 1 },
        professional: { rate: 1, pitch: 1.1, volume: 1 },
        energetic: { rate: 1.2, pitch: 1.2, volume: 1 },
        calm: { rate: 0.8, pitch: 0.9, volume: 0.8 },
        storytelling: { rate: 0.85, pitch: 0.95, volume: 0.9 },
        presentation: { rate: 0.95, pitch: 1.05, volume: 1 }
    };

    const applyPreset = (preset) => {
        const settings = presetStyles[preset];
        setSpeechRate(settings.rate);
        setSpeechPitch(settings.pitch);
        setVolume(settings.volume);
    };

    // Get available voices for selected language with better fallbacks
    const getAvailableVoices = () => {
        const exactMatches = voices.filter(voice => voice.lang === selectedLanguage);
        const languageMatches = voices.filter(voice =>
            voice.lang.startsWith(selectedLanguage.split('-')[0])
        );

        // For Indian languages, also include English voices as fallback
        const fallbackVoices = selectedLanguage.includes('-IN')
            ? voices.filter(voice => voice.lang.startsWith('en'))
            : [];

        const allVoices = [...exactMatches, ...languageMatches, ...fallbackVoices];

        // Remove duplicates
        const uniqueVoices = allVoices.filter((voice, index, self) =>
            index === self.findIndex(v => v.voiceURI === voice.voiceURI)
        );

        return uniqueVoices.length > 0 ? uniqueVoices : voices.slice(0, 10);
    };

    const availableVoices = getAvailableVoices();

    return (
        <ServiceContainer title="Advanced Text to Speech Converter">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Voice and Language Settings Card */ }
                <Card className="p-4 border-dashed">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Voice & Language Settings
                            </h3>
                            <div className="flex items-center gap-2">
                                { recordingStatus === 'processing' && (
                                    <div className="flex items-center gap-1 text-blue-500 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        Processing
                                    </div>
                                ) }
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={ () => setShowAdvanced(!showAdvanced) }
                                >
                                    <Settings2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[250px]">
                                <label className={ `text-sm font-medium mb-2 block ${isDark ? 'text-gray-200' : 'text-gray-700'}` }>
                                    Language Selection
                                </label>
                                <Select
                                    value={ selectedLanguage }
                                    onValueChange={ (value) => setSelectedLanguage(value) }
                                >
                                    <SelectTrigger className={ `w-full ${isDark ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'}` }>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 overflow-y-auto">
                                        { languageOptions.map(lang => (
                                            <SelectItem key={ lang.code } value={ lang.code }>
                                                <div className="flex items-center gap-2">
                                                    <span>{ lang.flag }</span>
                                                    <span>{ lang.name }</span>
                                                </div>
                                            </SelectItem>
                                        )) }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 min-w-[250px]">
                                <label className={ `text-sm font-medium mb-2 block ${isDark ? 'text-gray-200' : 'text-gray-700'}` }>
                                    Voice Selection
                                    <span className="text-xs text-muted-foreground ml-2">
                                        ({ availableVoices.length } available)
                                    </span>
                                </label>
                                <Select
                                    value={ selectedVoice }
                                    onValueChange={ setSelectedVoice }
                                >
                                    <SelectTrigger className={ `w-full ${isDark ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'}` }>
                                        <SelectValue placeholder="Select voice" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-48 overflow-y-auto">
                                        { availableVoices.map(voice => (
                                            <SelectItem key={ voice.voiceURI } value={ voice.voiceURI }>
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="truncate">{ voice.name }</span>
                                                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                                        { voice.lang }
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        )) }
                                    </SelectContent>
                                </Select>
                                { availableVoices.length === 0 && (
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Loading voices... Please wait.
                                    </p>
                                ) }
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <TooltipProvider>
                                { Object.keys(presetStyles).map(preset => (
                                    <Tooltip key={ preset }>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={ () => applyPreset(preset) }
                                                className="text-xs"
                                            >
                                                <Wand2 className="h-3 w-3 mr-1" />
                                                { preset.charAt(0).toUpperCase() + preset.slice(1) }
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Apply { preset } voice preset
                                        </TooltipContent>
                                    </Tooltip>
                                )) }
                            </TooltipProvider>
                        </div>

                        { showAdvanced && (
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-medium">Advanced Voice Controls</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium block mb-2">
                                            Speech Rate: { speechRate }x
                                        </label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            value={ speechRate }
                                            onChange={ (e) => setSpeechRate(parseFloat(e.target.value)) }
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>Slow</span>
                                            <span>Fast</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium block mb-2">
                                            Voice Pitch: { speechPitch }
                                        </label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            value={ speechPitch }
                                            onChange={ (e) => setSpeechPitch(parseFloat(e.target.value)) }
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium block mb-2">
                                            Volume: { Math.round(volume * 100) }%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={ volume }
                                            onChange={ (e) => setVolume(parseFloat(e.target.value)) }
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>Quiet</span>
                                            <span>Loud</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) }
                    </div>
                </Card>

                {/* Text Input Form for Generating Speech */ }
                <Card className="p-4 border-dashed">
                    <form onSubmit={ handleGenerateAudio } className="space-y-4">
                        <div>
                            <label className={ `text-sm font-medium mb-2 block ${isDark ? 'text-gray-200' : 'text-gray-700'}` }>
                                Enter Text to Convert to Speech
                            </label>
                            <Input
                                value={ text }
                                onChange={ (e) => setText(e.target.value) }
                                placeholder="Type your text here..."
                                className={ `w-full ${isDark ? 'border-gray-600 text-gray-200 bg-gray-800' : 'border-gray-300 text-gray-700'}` }
                                disabled={ isGenerating }
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="submit"
                                disabled={ isGenerating || !text.trim() }
                                className="flex items-center gap-2"
                            >
                                <Mic className="w-4 h-4" />
                                Generate Speech
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Generated Entries List */ }
                <AnimatePresence mode="popLayout">
                    { entries.map((entry, index) => (
                        <motion.div
                            key={ entry.id }
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            exit={ { opacity: 0, x: -20 } }
                            className="group"
                        >
                            <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed">{ entry.text }</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    { languageOptions.find(lang => lang.code === entry.language)?.name || entry.language }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Volume2 className="w-3 h-3" />
                                                    { entry.voiceName || 'System Voice' }
                                                </span>
                                                { entry.speechRate && (
                                                    <span>Rate: { entry.speechRate }x</span>
                                                ) }
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            { entry.hasAudio ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                            ) }
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={ () => togglePlay(index) }
                                            >
                                                { playingIndex === index ? (
                                                    <Pause className="h-4 w-4" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                ) }
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={ () => handleDownload(entry) }
                                                title="Download Speech Info"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            { entry.timestamp }
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )) }
                </AnimatePresence>

                {/* Empty State Message */ }
                { entries.length === 0 && (
                    <motion.div
                        className="h-[300px] flex items-center justify-center text-center"
                        initial={ { opacity: 0 } }
                        animate={ { opacity: 1 } }
                        exit={ { opacity: 0 } }
                    >
                        <div className="space-y-2">
                            <Mic className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No speech generated yet. Enter text and click "Generate Speech" to start.
                            </p>
                        </div>
                    </motion.div>
                ) }
            </div>
        </ServiceContainer>
    );
};

export default TextToSpeech;