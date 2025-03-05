// SignIn.jsx
import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/FunctionalComponents/Header';

const SignInPage = () => {
    const { theme } = useTheme();

    return (
        <div className={ `
      min-h-screen flex items-center justify-center 
      py-12 px-4 sm:px-6 lg:px-8 
      ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}
    `}>
            <Header />
            <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"

            />
        </div>
    );
};

export default SignInPage;