import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    return (
        <div className={ `min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
            }` }>
            <div className={ `max-w-md w-full space-y-8 rounded-xl shadow-2xl p-8 ` }>
                <div className={ `mt-8 ${isDark ? 'clerk-dark' : ''}` }>
                    <SignIn
                        path="/sign-in"
                        routing="path"
                        signUpUrl="/sign-up"
                        afterSignInUrl="/dashboard"
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
                                    'text-gray-600',
                                footerActionLink:
                                    'text-indigo-600 hover:text-indigo-500',
                                formFieldLabelRow: `[&_a]:text-indigo-600 ${isDark ? '[&_a]:hover:text-indigo-400' : '[&_a]:hover:text-indigo-700'
                                    }`
                            }
                        } }
                    />
                </div>
            </div>
        </div>
    );
};

export default SignInPage;