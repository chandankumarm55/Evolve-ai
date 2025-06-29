import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { GitBranch, Loader2, Monitor, Play, Copy, CheckCircle, Download } from 'lucide-react';

import ResultsPanel from './ResultsPanel';
import { makeApiCall } from './apiService';

const ERDiagramTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const [erForm, setErForm] = useState({
        tables: '',
        relationships: ''
    });

    // Monaco Editor Component
    const MonacoEditor = ({ value, onChange, language = 'sql', height = '300px', readOnly = false, onRun }) => {
        const [copied, setCopied] = useState(false);
        const editorRef = useRef(null);

        const copyToClipboard = () => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        const downloadFile = () => {
            const blob = new Blob([value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `code.${language}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        return (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">{ language.toUpperCase() } Editor</span>
                        { readOnly && <Badge variant="secondary" className="text-xs">Read Only</Badge> }
                    </div>
                    <div className="flex items-center gap-2">
                        { onRun && (
                            <Button
                                size="sm"
                                onClick={ onRun }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                            >
                                <Play className="w-3 h-3 mr-1" />
                                Run
                            </Button>
                        ) }
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={ copyToClipboard }
                            className="text-white hover:bg-gray-700 px-2 py-1"
                        >
                            { copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" /> }
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
                    <textarea
                        ref={ editorRef }
                        value={ value }
                        onChange={ (e) => onChange && onChange(e.target.value) }
                        readOnly={ readOnly }
                        className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 border-none outline-none resize-none"
                        style={ {
                            backgroundColor: '#1a1a1a',
                            color: '#22c55e',
                            fontFamily: 'Monaco, Menlo, monospace',
                            fontSize: '13px',
                            lineHeight: '1.5'
                        } }
                        placeholder={ readOnly ? '' : `Enter your ${language.toUpperCase()} code here...` }
                    />
                </div>
            </div>
        );
    };

    const handleGenerateERDiagram = () => {
        try {
            const formData = {
                tables: erForm.tables ? JSON.parse(erForm.tables) : [],
                relationships: erForm.relationships ? JSON.parse(erForm.relationships) : []
            };
            makeApiCall('/sqlerdiagram', formData, setLoading, setError, setResponse);
        } catch (parseError) {
            setError('Invalid JSON format. Please check your input.');
        }
    };

    // Extract SQL from response data
    const getSQLFromResponse = () => {
        if (!response?.data?.sql) return '';
        // Remove markdown code blocks if present
        return response.data.sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            Generate ER Diagram
                        </CardTitle>
                        <CardDescription>
                            Create visual representation of database relationships
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tables">Tables (JSON format)</Label>
                            <Textarea
                                id="tables"
                                placeholder='[{"name": "users", "columns": ["id", "email", "name"]}, {"name": "orders", "columns": ["id", "user_id", "total"]}]'
                                value={ erForm.tables }
                                onChange={ (e) => setErForm({ ...erForm, tables: e.target.value }) }
                                rows={ 4 }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="relationships">Relationships (JSON format)</Label>
                            <Textarea
                                id="relationships"
                                placeholder='[{"from": "orders", "to": "users", "type": "many-to-one", "fromKey": "user_id", "toKey": "id"}]'
                                value={ erForm.relationships }
                                onChange={ (e) => setErForm({ ...erForm, relationships: e.target.value }) }
                                rows={ 4 }
                            />
                        </div>

                        <Button
                            onClick={ handleGenerateERDiagram }
                            disabled={ loading || (!erForm.tables && !erForm.relationships) }
                            className="w-full"
                        >
                            { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitBranch className="w-4 h-4 mr-2" /> }
                            Generate ER Diagram
                        </Button>
                    </CardContent>
                </Card>

                <ResultsPanel
                    loading={ loading }
                    error={ error }
                    response={ response }
                    title="ER Diagram Results"
                    description="Your generated ER diagram and SQL schema"
                />
            </div>

            {/* SQL Editor Section - Shows when response contains SQL */ }
            { response?.data?.sql && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="w-5 h-5" />
                            Generated SQL Schema
                        </CardTitle>
                        <CardDescription>
                            SQL code for your database schema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MonacoEditor
                            value={ getSQLFromResponse() }
                            language="sql"
                            height="400px"
                            readOnly={ true }
                        />
                    </CardContent>
                </Card>
            ) }

            {/* ER Diagram Section - Shows when response contains ER diagram */ }
            { response?.data?.erDiagram && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            Entity Relationship Diagram
                        </CardTitle>
                        <CardDescription>
                            Visual representation of your database structure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
                            {/* If ER diagram is an image URL */ }
                            { typeof response.data.erDiagram === 'string' && response.data.erDiagram.startsWith('http') ? (
                                <img
                                    src={ response.data.erDiagram }
                                    alt="ER Diagram"
                                    className="max-w-full h-auto"
                                />
                            ) : (
                                /* If ER diagram is text/mermaid code */
                                <div className="w-full">
                                    <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border overflow-x-auto">
                                        { typeof response.data.erDiagram === 'string'
                                            ? response.data.erDiagram
                                            : JSON.stringify(response.data.erDiagram, null, 2)
                                        }
                                    </pre>
                                </div>
                            ) }
                        </div>
                    </CardContent>
                </Card>
            ) }

            {/* Tips Section - Shows when response contains tips */ }
            { response?.data?.tips && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5" />
                            Database Design Tips
                        </CardTitle>
                        <CardDescription>
                            Recommendations for your database schema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <pre className="whitespace-pre-wrap text-sm text-blue-800">
                                { typeof response.data.tips === 'string'
                                    ? response.data.tips
                                    : JSON.stringify(response.data.tips, null, 2)
                                }
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            ) }

            {/* Explanation Section - Shows when response contains explanation */ }
            { response?.data?.explanation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Explanation</CardTitle>
                        <CardDescription>
                            Detailed explanation of the generated schema
                        </CardDescription>
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
    );
};

export default ERDiagramTab;