import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { MessageSquare, User } from 'lucide-react';
import laptopFrameImg from './laptop.webp';

const LaptopFrame = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const containerRef = useRef(null);
    const observerRef = useRef(null);


    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

    const messages = [
        { id: 1, type: 'user', content: "What can Evolve AI do for me?" },
        { id: 2, type: 'ai', content: "I can help you with conversations, generate images, convert text to speech, and much more! Let me show you what's possible." },
        { id: 3, type: 'user', content: "Can you help me with content creation?" },
        { id: 4, type: 'ai', content: "Absolutely! From writing articles to generating images and creating natural speech, I'm here to enhance your creative process." }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (visible) {
            if (currentMessageIndex < messages.length - 1) {
                const interval = setInterval(() => {
                    setCurrentMessageIndex((prevIndex) => {
                        if (prevIndex < messages.length - 1) {
                            return prevIndex + 1;
                        } else {
                            clearInterval(interval);
                            return prevIndex;
                        }
                    });

                    if (messages[currentMessageIndex]?.type === 'ai') {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 500);
                    }
                }, 1000);

                return () => clearInterval(interval);
            }
        }
    }, [visible, currentMessageIndex]);

    return (
        <section className="min-h-screen relative flex items-start justify-center py-20 overflow-hidden">
            <motion.div
                ref={ containerRef }
                className="sticky top-20 w-full max-w-4xl mx-auto px-4"
                style={ { y, scale } }
                initial={ { scale: 1.2, opacity: 0 } }
                animate={ { scale: 1, opacity: 1 } }
                transition={ { duration: 0.8, ease: "easeOut" } }
            >
                <div className="relative aspect-[16/10]" ref={ observerRef }>
                    <motion.img
                        src={ laptopFrameImg }
                        alt="Laptop Frame"
                        className="w-full h-full object-contain"
                        initial={ { scale: 1.1 } }
                        animate={ { scale: 1 } }
                        transition={ { duration: 0.5 } }
                    />

                    <div className="absolute top-[5%] left-[11.5%] right-[11.5%] bottom-[15%] overflow-hidden p-2 mt-5">
                        <div className="p-6 space-y-6">
                            <AnimatePresence mode="wait">
                                { messages.slice(0, currentMessageIndex + 1).map((message) => (
                                    <motion.div
                                        key={ message.id }
                                        initial={ { opacity: 0, scale: 1.2, y: 20 } }
                                        animate={ { opacity: 1, scale: 1, y: 0 } }
                                        transition={ { duration: 0.5 } }
                                        className={ `flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}` }
                                    >
                                        <div className="flex-shrink-0">
                                            <div className={ `w-8 h-8 ${message.type === 'user' ? 'bg-gray-400' : 'bg-gray-700'} rounded-full flex items-center justify-center` }>
                                                { message.type === 'user' ? (
                                                    <User className="text-white w-5 h-5" />
                                                ) : (
                                                    <MessageSquare className="text-white w-5 h-5" />
                                                ) }
                                            </div>
                                        </div>
                                        <div className={ `flex-1 ${message.type === 'user' ? 'text-right' : ''}` }>
                                            { loading && message.id === messages[currentMessageIndex].id && message.type === 'ai' ? (
                                                <div className="flex gap-2">
                                                    { [0, 1, 2].map((i) => (
                                                        <motion.div
                                                            key={ i }
                                                            animate={ { scale: [1, 1.2, 1] } }
                                                            transition={ { repeat: Infinity, duration: 1, delay: i * 0.2 } }
                                                            className="w-2 h-2 bg-gray-500 rounded-full"
                                                        />
                                                    )) }
                                                </div>
                                            ) : (
                                                <motion.div
                                                    className={ `${message.type === 'user' ? 'bg-gray-400' : 'bg-gray-700'} text-white p-3 rounded-lg ${message.type === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} inline-block` }
                                                    initial={ { opacity: 0 } }
                                                    animate={ { opacity: 1 } }
                                                    transition={ { duration: 0.8, ease: "easeInOut" } }
                                                >
                                                    { message.content }
                                                </motion.div>
                                            ) }
                                        </div>
                                    </motion.div>
                                )) }
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default LaptopFrame;