import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import axios from 'axios';
import { Download } from 'lucide-react';

// Import your custom components
import StepsList from './StepsList';
import { FileExplorer } from './FileExplorer';
import { TabView } from './TabView';
import { CodeEditor } from './CodeEditor';
import { FileViewer } from './FileViewer';
import { Loader } from './Loader';

// Import your utilities
import { CodeWritingUrl } from '../../../../Utilities/constant';
import { parseXml } from './steps';

export const Builder = () => {
    const location = useLocation();
    const { prompt } = location.state || {};

    // State variables
    const [userPrompt, setUserPrompt] = useState("");
    const [llmMessages, setLlmMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [templateSet, setTemplateSet] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState('code');
    const [selectedFile, setSelectedFile] = useState(null);
    const [viewerFile, setViewerFile] = useState(null);

    const [steps, setSteps] = useState([]);
    const [files, setFiles] = useState([]);

    // File structure update effect


    useEffect(() => {
        let originalFiles = [...files];
        let updateHappened = false;

        steps.filter(({ status }) => status === "pending").forEach(step => {
            if (step?.type === "CreateFile") {
                updateHappened = true;
                let parsedPath = step.path?.split("/") ?? [];
                let currentFileStructure = [...originalFiles];
                let finalAnswerRef = currentFileStructure;

                let currentFolder = "";
                while (parsedPath.length) {
                    currentFolder = `${currentFolder}/${parsedPath[0]}`;
                    let currentFolderName = parsedPath[0];
                    parsedPath = parsedPath.slice(1);

                    if (!parsedPath.length) {
                        let file = currentFileStructure.find(x => x.path === currentFolder);
                        if (!file) {
                            currentFileStructure.push({
                                name: currentFolderName,
                                type: 'file',
                                path: currentFolder,
                                content: step.code
                            });
                        } else {
                            file.content = step.code;
                        }
                    } else {
                        let folder = currentFileStructure.find(x => x.path === currentFolder);
                        if (!folder) {
                            currentFileStructure.push({
                                name: currentFolderName,
                                type: 'folder',
                                path: currentFolder,
                                children: []
                            });
                        }

                        currentFileStructure = currentFileStructure.find(x => x.path === currentFolder).children;
                    }
                }
                originalFiles = finalAnswerRef;
            }
        });

        if (updateHappened) {
            setFiles(originalFiles);
            setSteps(steps => steps.map(s => ({
                ...s,
                status: "completed"
            })));
        }
    }, [steps]);

    // Initialize project generation
    async function init() {
        if (!prompt) {
            console.error('No prompt provided');
            return;
        }

        try {
            const response = await axios.post(`${CodeWritingUrl}/template`, {
                prompt: prompt.trim()
            });
            setTemplateSet(true);

            const { prompts, uiPrompts } = response.data;

            setSteps(parseXml(uiPrompts[0]).map(x => ({
                ...x,
                status: "pending"
            })));

            setLoading(true);
            const stepsResponse = await axios.post(`${CodeWritingUrl}/chat`, {
                messages: [...prompts, prompt].map(content => ({
                    role: "user",
                    content
                }))
            });

            setLoading(false);

            setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                ...x,
                status: "pending"
            }))]);

            setLlmMessages([...prompts, prompt].map(content => ({
                role: "user",
                content
            })));

            setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }]);
        } catch (error) {
            console.error('Error in init function:', error);
            setLoading(false);
        }
    }

    // Initialize on prompt change
    useEffect(() => {
        init();
    }, [prompt]);

    // Download files functionality
    const handleDownloadFiles = async () => {
        const zip = new JSZip();

        const addFilesToZip = (fileOrFolder, currentPath = '') => {
            if (fileOrFolder.type === 'file') {
                zip.file(
                    fileOrFolder.path.startsWith('/')
                        ? fileOrFolder.path.substring(1)
                        : fileOrFolder.path,
                    fileOrFolder.content || ''
                );
            } else if (fileOrFolder.type === 'folder' && fileOrFolder.children) {
                fileOrFolder.children.forEach(child => {
                    addFilesToZip(child, currentPath);
                });
            }
        };

        files.forEach(fileOrFolder => {
            addFilesToZip(fileOrFolder);
        });

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'project.zip');
        } catch (error) {
            console.error('Error creating zip file:', error);
        }
    };

    // Send additional prompt
    const handleSendPrompt = async () => {
        const newMessage = {
            role: "user",
            content: userPrompt
        };
        setLoading(true);
        try {
            const stepsResponse = await axios.post(`${CodeWritingUrl}/chat`, {
                messages: [...llmMessages, newMessage]
            });
            setLoading(false);

            setLlmMessages(x => [...x, newMessage]);
            setLlmMessages(x => [...x, {
                role: "assistant",
                content: stepsResponse.data.response
            }]);

            setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                ...x,
                status: "pending"
            }))]);
        } catch (error) {
            console.error('Error sending prompt:', error);
            setLoading(false);
        }
    };

    console.log(files);
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */ }
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
                    <p className="text-sm text-gray-400 mt-1">Prompt: { prompt || 'No prompt provided' }</p>
                </div>
                <button
                    onClick={ handleDownloadFiles }
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center"
                >
                    <Download size={ 16 } className="mr-2" /> Download Project
                </button>
            </header>

            {/* Main Content */ }
            <div className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-4 gap-6 p-6">
                    {/* Steps List */ }
                    <div className="col-span-1 space-y-6 overflow-auto">
                        <div>
                            <div className="max-h-[75vh] overflow-scroll">
                                <StepsList
                                    steps={ steps }
                                    currentStep={ currentStep }
                                    onStepClick={ setCurrentStep }
                                />
                            </div>

                            {/* Prompt Input */ }
                            <div>
                                <div className='flex'>
                                    <br />
                                    { (loading || !templateSet) && <Loader /> }
                                    { !(loading || !templateSet) && (
                                        <div className='flex w-full'>
                                            <textarea
                                                value={ userPrompt }
                                                onChange={ (e) => setUserPrompt(e.target.value) }
                                                className='p-2 w-full bg-gray-700 text-gray-200 rounded-l'
                                                placeholder="Enter additional instructions..."
                                            />
                                            <button
                                                onClick={ handleSendPrompt }
                                                className='bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-r'
                                            >
                                                Send
                                            </button>
                                        </div>
                                    ) }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Explorer */ }
                    <div className="col-span-1">
                        <FileExplorer
                            files={ files }
                            onFileSelect={ (file) => {
                                setSelectedFile(file);
                                setViewerFile(file);
                            } }
                        />
                    </div>

                    {/* Code Editor */ }
                    <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
                        <TabView
                            activeTab={ activeTab }
                            onTabChange={ setActiveTab }
                        />
                        <div className="h-[calc(100%-4rem)]">
                            { activeTab === 'code' ? (
                                <CodeEditor file={ selectedFile } />
                            ) : (
                                <h1 className="text-gray-400">Other tabs coming soon...</h1>
                            ) }
                        </div>
                    </div>
                </div>
            </div>

            {/* File Viewer Modal */ }
            { viewerFile && (
                <FileViewer
                    file={ viewerFile }
                    onClose={ () => setViewerFile(null) }
                />
            ) }
        </div>
    );
};