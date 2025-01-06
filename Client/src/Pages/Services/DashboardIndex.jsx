import React from 'react';
import {
    BarChart,
    MessageSquare,
    Image as ImageIcon,
    Mic,
    BookOpen,
    Crown,
    AlertCircle
} from 'lucide-react';
import { useUser } from "@clerk/clerk-react";
import { useTheme } from '../../contexts/ThemeContext';

const DashboardIndex = () => {
    const { user } = useUser();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    console.log(user)
    const metrics = [
        {
            title: 'Total Conversations',
            value: '50',
            icon: MessageSquare,
            change: '+12%',
        },
        {
            title: 'Images Generated',
            value: '20',
            icon: ImageIcon,
            change: '+8%',
        },
        {
            title: 'Dictionary Searches',
            value: '30',
            icon: BookOpen,
            change: '+15%',
        },
        {
            title: 'Audio Conversions',
            value: '10',
            icon: Mic,
            change: '+5%',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */ }
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                        Welcome back! Here's an overview of your AI tools usage.
                    </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                    <img
                        src="/placeholder-avatar.jpg"
                        alt="User"
                        className="h-full w-full object-cover"
                        onError={ (e) => {
                            e.target.src = 'https://via.placeholder.com/48';
                        } }
                    />
                </div>
            </div>

            {/* Subscription Status */ }
            <div className={ `rounded-lg border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                } p-6` }>
                <div className="flex items-center justify-between pb-2">
                    <h3 className="text-lg font-medium">Subscription Status</h3>
                    <Crown className={ isDark ? 'text-yellow-500' : 'text-yellow-600' } />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                            Free Plan
                        </p>
                        <p className="text-2xl font-bold">1,200 / 5,000</p>
                        <p className="text-sm text-gray-500">API calls remaining</p>
                    </div>
                    <button className={ `px-4 py-2 rounded-lg ${isDark
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-purple-500 hover:bg-purple-600'
                        } text-white transition-colors` }>
                        Upgrade Plan
                    </button>
                </div>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-600 rounded-full"
                        style={ { width: '24%' } }
                    />
                </div>
            </div>

            {/* Metrics Grid */ }
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                { metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={ metric.title }
                            className={ `rounded-lg border p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                                }` }
                        >
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-medium">{ metric.title }</p>
                                <Icon className={ `h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}` } />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">{ metric.value }</div>
                                <span className={ `text-xs ${isDark ? 'text-green-400' : 'text-green-500'
                                    }` }>
                                    { metric.change }
                                </span>
                            </div>
                        </div>
                    );
                }) }
            </div>

            {/* Recent Activity */ }
            <div className={ `rounded-lg border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                } p-6` }>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    { [
                        { icon: MessageSquare, text: 'New conversation started', time: '2 min ago' },
                        { icon: ImageIcon, text: 'Image generated', time: '1 hour ago' },
                        { icon: BookOpen, text: 'Dictionary search', time: '3 hours ago' },
                    ].map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                            <div key={ index } className="flex items-center gap-4">
                                <div className={ `p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }` }>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{ activity.text }</p>
                                    <p className={ `text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                                        }` }>
                                        { activity.time }
                                    </p>
                                </div>
                            </div>
                        );
                    }) }
                </div>
            </div>

            {/* Notifications */ }
            <div className={ `rounded-lg border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                } p-6` }>
                <div className="flex items-center justify-between pb-2">
                    <h3 className="text-lg font-medium">Important Updates</h3>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="space-y-4">
                    <div className={ `p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'
                        }` }>
                        <p className="text-sm font-medium">New AI Model Available</p>
                        <p className={ `text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                            }` }>
                            Try out our latest language model for improved conversations
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardIndex;