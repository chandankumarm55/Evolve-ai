import React from 'react';
import Editor from '@monaco-editor/react';

export function CodeEditor({ file }) {
    if (!file) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                Select a file to view its contents
            </div>
        );
    }

    return (
        <Editor
            height="100%"
            language={ getLanguageFromExtension(file.name) }
            value={ file.content || '' }
            options={ {
                readOnly: true,
                minimap: { enabled: false }
            } }
        />
    );
}

function getLanguageFromExtension(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'json':
            return 'json';
        case 'md':
            return 'markdown';
        default:
            return 'plaintext';
    }
}