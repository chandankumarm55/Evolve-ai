import React from 'react'
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import PromptComponent from './PromptComponent';

const HeroSection = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="h-screen flex flex-col justify-center items-center text-center">
            <motion.div
                initial={ { opacity: 0, y: 20 } }
                animate={ { opacity: 1, y: 0 } }
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

                {/* Badge */ }
                <motion.div
                    initial={ { scale: 0.8 } }
                    animate={ { scale: 1 } }
                    transition={ { delay: 0.2 } }
                    className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full mb-8">
                    <span>Welcome to the future of AI</span>
                </motion.div>

                {/* Heading */ }
                <h1 className={ `text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}` }>
                    Experience the Power of
                    <br />
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Evolve AI
                    </span>
                </h1>

                {/* Subtitle */ }
                <p className={ `text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                    Unlock the potential of artificial intelligence with our comprehensive suite of tools.
                </p>

                {/* Prompt Component */ }
                <div className="flex justify-center items-center w-full">
                    <PromptComponent />
                </div>
            </motion.div>
        </div>
    )
}

export default HeroSection
