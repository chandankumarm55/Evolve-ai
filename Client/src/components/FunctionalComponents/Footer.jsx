import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation

const Footer = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <footer className={ `py-10 ${isDark ? 'bg-black text-gray-400' : 'bg-white text-gray-700'}` }>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Footer Navigation Links */ }
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 ">
                    {/* Features Section */ }
                    <div>
                        <h3 className={ `text-lg font-semibold  ${isDark ? 'text-white' : 'text-gray-900'}` }>
                            Features
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/image-generation" className="hover:text-blue-500 transition-colors">
                                    Image Generation
                                </Link>
                            </li>
                            <li>
                                <Link to="/text-to-speech" className="hover:text-blue-500 transition-colors">
                                    Text-to-Speech
                                </Link>
                            </li>
                            <li>
                                <Link to="/conversion-ai" className="hover:text-blue-500 transition-colors">
                                    Conversion AI
                                </Link>
                            </li>
                            <li>
                                <Link to="/task-management" className="hover:text-blue-500 transition-colors">
                                    Task Management
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Section */ }
                    <div>
                        <h3 className={ `text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}` }>
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/terms-and-conditions" className="hover:text-blue-500 transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className="hover:text-blue-500 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="hover:text-blue-500 transition-colors">
                                    Refund & Cancellation Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */ }
                    <div>
                        <h3 className={ `text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}` }>
                            Contact Us
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:support@evolveai.com" className="hover:text-blue-500 transition-colors">
                                    support@evolveai.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+1234567890" className="hover:text-blue-500 transition-colors">
                                    +1 (234) 567-890
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Section */ }
                    <div>
                        <h3 className={ `text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}` }>
                            Follow Us
                        </h3>
                        <div className="flex space-x-4">
                            <a href="https://twitter.com/evolveai" className="hover:text-blue-500 transition-colors">
                                Twitter
                            </a>
                            <a href="https://linkedin.com/company/evolveai" className="hover:text-blue-500 transition-colors">
                                LinkedIn
                            </a>
                            <a href="https://github.com/evolveai" className="hover:text-blue-500 transition-colors">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */ }
                <div className="border-t pt-8 text-center">
                    <p className={ `text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}` }>
                        &copy; { new Date().getFullYear() } Evolve AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;