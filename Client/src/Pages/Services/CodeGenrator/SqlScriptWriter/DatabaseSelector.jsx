import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const DatabaseSelector = ({ value, onChange, label }) => {
    const databases = [
        { value: 'mysql', label: 'MySQL' },
        { value: 'postgresql', label: 'PostgreSQL' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'mssql', label: 'SQL Server' },
        { value: 'oracle', label: 'Oracle' }
    ];

    return (
        <div className="space-y-2">
            <Label>{ label }</Label>
            <select
                value={ value }
                onChange={ (e) => onChange(e.target.value) }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                { databases.map((db) => (
                    <option key={ db.value } value={ db.value }>
                        { db.label }
                    </option>
                )) }
            </select>
        </div>
    );
};


export default DatabaseSelector;