import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../FunctionalComponents/Header';
import Loading from '../FunctionalComponents/Loading';

// This component will serve as a layout for protected routes without the sidebar
const ProtectedFullWidthLayout = () => {
    const { isSignedIn, isLoaded } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Show loading or redirect if not authenticated
    if (!isLoaded) {
        return <Loading />;
    }

    if (!isSignedIn) {
        return <Navigate to="/sign-in" />;
    }

    return (
        <div className={ `min-h-screen w-full ${isDark ? 'bg-black text-white' : 'bg-white text-black'}` }>
            <Header />
            <div className="p-4 h-full overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedFullWidthLayout;