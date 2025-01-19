import React from 'react';
import Navbar from '../../components/FunctionalComponents/Header';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Sparkles } from 'lucide-react';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Pricing = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handlePayment = async (amount) => {
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load');
            return;
        }

        const options = {
            key: 'rzp_test_5ci9gXB1LXh49n',
            amount: amount * 100,
            currency: 'INR',
            name: 'Evolve AI',
            description: 'AI Platform Subscription',
            handler: function (response) {
                alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            theme: {
                color: isDark ? '#6366f1' : '#4f46e5'
            }
        };

        const paymentObject = new window.Razorpay(options);
        console.log(paymentObject);
        paymentObject.open();
    };

    const plans = [
        {
            name: 'Starter AI',
            price: 20,
            description: 'Perfect for individuals exploring AI capabilities',
            features: [
                'Access to basic AI models',
                'Up to 100 API calls per day',
                'Basic analytics dashboard',
                'Email support response within 24h',
                'Community forum access'
            ],
            highlight: false
        },
        {
            name: 'Pro AI',
            price: 40,
            description: 'Advanced AI features for growing teams',
            features: [
                'Access to advanced AI models',
                'Unlimited API calls',
                'Advanced analytics & monitoring',
                'Priority support with 4h response',
                'Custom model fine-tuning'
            ],
            highlight: true
        },
        {
            name: 'Enterprise AI',
            price: 30,
            description: 'Custom AI solutions for large organizations',
            features: [
                'Custom AI model development',
                'Dedicated infrastructure',
                'Enterprise-grade security',
                '24/7 dedicated support',
                'Full API access with SLA'
            ],
            highlight: false
        }
    ];

    return (
        <div className={ `min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}` }>
            <Navbar />
            <section className="py-12 px-4 mx-auto max-w-7xl lg:py-24 lg:px-8">
                <div className="mx-auto max-w-3xl text-center mb-12 lg:mb-20">
                    <div className="flex items-center justify-center mb-4">
                        <Sparkles className={ `w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} mr-2` } />
                        <h2 className={ `text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}` }>
                            Evolve with AI
                        </h2>
                    </div>
                    <p className={ `mt-4 text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}` }>
                        Unlock the power of artificial intelligence with our flexible pricing plans designed to scale with your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
                    { plans.map((plan) => (
                        <div
                            key={ plan.name }
                            className={ `relative ${plan.highlight ? 'scale-105' : ''}` }
                        >
                            <Card className={ `h-full ${isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                                } ${plan.highlight
                                    ? 'ring-2 ring-indigo-500'
                                    : ''
                                }` }>
                                <CardHeader>
                                    <h3 className={ `text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}` }>
                                        { plan.name }
                                    </h3>
                                    <p className={ `mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                                        { plan.description }
                                    </p>
                                    <div className="mt-4 flex items-baseline">
                                        <span className={ `text-5xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}` }>
                                            ₹{ plan.price }
                                        </span>
                                        <span className={ `ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                                            /month
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="mt-6 space-y-4">
                                        { plan.features.map((feature, index) => (
                                            <li key={ index } className="flex">
                                                <svg
                                                    className={ `flex-shrink-0 w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'
                                                        }` }
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <span className={ `ml-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}` }>
                                                    { feature }
                                                </span>
                                            </li>
                                        )) }
                                    </ul>
                                    <button
                                        onClick={ () => handlePayment(plan.price) }
                                        className={ `mt-8 w-full px-6 py-3 rounded-lg text-white font-medium transition-all ${plan.highlight
                                            ? isDark
                                                ? 'bg-indigo-500 hover:bg-indigo-600'
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                            : isDark
                                                ? 'bg-gray-700 hover:bg-gray-600'
                                                : 'bg-gray-800 hover:bg-gray-900'
                                            }` }
                                    >
                                        Get started
                                    </button>
                                </CardContent>
                            </Card>
                        </div>
                    )) }
                </div>
            </section>
        </div>
    );
};

export default Pricing;