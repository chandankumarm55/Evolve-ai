import React, { useState, useRef, useCallback } from 'react';
import { Code, Loader2, GripVertical } from 'lucide-react';

const GenerateSQLTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    const [generateForm, setGenerateForm] = useState({
        prompt: '',
        databaseType: 'mysql',
        includeERDiagram: false,
        includeTips: false,
        saveToFile: false,
        fileName: ''
    });

    // Mock API call function
    const makeApiCall = (endpoint, data, setLoading, setError, setResponse) => {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setLoading(false);
            setResponse({
                sql: `-- Generated SQL for: ${data.prompt}\nCREATE TABLE users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    username VARCHAR(50) UNIQUE NOT NULL,\n    email VARCHAR(100) UNIQUE NOT NULL,\n    password_hash VARCHAR(255) NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE user_roles (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    user_id INT,\n    role_name VARCHAR(50) NOT NULL,\n    FOREIGN KEY (user_id) REFERENCES users(id)\n);`,
                tips: data.includeTips ? ["Add indexes on frequently queried columns", "Use proper data types for optimal storage"] : null,
                diagram: data.includeERDiagram ? "ER Diagram would be generated here" : null
            });
        }, 2000);
    };

    const handleGenerateSQL = () => {
        makeApiCall('/sqlcodegenerate', generateForm, setLoading, setError, setResponse);
    };

    // Mock UI Components to match your original structure
    const Card = ({ children }) => (
        <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
            { children }
        </div>
    );

    const CardHeader = ({ children }) => (
        <div className="p-6 pb-4 border-b">
            { children }
        </div>
    );

    const CardTitle = ({ children, className }) => (
        <h3 className={ `text-lg font-semibold ${className}` }>
            { children }
        </h3>
    );

    const CardDescription = ({ children }) => (
        <p className="text-sm text-gray-600 mt-1">
            { children }
        </p>
    );

    const CardContent = ({ children, className }) => (
        <div className={ `p-6 pt-4 flex-1 overflow-auto ${className}` }>
            { children }
        </div>
    );

    const Button = ({ children, onClick, disabled, className }) => (
        <button
            onClick={ onClick }
            disabled={ disabled }
            className={ `bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}` }
        >
            { children }
        </button>
    );

    const Input = ({ placeholder, value, onChange }) => (
        <input
            type="text"
            placeholder={ placeholder }
            value={ value }
            onChange={ onChange }
            className="w-full p-2 border rounded-md"
        />
    );

    const Textarea = ({ id, placeholder, value, onChange, rows }) => (
        <textarea
            id={ id }
            placeholder={ placeholder }
            value={ value }
            onChange={ onChange }
            rows={ rows }
            className="w-full p-3 border rounded-md resize-none"
        />
    );

    const Switch = ({ id, checked, onCheckedChange, className }) => (
        <input
            type="checkbox"
            id={ id }
            checked={ checked }
            onChange={ (e) => onCheckedChange(e.target.checked) }
            className="rounded"
        />
    );

    const Label = ({ htmlFor, children }) => (
        <label htmlFor={ htmlFor } className="block text-sm font-medium">
            { children }
        </label>
    );

    const DatabaseSelector = ({ value, onChange, label }) => (
        <div className="space-y-2">
            <Label>{ label }</Label>
            <select
                value={ value }
                onChange={ (e) => onChange(e.target.value) }
                className="w-full p-2 border rounded-md"
            >
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlite">SQLite</option>
                <option value="mssql">SQL Server</option>
            </select>
        </div>
    );

    const ResultsPanel = ({ loading, error, response, title, description }) => {
        return (
            <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
                <div className="p-6 pb-4 border-b">
                    <h3 className="text-lg font-semibold">{ title }</h3>
                    <p className="text-sm text-gray-600 mt-1">{ description }</p>
                </div>

                <div className="p-6 pt-4 flex-1 overflow-auto">
                    { loading && (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2">Generating SQL...</span>
                        </div>
                    ) }

                    { error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">Error: { error }</p>
                        </div>
                    ) }

                    { response && !loading && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4" />
                                        <span className="font-medium">Generated SQL</span>
                                    </div>
                                </div>
                                <pre className="p-4 text-sm font-mono bg-gray-900 text-green-400 overflow-auto">
                                    { response.sql }
                                </pre>
                            </div>

                            { response.tips && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Optimization Tips:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                        { response.tips.map((tip, index) => (
                                            <li key={ index }>{ tip }</li>
                                        )) }
                                    </ul>
                                </div>
                            ) }

                            { response.diagram && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">ER Diagram:</h4>
                                    <p className="text-green-700">{ response.diagram }</p>
                                </div>
                            ) }
                        </div>
                    ) }

                    { !response && !loading && !error && (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                                <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Generated SQL will appear here</p>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        );
    };

    // Resize handling
    const handleMouseDown = useCallback((e) => {
        setIsResizing(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Set minimum and maximum widths (25% to 75%)
        const minWidth = 25;
        const maxWidth = 75;

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setLeftPanelWidth(newWidth);
        }
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    // Add event listeners
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={ containerRef }
            className="flex h-full gap-0"
            style={ { minHeight: '600px' } }
        >
            {/* Left Panel - Card Component */ }
            <div
                style={ { width: `${leftPanelWidth}%` } }
                className="pr-2"
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Generate SQL Code
                        </CardTitle>
                        <CardDescription>
                            Describe what you want to build and get production-ready SQL code
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="prompt">What do you want to build?</Label>
                            <Textarea
                                id="prompt"
                                placeholder="e.g., Create a user management system with authentication, roles, and permissions"
                                value={ generateForm.prompt }
                                onChange={ (e) => setGenerateForm({ ...generateForm, prompt: e.target.value }) }
                                rows={ 4 }
                            />
                        </div>

                        <DatabaseSelector
                            value={ generateForm.databaseType }
                            onChange={ (value) => setGenerateForm({ ...generateForm, databaseType: value }) }
                            label="Database Type"
                        />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="include-er"
                                    checked={ generateForm.includeERDiagram }
                                    onCheckedChange={ (checked) => setGenerateForm({ ...generateForm, includeERDiagram: checked }) }
                                />
                                <Label htmlFor="include-er">Include ER Diagram</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="include-tips"
                                    checked={ generateForm.includeTips }
                                    onCheckedChange={ (checked) => setGenerateForm({ ...generateForm, includeTips: checked }) }
                                />
                                <Label htmlFor="include-tips">Include Optimization Tips</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="save-file"
                                    checked={ generateForm.saveToFile }
                                    onCheckedChange={ (checked) => setGenerateForm({ ...generateForm, saveToFile: checked }) }
                                />
                                <Label htmlFor="save-file">Save to File</Label>
                            </div>

                            { generateForm.saveToFile && (
                                <Input
                                    placeholder="filename.sql"
                                    value={ generateForm.fileName }
                                    onChange={ (e) => setGenerateForm({ ...generateForm, fileName: e.target.value }) }
                                />
                            ) }
                        </div>

                        <Button
                            onClick={ handleGenerateSQL }
                            disabled={ loading || !generateForm.prompt }
                            className="w-full"
                        >
                            { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Code className="w-4 h-4 mr-2" /> }
                            Generate SQL Code
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Resize Handle */ }
            <div
                className={ `w-4 cursor-col-resize select-none flex items-center justify-center transition-colors ${isResizing ? 'bg-blue-200' : 'hover:bg-gray-200'
                    }` }
                onMouseDown={ handleMouseDown }
            >
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Right Panel - ResultsPanel Component */ }
            <div
                style={ { width: `${100 - leftPanelWidth}%` } }
                className="pl-2"
            >
                <ResultsPanel
                    loading={ loading }
                    error={ error }
                    response={ response }
                    title="Generated Results"
                    description="Your generated SQL code and additional information"
                />
            </div>
        </div>
    );
};

export default GenerateSQLTab;