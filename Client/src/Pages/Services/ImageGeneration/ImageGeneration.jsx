import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Loader2, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import ImageInputForm from './ImageInputForm';
import EnhancedImageCard from './EnhancedImageCard';

const fetchImage = async (prompt) => {
    try {
        // First, initiate the image generation
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

        // Function to check if image is actually generated
        const checkImage = async () => {
            try {
                const response = await axios.get(imageUrl, {
                    responseType: 'blob',
                    timeout: 5000 // 5s timeout for each check
                });

                // If we get a successful response and it's an image
                if (response.status === 200 && response.data.type.startsWith('image/')) {
                    return URL.createObjectURL(response.data);
                }
                throw new Error('Image not ready');
            } catch (error) {
                throw error;
            }
        };

        // Poll until image is ready
        const poll = async (retries = 0, maxRetries = 20) => { // 20 retries = ~60 seconds
            if (retries >= maxRetries) {
                throw new Error('Image generation timed out');
            }

            try {
                const imageUrl = await checkImage();
                return imageUrl;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between checks
                return poll(retries + 1, maxRetries);
            }
        };

        return await poll();
    } catch (error) {
        throw new Error('Failed to generate image: ' + error.message);
    }
};

export const ImageGeneration = () => {
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(new Map());
    const [prompt, setPrompt] = useState('');

    const handleDownload = (image) => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `generated-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateImage = async (inputPrompt) => {
        // Add to loading state
        setLoadingImages(prev => new Map(prev).set(inputPrompt, true));

        try {
            const imageUrl = await fetchImage(inputPrompt);

            // Add new image to the list
            setImages(prev => [{
                url: imageUrl,
                prompt: inputPrompt,
            }, ...prev]);

        } catch (error) {
            toast.error(error.message);
        } finally {
            // Remove from loading state
            setLoadingImages(prev => {
                const newMap = new Map(prev);
                newMap.delete(inputPrompt);
                return newMap;
            });
        }
    };

    return (
        <ServiceContainer>
            <div className="flex-1 overflow-y-auto mb-4 p-4">
                <AnimatePresence mode="sync">
                    { (images.length > 0 || loadingImages.size > 0) ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            initial={ { opacity: 0 } }
                            animate={ { opacity: 1 } }
                        >
                            {/* Display generated images */ }
                            { images.map((image) => (
                                <EnhancedImageCard
                                    key={ image.url }
                                    image={ image }
                                    onDownload={ handleDownload }
                                />
                            )) }

                            {/* Loading states */ }
                            { Array.from(loadingImages.keys()).map((loadingPrompt) => (
                                <div
                                    key={ `loading-${loadingPrompt}` }
                                    className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
                                >
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                                        <p className="text-sm text-gray-600 text-center px-4">
                                            Generating image for:<br />
                                            <span className="font-medium">{ loadingPrompt }</span>
                                        </p>
                                    </div>
                                </div>
                            )) }
                        </motion.div>
                    ) : (
                        <motion.div
                            className="h-[400px] flex items-center justify-center"
                            initial={ { opacity: 0 } }
                            animate={ { opacity: 1 } }
                        >
                            <div className="text-center space-y-4">
                                <motion.div
                                    animate={ {
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    } }
                                    transition={ {
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatType: 'reverse',
                                    } }
                                >
                                    <ImageIcon size={ 64 } className="mx-auto text-muted-foreground" />
                                </motion.div>
                                <h3 className="text-lg font-semibold">Create Amazing Images</h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter a description to generate unique images
                                </p>
                            </div>
                        </motion.div>
                    ) }
                </AnimatePresence>
            </div>
            <ImageInputForm
                onGenerateImage={ handleGenerateImage }
                loading={ loadingImages.size > 0 }
                prompt={ prompt }
                setPrompt={ setPrompt }
            />
        </ServiceContainer>
    );
};

export default ImageGeneration;