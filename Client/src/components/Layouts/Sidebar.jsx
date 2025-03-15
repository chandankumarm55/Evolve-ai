import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home,
    MessageSquare,
    Image,
    Mic,
    Smile,
    Settings,
    X,
    Languages,
    BookOpen,
    Speech,
    QrCode,
    AudioLines
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';


const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Conversation', path: '/dashboard/conversation' },
    { icon: Image, label: 'Image Generation', path: '/dashboard/image-generation' },
    { icon: AudioLines, label: 'Voice Based Assistant', path: '/dashboard/Voice-Based-Assistant' },
    { icon: Mic, label: 'Text to Speech', path: '/dashboard/text-to-speech' },
    { icon: Smile, label: 'Joke Generator', path: '/dashboard/joke-generator' },
    { icon: Languages, label: 'Translator', path: '/dashboard/translator' },
    { icon: BookOpen, label: 'Dictionary', path: '/dashboard/dictionary' },
    { icon: Speech, label: 'Speech To Text', path: '/dashboard/speech-to-text' },
    { icon: QrCode, label: 'QR Code Generator', path: '/dashboard/QR-Code-Generator' },


];



export const Sidebar = ({ onClose }) => {
    const location = useLocation();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    return (
        <div className={ `w-64 h-screen  overflow-y-auto  ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            } border-r p-4` }>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={ () => navigate('/') }>
                    <Settings className="w-6 h-6 text-purple-600" />
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Evolve AI
                    </span>
                </div>
                { onClose && (
                    <button
                        onClick={ onClose }
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) }
            </div>




            <nav className="space-y-2">
                { menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link key={ item.path } to={ item.path }>
                            <motion.div
                                whileHover={ { x: 4 } }
                                className={ `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                                    ? isDark
                                        ? 'bg-gray-800 text-purple-400'
                                        : 'bg-purple-50 text-purple-600'
                                    : isDark
                                        ? 'text-gray-400 hover:bg-gray-800'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }` }
                            >
                                <Icon className="w-5 h-5" />
                                <span>{ item.label }</span>
                                { isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="w-1 h-6 bg-purple-600 absolute right-0 rounded-l-full"
                                    />
                                ) }
                            </motion.div>
                        </Link>
                    );
                }) }
            </nav>
        </div>
    );
};