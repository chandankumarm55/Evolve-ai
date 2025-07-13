import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ArrowLeft, Monitor, Play, Copy, CheckCircle, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Code, Zap, GitBranch, Lightbulb } from 'lucide-react';

// Import all tab components
import GenerateSQLTab from './GenerateSQLTab';

const SQLScriptWriter = () => {
    const navigate = useNavigate();

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

    const [activeTab, setActiveTab] = useState('generate');

    const handleBackClick = () => {
        navigate('/dashboard/codegenerator');
    };

    return (
        <div className="max-w-7xl mx-auto pt-20 px-4 space-y-6">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 relative">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={ handleBackClick }
                        className="absolute left-0 flex items-center gap-2 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <Database className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">SQL Script Writer</h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Generate, optimize, and manage SQL scripts with AI assistance. Create database schemas,
                    optimize queries, and get expert tips for your database projects.
                </p>
            </div>

            <GenerateSQLTab />
        </div>
    );
};

export default SQLScriptWriter;