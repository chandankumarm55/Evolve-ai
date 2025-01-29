import React, { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { InputBox } from '../../components/ui/InputBox';
import { motion } from 'framer-motion';
import { Smile, Loader2, Search, List } from 'lucide-react';
import { TbArrowsRandom } from "react-icons/tb";

const JokeGenerator = () => {
    const [jokes, setJokes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('random');
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
            <div className="flex flex-col space-y-4 p-4">
                <div className="flex justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <button
                        onClick={ () => {
                            setMode('random');
                            setJokes([]);
                        } }
                        className={ `flex items-center px-6 py-3 rounded-lg transition-all ${mode === 'random'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }` }
                    >
                        <TbArrowsRandom className="w-5 h-5 mr-2" />
                        Random Joke
                    </button>
                    <button
                        onClick={ () => {
                            setMode('search');
                            setJokes([]);
                        } }
                        className={ `flex items-center px-6 py-3 rounded-lg transition-all ${mode === 'search'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }` }
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Search Jokes
                    </button>
                    <button
                        onClick={ () => {
                            setMode('slack');
                            setJokes([]);
                        } }
                        className={ `flex items-center px-6 py-3 rounded-lg transition-all ${mode === 'slack'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }` }
                    >
                        <List className="w-5 h-5 mr-2" />
                        Slack Style
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    { mode === 'search' && (
                        <div className="text-center text-sm text-gray-600">
                            Search through our collection of dad jokes!
                        </div>
                    ) }

                    { mode === 'random' && (
                        <div className="text-center">
                            <button
                                onClick={ () => handleGenerateJoke() }
                                disabled={ isLoading }
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                            >
                                Generate Random Joke
                            </button>
                        </div>
                    ) }

                    { mode === 'slack' && (
                        <div className="text-center">
                            <button
                                onClick={ () => handleGenerateJoke() }
                                disabled={ isLoading }
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                            >
                                Get Slack Joke
                            </button>
                        </div>
                    ) }

                    { jokes.map((joke, index) => (
                        <motion.div
                            key={ joke.id || index }
                            initial={ { opacity: 0, y: 20 } }
                            animate={ { opacity: 1, y: 0 } }
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                        >
                            <p className="text-lg font-medium text-gray-800">{ joke.setup }</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-gray-500">{ joke.timestamp }</span>
                                <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                                    { joke.type }
                                </span>
                            </div>
                        </motion.div>
                    )) }

                    { mode === 'search' && jokes.length > 0 && totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-4">
                            { Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={ pageNum }
                                    onClick={ () => handlePageChange(pageNum) }
                                    className={ `px-3 py-1 rounded ${page === pageNum
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                        }` }
                                >
                                    { pageNum }
                                </button>
                            )) }
                        </div>
                    ) }

                    { jokes.length === 0 && !isLoading && !error && (
                        <div className="h-48 flex items-center justify-center text-gray-400">
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

                    { isLoading && (
                        <div className="h-48 flex items-center justify-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) }

                    { error && (
                        <div className="text-amber-600 text-sm text-center p-4 bg-amber-50 rounded-lg">
                            { error }
                        </div>
                    ) }
                </div>

                { mode === 'search' && (
                    <InputBox
                        onSubmit={ handleGenerateJoke }
                        placeholder="Enter a topic to search for jokes..."
                        disabled={ isLoading }
                    />
                ) }
            </div>
        </ServiceContainer>
    );
};

export default JokeGenerator;