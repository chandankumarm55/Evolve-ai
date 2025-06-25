import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
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
    Settings
} from 'lucide-react';

const ResultsPanel = ({ loading, error, response, title, description }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatSQL = (sql) => {
        if (!sql) return '';
        return sql
            .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ORDER BY|GROUP BY|HAVING|INSERT INTO|UPDATE|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi, '\n$1')
            .replace(/,/g, ',\n  ')
            .trim();
    };

    const renderERDiagram = (diagram) => {
        if (!diagram) return null;
        return (
            <div className="font-mono text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded border overflow-x-auto">
                { diagram }
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    { title }
                </CardTitle>
                <CardDescription>
                    { description }
                </CardDescription>
            </CardHeader>
            <CardContent>
                { loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2">Processing...</span>
                    </div>
                ) }

                { error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Error</AlertTitle>
                        <AlertDescription className="text-red-700">{ error }</AlertDescription>
                    </Alert>
                ) }

                { response && response.data && (
                    <div className="space-y-4">
                        { response.data.sql && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Code className="w-4 h-4" />
                                        SQL Code
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={ () => copyToClipboard(response.data.sql) }
                                        >
                                            { copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" /> }
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={ () => downloadFile(response.data.sql, 'generated.sql') }
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="h-64 w-full">
                                    <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                                        <code>{ formatSQL(response.data.sql) }</code>
                                    </pre>
                                </ScrollArea>
                            </div>
                        ) }

                        { response.data.schema && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Database Schema
                                </h3>
                                <ScrollArea className="h-96 w-full">
                                    <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm">
                                        <code>{ response.data.schema }</code>
                                    </pre>
                                </ScrollArea>
                            </div>
                        ) }

                        { response.data.original && response.data.optimized && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Original Query</h3>
                                    <pre className="bg-gray-100 p-3 rounded text-sm font-mono">
                                        { response.data.original }
                                    </pre>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Optimized Version</h3>
                                    <ScrollArea className="h-64 w-full">
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm">
                                            <code>{ response.data.optimized }</code>
                                        </pre>
                                    </ScrollArea>
                                </div>
                            </div>
                        ) }

                        { response.data.diagram && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" />
                                    ER Diagram
                                </h3>
                                <ScrollArea className="h-96 w-full">
                                    { renderERDiagram(response.data.diagram) }
                                </ScrollArea>
                            </div>
                        ) }

                        { response.data.erDiagram && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" />
                                    ER Diagram
                                </h3>
                                { renderERDiagram(response.data.erDiagram) }
                            </div>
                        ) }

                        { response.data.tips && (
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    { response.data.sql ? 'Optimization Tips' : 'Expert Tips' }
                                </h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                                    <pre className="whitespace-pre-wrap text-sm">{ response.data.tips }</pre>
                                </div>
                            </div>
                        ) }

                        { response.metadata && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <Badge variant="outline">
                                    <Database className="w-3 h-3 mr-1" />
                                    { response.metadata.databaseType?.toUpperCase() }
                                </Badge>
                                <Badge variant="outline">
                                    <Settings className="w-3 h-3 mr-1" />
                                    { response.metadata.tokenUsage?.completion_tokens } tokens
                                </Badge>
                            </div>
                        ) }
                    </div>
                ) }
            </CardContent>
        </Card>
    );
};

export default ResultsPanel;