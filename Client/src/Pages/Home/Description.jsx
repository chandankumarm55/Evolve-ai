import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Description = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const textVariants = {
        hidden: {
            opacity: 0,
            y: 50
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const heroTexts = [
        "WHY SETTLE FOR",
        "ORDINARY WHEN",
        "YOU CAN EVOLVE?"
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={ containerVariants }
            className={ `
                min-h-screen h-screen
                flex flex-col lg:flex-row
                items-center justify-center
                mt-2
                lg:pt-16 sm:pt-10
                ${isDark ? 'bg-black text-white' : 'bg-white text-black'}
                transition-colors duration-500 ease-in-out
            `}
        >

            <div className="relative w-full lg:w-2/3 space-y-4 lg:space-y-8">
                { heroTexts.map((text, index) => (
                    <motion.div
                        key={ index }
                        variants={ textVariants }
                        className="overflow-hidden"
                        whileHover={ { scale: 1.05 } }
                        whileTap={ { scale: 0.95 } }
                    >
                        <h1 className={ `
                            text-5xl md:text-6xl lg:text-8xl xl:text-9xl
                            font-black tracking-tight leading-none
                            ${isDark ? 'text-white' : 'text-black'}
                        `}>
                            { text }
                        </h1>
                    </motion.div>
                )) }
            </div>
        </motion.div>
    );
};

export default Description;