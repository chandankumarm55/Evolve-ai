// Explore.js
import React from 'react';
import { Link } from 'react-router-dom';
import { CiChat1 } from "react-icons/ci";
import { IoImageOutline } from "react-icons/io5";
import { AiOutlineTranslation } from "react-icons/ai";
import { SlSpeech } from "react-icons/sl";
import { TbBrandApplePodcast } from "react-icons/tb";
import { VscBook } from "react-icons/vsc";
import { GiCardJoker } from "react-icons/gi";
import Footer from '../components/Footer';

const Explore = () => {
    return (
        <div className="explore-container">
            <h2 className='mb-4'>Services Available</h2>
            <div className="services-grid">

                <Link to='/chatboat' className='service-link'>
                    <div className='service-item'>
                        <CiChat1 />
                        <p>Conversation</p>
                    </div>
                </Link>

                <Link to='/imagegeneration' className='service-link'>
                    <div className='service-item'>
                        <IoImageOutline />
                        <p>Image Generation</p>
                    </div>
                </Link>
                <Link to='/languagetransalation' className='service-link'>
                    <div className='service-item'>
                        <AiOutlineTranslation />
                        <p> Language Translation</p>
                    </div>
                </Link>
                <Link to='/texttospeech' className='service-link'>
                    <div className='service-item'>
                        <SlSpeech />
                        <p>Text to Speech</p>
                    </div>
                </Link>
                <Link to='/objectdeduction' className='service-link'>
                    <div className='service-item'>
                        <TbBrandApplePodcast />
                        <p>Object Deduction</p>
                    </div>
                </Link>
                <Link to='/dictionary' className='service-link'>
                    <div className='service-item'>
                        <VscBook />
                        <p>Dictionary AI</p>
                    </div>
                </Link>
                <Link to='/jokegenerator' className='service-link'>
                    <div className='service-item'>
                        <GiCardJoker />
                        <p>Joke Generator</p>
                    </div>
                </Link>
            </div>
            <Footer />
        </div>
    );
}

export default Explore;
