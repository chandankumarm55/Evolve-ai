import React, { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { Input } from '../../components/ui/input';
import { motion } from 'framer-motion';
import { Smile, Loader2, Search, List } from 'lucide-react';
import { TbArrowsRandom } from "react-icons/tb";
import { useTheme } from '../../contexts/ThemeContext';

const JokeGenerator = () => {
    const [jokes, setJokes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('random');
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchRandomJoke = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Joke Generator React App (https://github.com/yourusername/repo)'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch joke');

            const data = await response.json();
            const newJoke = {
                setup: data.joke,
                timestamp: new Date().toLocaleTimeString(),
                id: data.id,
                type: 'random'
            };
            setJokes([newJoke]);
        } catch (err) {
            setError('Failed to fetch joke. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const searchJokes = async (term, currentPage = 1) => {
        if (!term) {
            setError('Please enter a search term');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `https://icanhazdadjoke.com/search?term=${encodeURIComponent(term)}&page=${currentPage}&limit=5`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Joke Generator React App (https://github.com/yourusername/repo)'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to search jokes');

            const data = await response.json();

            if (data.results.length === 0) {
                setError(`No jokes found for "${term}"`);
                setJokes([]);
                return;
            }

            const newJokes = data.results.map(joke => ({
                setup: joke.joke,
                timestamp: new Date().toLocaleTimeString(),
                id: joke.id,
                type: 'search'
            }));

            setJokes(newJokes);
            setTotalPages(data.total_pages);
            setPage(currentPage);
        } catch (err) {
            setError('Failed to search jokes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSlackJoke = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('https://icanhazdadjoke.com/slack', {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Joke Generator React App (https://github.com/yourusername/repo)'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch Slack joke');

            const data = await response.json();
            const newJoke = {
                setup: data.attachments[0].text,
                timestamp: new Date().toLocaleTimeString(),
                id: Date.now(),
                type: 'slack'
            };
            setJokes([newJoke]);
        } catch (err) {
            setError('Failed to fetch Slack joke. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateJoke = async (input) => {
        if (mode === 'search') {
            await searchJokes(input);
        } else if (mode === 'slack') {
            await fetchSlackJoke();
        } else {
            await fetchRandomJoke();
        }
    };

    const handlePageChange = async (newPage) => {
        const lastSearchTerm = jokes[0]?.searchTerm;
        await searchJokes(lastSearchTerm, newPage);
    };

    return (
        <ServiceContainer>
            <div className="flex flex-col h-full">
                {/* Main Content Area - Scrollable */ }
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Mode Selection Buttons */ }
                    <div className={ `flex justify-center space-x-4 p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg` }>
                        { ['random', 'search', 'slack'].map((buttonMode) => (
                            <button
                                key={ buttonMode }
                                onClick={ () => {
                                    setMode(buttonMode);
                                    setJokes([]);
                                } }
                                className={ `flex items-center px-6 py-3 rounded-lg transition-all ${mode === buttonMode
                                    ? isDark
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-indigo-500 text-white shadow-md'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                                    }` }
                            >
                                { buttonMode === 'random' && <TbArrowsRandom className="w-5 h-5 mr-2" /> }
                                { buttonMode === 'search' && <Search className="w-5 h-5 mr-2" /> }
                                { buttonMode === 'slack' && <List className="w-5 h-5 mr-2" /> }
                                { buttonMode.charAt(0).toUpperCase() + buttonMode.slice(1) } Joke
                            </button>
                        )) }
                    </div>

                    <div className="space-y-4">
                        {/* Mode Instructions */ }
                        { mode === 'search' && (
                            <div className={ `text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}` }>
                                Search through our collection of dad jokes!
                            </div>
                        ) }

                        {/* Action Buttons */ }
                        { (mode === 'random' || mode === 'slack') && (
                            <div className="text-center">
                                <button
                                    onClick={ () => handleGenerateJoke() }
                                    disabled={ isLoading }
                                    className={ `px-6 py-3 rounded-lg transition-colors ${isDark
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-800'
                                        : 'bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-indigo-300'
                                        }` }
                                >
                                    { mode === 'random' ? 'Generate Random Joke' : 'Get Slack Joke' }
                                </button>
                            </div>
                        ) }

                        {/* Jokes Display */ }
                        { jokes.map((joke, index) => (
                            <motion.div
                                key={ joke.id || index }
                                initial={ { opacity: 0, y: 20 } }
                                animate={ { opacity: 1, y: 0 } }
                                className={ `rounded-lg p-6 shadow-sm ${isDark
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-white border border-gray-200'
                                    }` }
                            >
                                <p className={ `text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}` }>
                                    { joke.setup }
                                </p>
                                <div className="flex justify-between items-center mt-4">
                                    <span className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                                        { joke.timestamp }
                                    </span>
                                    <span className={ `text-sm px-3 py-1 rounded-full ${isDark
                                        ? 'bg-gray-700 text-gray-300'
                                        : 'bg-gray-100 text-gray-600'
                                        }` }>
                                        { joke.type }
                                    </span>
                                </div>
                            </motion.div>
                        )) }

                        {/* Pagination */ }
                        { mode === 'search' && jokes.length > 0 && totalPages > 1 && (
                            <div className="flex justify-center space-x-2 mt-4">
                                { Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={ pageNum }
                                        onClick={ () => handlePageChange(pageNum) }
                                        className={ `px-3 py-1 rounded transition-colors ${page === pageNum
                                            ? isDark
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-indigo-500 text-white'
                                            : isDark
                                                ? 'bg-gray-700 text-gray-300'
                                                : 'bg-gray-100 text-gray-700'
                                            }` }
                                    >
                                        { pageNum }
                                    </button>
                                )) }
                            </div>
                        ) }

                        {/* Empty State */ }
                        { jokes.length === 0 && !isLoading && !error && (
                            <div className={ `h-48 flex items-center justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}` }>
                                <div className="text-center">
                                    <Smile size={ 48 } className="mx-auto mb-2" />
                                    <p>{
                                        mode === 'search'
                                            ? 'Enter a topic to search for jokes'
                                            : mode === 'slack'
                                                ? 'Click the button to get a Slack-style joke'
                                                : 'Click the button to get a random joke'
                                    }</p>
                                </div>
                            </div>
                        ) }

                        {/* Loading State */ }
                        { isLoading && (
                            <div className={ `h-48 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-400'}` }>
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) }

                        {/* Error State */ }
                        { error && (
                            <div className={ `text-sm text-center p-4 rounded-lg ${isDark
                                ? 'bg-red-900/20 text-red-400'
                                : 'bg-amber-50 text-amber-600'
                                }` }>
                                { error }
                            </div>
                        ) }
                    </div>
                </div>

                {/* Fixed Footer - Always at bottom */ }
                { mode === 'search' && (
                    <div className={ `p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/80'} backdrop-blur-sm border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}` }>
                        <Input
                            onSubmit={ handleGenerateJoke }
                            placeholder="Enter a topic to search for jokes..."
                            disabled={ isLoading }
                            className='bg-transparent'
                        />
                    </div>
                ) }
            </div>
        </ServiceContainer>
    );
};

export default JokeGenerator;