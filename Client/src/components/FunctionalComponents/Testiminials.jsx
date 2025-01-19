import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

const Testimonials = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [currentIndex, setCurrentIndex] = useState(1);

    const testimonials = [
        {
            id: 0,
            name: "Sarah Chen",
            role: "Content Creator",
            image: "https://www.jibyte.com/testimonialAvatar/202306020840avatar-3.jpg",
            quote: "Using this AI tool has completely transformed how I create content. The results are consistently impressive!"
        },
        {
            id: 1,
            name: "Eric Sanchez",
            role: "UX Designer",
            image: "https://www.jibyte.com/testimonialAvatar/202306020840avatar-2.jpg",
            quote: "The customer support team has been incredibly helpful whenever I've had any questions. I can't imagine going back to my old content-creation methods!"
        },
        {
            id: 2,
            name: "Maria Rodriguez",
            role: "Marketing Director",
            image: "https://www.jibyte.com/testimonialAvatar/202306020840avatar-1.jpg",
            quote: "This platform has streamlined our entire content generation process. The multi-lingual support is a game-changer."
        }
    ];

    const handlePrevious = () => {
        setCurrentIndex(current =>
            current === 0 ? testimonials.length - 1 : current - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex(current =>
            current === testimonials.length - 1 ? 0 : current + 1
        );
    };

    const getPreviousIndex = () => {
        return currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    };

    const getNextIndex = () => {
        return currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
    };

    return (
        <div className={ `py-16 ${isDark ? 'bg-background' : 'bg-gray-50'}` }>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Badge with gradient */ }
                <div className="flex justify-center mb-5">
                    <div className={ `inline-flex items-center px-2 py-1 rounded-full ${isDark
                        ? 'bg-gradient-to-r from-purple-900/50 to-purple-600/50 border border-purple-500/20'
                        : 'bg-gradient-to-r from-purple-100 to-purple-200'
                        }` }>
                        <span className={ `font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}` }>
                            Testimonials
                        </span>
                        <span className={ `ml-2 ${isDark ? 'text-purple-300/70' : 'text-purple-600/70'}` }>
                            • Trustpilot
                        </span>
                    </div>
                </div>

                <h2 className={ `text-5xl font-bold text-center mb-10 ${isDark ? 'text-white' : 'text-gray-900'
                    }` }>
                    Trusted by thousands.
                </h2>

                <div className="relative max-w-4xl mx-auto">
                    {/* Navigation Buttons */ }
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between z-10">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={ handlePrevious }
                            className={ `rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                                }` }
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={ handleNext }
                            className={ `rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                                }` }
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Circular Avatar Layout */ }
                    <div className="relative flex justify-center items-center mb-6 h-24">
                        {/* Previous Avatar */ }
                        <div className="absolute left-1/2 -translate-x-32 transform scale-75 opacity-50 transition-all duration-300">
                            <img
                                src={ testimonials[getPreviousIndex()].image }
                                alt={ testimonials[getPreviousIndex()].name }
                                className="w-16 h-16 rounded-full object-cover border-2 border-white"
                            />
                        </div>

                        {/* Current Avatar */ }
                        <div className="transform scale-100 z-10 transition-all duration-300">
                            <img
                                src={ testimonials[currentIndex].image }
                                alt={ testimonials[currentIndex].name }
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        </div>

                        {/* Next Avatar */ }
                        <div className="absolute left-1/2 translate-x-16 transform scale-75 opacity-50 transition-all duration-300">
                            <img
                                src={ testimonials[getNextIndex()].image }
                                alt={ testimonials[getNextIndex()].name }
                                className="w-16 h-16 rounded-full object-cover border-2 border-white"
                            />
                        </div>
                    </div>

                    {/* Testimonial Content */ }
                    <div className="text-center">
                        <h3 className={ `text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'
                            }` }>
                            { testimonials[currentIndex].name }
                        </h3>
                        <p className={ `text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }` }>
                            { testimonials[currentIndex].role }
                        </p>
                        <p className={ `text-2xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }` }>
                            "{ testimonials[currentIndex].quote }"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;