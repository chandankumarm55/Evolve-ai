import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom';

const TextToSpeech = () => {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [rate, setRate] = useState(0.5);
    const [pitch, setPitch] = useState(0.5);
    const [text, setText] = useState('');
    const synth = window.speechSynthesis;
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [resume, setResume] = useState('Pause');

    useEffect(() => {
        const getVoices = () => {
            const synthVoices = synth.getVoices();
            setVoices(synthVoices);
            setSelectedVoice(synthVoices[0]?.name || '');
        };

        synth.onvoiceschanged = getVoices;
        getVoices();
    }, []);

    const speak = () => {
        if (synth.speaking) {
            return;
        }

        if (text.trim() !== '') {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voices.find(voice => voice.name === selectedVoice);
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.onend = () => {
                setIsSpeaking(false);
            };
            synth.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const stopSpeaking = () => {
        synth.cancel();
        setIsSpeaking(false);
    };

    const pauseResumeSpeaking = () => {
        if (synth.paused) {
            synth.resume();
            setResume('Pause');
            setIsSpeaking(true);
        } else {
            synth.pause();
            setResume('Resume');
            setIsSpeaking(false);
        }
    };

    return (
        <div className="container text-center mt-5">
            <div className="row">
                <div className="col-auto d-flex align-items-center">
                    <Link to='/'>
                        <FaArrowLeft style={ { marginRight: '10px' } } />
                    </Link>

                    <h3 className="mb-0">Text-to-Speech Conversion</h3>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="form-group">
                        <div id="front-text" className="text-success">

                        </div>
                        <textarea
                            className="form-control form-control-lg mt-3"
                            placeholder="Enter the text..."
                            value={ text }
                            onChange={ e => setText(e.target.value) }
                            rows="6"
                        />
                    </div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-lg-8 mx-auto">
                    <div className="form-group d-flex justify-content-between">
                        <label htmlFor="rate">Rate</label>
                        <div className="badge badge-primary">{ (rate * 10).toFixed(1) }</div>
                        <input
                            className="custom-range flex-grow-1 ml-2"
                            type="range"
                            id="rate"
                            max="1"
                            min="0.2"
                            value={ rate }
                            step="0.1"
                            onChange={ e => setRate(parseFloat(e.target.value)) }
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="form-group d-flex justify-content-between">
                        <label htmlFor="pitch">Pitch</label>
                        <div className="badge badge-primary">{ (pitch * 10).toFixed(1) }</div>
                        <input
                            className="custom-range flex-grow-1 ml-2"
                            type="range"
                            id="pitch"
                            max="1"
                            min="0.2"
                            value={ pitch }
                            step="0.1"
                            onChange={ e => setPitch(parseFloat(e.target.value)) }
                        />
                    </div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-lg-8 mx-auto">
                    <div className="form-group d-flex justify-content-between">
                        <select
                            className="form-control form-control-lg flex-grow-1 mr-2"
                            onChange={ e => setSelectedVoice(e.target.value) }
                            value={ selectedVoice }
                        >
                            { voices.map((voice, index) => (
                                <option key={ index } value={ voice.name }>
                                    { `${voice.name} (${voice.lang})` }
                                </option>
                            )) }
                        </select>
                        <button className="btn btn-success btn-lg" onClick={ speak }>
                            { isSpeaking ? 'Speaking' : 'Speak' }
                        </button>
                        <button className="btn btn-danger btn-lg ml-2" onClick={ stopSpeaking }>
                            Stop
                        </button>
                        <button className="btn btn-primary btn-lg ml-2" onClick={ pauseResumeSpeaking }>
                            { resume }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSpeech;
