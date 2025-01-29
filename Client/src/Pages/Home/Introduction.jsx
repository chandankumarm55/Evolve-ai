import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
    Shield,
    Lock,
    Code,
    User,
    Zap,
    Globe
} from 'lucide-react';

export const FeatureItem = ({ icon: Icon, title, description }) => {
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

const Introduction = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const features = [
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Your data is yours alone. No history is saved, and no data is used for training."
        },
        {
            icon: Lock,
            title: "Open Source",
            description: "Built using multiple open-source AI models for transparency and flexibility."
        },
        {
            icon: Code,
            title: "Task Aggregation",
            description: "Gather all your tasks in one place with seamless integration."
        },
        {
            icon: User,
            title: "Personal Assistant",
            description: "A personal assistant tailored to your concerns and needs."
        },
        {
            icon: Zap,
            title: "Fast & Efficient",
            description: "Experience industry-leading speed and performance."
        },
        {
            icon: Globe,
            title: "Multi-Lingual Support",
            description: "Understand and generate content in multiple languages."
        }
    ];

    return (
        <div className={ `py-16 ${isDark ? 'bg-background' : 'bg-white'}` }>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className={ `text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                        }` }>
                        Welcome to Evolve AI
                    </h2>
                    <p className={ `text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }` }>
                        Your personal assistant designed to streamline tasks and enhance productivity without compromising your privacy.
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

export default Introduction;