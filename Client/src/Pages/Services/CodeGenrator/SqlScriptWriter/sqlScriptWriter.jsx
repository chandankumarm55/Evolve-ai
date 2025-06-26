import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Code, Zap, GitBranch, Lightbulb } from 'lucide-react';

// Import all tab components
import GenerateSQLTab from './GenerateSQLTab';
import SchemaTab from './SchemaTab';
import OptimizeTab from './OptimizeTab';
import ERDiagramTab from './ERDiagramTab';
import TipsTab from './TipsTab';

const SQLScriptWriter = () => {
    const [activeTab, setActiveTab] = useState('generate');

    return (
        <div className="max-w-7xl mx-auto pt-20 px-4 space-y-6">
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

                <TabsContent value="generate">
                    <GenerateSQLTab />
                </TabsContent>

                <TabsContent value="schema">
                    <SchemaTab />
                </TabsContent>

                <TabsContent value="optimize">
                    <OptimizeTab />
                </TabsContent>

                <TabsContent value="diagram">
                    <ERDiagramTab />
                </TabsContent>

                <TabsContent value="tips">
                    <TipsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SQLScriptWriter;