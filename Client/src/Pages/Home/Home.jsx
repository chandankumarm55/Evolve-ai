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
import Description from './Description'
import LaptopFrame from './LaptopFrame';
import Features from './Features';
import WhyEvolveAI from './WhyEvolveAI';
import Introduction from './Introduction';
import DonationPromo from './DonationPromo';
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
        <div className={ `min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}` }>
            {/* Header */ }
            <header className={ `${isDark ? 'bg-zinc-900' : 'bg-white'} border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}` }>
                <Header />
            </header>


            <section className="relative overflow-hidden">
                <HeroSection />
            </section>

            <Description />



            <section className={ `py-20 ${isDark ? 'bg-black' : 'bg-white'}` }>
                <Features />
            </section>

            <LaptopFrame />
            <Introduction />
            <DonationPromo />
            <WhyEvolveAI />

            <section className={ `py-20 ${isDark ? 'bg-black' : 'bg-white'}` }>
                <Testimonials />
            </section>

            <Footer />

        </div>
    );
};

export default Home;
