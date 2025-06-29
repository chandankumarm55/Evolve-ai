import React, { useState, useRef } from 'react';
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
    Zap
} from 'lucide-react';

const ResultsPanel = ({ loading, error, response, title, description }) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('sql');

    // Monaco-like Editor Component
    const CodeEditor = ({ value, language = 'sql', height = '400px', readOnly = true, onRun }) => {
        const [editorCopied, setEditorCopied] = useState(false);
        const editorRef = useRef(null);

        const copyToClipboard = () => {
            navigator.clipboard.writeText(value);
            setEditorCopied(true);
            setTimeout(() => setEditorCopied(false), 2000);
        };

        const downloadFile = () => {
            const blob = new Blob([value], { type: 'text/plain' });
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
            if (onRun) {
                onRun(value);
            } else {
                // Mock run functionality - you can replace this with actual execution
                alert('Script execution would happen here!\n\nIn a real implementation, this would:\n1. Connect to your database\n2. Execute the SQL script\n3. Show results or errors');
            }
        };

        if (!value) return null;

        return (
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">{ language.toUpperCase() } Editor</span>
                        { readOnly && <Badge variant="secondary" className="text-xs bg-gray-600">Read Only</Badge> }
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={ runScript }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                        >
                            <Play className="w-3 h-3 mr-1" />
                            Run Script
                        </Button>
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
                            value={ value }
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
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="sql" className="flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    SQL Code
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
                                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px]">
                                            { typeof response.data.erDiagram === 'string' && response.data.erDiagram.startsWith('http') ? (
                                                <img
                                                    src={ response.data.erDiagram }
                                                    alt="ER Diagram"
                                                    className="max-w-full h-auto mx-auto"
                                                />
                                            ) : (
                                                <div className="bg-white rounded border p-4">
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

export default ResultsPanel;