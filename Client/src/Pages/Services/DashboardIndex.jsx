import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    MessageSquare,
    Image as ImageIcon,
    Mic,
    BookOpen,
    Crown,
    AlertCircle
} from 'lucide-react';
import { useUser } from "@clerk/clerk-react";
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const DashboardIndex = () => {
    const navigate = useNavigate();
    const { user: clerkUser } = useUser();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Get user data from Redux
    const { user } = useSelector(store => store.user);
    const [currentDayUsage, setCurrentDayUsage] = useState(null);

    const TIER_LIMITS = {
        Free: {
            conversations: 5,
            imagesGenerated: 5,
            dictionarySearches: 5,
            audioConversions: 5
        },
        Starter: {
            conversations: 'Unlimited',
            imagesGenerated: 'Unlimited',
            dictionarySearches: 'Unlimited',
            audioConversions: 'Unlimited'
        },
        Pro: {
            conversations: 'Unlimited',
            imagesGenerated: 'Unlimited',
            dictionarySearches: 'Unlimited',
            audioConversions: 'Unlimited'
        }
    };

    useEffect(() => {
        if (user?.usage) {
            const today = new Date().toISOString().split('T')[0];
            const todayUsage = user.usage.find(u =>
                new Date(u.date).toISOString().split('T')[0] === today
            ) || { date: today, transactionCount: 0 };
            setCurrentDayUsage(todayUsage);
        }
    }, [user?.usage]);

    const currentTierLimits = TIER_LIMITS[user?.subscriptionPlan || 'Free'];

    // Format usage display
    const formatUsage = (current, limit) => {
        if (limit === 'Unlimited') return '∞';
        return `${current}/${limit}`;
    };

    // Calculate progress percentage
    const calculateProgress = (current, limit) => {
        if (limit === 'Unlimited') return 100;
        return Math.min((current / limit) * 100, 100);
    };

    const getMetricsData = () => [
        {
            title: 'Conversations',
            value: formatUsage(user?.metrics?.conversations || 0, currentTierLimits.conversations),
            icon: MessageSquare,
            limit: currentTierLimits.conversations,
            current: user?.metrics?.conversations || 0
        },
        {
            title: 'Images Generated',
            value: formatUsage(user?.metrics?.imagesGenerated || 0, currentTierLimits.imagesGenerated),
            icon: ImageIcon,
            limit: currentTierLimits.imagesGenerated,
            current: user?.metrics?.imagesGenerated || 0
        },
        {
            title: 'Dictionary Searches',
            value: formatUsage(user?.metrics?.dictionarySearches || 0, currentTierLimits.dictionarySearches),
            icon: BookOpen,
            limit: currentTierLimits.dictionarySearches,
            current: user?.metrics?.dictionarySearches || 0
        },
        {
            title: 'Audio Conversions',
            value: formatUsage(user?.metrics?.audioConversions || 0, currentTierLimits.audioConversions),
            icon: Mic,
            limit: currentTierLimits.audioConversions,
            current: user?.metrics?.audioConversions || 0
        }
    ];

    // Get subscription display info
    const getSubscriptionInfo = () => {
        const info = {
            title: user?.subscriptionPlan || 'Free',
            color: 'purple',
            showUpgrade: true,
            badge: ''
        };

        switch (user?.subscriptionPlan) {
            case 'Pro':
                info.color = 'yellow';
                info.showUpgrade = false;
                info.badge = 'Pro Plan';
                break;
            case 'Starter':
                info.color = 'blue';
                info.badge = 'Starter Plan';
                break;
            default:
                info.color = 'purple';
                info.badge = 'Free Plan';
        }

        return info;
    };

    const subscriptionInfo = getSubscriptionInfo();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                        Welcome back! <span className='font-bold'>{ clerkUser?.fullName }</span>
                    </p>
                </div>
                <div className={ `px-3 py-1 rounded-full ${user?.subscriptionPlan === 'Pro'
                    ? 'bg-yellow-100 text-yellow-800'
                    : user?.subscriptionPlan === 'Starter'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }` }>
                    { subscriptionInfo.badge }
                </div>
            </div>

            {/* Subscription Status */ }
            <div className={ `rounded-lg border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6` }>
                <div className="flex items-center justify-between pb-2">
                    <h3 className="text-lg font-medium">Subscription Status</h3>
                    <Crown className={ `${user?.subscriptionPlan === 'Pro'
                        ? 'text-yellow-500'
                        : user?.subscriptionPlan === 'Starter'
                            ? 'text-blue-500'
                            : 'text-purple-500'
                        }` } />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                            { user?.subscriptionPlan || 'Free' } Plan
                        </p>
                        { user?.subscriptionPlan !== 'Free' && user?.subscriptionDetails && (
                            <>
                                <p className="text-sm text-gray-500">
                                    Start Date: { new Date(user.subscriptionDetails.startDate).toLocaleDateString() }
                                </p>
                                <p className="text-sm text-gray-500">
                                    End Date: { new Date(user.subscriptionDetails.endDate).toLocaleDateString() }
                                </p>
                                <p className="text-sm text-gray-500">
                                    Status: <span className="capitalize">{ user.subscriptionDetails.status }</span>
                                </p>
                            </>
                        ) }
                    </div>
                    { subscriptionInfo.showUpgrade && (
                        <button
                            onClick={ () => navigate('/pricing') }
                            className={ `px-4 py-2 rounded-lg text-white transition-colors ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
                                }` }>
                            Upgrade Plan
                        </button>
                    ) }
                </div>
            </div>

            {/* Daily Usage Metrics */ }
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                { getMetricsData().map((metric) => {
                    const Icon = metric.icon;
                    const progress = calculateProgress(metric.current, metric.limit);
                    const isUnlimited = metric.limit === 'Unlimited';

                    return (
                        <div
                            key={ metric.title }
                            className={ `rounded-lg border p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}` }
                        >
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-medium">{ metric.title }</p>
                                <Icon className={ `h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}` } />
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold">{ metric.value }</div>
                                { !isUnlimited && (
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={ `h-full rounded-full ${progress > 90
                                                ? 'bg-red-500'
                                                : progress > 70
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                                }` }
                                            style={ { width: `${progress}%` } }
                                        />
                                    </div>
                                ) }
                                <p className={ `text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                                    { isUnlimited ? 'Unlimited Usage' : 'Daily Limit' }
                                </p>
                            </div>
                        </div>
                    );
                }) }
            </div>

            {/* Recent Activity */ }
            <div className={ `rounded-lg border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6` }>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    { user?.usage && user.usage.length > 0 ? (
                        user.usage.slice(0, 3).map((activity, index) => (
                            <div key={ index } className="flex items-center gap-4">
                                <div className={ `p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        { activity.transactionCount } operations performed
                                    </p>
                                    <p className={ `text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                                        { new Date(activity.date).toLocaleString() }
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={ `text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}` }>
                            No recent activity
                        </p>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default DashboardIndex;