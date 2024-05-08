import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';


export default function IndexPage() {
    const { userId, isLoaded } = useAuth();
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/explore');
    };

    return (
        <div className="container">
            <div className="row index">
                <div className="col-md-6 index">
                    <h1>Welcome to Evolve AI</h1>
                    <p className="lead">Discover the potential of artificial intelligence with Genius AI. From conversational agents to image generation, we've got you covered!</p>
                    <button className="btn btn-primary" onClick={ handleExploreClick }>Explore Now</button>
                </div>
                <div className="col-md-6">
                    <img src="https://assets-global.website-files.com/63430f78ebe0f3228a927f1d/634f2d04942e876da1884259_Coming%20Soon.jpg" alt="AI Illustration" className="img-fluid" />
                </div>
            </div>
            <Footer />
        </div>
    );
}
