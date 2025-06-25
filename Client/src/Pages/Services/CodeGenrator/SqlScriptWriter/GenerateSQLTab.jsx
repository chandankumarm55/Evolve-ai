import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';
import { Code, Loader2 } from 'lucide-react';

import DatabaseSelector from './DatabaseSelector';
import ResultsPanel from './ResultsPanel';
import { makeApiCall } from './apiService';

const GenerateSQLTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <ResultsPanel
                loading={ loading }
                error={ error }
                response={ response }
                title="Generated Results"
                description="Your generated SQL code and additional information"
            />
        </div>
    );
};

export default GenerateSQLTab;