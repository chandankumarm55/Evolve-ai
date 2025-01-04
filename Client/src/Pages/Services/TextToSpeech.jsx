import { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { InputBox } from '../../components/ui/InputBox';
import { motion } from 'framer-motion';
import { Mic, Play } from 'lucide-react';


export const TextToSpeech = () => {
    const [entries, setEntries] = useState([]);

    const handleGenerateAudio = (text) => {
        setEntries(prev => [...prev, {
            text,
            timestamp: new Date().toLocaleTimeString(),
        }]);
    };

    return (
        <ServiceContainer title="Text to Speech">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                { entries.map((entry, index) => (
                    <motion.div
                        key={ index }
                        initial={ { opacity: 0, x: -20 } }
                        animate={ { opacity: 1, x: 0 } }
                        className="bg-gray-100 rounded-lg p-4"
                    >
                        <p className="mb-2">{ entry.text }</p>
                        <div className="flex items-center justify-between">
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
                                <Play size={ 16 } />
                                Play Audio
                            </button>
                            <span className="text-sm text-gray-500">{ entry.timestamp }</span>
                        </div>
                    </motion.div>
                )) }
                { entries.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Mic size={ 48 } className="mx-auto mb-2" />
                            <p>Enter text to convert to speech</p>
                        </div>
                    </div>
                ) }
            </div>
            <InputBox onSubmit={ handleGenerateAudio } placeholder="Enter text to convert to speech..." />
        </ServiceContainer>
    );
};