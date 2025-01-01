import { useState, createContext, useContext } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    console.log(theme)

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };
    return (
        <ThemeContext.Provider value={ { theme, toggleTheme } }>
            <div className={ `${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen transition-colors duration-200` }>
                { children }
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}
