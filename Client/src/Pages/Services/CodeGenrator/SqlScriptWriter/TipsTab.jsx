
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Label } from '../../../../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import {
    Lightbulb,
    Loader2,
    AlertCircle
} from 'lucide-react';

const TipsTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    // Tips Form State
    const [tipsForm, setTipsForm] = useState({
        databaseType: 'mysql',
        scenario: '',
        currentIssues: ''
    });

    const API_BASE_URL = 'http://localhost:3000/api/codewriter';

    const makeApiCall = async (endpoint, data) => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }

            setResponse(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGetTips = () => {
        makeApiCall('/sqltips', tipsForm);
    };

    const DatabaseSelector = ({ value, onChange, label }) => (
        <div className="space-y-2">
            <Label>{ label }</Label>
            <Select value={ value } onValueChange={ onChange }>
                <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="sqlserver">SQL Server</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Database Tips & Best Practices
                    </CardTitle>
                    <CardDescription>
                        Get expert advice for your database challenges
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DatabaseSelector
                        value={ tipsForm.databaseType }
                        onChange={ (value) => setTipsForm({ ...tipsForm, databaseType: value }) }
                        label="Database Type"
                    />

                    <div className="space-y-2">
                        <Label htmlFor="scenario">Scenario Description</Label>
                        <Textarea
                            id="scenario"
                            placeholder="e.g., High-traffic e-commerce application with complex reporting needs"
                            value={ tipsForm.scenario }
                            onChange={ (e) => setTipsForm({ ...tipsForm, scenario: e.target.value }) }
                            rows={ 3 }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="current-issues">Current Issues (optional)</Label>
                        <Textarea
                            id="current-issues"
                            placeholder="e.g., Slow query performance, connection pool exhaustion"
                            value={ tipsForm.currentIssues }
                            onChange={ (e) => setTipsForm({ ...tipsForm, currentIssues: e.target.value }) }
                            rows={ 3 }
                        />
                    </div>

                    <Button
                        onClick={ handleGetTips }
                        disabled={ loading || !tipsForm.databaseType || !tipsForm.scenario }
                        className="w-full"
                    >
                        { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" /> }
                        Get Expert Tips
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Expert Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                    { loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2">Getting expert tips...</span>
                        </div>
                    ) }

                    { error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800">Error</AlertTitle>
                            <AlertDescription className="text-red-700">{ error }</AlertDescription>
                        </Alert>
                    ) }

                    { response && response.data && response.data.tips && (
                        <ScrollArea className="h-96 w-full">
                            <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                <pre className="whitespace-pre-wrap text-sm">{ response.data.tips }</pre>
                            </div>
                        </ScrollArea>
                    ) }
                </CardContent>
            </Card>
        </div>
    );
};

export default TipsTab;