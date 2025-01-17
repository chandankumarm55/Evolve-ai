import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Description = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Intersection Observer for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe animated elements
        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className={ `min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 lg:p-16 gap-5 lg:gap-16 
            ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
            transition-colors duration-500 ease-in-out`}>

            {/* Left side - Big Text */ }
            <div className="w-full lg:w-1/2 space-y-4 animate-on-scroll opacity-0 translate-y-10 
                transition-all duration-1000 ease-out">
                { ['WHY SETTLE FOR', 'ORDINARY WHEN', 'YOU CAN EVOVLE?'].map((text, index) => (
                    <h1 key={ index }
                        className="text-4xl md:text-5xl lg:text-7xl font-black 
                        tracking-tight leading-tight
                        hover:scale-105 transition-transform duration-300
                        ">
                        { text }
                    </h1>
                )) }
            </div>



            <style jsx>{ `
                .animate-on-scroll {
                    transform: translateY(40px);
                    opacity: 0;
                }
                .animate-on-scroll.show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default Description;