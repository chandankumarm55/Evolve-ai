import React from 'react';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const DatabaseSelector = ({ value, onChange, label }) => (
    <div className="space-y-2">
        <Label>{ label }</Label>
        <Select value={ value } onValueChange={ onChange }>
            <SelectTrigger>
                <SelectValue placeholder="Select database type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
            </SelectContent>
        </Select>
    </div>
);

export default DatabaseSelector;