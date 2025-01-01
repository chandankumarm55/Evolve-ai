import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SparkleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" fill="currentColor" />
    </svg>
);

export default function PromptComponent() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [prompt, setPrompt] = useState('');
    const [index, setIndex] = useState(0);
    const [typingIndex, setTypingIndex] = useState(0);

    const prompts = [
        'Deep sea exhibit with sparkling jellyfish and coral.',
        'Create a futuristic cityscape with flying cars.',
        'Design a magical forest with glowing mushrooms.'
    ];

    useEffect(() => {
        const typingTimeout = setTimeout(() => {
            if (typingIndex < prompts[index].length) {
                setPrompt(prev => prev + prompts[index][typingIndex]);
                setTypingIndex(prev => prev + 1);
            } else {
                setTimeout(() => {
                    setPrompt('');
                    setTypingIndex(0);
                    setIndex(prev => (prev + 1) % prompts.length);
                }, 2000);
            }
        }, 100);

        return () => clearTimeout(typingTimeout);
    }, [typingIndex, index]);

    return (
        <div className={ `flex items-center gap-3 w-full max-w-3xl p-3 rounded-full ${isDark ? 'bg-[#1D1E2F] border-gray-700' : 'bg-gray-100 border-gray-200'
            } border` }>
            <SparkleIcon />
            <input
                type="text"
                value={ prompt }
                readOnly
                placeholder="Enter your prompt..."
                className={ `flex-1 bg-transparent ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                    } text-lg outline-none border-none` }
            />
            <button className={ `px-6 py-2 ${isDark
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                } rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2` }>
                Generate
                <span className="text-xl">→</span>
            </button>
        </div>
    );
}