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
    const [activeTab, setActiveTab] = useState('sql');
    const [runResults, setRunResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const handleRunSQL = async () => {
        setIsRunning(true);
        // Simulate query execution
        setTimeout(() => {
            setRunResults({
                success: true,
                message: "Query executed successfully!",
                rowsAffected: 5,
                executionTime: "0.023s"
            });
            setIsRunning(false);
        }, 1500);
    };

    const renderERDiagram = (diagram) => {
        if (!diagram) return null;
        return (
            <div className="font-mono text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded border overflow-x-auto">
                { diagram }
            </div>
        );
    };

    const tabs = [
        { id: 'sql', label: 'SQL Code', icon: Code, show: response?.data?.sql },
        { id: 'diagram', label: 'ER Diagram', icon: GitBranch, show: response?.data?.erDiagram },
        { id: 'tips', label: 'Tips', icon: Lightbulb, show: response?.data?.tips }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    { title }
                </CardTitle>
                <CardDescription>{ description }</CardDescription>
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
                        {/* Tab Navigation */ }
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            { tabs.filter(tab => tab.show).map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={ tab.id }
                                        onClick={ () => setActiveTab(tab.id) }
                                        className={ `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }` }
                                    >
                                        <Icon className="w-4 h-4" />
                                        { tab.label }
                                    </button>
                                );
                            }) }
                        </div>

                        {/* Tab Content */ }
                        { activeTab === 'sql' && response.data.sql && (
                            <div className="space-y-4">
                                <MonacoEditor
                                    value={ response.data.sql }
                                    language="sql"
                                    height="400px"
                                    readOnly={ true }
                                    onRun={ handleRunSQL }
                                />

                                {/* Run Results */ }
                                { (runResults || isRunning) && (
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Play className="w-4 h-4" />
                                            Execution Results
                                        </h4>
                                        { isRunning ? (
                                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                <span className="text-blue-700">Executing query...</span>
                                            </div>
                                        ) : runResults && (
                                            <div className={ `p-3 rounded border ${runResults.success
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                                }` }>
                                                <div className="flex items-center gap-2 text-sm">
                                                    { runResults.success ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                    ) }
                                                    <span className={ runResults.success ? 'text-green-700' : 'text-red-700' }>
                                                        { runResults.message }
                                                    </span>
                                                </div>
                                                { runResults.success && (
                                                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                                                        <div>Rows affected: { runResults.rowsAffected }</div>
                                                        <div>Execution time: { runResults.executionTime }</div>
                                                    </div>
                                                ) }
                                            </div>
                                        ) }
                                    </div>
                                ) }
                            </div>
                        ) }

                        { activeTab === 'diagram' && response.data.erDiagram && (
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" />
                                    ER Diagram
                                </h3>
                                <ScrollArea className="h-96 w-full">
                                    { renderERDiagram(response.data.erDiagram) }
                                </ScrollArea>
                            </div>
                        ) }

                        { activeTab === 'tips' && response.data.tips && (
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Optimization Tips
                                </h3>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{ response.data.tips }</pre>
                                </div>
                            </div>
                        ) }

                        {/* Metadata */ }
                        { response.metadata && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Database className="w-3 h-3 mr-1" />
                                    { response.metadata.databaseType?.toUpperCase() }
                                </Badge>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
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