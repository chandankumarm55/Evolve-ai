import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

class SQLCodeWriterController {
    constructor() {
        this.API_URL = 'https://api.mistral.ai/v1/chat/completions';
        this.API_KEY = process.env.MISTRAL_API_KEY; // Set your API key in environment variables

        // System message to train the AI for SQL writing
        this.systemMessage = {
            role: 'system',
            content: `You are an expert SQL Code Writer and Database Designer. Your role is to:

1. WRITE ONLY SQL SCRIPTS - No explanations unless specifically asked
2. Generate optimized, production-ready SQL code
3. Create comprehensive database schemas
4. Generate ER diagrams in text format when requested
5. Provide database integration tips
6. Support multiple database systems (MySQL, PostgreSQL, SQL Server, SQLite, Oracle)
7. Follow best practices for:
   - Naming conventions (snake_case for tables/columns)
   - Data types selection
   - Indexing strategies
   - Constraints and relationships
   - Performance optimization
   - Security considerations

RESPONSE FORMAT:
- For SQL queries: Return ONLY the SQL code
- For schema creation: Return CREATE TABLE statements
- For ER diagrams: Use ASCII art or textual representation
- For tips: Provide concise, actionable advice

GUIDELINES:
- Always include proper constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE)
- Use appropriate data types for each column
- Include indexes for performance-critical columns
- Add comments for complex logic
- Ensure ACID compliance
- Consider normalization principles
- Handle edge cases and error scenarios

Remember: You are a SQL specialist. Focus on writing clean, efficient, and maintainable SQL code.`
        };
    }

