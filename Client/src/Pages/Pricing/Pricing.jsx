import React, { useEffect } from 'react';
import { toast } from 'sonner';
import Navbar from '../../components/FunctionalComponents/Header';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

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
    const { userId: clerkUserId } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    useEffect(() => {
        if (!clerkUserId) {
            toast.error('Please sign in to access pricing');
            navigate('/sign-in');
        }
    }, [clerkUserId, navigate]);

    const handlePayment = async (plan) => {
        // Validate user is signed in
        if (!clerkUserId) {
            toast.error('Please sign in to purchase a plan');
            return;
        }

        // Load Razorpay SDK
        const res = await loadRazorpay();
        if (!res) {
            toast.error('Failed to load payment gateway. Please try again.');
            return;
        }

        const options = {
            key: 'rzp_test_sU4uosDvBZKlyf',
            amount: plan.price * 100,
            currency: 'INR',
            name: 'Evolve AI',
            description: `${plan.name} Subscription`,
            handler: async function (response) {
                try {
                    // Prepare subscription data
                    const startDate = new Date().toISOString();
                    const endDate = new Date(
                        new Date().setMonth(new Date().getMonth() + 1)
                    ).toISOString();

                    const subscriptionData = {
                        clerkId: clerkUserId,
                        subscriptionPlan: plan.name,
                        startDate,
                        endDate,
                        paymentId: response.razorpay_payment_id
                    };

                    // Send subscription update to backend
                    const updateResponse = await fetch('http://localhost:3000/api/subscription/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(subscriptionData)
                    });

                    if (!updateResponse.ok) {
                        throw new Error('Subscription update failed');
                    }

                    const result = await updateResponse.json();

                    // Show success toast with payment details
                    toast.success('Payment Successful', {
                        description: `Plan: ${plan.name}\nAmount: ₹${plan.price}\nPayment ID: ${response.razorpay_payment_id}`
                    });

                    // Optional: Redirect to dashboard or subscription page
                    navigate('/dashboard');
                } catch (error) {
                    // Detailed error handling
                    console.error('Subscription update error:', error);
                    toast.error('Payment Update Failed', {
                        description: 'Payment received, but subscription update failed. Please contact support.'
                    });
                }
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
        paymentObject.open();
    };

    const plans = [
        {
            name: 'Starter AI',
            price: 10,
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
            price: 30,
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
            price: 20,
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
                                        onClick={ () => handlePayment(plan) }
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