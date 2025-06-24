import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Separator } from '../../../../components/ui/separator';
import { ScrollArea } from '../../../../components/ui/scroll-area';


import {
    Database,
    Code,
    Zap,
    FileText,
    Lightbulb,
    Download,
    Copy,
    CheckCircle,
    AlertCircle,
    Loader2,
    GitBranch,
    Settings
} from 'lucide-react';

const SQLScriptWriter = () => {
    const [activeTab, setActiveTab] = useState('generate');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Generate SQL Form State
    const [generateForm, setGenerateForm] = useState({
        prompt: '',
        databaseType: 'mysql',
        includeERDiagram: false,
        includeTips: false,
        saveToFile: false,
        fileName: ''
    });

    // Schema Form State
    const [schemaForm, setSchemaForm] = useState({
        description: '',
        databaseType: 'mysql',
        entities: '',
        relationships: ''
    });

    // Optimize Form State
    const [optimizeForm, setOptimizeForm] = useState({
        sqlQuery: '',
        databaseType: 'mysql',
        performanceGoals: ''
    });

    // ER Diagram Form State
    const [erForm, setErForm] = useState({
        tables: '',
        relationships: ''
    });

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

    const handleGenerateSQL = () => {
        makeApiCall('/sqlcodegenerate', generateForm);
    };

    const handleGenerateSchema = () => {
        const formData = {
            ...schemaForm,
            entities: schemaForm.entities ? JSON.parse(schemaForm.entities) : undefined,
            relationships: schemaForm.relationships ? JSON.parse(schemaForm.relationships) : undefined
        };
        makeApiCall('/sqlschema', formData);
    };

    const handleOptimizeSQL = () => {
        makeApiCall('/sqloptimize', optimizeForm);
    };

    const handleGenerateERDiagram = () => {
        const formData = {
            tables: JSON.parse(erForm.tables),
            relationships: JSON.parse(erForm.relationships)
        };
        makeApiCall('/sqlerdiagram', formData);
    };

    const handleGetTips = () => {
        makeApiCall('/sqltips', tipsForm);
    };

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
        <div className="max-w-7xl mx-auto  mt-15 pt-15 space-y-6">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Database className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">SQL Script Writer</h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Generate, optimize, and manage SQL scripts with AI assistance. Create database schemas,
                    optimize queries, and get expert tips for your database projects.
                </p>
            </div>

            <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="generate" className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Generate SQL
                    </TabsTrigger>
                    <TabsTrigger value="schema" className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Schema
                    </TabsTrigger>
                    <TabsTrigger value="optimize" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Optimize
                    </TabsTrigger>
                    <TabsTrigger value="diagram" className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        ER Diagram
                    </TabsTrigger>
                    <TabsTrigger value="tips" className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Tips
                    </TabsTrigger>
                </TabsList>

                {/* Generate SQL Tab */ }
                <TabsContent value="generate">
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

                        {/* Results Panel */ }
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Generated Results
                                </CardTitle>
                                <CardDescription>
                                    Your generated SQL code and additional information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                { loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="ml-2">Generating SQL code...</span>
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
                                                    Optimization Tips
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
                    </div>
                </TabsContent>

                {/* Schema Generation Tab */ }
                <TabsContent value="schema">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="w-5 h-5" />
                                    Generate Database Schema
                                </CardTitle>
                                <CardDescription>
                                    Create a complete database schema from your description
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Database Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="e.g., E-commerce platform with products, customers, orders, and inventory"
                                        value={ schemaForm.description }
                                        onChange={ (e) => setSchemaForm({ ...schemaForm, description: e.target.value }) }
                                        rows={ 4 }
                                    />
                                </div>

                                <DatabaseSelector
                                    value={ schemaForm.databaseType }
                                    onChange={ (value) => setSchemaForm({ ...schemaForm, databaseType: value }) }
                                    label="Database Type"
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="entities">Entities (JSON format, optional)</Label>
                                    <Textarea
                                        id="entities"
                                        placeholder='[{"name": "users", "attributes": ["id", "email", "name"]}]'
                                        value={ schemaForm.entities }
                                        onChange={ (e) => setSchemaForm({ ...schemaForm, entities: e.target.value }) }
                                        rows={ 3 }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="relationships">Relationships (JSON format, optional)</Label>
                                    <Textarea
                                        id="relationships"
                                        placeholder='[{"from": "orders", "to": "users", "type": "many-to-one"}]'
                                        value={ schemaForm.relationships }
                                        onChange={ (e) => setSchemaForm({ ...schemaForm, relationships: e.target.value }) }
                                        rows={ 3 }
                                    />
                                </div>

                                <Button
                                    onClick={ handleGenerateSchema }
                                    disabled={ loading || !schemaForm.description }
                                    className="w-full"
                                >
                                    { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" /> }
                                    Generate Schema
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Schema Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                { loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="ml-2">Generating schema...</span>
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
                                    <ScrollArea className="h-96 w-full">
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm">
                                            <code>{ response.data.schema }</code>
                                        </pre>
                                    </ScrollArea>
                                ) }
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Optimize SQL Tab */ }
                <TabsContent value="optimize">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Optimize SQL Query
                                </CardTitle>
                                <CardDescription>
                                    Improve performance of your existing SQL queries
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sql-query">SQL Query to Optimize</Label>
                                    <Textarea
                                        id="sql-query"
                                        placeholder="SELECT * FROM users WHERE email LIKE '%@gmail.com%'"
                                        value={ optimizeForm.sqlQuery }
                                        onChange={ (e) => setOptimizeForm({ ...optimizeForm, sqlQuery: e.target.value }) }
                                        rows={ 6 }
                                        className="font-mono"
                                    />
                                </div>

                                <DatabaseSelector
                                    value={ optimizeForm.databaseType }
                                    onChange={ (value) => setOptimizeForm({ ...optimizeForm, databaseType: value }) }
                                    label="Database Type"
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="performance-goals">Performance Goals (optional)</Label>
                                    <Input
                                        id="performance-goals"
                                        placeholder="e.g., Optimize for large datasets, reduce query time"
                                        value={ optimizeForm.performanceGoals }
                                        onChange={ (e) => setOptimizeForm({ ...optimizeForm, performanceGoals: e.target.value }) }
                                    />
                                </div>

                                <Button
                                    onClick={ handleOptimizeSQL }
                                    disabled={ loading || !optimizeForm.sqlQuery }
                                    className="w-full"
                                >
                                    { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" /> }
                                    Optimize Query
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Optimization Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                { loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="ml-2">Optimizing query...</span>
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
                                        <div>
                                            <h3 className="font-semibold mb-2">Original Query</h3>
                                            <pre className="bg-gray-100 p-3 rounded text-sm font-mono">
                                                { response.data.original }
                                            </pre>
                                        </div>
                                        <Separator />
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
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ER Diagram Tab */ }
                <TabsContent value="diagram">
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
                                        placeholder='[{"name": "users", "columns": [{"name": "id", "type": "INT", "primary": true}]}]'
                                        value={ erForm.tables }
                                        onChange={ (e) => setErForm({ ...erForm, tables: e.target.value }) }
                                        rows={ 6 }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="er-relationships">Relationships (JSON format)</Label>
                                    <Textarea
                                        id="er-relationships"
                                        placeholder='[{"from": "orders", "to": "users", "type": "many-to-one", "cardinality": "1:N"}]'
                                        value={ erForm.relationships }
                                        onChange={ (e) => setErForm({ ...erForm, relationships: e.target.value }) }
                                        rows={ 4 }
                                    />
                                </div>

                                <Button
                                    onClick={ handleGenerateERDiagram }
                                    disabled={ loading || !erForm.tables || !erForm.relationships }
                                    className="w-full"
                                >
                                    { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitBranch className="w-4 h-4 mr-2" /> }
                                    Generate ER Diagram
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>ER Diagram</CardTitle>
                            </CardHeader>
                            <CardContent>
                                { loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        <span className="ml-2">Generating diagram...</span>
                                    </div>
                                ) }

                                { error && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <AlertTitle className="text-red-800">Error</AlertTitle>
                                        <AlertDescription className="text-red-700">{ error }</AlertDescription>
                                    </Alert>
                                ) }

                                { response && response.data && response.data.diagram && (
                                    <ScrollArea className="h-96 w-full">
                                        { renderERDiagram(response.data.diagram) }
                                    </ScrollArea>
                                ) }
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tips Tab */ }
                <TabsContent value="tips">
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
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SQLScriptWriter;