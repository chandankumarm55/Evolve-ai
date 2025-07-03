import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import {
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
    Copy,
    Download,
    Code,
    GitBranch,
    Lightbulb,
    Database,
    Settings,
    Monitor,
    Play,
    Table,
    Info,
    Zap,
    Terminal,
    RotateCcw,
    Save,
    Edit3,
    ExternalLink,
    Square
} from 'lucide-react'

const EnhancedResultsPanel = ({ loading, error, response, title, description }) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('sql');
    const [isTestMode, setIsTestMode] = useState(false);
    const [testingSql, setTestingSql] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [executionResults, setExecutionResults] = useState([]);
    const terminalRef = useRef(null);

    // Enhanced Monaco-like Editor Component
    const CodeEditor = ({ value, language = 'sql', height = '400px', readOnly = true, onRun, onEdit }) => {
        const [editorCopied, setEditorCopied] = useState(false);
        const [editableValue, setEditableValue] = useState(value);
        const editorRef = useRef(null);

        useEffect(() => {
            setEditableValue(value);
        }, [value]);

        const copyToClipboard = () => {
            navigator.clipboard.writeText(readOnly ? value : editableValue);
            setEditorCopied(true);
            setTimeout(() => setEditorCopied(false), 2000);
        };

        const downloadFile = () => {
            const content = readOnly ? value : editableValue;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `script.${language}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const runScript = () => {
            const codeToRun = readOnly ? value : editableValue;
            if (onRun) {
                onRun(codeToRun);
            }
        };

        const toggleEditMode = () => {
            if (readOnly && onEdit) {
                onEdit(value);
            }
        };

        const openInTestEnvironment = () => {
            setTestingSql(readOnly ? value : editableValue);
            setIsTestMode(true);
            setActiveTab('testing');
        };

        if (!value && !editableValue) return null;

        return (
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">{ language.toUpperCase() } Editor</span>
                        { readOnly ? (
                            <Badge variant="secondary" className="text-xs bg-gray-600">Read Only</Badge>
                        ) : (
                            <Badge variant="secondary" className="text-xs bg-blue-600">Editable</Badge>
                        ) }
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={ runScript }
                            disabled={ isExecuting }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                        >
                            { isExecuting ? (
                                <>
                                    <Square className="w-3 h-3 mr-1" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Run
                                </>
                            ) }
                        </Button>
                        <Button
                            size="sm"
                            onClick={ openInTestEnvironment }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Test
                        </Button>
                        { readOnly && (
                            <Button
                                size="sm"
                                onClick={ toggleEditMode }
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 text-xs"
                            >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                            </Button>
                        ) }
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={ copyToClipboard }
                            className="text-white hover:bg-gray-700 px-2 py-1"
                        >
                            { editorCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" /> }
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={ downloadFile }
                            className="text-white hover:bg-gray-700 px-2 py-1"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div style={ { height } } className="relative">
                    <ScrollArea className="h-full">
                        <textarea
                            ref={ editorRef }
                            value={ readOnly ? value : editableValue }
                            onChange={ (e) => !readOnly && setEditableValue(e.target.value) }
                            readOnly={ readOnly }
                            className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none"
                            style={ {
                                backgroundColor: '#1e1e1e',
                                color: '#d4d4d4',
                                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                minHeight: height
                            } }
                        />
                    </ScrollArea>
                </div>
            </div>
        );
    };

    // Mock SQL execution
    const executeSQL = async (sqlCode) => {
        setIsExecuting(true);
        addToTerminal(`🚀 Executing SQL script...`);
        addToTerminal(`⏰ Started at: ${new Date().toLocaleTimeString()}`);

        // Simulate execution
        await new Promise(resolve => setTimeout(resolve, 1500));

        addToTerminal(`✅ SQL script executed successfully`);
        addToTerminal(`📊 Rows affected: ${Math.floor(Math.random() * 10) + 1}`);
        addToTerminal(`⚡ Execution time: ${Math.floor(Math.random() * 500) + 100}ms`);

        setExecutionResults([
            {
                type: 'SUCCESS',
                message: 'SQL script executed successfully',
                rowsAffected: Math.floor(Math.random() * 10) + 1,
                executionTime: Math.floor(Math.random() * 500) + 100
            }
        ]);

        setIsExecuting(false);
    };

    const addToTerminal = (text) => {
        setTerminalOutput(prev => prev + text + '\n');
    };

    const clearTerminal = () => {
        setTerminalOutput('');
        setExecutionResults([]);
    };

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    // Extract clean SQL from response
    const getCleanSQL = () => {
        if (!response?.data?.sql) return '';
        return response.data.sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
    };

    // Parse tables from SQL if not provided separately
    const parseTablesFromSQL = () => {
        const sql = getCleanSQL();
        if (!sql) return [];

        const createTableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
        const tables = [];
        let match;

        while ((match = createTableRegex.exec(sql)) !== null) {
            const tableName = match[1];
            const columnsText = match[2];
            const columnRegex = /(\w+)\s+([A-Z]+(?:\(\d+\))?)/gi;
            const columns = [];
            let columnMatch;

            while ((columnMatch = columnRegex.exec(columnsText)) !== null) {
                columns.push({
                    name: columnMatch[1],
                    type: columnMatch[2]
                });
            }

            tables.push({ name: tableName, columns });
        }

        return tables;
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    { title }
                </CardTitle>
                <CardDescription>{ description }</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                { loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                            <p className="text-gray-600">Processing your request...</p>
                            <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
                                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={ { width: '60%' } }></div>
                            </div>
                        </div>
                    </div>
                ) }

                { error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{ error }</AlertDescription>
                    </Alert>
                ) }

                { response && response.data && (
                    <div className="space-y-6">
                        {/* Main Content Tabs */ }
                        <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="sql" className="flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    SQL Code
                                </TabsTrigger>
                                <TabsTrigger value="testing" className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4" />
                                    Testing
                                </TabsTrigger>
                                <TabsTrigger value="diagram" className="flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" />
                                    ER Diagram
                                </TabsTrigger>
                                <TabsTrigger value="optimize" className="flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Optimization
                                </TabsTrigger>
                                <TabsTrigger value="info" className="flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Details
                                </TabsTrigger>
                            </TabsList>

                            {/* SQL Code Tab */ }
                            <TabsContent value="sql" className="space-y-4">
                                { response.data.sql ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Code className="w-5 h-5" />
                                                Generated SQL Script
                                            </h3>
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                { response.metadata?.databaseType?.toUpperCase() || 'SQL' }
                                            </Badge>
                                        </div>
                                        <CodeEditor
                                            value={ getCleanSQL() }
                                            language="sql"
                                            height="500px"
                                            onRun={ executeSQL }
                                            onEdit={ (code) => {
                                                setTestingSql(code);
                                                setActiveTab('testing');
                                            } }
                                        />

                                        {/* Tables Overview */ }
                                        { (response.data.tables || parseTablesFromSQL().length > 0) && (
                                            <div className="mt-6">
                                                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                                                    <Table className="w-4 h-4" />
                                                    Database Tables ({ (response.data.tables || parseTablesFromSQL()).length })
                                                </h4>
                                                <div className="grid gap-3">
                                                    { (response.data.tables || parseTablesFromSQL()).map((table, index) => (
                                                        <div key={ index } className="border rounded-lg p-3 bg-gray-50">
                                                            <h5 className="font-medium text-base mb-2 text-blue-600">{ table.name }</h5>
                                                            { table.columns && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    { table.columns.map((column, colIndex) => (
                                                                        <div key={ colIndex } className="flex items-center justify-between bg-white px-2 py-1 rounded text-sm border">
                                                                            <span className="font-mono text-gray-800">{ column.name }</span>
                                                                            <span className="text-gray-500 text-xs">{ column.type }</span>
                                                                        </div>
                                                                    )) }
                                                                </div>
                                                            ) }
                                                        </div>
                                                    )) }
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Code className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No SQL code generated</p>
                                    </div>
                                ) }
                            </TabsContent>

                            {/* Testing Tab */ }
                            <TabsContent value="testing" className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* SQL Editor */ }
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Edit3 className="w-5 h-5" />
                                                SQL Editor
                                            </h3>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={ () => executeSQL(testingSql) }
                                                    disabled={ isExecuting }
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    { isExecuting ? (
                                                        <>
                                                            <Square className="w-4 h-4 mr-2" />
                                                            Running...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Execute
                                                        </>
                                                    ) }
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={ clearTerminal }>
                                                    <RotateCcw className="w-4 h-4 mr-2" />
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                        <CodeEditor
                                            value={ testingSql || getCleanSQL() }
                                            language="sql"
                                            height="400px"
                                            readOnly={ false }
                                            onRun={ executeSQL }
                                        />
                                    </div>

                                    {/* Terminal & Results */ }
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Terminal className="w-5 h-5" />
                                                Terminal Output
                                            </h3>
                                            <Button size="sm" variant="outline" onClick={ clearTerminal }>
                                                Clear
                                            </Button>
                                        </div>
                                        <div
                                            ref={ terminalRef }
                                            className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto"
                                            style={ { fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' } }
                                        >
                                            <pre className="whitespace-pre-wrap">
                                                { terminalOutput || '💻 Terminal ready... Execute SQL to see output here.' }
                                            </pre>
                                        </div>

                                        {/* Execution Results */ }
                                        { executionResults.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Execution Results</h4>
                                                { executionResults.map((result, index) => (
                                                    <Alert key={ index }>
                                                        <CheckCircle className="h-4 w-4" />
                                                        <AlertTitle>{ result.type }</AlertTitle>
                                                        <AlertDescription>
                                                            { result.message } - { result.rowsAffected } rows affected in { result.executionTime }ms
                                                        </AlertDescription>
                                                    </Alert>
                                                )) }
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ER Diagram Tab */ }
                            <TabsContent value="diagram" className="space-y-4">
                                { response.data.erDiagram ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <GitBranch className="w-5 h-5" />
                                                Entity Relationship Diagram
                                            </h3>
                                        </div>

                                        {/* ER Diagram Display */ }
                                        <div className="border">
                                            { typeof response.data.erDiagram === 'string' && response.data.erDiagram.startsWith('http') ? (
                                                <img
                                                    src={ response.data.erDiagram }
                                                    alt="ER Diagram"
                                                    className="max-w-full h-auto mx-auto"
                                                />
                                            ) : (
                                                <div className="rounded border p-4">
                                                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
                                                        { typeof response.data.erDiagram === 'string'
                                                            ? response.data.erDiagram
                                                            : JSON.stringify(response.data.erDiagram, null, 2)
                                                        }
                                                    </pre>
                                                </div>
                                            ) }
                                        </div>

                                        {/* Relationships */ }
                                        { response.data.relationships && response.data.relationships.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-md font-semibold">Table Relationships ({ response.data.relationships.length })</h4>
                                                <div className="space-y-2">
                                                    { response.data.relationships.map((rel, index) => (
                                                        <div key={ index } className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                                                            <span className="font-medium">{ rel.from }</span>
                                                            <span className="text-blue-600 font-mono text-sm px-2 py-1 bg-blue-100 rounded">
                                                                { rel.type || 'relates to' }
                                                            </span>
                                                            <span className="font-medium">{ rel.to }</span>
                                                        </div>
                                                    )) }
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p className="text-lg mb-2">No ER Diagram Generated</p>
                                        <p className="text-sm">ER diagram will appear here when available</p>
                                    </div>
                                ) }
                            </TabsContent>

                            {/* Optimization Tab */ }
                            <TabsContent value="optimize" className="space-y-4">
                                { response.data.tips ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5" />
                                            Optimization Tips & Recommendations
                                        </h3>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <pre className="whitespace-pre-wrap text-sm text-yellow-800">
                                                { typeof response.data.tips === 'string'
                                                    ? response.data.tips
                                                    : JSON.stringify(response.data.tips, null, 2)
                                                }
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No optimization tips available</p>
                                    </div>
                                ) }
                            </TabsContent>

                            {/* Details Tab */ }
                            <TabsContent value="info" className="space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        Request Details & Metadata
                                    </h3>

                                    {/* Success Alert */ }
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertTitle>Generation Successful</AlertTitle>
                                        <AlertDescription>
                                            Your SQL script has been generated successfully and is ready to use.
                                        </AlertDescription>
                                    </Alert>

                                    {/* Metadata */ }
                                    { response.metadata && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Generation Metadata</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">Database Type:</span>
                                                        <Badge variant="outline" className="ml-2">
                                                            { response.metadata.databaseType?.toUpperCase() }
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Generated:</span>
                                                        <span className="ml-2 text-gray-600">
                                                            { new Date(response.metadata.timestamp).toLocaleString() }
                                                        </span>
                                                    </div>
                                                    { response.metadata.tokenUsage && (
                                                        <>
                                                            <div>
                                                                <span className="font-medium">Tokens Used:</span>
                                                                <span className="ml-2 text-gray-600">
                                                                    { response.metadata.tokenUsage.total_tokens }
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Completion:</span>
                                                                <span className="ml-2 text-gray-600">
                                                                    { response.metadata.tokenUsage.completion_tokens }
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) }
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) }

                                    {/* Explanation */ }
                                    { response.data.explanation && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Explanation</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose max-w-none">
                                                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border">
                                                        { typeof response.data.explanation === 'string'
                                                            ? response.data.explanation
                                                            : JSON.stringify(response.data.explanation, null, 2)
                                                        }
                                                    </pre>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) }
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) }

                { !loading && !error && !response && (
                    <div className="text-center py-12 text-gray-500">
                        <Database className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">No Results Yet</p>
                        <p className="text-sm">Fill in the form and generate to see results here</p>
                    </div>
                ) }
            </CardContent>
        </Card>
    );
};

export default EnhancedResultsPanel;