import React, { useState } from 'react';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import { LanguageSelect } from '../../../components/ui/LanguageSelect';
import { Button } from '../../../components/ui/button';
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';
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
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const translate = async (langFrom, langTo, text) => {
        if (!text || !langFrom || !langTo) {
            throw new Error('Missing required translation parameters');
        }

        // Use the same URL structure as the Java code
        const urlStr = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" +
            "?q=" + encodeURIComponent(text) +
            "&target=" + langTo +
            "&source=" + langFrom;

        try {
            const response = await fetch(urlStr, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Translation failed with status: ${response.status}`);
            }

            const data = await response.text(); // Use text() instead of json() to match Java implementation
            return data;
        } catch (error) {
            throw new Error('Translation failed: ' + error.message);
        }
    };

    const handleTranslate = async () => {
        if (!sourceText) {
            setError('Please enter text to translate');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await translate(sourceLang, targetLang, sourceText);
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
                                <div className="text-red-500 p-2 bg-red-50 rounded">
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

                <div className="md:col-span-2 flex justify-center items-center gap-4">
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