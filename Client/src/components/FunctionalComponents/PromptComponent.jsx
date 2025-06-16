import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const SparkleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    </svg>
);

export default function PromptComponent() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [userInput, setUserInput] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const [index, setIndex] = useState(0);
    const [typingIndex, setTypingIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    const prompts = [
        'Deep sea exhibit with sparkling jellyfish and coral.',
        'Create a futuristic cityscape with flying cars.',
        'Design a magical forest with glowing mushrooms.',
    ];

    useEffect(() => {
        if (userInput || isTyping) return;

        const typingTimeout = setTimeout(() => {
            if (typingIndex < prompts[index].length) {
                setPlaceholder((prev) => prev + prompts[index][typingIndex]);
                setTypingIndex((prev) => prev + 1);
            } else {
                setTimeout(() => {
                    setPlaceholder('');
                    setTypingIndex(0);
                    setIndex((prev) => (prev + 1) % prompts.length);
                }, 2000);
            }
        }, 100);

        return () => clearTimeout(typingTimeout);
    }, [typingIndex, index, userInput, isTyping]);

    const handleInputFocus = () => {
        setIsTyping(true);
        setPlaceholder('');
    };

    const handleInputBlur = () => {
        if (!userInput) {
            setIsTyping(false);
            setTypingIndex(0);
            setPlaceholder('');
        }
    };

    const handleSubmit = () => {
        if (userInput.trim()) {
            navigate('/dashboard/conversation', {
                state: { initialPrompt: userInput.trim() }
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className={ `flex items-center w-full max-w-3xl mx-auto p-2 sm:p-3 rounded-full border ${isDark ? 'bg-[#1D1E2F] border-gray-700' : 'bg-gray-100 border-gray-200'}` }>
            <div className="flex items-center flex-1 gap-3 min-w-0">
                <span className={ `shrink-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                    <SparkleIcon />
                </span>
                <input
                    type="text"
                    value={ userInput }
                    onChange={ (e) => setUserInput(e.target.value) }
                    onFocus={ handleInputFocus }
                    onBlur={ handleInputBlur }
                    onKeyPress={ handleKeyPress }
                    placeholder={ isTyping ? "Enter your prompt..." : placeholder || "Enter your prompt..." }
                    className={ `w-full bg-transparent text-sm sm:text-base truncate outline-none border-none ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}` }
                />
            </div>
            <button
                onClick={ handleSubmit }
                className={ `ml-2 px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap text-sm sm:text-base rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-white ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}` }
            >
                Generate <span className="hidden sm:inline">→</span>
            </button>
        </div>
    );
}
