import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';

export const Dashboard = () => {
    const currentPath = useLocation().pathname;
    const { theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const setTitle = (url) => {
        const parts = url.split('/');
        return parts[parts.length - 1].charAt(0).toUpperCase() +
            parts[parts.length - 1].slice(1);
    }

    const isDark = theme === 'dark';

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
                <header className={ `h-16 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} border-b shadow-sm` }>
                    <div className="h-full px-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={ () => setIsSidebarOpen(true) }
                                className={ `p-2 rounded-lg lg:hidden hover:bg-opacity-10 hover:bg-gray-900
                                    ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}` }
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                                { setTitle(currentPath) } AI
                            </h1>
                        </div>

                        {/* Right section with theme toggle and user button */ }
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <UserButton
                                afterSignOutUrl="/sign-in"
                                appearance={ {
                                    elements: {
                                        avatarBox: "w-8 h-8"
                                    }
                                } }
                            />
                        </div>
                    </div>
                </header>

                {/* Main content */ }
                <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};