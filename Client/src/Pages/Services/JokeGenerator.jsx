import { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { InputBox } from '../../components/ui/InputBox';
import { motion } from 'framer-motion';
import { Smile } from 'lucide-react';


export const JokeGenerator = () => {
    const [jokes, setJokes] = useState([]);

    const handleGenerateJoke = (topic) => {
        setJokes(prev => [...prev, {
            setup: "Why did the AI go to therapy?",
            punchline: "Because it had too many processing issues!",
            timestamp: new Date().toLocaleTimeString(),
        }]);
    };

    return (
        <ServiceContainer title="AI Joke Generator">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                { jokes.map((joke, index) => (
                    <motion.div
                        key={ index }
                        initial={ { opacity: 0, y: 20 } }
                        animate={ { opacity: 1, y: 0 } }
                        className="bg-gray-100 rounded-lg p-4"
                    >
                        <p className="mb-2 font-medium">{ joke.setup }</p>
                        <p className="text-gray-700">{ joke.punchline }</p>
                        <span className="text-sm text-gray-500 mt-2 block">{ joke.timestamp }</span>
                    </motion.div>
                )) }
                { jokes.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Smile size={ 48 } className="mx-auto mb-2" />
                            <p>Enter a topic to generate jokes</p>
                        </div>
                    </div>
                ) }
            </div>
            <InputBox onSubmit={ handleGenerateJoke } placeholder="Enter a topic for the joke..." />
        </ServiceContainer>
    );
};