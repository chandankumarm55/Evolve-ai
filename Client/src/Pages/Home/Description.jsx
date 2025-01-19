import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import laptop from './laptop.webp'
const Description = () => {
    const [scrollY, setScrollY] = useState(0);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const heroTexts = ["WHY SETTLE FOR", "ORDINARY WHEN", "YOU CAN EVOLVE?"];

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center relative">
            {/* Background gradient remains unchanged */ }
            <div
                className="absolute inset-0 opacity-10 dark:opacity-20 transition-opacity duration-1000"
                style={ {
                    opacity: Math.min(scrollY / 1000, 0.5),
                } }
            />

            {/* Main content */ }
            <div className="w-full flex flex-col items-center text-center px-4 sm:px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl sm:max-w-5xl md:max-w-7xl">
                    { heroTexts.map((text, index) => (
                        <div
                            key={ index }
                            className="group relative mb-4 sm:mb-6 md:mb-8 transition-all duration-500 ease-out hover:scale-105"
                            style={ {
                                transform: `translateX(${Math.max(-scrollY * 0.1, -50)}px) translateY(${Math.min(scrollY * 0.05, 25)}px)`,
                                opacity: Math.max(1 - scrollY * 0.0008 * (index + 1), 0.2),
                            } }
                        >
                            <h1
                                className={ `text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-tight ${isDark ? "text-white" : "text-black"
                                    } transition-colors duration-500 transform hover:translate-x-2 sm:hover:translate-x-4` }
                            >
                                { text }
                            </h1>

                            {/* Decorative line */ }
                            <div className="w-0 h-1 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:w-full" />
                        </div>
                    )) }
                </div>
            </div>

            {/* Scroll indicator */ }
            <div className="fixed bottom-8 right-4 sm:right-8 w-12 h-12 flex items-center justify-center">
                <div className={ `relative w-10 h-10 rounded-full border-2 ${isDark ? "border-white/20" : "border-black/20"}` }>
                    <div
                        className={ `absolute bottom-0 left-0 w-full rounded-full ${isDark ? "bg-white" : "bg-black"}` }
                        style={ {
                            height: `${(scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%`,
                            transition: "height 0.3s ease-out",
                        } }
                    />
                </div>
            </div>
        </div>
    );
};

export default Description;
