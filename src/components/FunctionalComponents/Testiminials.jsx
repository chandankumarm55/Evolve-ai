import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Testimonials = () => {
    const { theme } = useTheme(); // Access theme context
    const isDark = theme === 'dark';

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Product Designer',
            content: 'Evolve AI has revolutionized how I approach creative tasks. The image generation is incredible!',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        },
        {
            name: 'Michael Chen',
            role: 'Content Creator',
            content: 'The conversation AI is so natural, it feels like chatting with a real person. Amazing tool!',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */ }
            <motion.div
                initial={ { opacity: 0, y: 20 } }
                whileInView={ { opacity: 1, y: 0 } }
                viewport={ { once: true } }
                className="text-center mb-16"
            >
                <h2 className={ `text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}` }>
                    What Our Users Say
                </h2>
                <p className={ isDark ? 'text-gray-300' : 'text-gray-600' }>
                    Join thousands of satisfied users
                </p>
            </motion.div>

            {/* Testimonials Grid */ }
            <div className="grid md:grid-cols-2 gap-8">
                { testimonials.map((testimonial, index) => (
                    <motion.div
                        key={ testimonial.name }
                        initial={ { opacity: 0, x: index % 2 === 0 ? -20 : 20 } }
                        whileInView={ { opacity: 1, x: 0 } }
                        viewport={ { once: true } }
                        className={ `p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}` }
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={ testimonial.image }
                                alt={ testimonial.name }
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h4 className={ `font-semibold ${isDark ? 'text-white' : 'text-gray-900'}` }>
                                    { testimonial.name }
                                </h4>
                                <p className={ isDark ? 'text-gray-400' : 'text-gray-600' }>
                                    { testimonial.role }
                                </p>
                            </div>
                        </div>
                        <p className={ isDark ? 'text-gray-300' : 'text-gray-700' }>
                            { testimonial.content }
                        </p>
                    </motion.div>
                )) }
            </div>
        </div>
    );
};

export default Testimonials;
