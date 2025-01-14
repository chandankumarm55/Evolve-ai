import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Loader2, SendIcon, Download } from 'lucide-react';
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { ServiceContainer } from '../../../components/ui/ServiceContainer';
import { FetchImage } from './FetchImage';

export const ImageGeneration = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState('');

    const handleGenerateImage = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);

        setImages(prev => [
            {
                url: `https://image.pollinations.ai/prompt/${prompt}`,
                prompt: prompt
            },
            ...prev
        ]);

        setPrompt('');
        setLoading(false);
    };


    const handleDownload = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-image-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const LoadingCard = () => (
        <Card className="relative aspect-square p-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"
                style={ { backgroundSize: '200% 100%' } }
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        </Card>
    );

    return (
        <ServiceContainer >
            <div className="flex-1 overflow-y-auto mb-4 p-4">
                <AnimatePresence mode="sync">
                    { images.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            initial={ { opacity: 0 } }
                            animate={ { opacity: 1 } }
                        >
                            { loading && (
                                <motion.div
                                    initial={ { opacity: 0, scale: 0.9 } }
                                    animate={ { opacity: 1, scale: 1 } }
                                    exit={ { opacity: 0, scale: 0.9 } }
                                >
                                    <LoadingCard />
                                </motion.div>
                            ) }

                            { images.map((image, index) => (
                                <motion.div
                                    key={ index }
                                    initial={ { opacity: 0, scale: 0.9 } }
                                    animate={ { opacity: 1, scale: 1 } }
                                    exit={ { opacity: 0, scale: 0.9 } }
                                    transition={ { delay: index * 0.1 } }
                                    className="group"
                                >
                                    <Card className="overflow-hidden">
                                        <div className="relative aspect-square">
                                            <img
                                                src={ image.url }
                                                alt={ `Generated ${index}` }
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-white text-sm flex-1">{ image.prompt }</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                                        onClick={ () => handleDownload(image.url) }
                                                    >
                                                        <Download className="w-4 h-4 text-white" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
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
                                        rotate: [0, 5, -5, 0]
                                    } }
                                    transition={ {
                                        duration: 3,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    } }
                                >
                                    <ImageIcon size={ 64 } className="mx-auto text-muted-foreground" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Create Amazing Images</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Enter a detailed description to generate unique images
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ) }
                </AnimatePresence>
            </div>

            <form onSubmit={ handleGenerateImage } className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={ prompt }
                        onChange={ (e) => setPrompt(e.target.value) }
                        placeholder="Describe the image you want to generate..."
                        className="flex-1"
                        disabled={ loading }
                    />
                    <Button type="submit" disabled={ loading || !prompt.trim() }>
                        { loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating
                            </>
                        ) : (
                            <>
                                <SendIcon className="w-4 h-4 mr-2" />
                                Generate
                            </>
                        ) }
                    </Button>
                </div>
            </form>
        </ServiceContainer>
    );
};

export default ImageGeneration;