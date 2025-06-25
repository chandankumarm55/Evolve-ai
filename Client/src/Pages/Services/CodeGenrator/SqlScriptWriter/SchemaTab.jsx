import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Database, Loader2 } from 'lucide-react';

import DatabaseSelector from './DatabaseSelector';
import ResultsPanel from './ResultsPanel';
import { makeApiCall } from './apiService';

const SchemaTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const [schemaForm, setSchemaForm] = useState({
        description: '',
        databaseType: 'mysql',
        entities: '',
        relationships: ''
    });

    const handleGenerateSchema = () => {
        const formData = {
            ...schemaForm,
            entities: schemaForm.entities ? JSON.parse(schemaForm.entities) : undefined,
            relationships: schemaForm.relationships ? JSON.parse(schemaForm.relationships) : undefined
        };
        makeApiCall('/sqlschema', formData, setLoading, setError, setResponse);
    };

    return (
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

            <ResultsPanel
                loading={ loading }
                error={ error }
                response={ response }
                title="Schema Results"
                description="Your generated database schema"
            />
        </div>
    );
};

export default SchemaTab;