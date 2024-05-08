import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'

const JokesComponent = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [joke, setJoke] = useState('');
    const [copied, setCopied] = useState(false); // State variable to track copy action

    useEffect(() => {
        const fetchCategories = async () => {
            const options = {
                method: 'GET',
                url: 'https://world-of-jokes1.p.rapidapi.com/v1/jokes/categories',
                headers: {
                    'X-RapidAPI-Key': '72eaea21a0mshcc4f026952e3257p157a72jsn26424341a589',
                    'X-RapidAPI-Host': 'world-of-jokes1.p.rapidapi.com'
                }
            };

            try {
                const response = await axios.request(options);
                setCategories(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchCategories();
    }, []);

    const fetchJokeByCategory = async (category) => {
        const options = {
            method: 'GET',
            url: 'https://world-of-jokes1.p.rapidapi.com/v1/jokes/random-joke-by-category',
            params: {
                category: category
            },
            headers: {
                'X-RapidAPI-Key': '72eaea21a0mshcc4f026952e3257p157a72jsn26424341a589',
                'X-RapidAPI-Host': 'world-of-jokes1.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            setJoke(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        fetchJokeByCategory(event.target.value);
    };

    const handleCopyJoke = () => {
        navigator.clipboard.writeText(joke.body);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const generateRandomJoke = () => {
        fetchJokeByCategory(selectedCategory);
    };

    return (
        <div className="container">
            <div className="d-flex align-items-center mb-3">
                <Link to='/explore'>

                    <FaArrowLeft size={ 24 } />

                </Link>

                <div style={ { marginLeft: '5px' } }>
                    <h3 className="m-0">Joke's Generator </h3>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <select className="form-select" value={ selectedCategory } onChange={ handleCategoryChange }>
                        <option value="">Select a category</option>
                        { categories.map((category, index) => (
                            <option key={ index } value={ category }>{ category }</option>
                        )) }
                    </select>
                </div>
                <div className="col">
                    <button className="btn btn-primary w-100" onClick={ generateRandomJoke }>Generate Joke</button>
                </div>
            </div>

            { joke && (
                <div>
                    <h2 className="mt-4">Random Joke ({ selectedCategory })</h2>
                    <p className='text-justify'>{ joke.body }</p>
                    <button className="btn btn-primary mt-3 me-2" onClick={ handleCopyJoke }>
                        { copied ? 'Copied' : 'Copy Joke' }
                    </button>
                </div>
            ) }
        </div>
    );
};

export default JokesComponent;
