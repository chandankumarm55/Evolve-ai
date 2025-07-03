import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';
import { Code, Loader2, GripVertical } from 'lucide-react';

import DatabaseSelector from './DatabaseSelector';
import ResultsPanel from './ResultsPanel';
import { makeApiCall } from './apiService';

const GenerateSQLTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [leftWidth, setLeftWidth] = useState(50);
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

    const handleGenerateSQL = () => {
        makeApiCall('/sqlcodegenerate', generateForm, setLoading, setError, setResponse);
    };

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Constrain between 20% and 80%
        const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
        setLeftWidth(constrainedWidth);
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <div className="flex gap-2 h-full" ref={ containerRef }>
            {/* Left part */ }
            <div style={ { width: `${leftWidth}%` } } className="flex-shrink-0">
                <Card className="h-full">
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
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                                <Label htmlFor="include-er">Include ER Diagram</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="include-tips"
                                    checked={ generateForm.includeTips }
                                    onCheckedChange={ (checked) => setGenerateForm({ ...generateForm, includeTips: checked }) }
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                                <Label htmlFor="include-tips">Include Optimization Tips</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="save-file"
                                    checked={ generateForm.saveToFile }
                                    onCheckedChange={ (checked) => setGenerateForm({ ...generateForm, saveToFile: checked }) }
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
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

            {/* Resizer */ }
            <div
                className={ `flex items-center justify-center w-2 cursor-col-resize hover:bg-gray-200 transition-colors ${isResizing ? 'bg-gray-300' : 'bg-gray-100'
                    }` }
                onMouseDown={ handleMouseDown }
            >
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Right part */ }
            <div style={ { width: `${100 - leftWidth}%` } } className="flex-shrink-0">
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