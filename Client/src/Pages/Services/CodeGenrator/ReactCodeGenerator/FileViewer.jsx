import React from 'react';
import { X } from 'lucide-react';

export function FileViewer({ file, onClose }) {
    if (!file) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-3/4 h-3/4 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-200">{ file.path }</h2>
                    <button
                        onClick={ onClose }
                        className="text-gray-400 hover:text-gray-200"
                    >
                        <X size={ 24 } />
                    </button>
                </div>
                <pre className="p-4 overflow-auto text-gray-300 bg-gray-900 flex-1">
                    { file.content || 'No content available' }
                </pre>
            </div>
        </div>
    );
}