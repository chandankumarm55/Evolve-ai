import { useTheme } from '../../contexts/ThemeContext';

interface LanguageOption {
  code: string;
  name: string;
}

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  languages: LanguageOption[];
  label?: string;
}

export const LanguageSelect = ({ value, onChange, languages, label }: LanguageSelectProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-4 py-2 rounded-lg border-2 ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        } focus:border-purple-500 outline-none transition-colors`}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};