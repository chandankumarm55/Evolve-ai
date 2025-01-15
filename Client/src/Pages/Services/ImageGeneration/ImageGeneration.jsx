import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Loader2, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import { ImageCard } from './ImageCard';
import ImageInputForm from './ImageInputForm';

// Separate component for image processing canvas
const ImageProcessor = ({ imageUrl, onProcessed }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const processImage = async () => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Enable CORS

            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // Set canvas size to match image dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // Calculate crop height (remove bottom 10% where watermark typically appears)
                const cropHeight = img.height * 0.9;

                // Draw cropped image
                ctx.drawImage(img,
                    0, 0, img.width, cropHeight, // Source rectangle
                    0, 0, img.width, cropHeight  // Destination rectangle
                );

                // Get processed image URL
                const processedUrl = canvas.toDataURL('image/jpeg', 0.9);
                onProcessed(processedUrl);
            };

            img.onerror = () => {
                toast.error('Failed to load image for processing');
                onProcessed(null);
            };

            img.src = imageUrl;
        };

        processImage();
    }, [imageUrl, onProcessed]);

    return <canvas ref={ canvasRef } style={ { display: 'none' } } />;
};

// Enhanced ImageCard component with download functionality
const EnhancedImageCard = ({ image, onDownload }) => {
    return (
        <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            className="relative rounded-lg overflow-hidden"
        >
            <img
                src={ image.processedUrl || image.url }
                alt={ image.prompt }
                className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-sm mb-2">{ image.prompt }</p>
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                    onClick={ () => onDownload(image) }
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </Button>
            </div>
        </motion.div>
    );
};

export const ImageGeneration = () => {
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(new Map());
    const [prompt, setPrompt] = useState('');

    const handleImageProcessed = (originalUrl, processedUrl) => {
        if (processedUrl) {
            setImages(prev => prev.map(img =>
                img.url === originalUrl
                    ? { ...img, processedUrl }
                    : img
            ));
        }
    };

    const handleDownload = (image) => {
        const link = document.createElement('a');
        link.href = image.processedUrl || image.url;
        link.download = `generated-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const checkImageLoaded = async (imageUrl, promptText, timeoutId) => {
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                setLoadingImages(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(promptText);
                    return newMap;
                });
                setImages(prev => [{
                    url: imageUrl,
                    prompt: promptText,
                }, ...prev]);
                clearTimeout(timeoutId);
            } else {
                setTimeout(() => checkImageLoaded(imageUrl, promptText, timeoutId), 1000);
            }
        } catch (error) {
            setTimeout(() => checkImageLoaded(imageUrl, promptText, timeoutId), 1000);
        }
    };

    const handleGenerateImage = async (inputPrompt) => {
        setLoadingImages(prev => new Map(prev).set(inputPrompt, true));

        const timeoutId = setTimeout(() => {
            setLoadingImages(prev => {
                const newMap = new Map(prev);
                newMap.delete(inputPrompt);
                return newMap;
            });
            toast.error('Image generation timed out. Please try again.');
        }, 10000);

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(inputPrompt)}`;
        checkImageLoaded(imageUrl, inputPrompt, timeoutId);
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
                            {/* Process images as they're loaded */ }
                            { images.map((image) => (
                                <div key={ image.url }>
                                    { !image.processedUrl && (
                                        <ImageProcessor
                                            imageUrl={ image.url }
                                            onProcessed={ (processedUrl) =>
                                                handleImageProcessed(image.url, processedUrl)
                                            }
                                        />
                                    ) }
                                    <EnhancedImageCard
                                        image={ image }
                                        onDownload={ handleDownload }
                                    />
                                </div>
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