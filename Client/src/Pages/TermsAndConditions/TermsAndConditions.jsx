import React from 'react';
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent } from "../../components/ui/card";
import Header from '../../components/FunctionalComponents/Header';
import Footer from '../../components/FunctionalComponents/Footer';

const TermsAndConditions = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <>
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"> {/* Increased top padding */ }
                <div >
                    <div className="p-6 space-y-4">
                        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
                        <p>Welcome to Evolve AI! By using our services, you agree to the following terms and conditions.</p>

                        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                        <p>By accessing or using Evolve AI, you agree to be bound by these terms. If you do not agree, please discontinue use.</p>

                        <h2 className="text-xl font-semibold">2. Use of Services</h2>
                        <p>Evolve AI provides AI-powered tools for productivity, automation, and analytics. You must use our services responsibly and lawfully.</p>

                        <h2 className="text-xl font-semibold">3. Refund Policy</h2>
                        <p>All payments are final. Due to the nature of our services, we do not offer refunds or cancellations.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TermsAndConditions;
