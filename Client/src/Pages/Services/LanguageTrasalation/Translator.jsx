import React, { useState } from 'react';
import axios from 'axios';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import { LanguageSelect } from '../../../components/ui/LanguageSelect';
import { Button } from '../../../components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
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

    const handleTranslate = async () => {
        if (!sourceText || !sourceLang || !targetLang) return;

        const encodedParams = new URLSearchParams();
        encodedParams.set('q', sourceText);
        encodedParams.set('source', sourceLang);
        encodedParams.set('target', targetLang);

        const options = {
            method: 'POST',
            url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'application/gzip',
                'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
            },
            data: encodedParams
        };

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.request(options);
            const translation = response.data.data.translations[0].translatedText;
            setTranslatedText(translation);
        } catch (error) {
            console.error(error);
            setError("Translation failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const swapLanguages = () => {
        const temp = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(temp);

        if (translatedText) {
            setSourceText(translatedText);
            setTranslatedText(sourceText);
        }
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
                            className={ `mt-2 w-full h-[calc(100%-4rem)] p-4 rounded-lg border-2 resize-none ${isDark
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
                            className={ `mt-2 w-full h-[calc(100%-4rem)] p-4 rounded-lg border-2 ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-200 text-gray-900'
                                }` }
                        >
                            { isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin w-6 h-6" />
                                </div>
                            ) : error ? (
                                <div className="text-red-500">{ error }</div>
                            ) : (
                                translatedText || 'Translation will appear here...'
                            ) }
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-center items-center gap-4">
                    <Button
                        onClick={ swapLanguages }
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        Swap Languages
                    </Button>
                    <Button
                        onClick={ handleTranslate }
                        className="flex items-center gap-2"
                        disabled={ !sourceText || isLoading }
                    >
                        { isLoading ? (
                            <>Translating <Loader2 className="animate-spin w-4 h-4" /></>
                        ) : (
                            <>Translate <ArrowRight className="w-4 h-4" /></>
                        ) }
                    </Button>
                </div>
            </div>
        </ServiceContainer>
    );
};