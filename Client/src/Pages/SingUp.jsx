import React from 'react';
import { SignUp } from "@clerk/clerk-react";
import { useTheme } from '../contexts/ThemeContext';

const SignUpPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={ `min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
            }` }>
            <div className={ `max-w-md w-full space-y-8 rounded-xl shadow-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'
                }` }>
                <div className="text-center">
                    <h2 className={ `text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'
                        }` }>
                        Create your account
                    </h2>
                    <p className={ `mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }` }>
                        Join us to explore AI possibilities
                    </p>
                </div>

                <div className={ `mt-8 ${isDark ? 'clerk-dark' : ''
                    }` }>
                    <SignUp
                        path="/sign-up"
                        appearance={ {
                            elements: {
                                formButtonPrimary:
                                    'bg-indigo-600 hover:bg-indigo-700 text-white',
                                card: isDark ?
                                    'bg-gray-800 text-white' :
                                    'bg-white',
                                headerTitle: isDark ?
                                    'text-white' :
                                    'text-gray-900',
                                dividerText: isDark ?
                                    'text-gray-400' :
                                    'text-gray-500',
                                formFieldLabel: isDark ?
                                    'text-gray-300' :
                                    'text-gray-700',
                                formFieldInput: isDark ?
                                    'bg-gray-700 border-gray-600 text-white' :
                                    'bg-white border-gray-300',
                                footer: isDark ?
                                    'text-gray-400' :
                                    'text-gray-600'
                            }
                        } }
                    />
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;