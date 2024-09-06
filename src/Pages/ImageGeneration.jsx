import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import ImageBox from '../components/ImageBox';
import RecentResults from '../components/RecentResults';
import { getRandom, loaderMessages, promptIdeas } from '../utils/Prompt';
import { fetchImages } from '../api/imageapi';
import { Link } from 'react-router-dom';

const ImageGeneration = () => {
    const [showLoader, setShowLoader] = useState(false);
    const [imageResult, setImageResult] = useState(null);
    const [promptQuery, setPromptQuery] = useState("");
    const [radioValue, setRadioValue] = useState("20");
    const [dropDownValue, setDropDownValue] = useState("DDIM");
    const [seedValue, setSeedValue] = useState(17123564234);
    const [loaderMessage, setLoaderMessage] = useState(loaderMessages[0]);

    useEffect(() => {
        const loaderInterval = setInterval(() => {
            setLoaderMessage(getRandom(loaderMessages));
        }, 3000);

        return () => {
            clearInterval(loaderInterval);
        }
    }, [loaderMessage])

    const handleGenerate = (e) => {
        e.preventDefault();
        fetchData();
    }

    const fetchData = async () => {
        try {
            setShowLoader(true);
            const imageBlog = await fetchImages(
                promptQuery, seedValue, dropDownValue, radioValue
            );
            const fileReaderInstance = new FileReader();
            fileReaderInstance.onload = () => {
                let base64data = fileReaderInstance.result;
                setImageResult(base64data)
            }

            fileReaderInstance.readAsDataURL(imageBlog);
            setShowLoader(false);
        } catch (error) {
            console.error('Error in fetching the data ', error);
            setShowLoader(false)
        }
    }

    const handleSurpriseMe = () => {
        const surprisePrompt = getRandom(promptIdeas);
        setPromptQuery(surprisePrompt)
    }

    const handleAvailOptions = (option) => {
        setPromptQuery(option)
    }

    return (
        <div className="container">
            <div className="d-flex align-items-center mb-3">
                <Link to='/explore'>
                    <div>
                        <FaArrowLeft size={ 24 } />
                    </div>
                </Link>

                <div style={ { marginLeft: '5px' } }>
                    <h3 className="m-0">Image-Generating-Ai</h3>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-8 col-12">
                    <input
                        type="text"
                        id="prompt"
                        value={ promptQuery }
                        onChange={ e => setPromptQuery(e.target.value) }
                        placeholder="A plush toy robot sitting against a yellow wall"
                        className="form-control"
                    />
                </div>
                <div className="col-md-4 col-12 d-flex align-items-center justify-content-end">
                    <button onClick={ handleSurpriseMe } className="btn btn-primary ml-2 w-100">Generate Promt</button>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-4">
                    <label>Scheduler</label>
                    <select name="dropdown" value={ dropDownValue } onChange={ e => setDropDownValue(e.target.value) } className="form-select">
                        <option value="Euler">Euler</option>
                        <option value="LMS">LMS</option>
                        <option value="Heun">Heun</option>
                        <option value="DDPM">DDPM</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label>Steps</label>
                    <div>
                        <div className="form-check form-check-inline">
                            <input
                                type="radio"
                                name="radio"
                                value="20"
                                checked={ radioValue === "20" }
                                onChange={ e => setRadioValue(e.target.value) }
                                className="form-check-input"
                            />
                            <label className="form-check-label">20</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                type="radio"
                                name="radio"
                                value="30"
                                checked={ radioValue === "30" }
                                onChange={ e => setRadioValue(e.target.value) }
                                className="form-check-input"
                            />
                            <label className="form-check-label">30</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                type="radio"
                                name="radio"
                                value="50"
                                checked={ radioValue === "50" }
                                onChange={ e => setRadioValue(e.target.value) }
                                className="form-check-input"
                            />
                            <label className="form-check-label">50</label>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <label>Seed</label>
                    <input
                        type="number"
                        name="input"
                        value={ seedValue }
                        onChange={ e => setSeedValue(e.target.value) }
                        className="form-control"
                    />
                </div>
            </div>
            <div className="d-flex justify-content-center mb-3">
                <button onClick={ handleGenerate } className="btn btn-success w-100">Generate</button>
            </div>
            { showLoader ? (
                <div className="text-center">Blazing fast results... ⚡️⚡️⚡️</div>
            ) : (
                <ImageBox promptQuery={ promptQuery } imageResult={ imageResult } />
            ) }
            <RecentResults
                promptQuery={ promptQuery }
                imageResult={ imageResult }
                onSelect={ handleAvailOptions }
            />
        </div>
    )
}

export default ImageGeneration;
