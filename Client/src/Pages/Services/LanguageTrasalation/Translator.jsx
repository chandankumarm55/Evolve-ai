import React, { useState } from 'react';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import { LanguageSelect } from '../../../components/ui/LanguageSelect';
import { Button } from '../../../components/ui/button';
import { ArrowRight, Loader2, RotateCcw, Bot } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
];

export const Translator = () => {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('es');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [translationMethod, setTranslationMethod] = useState('ai');
    const { theme } = useTheme();
    const isDark = theme === 'dark';



    // Function for AI-based translation
    const translateWithAI = async (langFrom, langTo, text) => {
        if (!text) {
            throw new Error('No text provided for translation');
        }

        // Get language names from codes
        const fromLangName = languages.find(l => l.code === langFrom)?.name || langFrom;
        const toLangName = languages.find(l => l.code === langTo)?.name || langTo;

        // Construct the prompt
        const prompt = `${text} in ${toLangName} only the translated word`;

        // Call the pollinations.ai API
        const url = `https://text.pollinations.ai/openai/${encodeURIComponent(prompt)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`AI translation failed with status: ${response.status}`);
        }

        return await response.text();
    };

    const handleTranslate = async () => {
        if (!sourceText) {
            setError('Please enter text to translate');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let result;
            if (translationMethod === 'ai') {
                result = await translateWithAI(sourceLang, targetLang, sourceText);
            } else {
                result = await translateWithGoogleScript(sourceLang, targetLang, sourceText);
            }
            setTranslatedText(result);
        } catch (error) {
            console.error('Translation error:', error);
            setError(error.message || 'Translation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const swapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setSourceText(translatedText);
        setTranslatedText(sourceText);
    };

    const handleReset = () => {
        setSourceText('');
        setTranslatedText('');
        setError(null);
    };

    return (
        <ServiceContainer title="Language Translator">
            <div className="grid md:grid-cols-2 gap-6 h-full">
                <div className="flex flex-col gap-4">
                    <div className="flex-1">
                        <LanguageSelect
                            value={ sourceLang }
                            onChange={ setSourceLang }
                            languages={ languages }
                            label="Translate from"
                        />
                        <textarea
                            value={ sourceText }
                            onChange={ (e) => setSourceText(e.target.value) }
                            placeholder="Enter text to translate..."
                            className={ `mt-2 w-full h-[calc(100%-4rem)] p-4 rounded-lg border-2 resize-none 
                                ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                                } focus:border-purple-500 outline-none transition-colors` }
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex-1 relative">
                        <LanguageSelect
                            value={ targetLang }
                            onChange={ setTargetLang }
                            languages={ languages }
                            label="Translate to"
                        />
                        <div
                            className={ `mt-2 w-full h-[calc(100%-4rem)] p-4 rounded-lg border-2 
                                ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }` }
                        >
                            { isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin w-6 h-6" />
                                </div>
                            ) : error ? (
                                <div className={ `text-red-500 p-2 ${isDark ? 'bg-red-900/20' : 'bg-red-50'} rounded` }>
                                    { error }
                                </div>
                            ) : (
                                <div className="h-full">
                                    { translatedText || (
                                        <span className="text-gray-400">
                                            Translation will appear here...
                                        </span>
                                    ) }
                                </div>
                            ) }
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex flex-wrap justify-center items-center gap-4">
                    <div className={ `w-full flex justify-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}` }>
                        <div className="flex items-center gap-2">
                            <div className="relative inline-flex items-center">
                                <input
                                    type="radio"
                                    id="google-translate"
                                    value="google"
                                    checked={ translationMethod === 'google' }
                                    onChange={ () => setTranslationMethod('google') }
                                    className="sr-only"
                                />


                                <input
                                    type="radio"
                                    id="ai-translate"
                                    value="ai"
                                    checked={ translationMethod === 'ai' }
                                    onChange={ () => setTranslationMethod('ai') }
                                    className="sr-only"
                                />
                                <label
                                    htmlFor="ai-translate"
                                    className={ `flex items-center cursor-pointer py-2 px-4 rounded-r-md ${translationMethod === 'ai'
                                        ? isDark
                                            ? 'bg-purple-700 text-white'
                                            : 'bg-purple-100 text-purple-700'
                                        : isDark
                                            ? 'bg-gray-600 hover:bg-gray-500'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }` }
                                >
                                    <Bot className="w-4 h-4 mr-2" />
                                    AI Translation
                                </label>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={ swapLanguages }
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={ !translatedText || isLoading }
                    >
                        Swap Languages
                    </Button>
                    <Button
                        onClick={ handleReset }
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={ !sourceText && !translatedText }
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={ handleTranslate }
                        className="flex items-center gap-2"
                        disabled={ !sourceText || isLoading }
                    >
                        { isLoading ? (
                            <>
                                Translating <Loader2 className="animate-spin w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Translate <ArrowRight className="w-4 h-4" />
                            </>
                        ) }
                    </Button>
                </div>
            </div>
        </ServiceContainer>
    );
};