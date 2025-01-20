import { Menu } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { UserButton } from '@clerk/clerk-react';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardHeader = ({ setIsSidebarOpen, currentPath }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const setTitle = (url) => {
        const parts = url.split('/');
        return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
    };

    return (
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
    );
};

export default DashboardHeader