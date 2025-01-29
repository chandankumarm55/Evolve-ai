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
import { FeatureItem } from './Introduction';

const WhyEvolveAI = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const reasons = [
        {
            icon: Shield,
            title: "Uncompromising Integrity",
            description: "Built with a commitment to security and ethical AI practices."
        },
        {
            icon: Lock,
            title: "No Data Retention",
            description: "Your interactions are private. No data is stored or used for training."
        },
        {
            icon: Code,
            title: "Open Source Flexibility",
            description: "Leverage the power of multiple open-source AI models."
        },
        {
            icon: User,
            title: "Personalized Assistance",
            description: "Tailored to your specific needs and concerns."
        },
        {
            icon: Zap,
            title: "Speed & Performance",
            description: "Experience fast and efficient task management."
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Multi-lingual support for a global user base."
        }
    ];

    return (
        <div className={ `py-16 ${isDark ? 'bg-background' : 'bg-white'}` }>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className={ `text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'
                        }` }>
                        Why Evolve AI?
                    </h2>
                    <p className={ `text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }` }>
                        Evolve AI is designed to provide a secure, efficient, and personalized experience, ensuring your data remains private and your tasks are managed seamlessly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    { reasons.map((reason, index) => (
                        <FeatureItem
                            key={ index }
                            icon={ reason.icon }
                            title={ reason.title }
                            description={ reason.description }
                        />
                    )) }
                </div>
            </div>
        </div>
    );
};

export default WhyEvolveAI;