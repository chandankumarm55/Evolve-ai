import React from 'react';
import { SignUp } from "@clerk/clerk-react";
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/FunctionalComponents/Header';

const SignUpPage = () => {
    const { theme } = useTheme();

    return (
        <div className={ `
             min-h-screen flex items-center justify-center 
             py-12 px-4 sm:px-6 lg:px-8 
             ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}
         `}>
            <Header />
            <SignUp
                path="/sign-up"
                routing="path"
                signInUrl="/sign-in"
                afterSignUpUrl="/dashboard"
            />
        </div>
    );
};

export default SignUpPage;