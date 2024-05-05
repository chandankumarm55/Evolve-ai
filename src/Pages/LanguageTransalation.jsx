import React, { useState } from 'react';
import languageList from '../components/language.json';
import axios from 'axios';
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";
import { MdClear } from "react-icons/md";
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Translator() {
    const [inputFormat, setInputFormat] = useState('en');
    const [outputFormat, setOutputFormat] = useState('hi');
    const [translatedText, setTranslatedText] = useState('Translation');
    const [inputText, setInputText] = useState('');

    const handleReverseLanguage = () => {
        const value = inputFormat;
        setInputFormat(outputFormat);
        setOutputFormat(value);
        setInputText('');
        setTranslatedText('Translation');
    };

    const handleRemoveInputText = () => {
        setInputText('');
        setTranslatedText('Translation');
    };

    const handleTranslate = async () => {
        if (!inputText || !inputFormat || !outputFormat) return;



        const encodedParams = new URLSearchParams();
        encodedParams.set('q', inputText);
        encodedParams.set('source', inputFormat);
        encodedParams.set('target', outputFormat);

        const options = {
            method: 'POST',
            url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'application/gzip',
                'X-RapidAPI-Key': '44c7486fb9msh67b5612b445825ap15220ajsn62dcc09c8634',
                'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
            },
            data: encodedParams
        };

        try {
            const response = await axios.request(options);
            console.log(response.data);
            const translation = response.data.data.translations[0].translatedText;
            setTranslatedText(translation);
        } catch (error) {
            console.error(error);
            alert("Please Try Again! Some Error Occurred at your side");
        }


    };

    return (
        <div className="container">
            <div className="d-flex align-items-center mb-3">
                <Link to='/'>
                    <div>
                        <FaArrowLeft size={ 24 } />
                    </div>
                </Link>

                <div style={ { marginLeft: '5px' } }>
                    <h3 className="m-0">Language Translation Ai</h3>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <select className="form-select" value={ inputFormat } onChange={ (e) => setInputFormat(e.target.value) }>
                        { Object.keys(languageList).map((key, index) => {
                            const language = languageList[key];
                            return (
                                <option key={ index } value={ key }>{ language.name }</option>
                            );
                        }) }
                    </select>
                </div>
                <div className="col-auto">
                    <button className="btn btn-outline-primary" onClick={ handleReverseLanguage }>
                        < HiOutlineArrowsRightLeft size={ 25 } />
                    </button>
                </div>
                <div className="col">
                    <select className="form-select" value={ outputFormat } onChange={ (e) => {
                        setOutputFormat(e.target.value);
                        setTranslatedText('Translation');
                    } }>
                        { Object.keys(languageList).map((key, index) => {
                            const language = languageList[key];
                            return (
                                <option key={ index + 118 } value={ key }>{ language.name }</option>
                            );
                        }) }
                    </select>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col">
                    <div className="input-group">
                        <span className="input-group-text">
                            <button className="btn btn-outline-secondary" type="button" onClick={ handleRemoveInputText }>
                                < MdClear siz />
                            </button>
                        </span>
                        <textarea className="form-control" rows="3" value={ inputText } placeholder="Enter Text" onChange={ (e) => setInputText(e.target.value) } />
                    </div>
                </div>
                <div className="col rounded border border-2">
                    <div className="outputText">{ translatedText }</div>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col d-flex justify-content-center">
                    <button className="btn btn-primary" onClick={ handleTranslate }>
                        <span className="translate text-black">Translate</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
