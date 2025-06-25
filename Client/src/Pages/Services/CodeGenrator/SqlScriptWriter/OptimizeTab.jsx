import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Zap, Loader2 } from 'lucide-react';

import DatabaseSelector from './DatabaseSelector';
import ResultsPanel from './ResultsPanel';
import { makeApiCall } from './apiService';

const OptimizeTab = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const [optimizeForm, setOptimizeForm] = useState({
        sqlQuery: '',
        databaseType: 'mysql',
        performanceGoals: ''
    });

    const handleOptimizeSQL = () => {
        makeApiCall('/sqloptimize', optimizeForm, setLoading, setError, setResponse);
    };

    return (
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

            <ResultsPanel
                loading={ loading }
                error={ error }
                response={ response }
                title="Optimization Results"
                description="Your optimized SQL query with performance improvements"
            />
        </div>
    );
};

export default OptimizeTab;