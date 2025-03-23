import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../FunctionalComponents/Header';

// This component will serve as a layout for protected routes without the sidebar
const ProtectedFullWidthLayout = () => {
    const { isSignedIn, isLoaded } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Show loading or redirect if not authenticated
    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!isSignedIn) {
        return <Navigate to="/sign-in" />;
    }

    return (
        <div className={ `min-h-screen w-full ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}` }>
            <Header />
            <div className="p-4 h-full overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedFullWidthLayout;