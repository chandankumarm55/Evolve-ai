import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import PromptComponent from './PromptComponent';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";

const NeuralBackground = ({ isDark }) => {
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        console.log("Particles loaded", container);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={ particlesInit }
            loaded={ particlesLoaded }
            className="absolute inset-0"
            options={ {
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fullScreen: {
                    enable: false,
                    zIndex: 0
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: isDark ? "#6366f1" : "#818cf8",
                    },
                    links: {
                        color: isDark ? "#6366f1" : "#818cf8",
                        distance: 150,
                        enable: true,
                        opacity: 0.5,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: false,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 80,
                    },
                    opacity: {
                        value: 0.5,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 5 },
                    },
                },
                detectRetina: true,
            } }
        />
    );
};

const TaglineRotator = () => {
    const taglines = [
        "One AI, Endless Possibilities – Evolve AI!",
        "Reshape Tomorrow with AI Today",
        "Where Innovation Meets Intelligence",
        "Transform Your Ideas into Reality"
    ];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % taglines.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-8 overflow-hidden relative">
            <motion.div
                key={ current }
                initial={ { y: 20, opacity: 0 } }
                animate={ { y: 0, opacity: 1 } }
                exit={ { y: -20, opacity: 0 } }
                transition={ { duration: 0.5 } }
                className="absolute w-full"
            >
                { taglines[current] }
            </motion.div>
        </div>
    );
};

const HeroSection = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className={ `
            relative min-h-screen flex items-center justify-center px-4 sm:px-6 
            ${isDark ? 'bg-black' : 'bg-white'}
        `}>
            <NeuralBackground isDark={ isDark } />

            <motion.div
                variants={ containerVariants }
                initial="hidden"
                animate="visible"
                className="w-full max-w-7xl text-center relative z-10"
            >
                <motion.h1
                    variants={ itemVariants }
                    className={ `
                        text-4xl sm:text-5xl md:text-7xl font-bold mb-6 select-none
                        ${isDark ? 'text-white' : 'text-gray-900'}
                    `}
                >
                    Experience the Power of
                    <br />
                    <motion.span
                        className={ `
                            bg-gradient-to-r bg-clip-text text-transparent select-none
                            ${isDark
                                ? 'from-purple-400 via-blue-400 to-purple-400'
                                : 'from-purple-600 via-blue-600 to-purple-600'}
                        `}
                        animate={ {
                            backgroundPosition: ["0%", "100%", "0%"],
                        } }
                        transition={ {
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        } }
                    >
                        Evolve AI
                    </motion.span>
                </motion.h1>

                <motion.p
                    variants={ itemVariants }
                    className={ `
                        text-xl sm:text-2xl mb-12 max-w-2xl mx-auto select-none
                        ${isDark ? 'text-gray-300' : 'text-gray-600'}
                    `}
                >
                    Unlock the potential of artificial intelligence with our
                    comprehensive suite of tools.
                </motion.p>

                <motion.div
                    variants={ itemVariants }
                    whileHover={ { scale: 1.02 } }
                    transition={ { type: "spring", stiffness: 300 } }
                    className="flex justify-center w-full"
                >
                    <PromptComponent />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HeroSection;