    // Main method to generate SQL code
    async generateSQL(req, res) {
        try {
            const { prompt, databaseType = 'mysql', includeERDiagram = false, includeTips = false } = req.body;

            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    error: 'Prompt is required'
                });
            }

            // Enhance prompt with database-specific context
            const enhancedPrompt = this.enhancePrompt(prompt, databaseType, includeERDiagram, includeTips);

            // Prepare conversation for Mistral AI
            const messages = [{
                role: 'user',
                content: enhancedPrompt
            }];

            const fullConversation = [this.systemMessage, ...messages];

            // Call Mistral AI
            const response = await axios.post(
                this.API_URL, {
                    model: 'mistral-large-latest',
                    messages: fullConversation,
                    temperature: 0.3, // Lower temperature for more consistent SQL generation
                    max_tokens: 4000
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const sqlResponse = response.data.choices[0].message.content;

            // Process and structure the response
            const structuredResponse = this.processResponse(sqlResponse, includeERDiagram, includeTips);

            // Save to file if requested
            if (req.body.saveToFile) {
                await this.saveToFile(structuredResponse.sql, req.body.fileName || 'generated_sql.sql');
            }

            res.json({
                success: true,
                data: structuredResponse,
                metadata: {
                    databaseType,
                    timestamp: new Date().toISOString(),
                    tokenUsage: response.data.usage
                }
            });

        } catch (error) {
            console.error('Error generating SQL:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate SQL code',
                details: error.response.data || null
            });
        }
    }

    // Generate database schema from description
    async generateSchema(req, res) {
        try {
            const { description, databaseType = 'mysql', entities, relationships } = req.body;

            const schemaPrompt = `
Create a complete database schema for: ${description}

Entities: ${entities ? JSON.stringify(entities) : 'Identify from description'}
Relationships: ${relationships ? JSON.stringify(relationships) : 'Infer from description'}

Requirements:
1. CREATE TABLE statements with all constraints
2. Proper data types for ${databaseType}
3. Primary and foreign keys
4. Indexes for performance
5. Sample INSERT statements
6. ER diagram representation
            `;

            const messages = [{ role: 'user', content: schemaPrompt }];
            const fullConversation = [this.systemMessage, ...messages];

            const response = await axios.post(
                this.API_URL, {
                    model: 'mistral-large-latest',
                    messages: fullConversation,
                    temperature: 0.2,
                    max_tokens: 4000
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const schemaResponse = response.data.choices[0].message.content;
            const structuredSchema = this.processSchemaResponse(schemaResponse);

            res.json({
                success: true,
                data: structuredSchema,
                metadata: {
                    databaseType,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error generating schema:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate database schema'
            });
        }
    }

    // Optimize existing SQL query
    async optimizeSQL(req, res) {
        try {
            const { sqlQuery, databaseType = 'mysql', performanceGoals } = req.body;

            const optimizePrompt = `
Optimize this SQL query for ${databaseType}:

${sqlQuery}

Performance Goals: ${performanceGoals || 'General optimization'}

Provide:
1. Optimized SQL query
2. Explanation of changes
3. Index recommendations
4. Performance tips
            `;

            const messages = [{ role: 'user', content: optimizePrompt }];
            const fullConversation = [this.systemMessage, ...messages];

            const response = await axios.post(
                this.API_URL, {
                    model: 'mistral-large-latest',
                    messages: fullConversation,
                    temperature: 0.3,
                    max_tokens: 3000
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const optimizedResponse = response.data.choices[0].message.content;

            res.json({
                success: true,
                data: {
                    original: sqlQuery,
                    optimized: optimizedResponse,
                    databaseType
                },
                metadata: {
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error optimizing SQL:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to optimize SQL query'
            });
        }
    }

    // Generate ER Diagram
    async generateERDiagram(req, res) {
        try {
            const { tables, relationships } = req.body;

            const erPrompt = `
Create an ER diagram representation for these database tables and relationships:

Tables: ${JSON.stringify(tables)}
Relationships: ${JSON.stringify(relationships)}

Provide:
1. ASCII art ER diagram
2. Textual representation
3. Relationship descriptions
4. Cardinality information
            `;

            const messages = [{ role: 'user', content: erPrompt }];
            const fullConversation = [this.systemMessage, ...messages];

            const response = await axios.post(
                this.API_URL, {
                    model: 'mistral-large-latest',
                    messages: fullConversation,
                    temperature: 0.4,
                    max_tokens: 3000
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const erDiagram = response.data.choices[0].message.content;

            res.json({
                success: true,
                data: {
                    diagram: erDiagram,
                    tables,
                    relationships
                },
                metadata: {
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error generating ER diagram:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate ER diagram'
            });
        }
    }

    // Get database integration tips
    async getDatabaseTips(req, res) {
        try {
            const { databaseType, scenario, currentIssues } = req.body;

            const tipsPrompt = `
Provide database integration and optimization tips for:

Database: ${databaseType}
Scenario: ${scenario}
Current Issues: ${currentIssues || 'General guidance needed'}

Focus on:
1. Performance optimization
2. Security best practices
3. Scalability considerations
4. Maintenance tips
5. Common pitfalls to avoid
            `;

            const messages = [{ role: 'user', content: tipsPrompt }];
            const fullConversation = [this.systemMessage, ...messages];

            const response = await axios.post(
                this.API_URL, {
                    model: 'mistral-large-latest',
                    messages: fullConversation,
                    temperature: 0.5,
                    max_tokens: 2000
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const tips = response.data.choices[0].message.content;

            res.json({
                success: true,
                data: {
                    tips,
                    databaseType,
                    scenario
                },
                metadata: {
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error getting database tips:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get database tips'
            });
        }
    }

    // Helper method to enhance prompt with context
    enhancePrompt(prompt, databaseType, includeERDiagram, includeTips) {
        let enhanced = `Database Type: ${databaseType.toUpperCase()}\n\n${prompt}`;

        if (includeERDiagram) {
            enhanced += `\n\nAlso provide an ER diagram representation of the database structure.`;
        }

        if (includeTips) {
            enhanced += `\n\nInclude optimization tips and best practices.`;
        }

        return enhanced;
    }

    // Process AI response and structure it
    processResponse(response, includeERDiagram, includeTips) {
        const sections = {
            sql: '',
            erDiagram: '',
            tips: '',
            explanation: ''
        };

        // Split response into sections (basic parsing)
        const lines = response.split('\n');
        let currentSection = 'sql';

        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            if (lowerLine.includes('er diagram') || lowerLine.includes('entity relationship')) {
                currentSection = 'erDiagram';
                continue;
            } else if (lowerLine.includes('tips') || lowerLine.includes('best practices')) {
                currentSection = 'tips';
                continue;
            } else if (lowerLine.includes('explanation') || lowerLine.includes('description')) {
                currentSection = 'explanation';
                continue;
            }

            sections[currentSection] += line + '\n';
        }

        return {
            sql: sections.sql.trim(),
            erDiagram: includeERDiagram ? sections.erDiagram.trim() : null,
            tips: includeTips ? sections.tips.trim() : null,
            explanation: sections.explanation.trim() || null
        };
    }

    // Process schema response
    processSchemaResponse(response) {
        return {
            schema: response,
            createStatements: this.extractCreateStatements(response),
            insertStatements: this.extractInsertStatements(response),
            erDiagram: this.extractERDiagram(response)
        };
    }

    // Extract CREATE statements
    extractCreateStatements(response) {
        const createRegex = /CREATE TABLE[\s\S]*?;/gi;
        return response.match(createRegex) || [];
    }

    // Extract INSERT statements
    extractInsertStatements(response) {
        const insertRegex = /INSERT INTO[\s\S]*?;/gi;
        return response.match(insertRegex) || [];
    }

    // Extract ER diagram from response
    extractERDiagram(response) {
        const erSection = response.split('ER DIAGRAM')[1] || response.split('Entity Relationship')[1];
        return erSection ? erSection.split('---')[0] : null;
    }

    // Save SQL to file
    async saveToFile(sqlContent, fileName) {
        try {
            const filePath = path.join(__dirname, '../generated_sql', fileName);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, sqlContent, 'utf8');
            return filePath;
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }

    // Validate API key
    validateApiKey() {
        if (!this.API_KEY) {
            throw new Error('MISTRAL_API_KEY environment variable is not set');
        }
    }

    // Health check
    async healthCheck(req, res) {
        try {
            this.validateApiKey();
            res.json({
                success: true,
                message: 'SQL Code Writer Controller is healthy',
                services: {
                    mistralAI: 'Connected',
                    database: 'Ready'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default new SQLCodeWriterController();