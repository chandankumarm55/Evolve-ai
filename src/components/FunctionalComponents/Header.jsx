import React from 'react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { Button } from '../ui/button';
import './Header.css';

const Header = () => {
    return (
        <div className="header-container px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Logo Section */ }
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Evolve AI
                </span>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link to="/dashboard">
                    <Button className="animated-button flex items-center gap-2 font-bold">
                        Get Started
                        <FaArrowRight />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Header;
