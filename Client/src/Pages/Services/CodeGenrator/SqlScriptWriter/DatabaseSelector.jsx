import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { useTheme } from '../../../../contexts/ThemeContext';

const DatabaseSelector = ({ value, onChange, label }) => {
    const databases = [
        { value: 'mysql', label: 'MySQL' },
        { value: 'postgresql', label: 'PostgreSQL' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'mssql', label: 'SQL Server' },
        { value: 'oracle', label: 'Oracle' }
    ];

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-2">
            <Label>{ label }</Label>
            <Select value={ value } onValueChange={ onChange }>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a database" />
                </SelectTrigger>
                <SelectContent className={ `bg-${isDark ? 'black' : 'white'} text-${isDark ? 'white' : 'black'}` }>
                    { databases.map((db) => (
                        <SelectItem key={ db.value } value={ db.value }>
                            { db.label }
                        </SelectItem>
                    )) }
                </SelectContent>
            </Select>
        </div>
    );
};

export default DatabaseSelector;