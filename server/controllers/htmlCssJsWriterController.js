import axios from 'axios';
import dotenv from 'dotenv';
import archiver from 'archiver';
import { Readable } from 'stream';

dotenv.config();

// Store sessions temporarily (in production, use Redis or database)
const sessions = new Map();

const generateAiresponseHtmlCss = async(conversation) => {
    try {
        const API_URL = process.env.AI_API_URL || 'https://api.mistral.ai/v1/chat/completions';
        const API_KEY = process.env.AI_API_KEY;

        if (!API_KEY) {
            throw new Error('AI API key is not configured');
        }

        const systemMessage = {
            role: 'system',
            content: `You are an expert web developer. Generate HTML, CSS, and JavaScript code based on user requests. 
            Always organize your response with clear sections for each file type.
            Format your response as follows:
            
            <!-- HTML -->
            <!DOCTYPE html>
            <html>
            <head>
                <title>Generated App</title>
            </head>
            <body>
            ...
            </body>
            </html>
            
            /* CSS */
            <style>
            ...
            </style>
            
            /* JavaScript */
            <script>
            ...
            </script>
            
            Only generate code - no explanations unless specifically requested. Ensure the code is complete and functional.
            When modifying existing code, provide the complete updated versions of all files.`
        };

        const fullConversation = [systemMessage, ...conversation];

        const response = await axios.post(
            API_URL, {
                model: 'mistral-large-latest',
                messages: fullConversation,
                temperature: 0.7,
                max_tokens: 4000
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedCode = response.data.choices[0].message.content;
        return generatedCode;
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`Failed to generate code: ${error.message}`);
    }
};

export const generateCode = async(req, res) => {
    try {
        const { prompt, conversation = [] } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const updatedConversation = [
            ...conversation,
            { role: 'user', content: prompt }
        ];

        const generatedCode = await generateAiresponseHtmlCss(updatedConversation);

        updatedConversation.push({ role: 'assistant', content: generatedCode });

        // Generate a session ID and store the conversation
        const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessions.set(sessionId, {
            conversation: updatedConversation,
            createdAt: new Date()
        });

        // Clean up old sessions (keep only last 100)
        if (sessions.size > 100) {
            const oldestKey = sessions.keys().next().value;
            sessions.delete(oldestKey);
        }

        res.status(201).json({
            message: 'Code generated successfully',
            sessionId,
            content: generatedCode,
            conversation: updatedConversation
        });
    } catch (error) {
        console.error('Error in generateCode:', error);
        res.status(500).json({ message: error.message });
    }
};

export const continueConversation = async(req, res) => {
    try {
        const { prompt, conversation = [], sessionId } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Get existing conversation from session or use provided conversation
        let existingConversation = conversation;
        if (sessionId && sessions.has(sessionId)) {
            existingConversation = sessions.get(sessionId).conversation;
        }

        const updatedConversation = [
            ...existingConversation,
            { role: 'user', content: prompt }
        ];

        const generatedCode = await generateAiresponseHtmlCss(updatedConversation);

        updatedConversation.push({ role: 'assistant', content: generatedCode });

        // Update session with new conversation
        if (sessionId) {
            sessions.set(sessionId, {
                conversation: updatedConversation,
                createdAt: new Date()
            });
        }

        res.status(200).json({
            message: 'Feature added successfully',
            sessionId,
            content: generatedCode,
            conversation: updatedConversation
        });
    } catch (error) {
        console.error('Error in continueConversation:', error);
        res.status(500).json({ message: error.message });
    }
};

export const downloadFiles = async(req, res) => {
        try {
            const { files } = req.body;

            if (!files || typeof files !== 'object') {
                return res.status(400).json({ message: 'Files object is required' });
            }

            // Set response headers for zip download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename=generated_code.zip');

            // Create archiver instance
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            // Handle archiver errors
            archive.on('error', (err) => {
                console.error('Archive error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Failed to create zip file' });
                }
            });

            // Pipe archive to response
            archive.pipe(res);

            // Add files to archive
            Object.entries(files).forEach(([filename, content]) => {
                if (content && content.trim()) {
                    // Create a readable stream from the content
                    const stream = Readable.from([content]);
                    archive.append(stream, { name: filename });
                }
            });

            // If we have HTML, CSS, and JS files, create a combined index.html as well
            if (files['index.html'] && (files['styles.css'] || files['app.js'])) {
                let combinedHtml = files['index.html'];

                // Ensure proper HTML structure
                if (!combinedHtml.includes('<!DOCTYPE html>')) {
                    combinedHtml = `<!DOCTYPE html>\n<html>\n<head>\n<title>Generated App</title>\n</head>\n<body>\n${combinedHtml}\n</body>\n</html>`;
                }

                // Inject CSS
                if (files['styles.css']) {
                    if (combinedHtml.includes('</head>')) {
                        combinedHtml = combinedHtml.replace('</head>', `<style>\n${files['styles.css']}\n</style>\n</head>`);
                    } else {
                        combinedHtml = combinedHtml.replace('<body>', `<style>\n${files['styles.css']}\n</style>\n<body>`);
                    }
                }

                // Inject JavaScript
                if (files['app.js']) {
                    if (combinedHtml.includes('</body>')) {
                        combinedHtml = combinedHtml.replace('</body>', `<script>\n${files['app.js']}\n</script>\n</body>`);
                    } else {
                        combinedHtml = `${combinedHtml}\n<script>\n${files['app.js']}\n</script>`;
                    }
                }

                const combinedStream = Readable.from([combinedHtml]);
                archive.append(combinedStream, { name: 'combined.html' });
            }

            // Add README file
            const readmeContent = `# Generated Code

This package contains the generated HTML, CSS, and JavaScript files.

## Files:
${Object.keys(files).map(filename => `- ${filename}`).join('\n')}

## Usage:
1. Open index.html in a web browser to view the application
2. If combined.html exists, it contains all files merged into a single HTML file
3. Modify the files as needed for your project

Generated on: ${new Date().toISOString()}
`;

        const readmeStream = Readable.from([readmeContent]);
        archive.append(readmeStream, { name: 'README.md' });

        // Finalize the archive
        archive.finalize();

    } catch (error) {
        console.error('Error in downloadFiles:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// Clean up old sessions periodically (run every hour)
setInterval(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [sessionId, session] of sessions.entries()) {
        if (session.createdAt < oneHourAgo) {
            sessions.delete(sessionId);
        }
    }
}, 60 * 60 * 1000);