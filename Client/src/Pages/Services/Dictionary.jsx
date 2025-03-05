import { useState } from 'react';
import axios from 'axios';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { Input } from '../../components/ui/input';
import { motion } from 'framer-motion';
import { BookOpen, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast, Toaster } from 'sonner';

export const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSearch = async () => {
    // Trim the search term and check if it's not empty
    const word = searchTerm.trim();
    if (!word) {
      toast.error('Please enter a word');
      return;
    }

    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`
      );

      const fetchedDefinition = {
        word: response.data[0].word,
        phonetic: response.data[0].phonetic || '/not found/',
        meanings: response.data[0].meanings.map(meaning => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions: meaning.definitions.map(def => def.definition),
          synonyms: meaning.synonyms || [],
          antonyms: meaning.antonyms || []
        })),
        timestamp: new Date().toLocaleTimeString()
      };

      setSearchHistory((prev) => [fetchedDefinition, ...prev]);
      setSearchTerm(''); // Clear the input after successful search
    } catch (error) {
      toast.error('Word not found');
      console.error(error);
    }
  };

  return (
    <ServiceContainer >
      <Toaster />
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        { searchHistory.map((entry, index) => (
          <motion.div
            key={ `${entry.word}-${index}` }
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            className={ `p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-sm` }
          >
            <div className="flex items-baseline justify-between mb-2">
              <h3 className={ `text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}` }>
                { entry.word }
              </h3>
              { entry.phonetic && (
                <span className="text-purple-500 text-sm">
                  { entry.phonetic }
                </span>
              ) }
            </div>

            { entry.meanings.map((meaning, idx) => (
              <div key={ idx } className="mt-4">
                <div className={ `text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                  { meaning.partOfSpeech }
                </div>
                <ul className="list-disc list-inside space-y-2">
                  { meaning.definitions.map((def, defIdx) => (
                    <li key={ defIdx } className={ isDark ? 'text-gray-300' : 'text-gray-700' }>
                      { def }
                    </li>
                  )) }
                </ul>
                { meaning.synonyms && meaning.synonyms.length > 0 && (
                  <div className="mt-2">
                    <span className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                      Synonyms:{ ' ' }
                    </span>
                    <span className="text-purple-500">
                      { meaning.synonyms.join(', ') }
                    </span>
                  </div>
                ) }
              </div>
            )) }
            <div className="mt-4 text-sm text-gray-500">{ entry.timestamp }</div>
          </motion.div>
        )) }

        { searchHistory.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BookOpen size={ 48 } className="mx-auto mb-2" />
              <p>Enter a word to look up its definition</p>
            </div>
          </div>
        ) }
      </div>

      <div className="flex items-center space-x-2">
        <Input
          value={ searchTerm }
          onChange={ (e) => setSearchTerm(e.target.value) }
          onKeyDown={ (e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          } }
          placeholder="Enter a word to look up..."
          className="flex-1"
        />
        <button
          onClick={ handleSearch }
          className={ `
            p-2 rounded-lg 
            ${isDark
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'}
          `}
        >
          <Send size={ 20 } />
        </button>
      </div>
    </ServiceContainer>
  );
};