import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    PenLine,
    BarChart3,
    CircleDollarSign,
    Globe,
    ListTodo,
    MessagesSquare
} from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="flex items-start gap-4">
            <div className={ `flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer p-2 
            ${isDark ? 'bg-gray-800 text-white hover:bg-white hover:text-black hover:scale-105'
                    : 'bg-gray-100 text-black hover:bg-black hover:text-white hover:scale-105'}
             transition-transform duration-200`}>

                <Icon className={ `w-6 h-6 cursor-pointer ` } />
            </div>
            <div>
                <h3 className={ `text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                    }` }>
                    { title }
                </h3>
                <p className={ `${isDark ? 'text-gray-400' : 'text-gray-600'
                    }` }>
                    { description }
                </p>
            </div>
        </div>
    );
};

const Features = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const features = [
        {
            icon: PenLine,
            title: "AI Generator",
            description: "Generate text, image, code, chat and even more with"
        },
        {
            icon: BarChart3,
            title: "Advanced Dashboard",
            description: "Access to valuable user insight, analytics and activity."
        },
        {
            icon: CircleDollarSign,
            title: "Payment Gateways",
            description: "Securely process credit card, debit card, or other methods."
        },
        {
            icon: Globe,
            title: "Multi-Lingual",
            description: "Ability to understand and generate content in different languages"
        },
        {
            icon: ListTodo,
            title: "Custom Templates",
            description: "Add unlimited number of custom prompts for your customers."
        },
        {
            icon: MessagesSquare,
            title: "Support Platform",
            description: "Access and manage your support tickets from your dashboard."
        }
    ];

    return (
        <div className={ `py-16 ${isDark ? 'bg-background' : 'bg-white'}` }>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className={ `text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                        }` }>
                        The future of AI.
                    </h2>
                    <p className={ `text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }` }>
                        Evovle AI is designed to help you generate high-quality content instantly,
                        without breaking a sweat.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    { features.map((feature, index) => (
                        <FeatureItem
                            key={ index }
                            icon={ feature.icon }
                            title={ feature.title }
                            description={ feature.description }
                        />
                    )) }
                </div>
            </div>
        </div>
    );
};

export default Features;