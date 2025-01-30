import React from 'react';
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent } from "../../components/ui/card";
import Header from '../../components/FunctionalComponents/Header';
import Footer from '../../components/FunctionalComponents/Footer';
import { CreditCard, Bitcoin, Heart, Share2, MessageCircle } from 'lucide-react';
import { FaAmazonPay } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const PaymentOption = ({ icon: Icon, title, description }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={ `p-6 rounded-lg border ${isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} transition-all cursor-pointer` }>
            <div className="flex items-center space-x-4">
                <div className={ `p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                    <Icon className={ `w-6 h-6 ${isDark ? 'text-gray-200' : 'text-gray-700'}` } />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{ title }</h3>
                    <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}` }>{ description }</p>
                </div>
            </div>
        </div>
    );
};

const ImpactCard = ({ icon: Icon, title, description }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={ `p-4 rounded-lg ` }>
            <Icon className={ `w-8 h-8 mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}` } />
            <h3 className="font-semibold mb-2">{ title }</h3>
            <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}` }>{ description }</p>
        </div>
    );
};

const DonatePage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate()

    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <Heart className={ `w-16 h-16 mx-auto mb-6 ${isDark ? 'text-pink-400' : 'text-pink-500'}` } />
                    <h1 className="text-4xl font-bold mb-4">Support Evolve AI</h1>
                    <p className={ `text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                        Your contributions help us continue providing AI-powered tools and improving our services.
                    </p>
                </div>

                <div>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            <PaymentOption
                                icon={ CreditCard }
                                title="Credit/Debit Card"
                                description="Quick and secure payment using your card"
                            />

                            <PaymentOption
                                icon={ FaAmazonPay }
                                title="BHIM UPI"
                                description="Support us using various cryptocurrencies"
                            />
                            <PaymentOption
                                icon={ FaWallet }
                                title="Wallets"
                                description="Support us using various cryptocurrencies"
                            />
                        </div>

                        <div className="border-t border-b py-12 my-12">
                            <h2 className="text-2xl font-bold mb-8 text-center">Your Impact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ImpactCard
                                    icon={ Heart }
                                    title="Support Innovation"
                                    description="Help us develop cutting-edge AI technologies"
                                />
                                <ImpactCard
                                    icon={ Share2 }
                                    title="Spread Knowledge"
                                    description="Enable us to make AI accessible to everyone"
                                />
                                <ImpactCard
                                    icon={ MessageCircle }
                                    title="Community Growth"
                                    description="Foster a thriving AI learning community"
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Other Ways to Help</h2>
                            <p className={ `max-w-2xl mx-auto mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}` }>
                                Even if you can't donate, you can support us by sharing Evolve AI with others
                                or providing valuable feedback to help us improve.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={ () => window.location.href = "https://razorpay.me/@kumarmunirajuchandan" }
                                    className={ `px-6 py-3 rounded-lg font-medium ${isDark
                                        ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                        : 'bg-pink-500 hover:bg-pink-600 text-white'
                                        } transition-colors` }>
                                    Make a Donation
                                </button>
                                <button className={ `px-6 py-3 rounded-lg font-medium ${isDark
                                    ? 'border border-gray-600 hover:border-gray-500'
                                    : 'border border-gray-300 hover:border-gray-400'
                                    } transition-colors` }>
                                    Share Evolve AI
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default DonatePage;