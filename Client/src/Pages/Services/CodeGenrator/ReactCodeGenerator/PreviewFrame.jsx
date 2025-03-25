import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

export function PreviewFrame({ webContainer, files }) {
    const iframeRef = useRef(null);
    const { isDark } = useTheme();

    useEffect(() => {
        async function setupPreview() {
            if (!webContainer || !iframeRef.current) return;
            try {
                // Ensure the WebContainer is ready
                await webContainer.init();

                // Create an entry point file if not exists
                const indexHtml = files.find(f => f.name === 'index.html' || f.name === 'App.html');
                const entryFile = indexHtml || {
                    content: `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Preview</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: ${isDark ? '#1f2937' : '#f3f4f6'};
                    color: ${isDark ? '#f3f4f6' : '#1f2937'};
                  }
                </style>
              </head>
              <body>
                <div id="root">No preview available</div>
              </body>
            </html>
          `
                };

                // Write the entry file
                await webContainer.fs.writeFile('/index.html', entryFile.content || '');

                // Get the preview URL
                const preview = await webContainer.preview({
                    port: 8080,
                    path: '/index.html'
                });

                // Set iframe source
                if (iframeRef.current) {
                    iframeRef.current.src = preview.url;
                }
            } catch (error) {
                console.error('Preview setup error:', error);
            }
        }

        setupPreview();
    }, [webContainer, files, isDark]);

    return (
        <div className={ `h-full w-full rounded-lg overflow-hidden 
      ${isDark ? 'bg-gray-800' : 'bg-gray-100'}` }>
            <iframe
                ref={ iframeRef }
                className="w-full h-full border-none"
                title="Component Preview"
            />
        </div>
    );
}