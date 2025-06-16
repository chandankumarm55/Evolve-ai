import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent } from "../../components/ui/card";

const DonationPromo = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="flex justify-center">
            <Card className={ `overflow-hidden max-w-5xl w-full` }>
                <CardContent className="p-0">
                    <div className={ `relative p-6 md:p-8 ${isDark ? 'text-white' : 'text-gray-900'}` }>
                        {/* Background decorative elements */ }
                        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                            <Heart className={ `w-32 h-32 opacity-5 ${isDark ? 'text-pink-300' : 'text-pink-500'}` } />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Content section */ }
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                    <Heart className={ `w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-500'}` } />
                                    <h2 className="text-xl font-semibold">Support Our Mission</h2>
                                </div>
                                <p className={ `mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                                    Help us continue to provide cutting-edge AI tools and services. Your support makes a difference in advancing AI technology for everyone.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start text-sm">
                                    <span className={ `px-3 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                                        🚀 Innovation
                                    </span>
                                    <span className={ `px-3 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                                        🌟 Research
                                    </span>
                                    <span className={ `px-3 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                                        💡 Education
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */ }
                            <div className="flex-shrink-0">
                                <button
                                    onClick={ () => navigate('/donate') }
                                    className={ `
                                      px-6 py-3 rounded-lg font-medium transition-all
                                      transform hover:scale-105
                                      ${isDark
                                            ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                            : 'bg-pink-500 hover:bg-pink-600 text-white'
                                        }
                                    `}
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DonationPromo;