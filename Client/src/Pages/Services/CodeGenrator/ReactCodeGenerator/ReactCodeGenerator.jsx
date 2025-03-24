import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useTheme } from '../../../../contexts/ThemeContext';

export function ReactCodeGenerator() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);
    const navigate = useNavigate();
    const { theme, toggleTheme, isDark } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Optional: Backend validation or preprocessing
            const response = await axios.post(`${BACKEND_URL}/generate-react`, {
                prompt: prompt.trim()
            });

            // Navigate to builder with response data if needed
            navigate('/builder', {
                state: {
                    prompt: prompt,
                    generatedCode: response.data.code
                }
            });
        } catch (err) {
            setError('Failed to generate React code. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={ `min-h-screen flex items-center justify-center p-4 transition-colors duration-300 
      ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}` }>

            {/* Theme Toggle */ }
            <button
                onClick={ toggleTheme }
                className={ `absolute top-4 right-4 p-2 rounded-full 
          ${isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}` }
            >
                { isDark ? <Sun /> : <Moon /> }
            </button>

            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Wand2 className={ `w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-600'}` } />
                    </div>

                    <h1 className={ `text-4xl font-bold mb-4 
            ${isDark ? 'text-gray-100' : 'text-gray-900'}` }>
                        React Code Generator
                    </h1>

                    <p className={ `text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                        Describe your React component, and we'll generate the code for you
                    </p>
                </div>

                <form onSubmit={ handleSubmit } className="space-y-4">
                    <div className={ `rounded-lg shadow-lg p-6 
            ${isDark
                            ? 'bg-gray-800 border border-gray-700'
                            : 'bg-white border border-gray-200'}` }>
                        <textarea
                            value={ prompt }
                            onChange={ (e) => setPrompt(e.target.value) }
                            placeholder="Describe the React component you want to generate..."
                            className={ `w-full h-32 p-4 rounded-lg resize-none 
                ${isDark
                                    ? 'bg-gray-900 text-gray-100 border-gray-700 placeholder-gray-500'
                                    : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-400'}` }
                        />

                        { error && (
                            <div className="text-red-500 mt-2 text-sm">
                                { error }
                            </div>
                        ) }

                        <button
                            type="submit"
                            disabled={ loading || !prompt.trim() }
                            className={ `w-full mt-4 py-3 rounded-lg font-medium transition-colors
                ${loading || !prompt.trim()
                                    ? 'opacity-50 cursor-not-allowed'
                                    : isDark
                                        ? 'bg-blue-600 hover:bg-blue-700 text-gray-100'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'}` }
                        >
                            { loading ? 'Generating...' : 'Generate React Code' }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}