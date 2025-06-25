import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { GitBranch, Loader2 } from 'lucide-react';

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

    const handleGenerateERDiagram = () => {
        const formData = {
            tables: JSON.parse(erForm.tables),
            relationships: JSON.parse(erForm.relationships)
        };
        makeApiCall('/sqlerdiagram', formData, setLoading, setError, setResponse);
    };

    return (
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
                            placeholder='[{"name": "users", "columns": ["id", "email", "name"]}]'
                            value={ erForm.tables }
                            onChange={ (e) => setErForm({ ...erForm, tables: e.target.value }) }
                            rows={ 3 }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relationships">Relationships (JSON format)</Label>
                        <Textarea
                            id="relationships"
                            placeholder='[{"from": "orders", "to": "users", "type": "many-to-one"}]'
                            value={ erForm.relationships }
                            onChange={ (e) => setErForm({ ...erForm, relationships: e.target.value }) }
                            rows={ 3 }
                        />
                    </div>

                    <Button
                        onClick={ handleGenerateERDiagram }
                        disabled={ loading || !erForm.tables }
                        className="w-full"
                    >
                        { loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitBranch className="w-4 h-4 mr-2" /> }
                        Generate Diagram
                    </Button>
                </CardContent>
            </Card>

            <ResultsPanel
                loading={ loading }
                error={ error }
                response={ response }
                title="ER Diagram"
                description="Your generated ER diagram"
            />
        </div>
    );
};

export default ERDiagramTab;