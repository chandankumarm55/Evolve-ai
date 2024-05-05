import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import { useAuth } from '@clerk/clerk-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { SiTheconversation } from "react-icons/si";
import { FaArrowRight } from "react-icons/fa6";
import { IoImageOutline } from "react-icons/io5";
import { SlSpeech } from "react-icons/sl";
import { AiOutlineTranslation } from "react-icons/ai";
import { TbBrandApplePodcast } from "react-icons/tb";
import { CiChat1 } from "react-icons/ci";
import { FiArrowRight } from "react-icons/fi";
import Footer from '../components/Footer';
import { VscBook } from "react-icons/vsc";

export default function IndexPage() {
    const { userId, isLoaded } = useAuth();
    const navigate = useNavigate();
    const typedRef = useRef(null);

    useEffect(() => {

        const options = {
            strings: ['Welcome to Genius AI...', 'Unleash the Power of AI...'],
            typeSpeed: 200,
            backSpeed: 150,
            loop: true,
            loopCount: Infinity,
            backDelay: 10,
            showCursor: false,
        };
        const typed = new Typed(typedRef.current, options);

        return () => {
            typed.destroy();
        };
    }, []);

    const handleExploreClick = () => {
        navigate('/explore');
    };

    return (
        <div className="index-container">
            <div>
                <script type="module" src="https://unpkg.com/@splinetool/viewer@1.1.9/build/spline-viewer.js"></script>
                <spline-viewer style={ { height: '500px' } } url="https://prod.spline.design/IEaXrSFtMtxiOQua/scene.splinecode"></spline-viewer>
            </div>
            <div className="typing-container float-left " style={ { minHeight: '50px' } }>
                <h1 className="type" ref={ typedRef }></h1>
            </div>
            <div className="content-container">
                <p className="lead">Genius AI is your ultimate platform to explore the amazing world of artificial intelligence. Discover innovative solutions, unleash your creativity, and revolutionize industries with AI.</p>
            </div>
            <div className='service'>
                <div className='title'>Service Available</div>
                <Link to='/chatboat'>
                    <div className='service-item'>
                        <div>
                            < CiChat1 />
                            <p>Conversation</p>
                        </div>
                        <FiArrowRight className='arrow' />
                    </div>
                </Link>

                <Link to='/imagegeneration'>
                    <div className='service-item'>
                        <div>
                            <IoImageOutline />
                            <p>Image Generation</p>
                        </div>
                        <FiArrowRight className='arrow' />
                    </div>
                </Link>
                <Link to='/languagetransalation'>
                    <div className='service-item'>
                        <div>
                            <AiOutlineTranslation />
                            <p>Language Translation</p>
                        </div>
                        <FiArrowRight className='arrow' />
                    </div>
                </Link>

                <Link to='/texttospeech'>
                    <div className='service-item'>
                        <div>
                            <SlSpeech />
                            <p>Text to Speech</p>
                        </div>
                        <FiArrowRight className='arrow' />
                    </div>
                </Link>
                <Link to='objectdeduction'>
                    <div className='service-item'>
                        <div>
                            <TbBrandApplePodcast />
                            <p>Object Deduction</p>
                        </div>
                        <FiArrowRight className='arrow' />
                    </div>
                </Link>
                <Link to='dictionary'>
                    <div className='service-item'>
                        <div>
                            <VscBook />
                            <p>Dictionary Ai</p>
                        </div>
                        <FiArrowRight className='arrow' />
                    </div>
                </Link>

            </div>
            <Footer />

        </div>
    );
}
