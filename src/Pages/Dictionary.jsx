import { useState } from "react";
import Axios from "axios";
import toast from 'react-hot-toast'
import { FaSearch } from "react-icons/fa";
import { FcSpeaker } from "react-icons/fc";
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from "react-router-dom";

function Dictionary() {
    const [data, setData] = useState("");
    const [searchWord, setSearchWord] = useState("");
    const [audioError, setAudioError] = useState(false);
    const [noWordError, setNoWordError] = useState(false);

    async function getMeaning() {
        setData('')
        try {
            const response = await Axios.get(
                `https://api.dictionaryapi.dev/api/v2/entries/en_US/${searchWord}`
            );

            if (response.data.length === 0) {
                setNoWordError(true);
            } else {
                setData(response.data[0]);
                setAudioError(false);
                setNoWordError(false);
                console.log(data)
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setNoWordError(true);
        }
    }
    const playAudio = () => {
        console.log('aduio')
        if (data && data.phonetics && data.phonetics.length >= 2) {
            let audioUrl = data.phonetics[1].audio;
            console.log(audioUrl)
            if (audioUrl) {
                let audio = new Audio(audioUrl);
                audio.onerror = () => {
                    setAudioError(true);
                };
                audio.play();
            } else {
                toast.error('Sorry faild to load audio')
            }
        }
    }




    return (
        <div className="container mt-1">
            <div className="d-flex align-items-center mb-3">
                <Link to='/'>
                    <div>
                        <FaArrowLeft size={ 24 } />
                    </div>
                </Link>

                <div style={ { marginLeft: '5px' } }>
                    <h3 className="m-0">Dictionary</h3>
                </div>
            </div>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    onChange={ (e) => setSearchWord(e.target.value) }
                />
                <button
                    className="btn btn-outline-success"
                    type="button"
                    onClick={ () => {
                        getMeaning();
                    } }
                >
                    <FaSearch size="20px" />
                </button>
            </div>
            { data && (
                <div className="showResults">
                    <h2>
                        { data.word }
                        { " " }
                        <button
                            className="btn btn-link"
                            onClick={ playAudio }
                        >
                            <FcSpeaker size="26px" />
                        </button>
                    </h2>
                    <h4>Parts of speech:</h4>
                    <p>{ data.meanings[0].partOfSpeech }</p>
                    <h4>Definition:</h4>
                    <p>{ data.meanings[0].definitions[0].definition }</p>
                    <h4>Example:</h4>
                    <p>{ data.meanings[0].definitions[0].example ? data.meanings[0].definitions[0].example : 'no example generated' }</p>
                </div>
            ) }
            { noWordError && (
                <p className="text-danger">No such word exists</p>
            ) }

        </div>
    );
}

export default Dictionary;
