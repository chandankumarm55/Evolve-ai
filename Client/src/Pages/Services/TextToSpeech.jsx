import { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Pause, Download, Loader2, Volume2, Settings2 } from 'lucide-react';
import { Card } from '../../components/ui/card';

export const TextToSpeech = () => {
    const [entries, setEntries] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('en-US-1');
    const [playingIndex, setPlayingIndex] = useState(null);

    const dummyVoices = [
        { id: 'en-US-1', name: 'Emma (US)', language: 'English (US)' },
        { id: 'en-GB-1', name: 'James (UK)', language: 'English (UK)' },
        { id: 'en-AU-1', name: 'Oliver (AU)', language: 'English (AU)' }
    ];

    const handleGenerateAudio = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsGenerating(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setEntries(prev => [{
            id: Date.now(),
            text,
            timestamp: new Date().toLocaleTimeString(),
            voice: selectedVoice,
            duration: Math.floor(Math.random() * 60) + 30, // Random duration between 30-90s
            isPlaying: false
        }, ...prev]);

        setText('');
        setIsGenerating(false);
    };

    const togglePlay = (index) => {
        if (playingIndex === index) {
            setPlayingIndex(null);
        } else {
            setPlayingIndex(index);
        }
    };

    const handleDownload = (entry) => {
        // Simulate download delay
        const button = document.createElement('button');
        button.className = 'download-notification';
        button.textContent = 'Audio downloaded successfully!';
        document.body.appendChild(button);
        setTimeout(() => document.body.removeChild(button), 2000);
    };

    return (
        <ServiceContainer title="Text to Speech">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card className="p-4 border-dashed">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-1 block">Voice Selection</label>
                            <select
                                className="w-full px-3 py-2 rounded-md border bg-background"
                                value={ selectedVoice }
                                onChange={ (e) => setSelectedVoice(e.target.value) }
                            >
                                { dummyVoices.map(voice => (
                                    <option key={ voice.id } value={ voice.id }>
                                        { voice.name } - { voice.language }
                                    </option>
                                )) }
                            </select>
                        </div>
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <Settings2 className="h-4 w-4" />
                        </Button>
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

                                    <div className="flex items-center gap-2">
                                        <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-linear"
                                                style={ {
                                                    width: playingIndex === index ? '100%' : '0%',
                                                    transition: 'width 1s linear'
                                                } }
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground min-w-[40px]">
                                            { Math.floor(entry.duration / 60) }:{ (entry.duration % 60).toString().padStart(2, '0') }
                                        </span>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={ () => handleDownload(entry) }
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
                                <h3 className="font-semibold">Start Converting Text to Speech</h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter your text below and choose from multiple voices
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
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Converting
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