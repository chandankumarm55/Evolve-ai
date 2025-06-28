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

// Mock ResultsPanel component
const ResultsPanel = ({ loading, error, response, title, description }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                { title }
            </CardTitle>
            <CardDescription>{ description }</CardDescription>
        </CardHeader>
        <CardContent>
            { loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                        <p className="text-gray-600">Generating ER Diagram...</p>
                        <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
                            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={ { width: '60%' } }></div>
                        </div>
                    </div>
                </div>
            ) }

            { error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-medium">Error</h3>
                    </div>
                    <p className="text-red-600">{ error }</p>
                </div>
            ) }

            { response && (
                <div className="space-y-6">
                    {/* ER Diagram Display */ }
                    { response.diagram && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <GitBranch className="w-5 h-5" />
                                    ER Diagram
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={ () => navigator.clipboard.writeText(response.diagram) }
                                    >
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copy
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={ () => {
                                            const blob = new Blob([response.diagram], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'er-diagram.txt';
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        } }
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-gray-50 border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <pre className="whitespace-pre-wrap">{ response.diagram }</pre>
                            </div>
                        </div>
                    ) }

                    {/* Tables Information */ }
                    { response.tables && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Table className="w-5 h-5" />
                                Tables ({ response.tables.length })
                            </h3>
                            <div className="grid gap-4">
                                { response.tables.map((table, index) => (
                                    <div key={ index } className="border rounded-lg p-4 bg-white">
                                        <h4 className="font-medium text-lg mb-2">{ table.name }</h4>
                                        { table.columns && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-600">Columns:</p>
                                                <div className="grid gap-1">
                                                    { table.columns.map((column, colIndex) => (
                                                        <div key={ colIndex } className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded text-sm">
                                                            <span className="font-mono">{ column.name }</span>
                                                            <span className="text-gray-500">{ column.type }</span>
                                                        </div>
                                                    )) }
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                )) }
                            </div>
                        </div>
                    ) }

                    {/* Relationships */ }
                    { response.relationships && response.relationships.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">Relationships ({ response.relationships.length })</h3>
                            <div className="space-y-2">
                                { response.relationships.map((rel, index) => (
                                    <div key={ index } className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                                        <span className="font-medium">{ rel.from }</span>
                                        <span className="text-blue-600 font-mono text-sm">{ rel.type || 'relates to' }</span>
                                        <span className="font-medium">{ rel.to }</span>
                                    </div>
                                )) }
                            </div>
                        </div>
                    ) }

                    {/* Success Message */ }
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">ER Diagram generated successfully!</span>
                        </div>
                    </div>
                </div>
            ) }

            { !loading && !error && !response && (
                <div className="text-center py-12 text-gray-500">
                    <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No ER Diagram Generated</p>
                    <p className="text-sm">Fill in the table and relationship information, then click generate</p>
                </div>
            ) }
        </CardContent>
    </Card>
);

export default ResultsPanel;