import { useState, useEffect, useRef } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Pause, Download, Volume2, Settings2, Save, Wand2 } from 'lucide-react';
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

export const TextToSpeech = () => {
    const [entries, setEntries] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [text, setText] = useState('');
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);

    // Advanced controls
    const [speechRate, setSpeechRate] = useState(1);
    const [speechPitch, setSpeechPitch] = useState(1);
    const [volume, setVolume] = useState(1);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Refs for recording
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                setSelectedVoice(availableVoices[0].voiceURI);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleGenerateAudio = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsGenerating(true);

        // Start recording the audio output
        await startRecording();

        const newEntry = {
            id: Date.now(),
            text,
            timestamp: new Date().toLocaleTimeString(),
            voice: selectedVoice,
            isPlaying: false,
            audioUrl: null
        };

        setEntries(prev => [newEntry, ...prev]);
        setText('');

        // Speak the text
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voices.find(voice => voice.voiceURI === selectedVoice);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.volume = volume;

        utterance.onend = () => {
            stopRecording();
            setIsGenerating(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const speakText = (entry, index) => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(entry.text);
        utterance.voice = voices.find(voice => voice.voiceURI === entry.voice);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.volume = volume;

        utterance.onend = () => {
            setPlayingIndex(null);
        };

        setPlayingIndex(index);
        window.speechSynthesis.speak(utterance);
    };

    const togglePlay = (index) => {
        if (playingIndex === index) {
            window.speechSynthesis.cancel();
            setPlayingIndex(null);
        } else {
            speakText(entries[index], index);
        }
    };

    const handleDownload = (audioUrl) => {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `tts-audio-${Date.now()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const presetStyles = {
        natural: { rate: 0.9, pitch: 1, volume: 1 },
        professional: { rate: 1, pitch: 1.1, volume: 1 },
        energetic: { rate: 1.2, pitch: 1.2, volume: 1 },
        calm: { rate: 0.8, pitch: 0.9, volume: 0.8 }
    };

    const applyPreset = (preset) => {
        const settings = presetStyles[preset];
        setSpeechRate(settings.rate);
        setSpeechPitch(settings.pitch);
        setVolume(settings.volume);
    };

    return (
        <ServiceContainer title="Professional Text to Speech">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card className="p-4 border-dashed">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Voice Settings</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={ () => setShowAdvanced(!showAdvanced) }
                            >
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className={ `text-sm font-medium mb-1 block ${isDark ? 'text-gray-200' : 'text-gray-700'}` }>
                                    Voice Selection
                                </label>
                                <select
                                    className={ `w-full px-3 py-2 rounded-md border ${isDark
                                        ? 'border-gray-600 text-gray-200'
                                        : 'border-gray-300 text-gray-700'
                                        } bg-transparent` }
                                    value={ selectedVoice }
                                    onChange={ (e) => setSelectedVoice(e.target.value) }
                                >
                                    { voices.map(voice => (
                                        <option
                                            key={ voice.voiceURI }
                                            value={ voice.voiceURI }
                                        >
                                            { voice.name } ({ voice.lang })
                                        </option>
                                    )) }
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <TooltipProvider>
                                    { Object.keys(presetStyles).map(preset => (
                                        <Tooltip key={ preset }>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={ () => applyPreset(preset) }
                                                >
                                                    <Wand2 className="h-4 w-4 mr-1" />
                                                    { preset.charAt(0).toUpperCase() + preset.slice(1) }
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Apply { preset } preset
                                            </TooltipContent>
                                        </Tooltip>
                                    )) }
                                </TooltipProvider>
                            </div>
                        </div>

                        { showAdvanced && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Rate: { speechRate }x
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={ speechRate }
                                                onChange={ (e) => setSpeechRate(parseFloat(e.target.value)) }
                                                className="w-full"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Pitch: { speechPitch }
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={ speechPitch }
                                                onChange={ (e) => setSpeechPitch(parseFloat(e.target.value)) }
                                                className="w-full"
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Volume: { Math.round(volume * 100) }%
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={ volume }
                                                onChange={ (e) => setVolume(parseFloat(e.target.value)) }
                                                className="w-full"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) }
                    </div>
                </Card>

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
                                        <p className="flex-1 text-sm">{ entry.text }</p>
                                        <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={ () => togglePlay(index) }
                                            >
                                                { playingIndex === index ?
                                                    <Pause className="h-4 w-4" /> :
                                                    <Play className="h-4 w-4" />
                                                }
                                            </Button>
                                            { audioURL && index === 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={ () => handleDownload(audioURL) }
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            ) }
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

                { entries.length === 0 && (
                    <motion.div
                        className="h-[300px] flex items-center justify-center"
                        initial={ { opacity: 0 } }
                        animate={ { opacity: 1 } }
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                animate={ {
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                } }
                                transition={ {
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                } }
                            >
                                <Mic size={ 48 } className="mx-auto text-muted-foreground" />
                            </motion.div>
                            <div className="space-y-2">
                                <h3 className="font-semibold">Professional Text to Speech Converter</h3>
                                <p className="text-sm text-muted-foreground">
                                    Convert text to natural-sounding speech with customizable voices
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) }
            </div>

            <form onSubmit={ handleGenerateAudio } className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={ text }
                        onChange={ (e) => setText(e.target.value) }
                        placeholder="Enter text to convert to speech..."
                        className="flex-1"
                        disabled={ isGenerating }
                    />
                    <Button type="submit" disabled={ isGenerating || !text.trim() }>
                        { isGenerating ? (
                            <>
                                <Save className="w-4 h-4 mr-2 animate-spin" />
                                Recording...
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4 mr-2" />
                                Convert
                            </>
                        ) }
                    </Button>
                </div>
            </form>
        </ServiceContainer>
    );
};

export default TextToSpeech;