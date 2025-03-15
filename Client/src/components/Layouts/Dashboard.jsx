import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import DashboardHeader from './DashboardHeader';
import { useAuth } from "@clerk/clerk-react"; // Add this import
import { useDispatch } from 'react-redux';
import { updateUser } from '../../redux/userSlice';
import { LoginRouteUrl } from '../../Utilities/constant';

export const Dashboard = () => {
    const dispatch = useDispatch();
    const currentPath = useLocation().pathname;
    const { theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const { userId: clerkUserId } = useAuth();
    useEffect(() => {
        const initializeUser = async () => {
            try {
                // First check if clerk user ID exists
                if (!clerkUserId) {
                    console.error('No Clerk user ID found');
                    navigate('/sign-in');
                    return;
                }

                localStorage.setItem('clerkId', clerkUserId);

                const existingUserId = localStorage.getItem('userId');

                const response = await fetch(LoginRouteUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clerkId: clerkUserId }),
                });


                if (!response.ok) {
                    throw new Error('Failed to create/fetch user');
                }

                const data = await response.json();
                console.log('User data:', data);

                if (data.user && data.user._id) {
                    dispatch(updateUser(data.user))
                    localStorage.setItem('userId', data.user._id);
                } else {
                    throw new Error('No user ID received from server');
                }
            } catch (error) {
                console.error('Error in user initialization:', error);
                alert(error.message);
                navigate('/sing-in');
            }
        };

        initializeUser();
    }, [clerkUserId, navigate]); // Dependencies added

    return (
        <div className="flex h-screen">
            {/* Mobile Sidebar Overlay */ }
            <AnimatePresence>
                { isSidebarOpen && (
                    <motion.div
                        initial={ { opacity: 0 } }
                        animate={ { opacity: 1 } }
                        exit={ { opacity: 0 } }
                        onClick={ () => setIsSidebarOpen(false) }
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    />
                ) }
            </AnimatePresence>

            <AnimatePresence>
                { isSidebarOpen && (
                    <motion.div
                        initial={ { x: '-100%' } }
                        animate={ { x: 0 } }
                        exit={ { x: '-100%' } }
                        transition={ { type: 'spring', bounce: 0, duration: 0.4 } }
                        className="fixed inset-y-0 left-0 z-30 lg:hidden"
                    >
                        <Sidebar onClose={ () => setIsSidebarOpen(false) } />
                    </motion.div>
                ) }
            </AnimatePresence>

            {/* Desktop Sidebar */ }
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className={ `flex-1 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'} overflow-hidden` }>
                <DashboardHeader setIsSidebarOpen={ setIsSidebarOpen } currentPath={ currentPath } />
                <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;