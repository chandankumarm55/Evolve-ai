import React from 'react';
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent } from "../../components/ui/card";
import Header from '../../components/FunctionalComponents/Header';
import Footer from '../../components/FunctionalComponents/Footer';

const PrivacyPolicy = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"> {/* Increased top padding */ }
                <div>
                    <CardContent className="p-6 space-y-4">
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        <p>
                            At Evolve AI, we are committed to protecting your privacy. This policy outlines how we handle your data.
                        </p>
                        <h2 className="text-xl font-semibold">1. Data Collection</h2>
                        <p>
                            We do not store or use your data for training purposes. Your interactions with Evolve AI are private.
                        </p>
                        <h2 className="text-xl font-semibold">2. Data Usage</h2>
                        <p>
                            Your data is used solely to provide and improve our services. We do not share your data with third parties.
                        </p>
                        <h2 className="text-xl font-semibold">3. Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data.
                        </p>
                    </CardContent>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
