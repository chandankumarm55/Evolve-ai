import React, { useState } from 'react';
import { FolderTree, File, ChevronRight, ChevronDown } from 'lucide-react';

function FileNode({ item, depth = 0, onFileClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        if (item.type === 'folder') {
            setIsExpanded(!isExpanded);
        } else {
            onFileClick(item);
        }
    };

    return (
        <div
            className={ `cursor-pointer hover:bg-gray-700 ${item.type === 'file' ? 'pl-4' : ''}` }
            style={ { paddingLeft: `${depth * 16}px` } }
            onClick={ handleClick }
        >
            <div className="flex items-center">
                { item.type === 'folder' && (
                    item.children?.length > 0 ? (
                        isExpanded ? <ChevronDown size={ 16 } /> : <ChevronRight size={ 16 } />
                    ) : null
                ) }
                { item.type === 'folder' ? (
                    <FolderTree size={ 16 } className="mr-2" />
                ) : (
                    <File size={ 16 } className="mr-2" />
                ) }
                { item.name }
            </div>
            { item.type === 'folder' && isExpanded && item.children && (
                <div>
                    { item.children.map((child, index) => (
                        <FileNode
                            key={ child.path || index }
                            item={ child }
                            depth={ depth + 1 }
                            onFileClick={ onFileClick }
                        />
                    )) }
                </div>
            ) }
        </div>
    );
}

export function FileExplorer({ files, onFileSelect }) {
    return (
        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg">
            <div className="font-bold mb-4">
                File Explorer
            </div>
            <div className="space-y-2">
                { files.map((file, index) => (
                    <FileNode
                        key={ file.path || index }
                        item={ file }
                        onFileClick={ onFileSelect }
                    />
                )) }
            </div>
        </div>
    );
}