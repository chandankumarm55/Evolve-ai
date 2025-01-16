import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Sparkles, MessageSquare, Image, Mic } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import PromptComponent from '../../components/FunctionalComponents/PromptComponent';
import Testimonials from '../../components/FunctionalComponents/Testiminials';
import { Button } from '../../components/ui/button'
import Header from '../../components/FunctionalComponents/Header';
import Footer from '../../components/FunctionalComponents/Footer';
import HeroSection from '../../components/FunctionalComponents/HeroSection';

const features = [
    {
        icon: 'MessageSquare',
        title: 'Smart Conversations',
        description: 'Engage in natural conversations with our advanced AI assistant.',
    },
    {
        icon: 'Image',
        title: 'Image Generation',
        description: 'Create stunning images from text descriptions instantly.',
    },
    {
        icon: 'Mic',
        title: 'Text to Speech',
        description: 'Convert your text into natural-sounding speech.',
    },
];

const Home = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={ `min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}` }>
            {/* Header */ }
            <header className={ `${isDark ? 'bg-gray-900' : 'bg-white'} border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}` }>
                <Header />
            </header>


            <section className="relative overflow-hidden">
                <HeroSection />
            </section>


            <section className={ `py-20 ${isDark ? 'bg-gray-800' : 'bg-white'}` }>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={ { opacity: 0, y: 20 } } whileInView={ { opacity: 1, y: 0 } } viewport={ { once: true } } className="text-center mb-16">
                        <h2 className={ `text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}` }>Powerful Features</h2>
                        <p className={ isDark ? 'text-gray-300' : 'text-gray-600' }>Discover what makes Evolve AI special</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        { features.map((feature, index) => (
                            <motion.div key={ feature.title } initial={ { opacity: 0, y: 20 } } whileInView={ { opacity: 1, y: 0 } } viewport={ { once: true } } transition={ { delay: index * 0.2 } } className={ `p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}` }>
                                <div className="w-12 h-12 text-purple-600 mb-4">{ feature.icon }</div>
                                <h3 className={ `text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}` }>{ feature.title }</h3>
                                <p className={ isDark ? 'text-gray-300' : 'text-gray-600' }>{ feature.description }</p>
                            </motion.div>
                        )) }
                    </div>
                </div>
            </section>


            <section className={ `py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}` }>
                <Testimonials />
            </section>

            {/* Footer */ }
            <footer className="bg-gray-900 text-white py-12">
                <Footer />
            </footer>
        </div>
    );
};

export default Home;

