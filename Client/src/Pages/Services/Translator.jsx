import { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { LanguageSelect } from '../../components/ui/LanguageSelect';
import { Button } from '../../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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
];

export const Translator = () => {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('es');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleTranslate = () => {
        // Simulate translation
        setTranslatedText('Translated text will appear here...');
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
                    <div className="flex-1">
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
                            { translatedText || 'Translation will appear here...' }
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-center">
                    <Button
                        onClick={ handleTranslate }
                        className="flex items-center gap-2"
                        disabled={ !sourceText }
                    >
                        Translate <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </ServiceContainer>
    );
};