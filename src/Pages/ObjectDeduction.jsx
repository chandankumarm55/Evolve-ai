import { load } from '@tensorflow-models/coco-ssd';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { renderPredictions } from '../utils/renderPredictions';
import * as tf from '@tensorflow/tfjs';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'


const Object = () => {
    const [isWebcamActive, setIsWebcamActive] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    let detectInterval;

    const runCoco = async () => {
        setLoading(true);
        const net = await load();
        setLoading(false);

        detectInterval = setInterval(() => {
            runObjectDetection(net);
        }, 10);
    };

    const runObjectDetection = async (net) => {
        if (canvasRef.current && webcamRef.current !== null && webcamRef.current.video?.readyState === 4) {
            canvasRef.current.width = webcamRef.current.video.videoWidth;
            canvasRef.current.height = webcamRef.current.video.videoHeight;

            const detectedObjects = await net.detect(webcamRef.current.video, undefined, 0.8);
            console.log(detectedObjects);

            const context = canvasRef.current.getContext('2d');
            renderPredictions(detectedObjects, context);
        }
    };

    const showMyVideo = () => {
        if (webcamRef.current !== null && webcamRef.current.video?.readyState === 4) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    useEffect(() => {
        runCoco();
        showMyVideo();
    }, []);

    const toggleWebcam = () => {
        setIsWebcamActive(!isWebcamActive);

        // If webcam is stopped, clear the canvas
        if (!isWebcamActive && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    return (
        <div className='object-container'>
            <div className="row mb-5">
                <div className="col-auto d-flex align-items-center">
                    <Link to='/explore'>
                        <FaArrowLeft style={ { marginRight: '10px' } } size={ 25 } />
                    </Link>

                    <h3 className="mb-0">Object-Deduction-AI</h3>
                </div>
            </div>
            { isLoading ? (
                <div className='loading-text' >Loading</div>
            ) : (
                <div>
                    <div className="webcam-container">
                        { isWebcamActive ? (
                            <Webcam className='webcam' ref={ webcamRef } />
                        ) : (
                            <div className='webcam-stoped'>Webcam stopped <span>Please Turn-ON</span></div>
                        ) }
                    </div>

                    <canvas
                        ref={ canvasRef }
                        className='canvas'
                        style={ { display: isWebcamActive ? 'block' : 'none' } }
                    />
                    <div className='stop'>
                        <button onClick={ toggleWebcam }>
                            { isWebcamActive ? 'Turn-OFF' : 'Turn-ON' }
                        </button>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default Object;
