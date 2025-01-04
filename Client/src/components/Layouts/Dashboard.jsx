import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';

export const Dashboard = () => {
    const { theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

            {/* Mobile Sidebar */ }
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

            <main className={ `flex-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} overflow-hidden` }>
                <div className={ `p-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}` }>
                    {/* Menu Button for Mobile */ }
                    <button
                        onClick={ () => setIsSidebarOpen(true) }
                        className="p-2 rounded-lg lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Right-aligned Buttons */ }
                    <div className="ml-auto flex items-center gap-4">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
                <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
