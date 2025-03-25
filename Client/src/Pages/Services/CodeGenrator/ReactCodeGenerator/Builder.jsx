import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StepsList from './StepsList';
import { FileExplorer } from './FileExplorer';
import { TabView } from './TabView';
import { CodeEditor } from './CodeEditor';
import axios from 'axios';
import { CodeWritingUrl } from '../../../../Utilities/constant';
import { parseXml } from './steps';
import { Loader } from './Loader';

export const Builder = () => {
    const location = useLocation();
    const { prompt } = location.state || {}; // Add default empty object to prevent undefined error

    const [userPrompt, setPrompt] = useState("");
    const [llmMessages, setLlmMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [templateSet, setTemplateSet] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const [activeTab, setActiveTab] = useState('code');
    const [selectedFile, setSelectedFile] = useState(null);

    const [steps, setSteps] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        let originalFiles = [...files];
        let updateHappened = false;
        steps.filter(({ status }) => status === "pending").forEach(step => {
            updateHappened = true;
            if (step?.type === "CreateFile") {
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
    }, [steps, files]);

    async function init() {
        // Check if prompt exists before using it
        if (!prompt) {
            console.error('No prompt provided');
            return;
        }

        try {
            const response = await axios.post(`${CodeWritingUrl}/template`, {
                prompt: prompt.trim() // Add null check or provide a default
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

    useEffect(() => {
        init();
    }, [prompt]); // Add prompt as a dependency

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
                <p className="text-sm text-gray-400 mt-1">Prompt: { prompt || 'No prompt provided' }</p>
            </header>

            <div className="flex-1 overflow-hidden">
                <div className="h-full grid grid-cols-4 gap-6 p-6">
                    <div className="col-span-1 space-y-6 overflow-auto">
                        <div>
                            <div className="max-h-[75vh] overflow-scroll">
                                <StepsList
                                    steps={ steps }
                                    currentStep={ currentStep }
                                    onStepClick={ setCurrentStep }
                                />
                            </div>
                            <div>
                                <div className='flex'>
                                    <br />
                                    { (loading || !templateSet) && <Loader /> }
                                    { !(loading || !templateSet) && (
                                        <div className='flex'>
                                            <textarea
                                                value={ userPrompt }
                                                onChange={ (e) => {
                                                    setPrompt(e.target.value);
                                                } }
                                                className='p-2 w-full'
                                            />
                                            <button
                                                onClick={ async () => {
                                                    const newMessage = {
                                                        role: "user",
                                                        content: userPrompt
                                                    };

                                                    setLoading(true);
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
                                                } }
                                                className='bg-purple-400 px-4'
                                            >
                                                Send
                                            </button>
                                        </div>
                                    ) }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <FileExplorer
                            files={ files }
                            onFileSelect={ setSelectedFile }
                        />
                    </div>
                    <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
                        <TabView
                            activeTab={ activeTab }
                            onTabChange={ setActiveTab }
                        />
                        <div className="h-[calc(100%-4rem)]">
                            { activeTab === 'code' ? (
                                <CodeEditor file={ selectedFile } />
                            ) : (
                                <h1>Hello</h1>
                            ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};