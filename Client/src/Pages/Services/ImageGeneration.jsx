import { useState } from 'react';
import { ServiceContainer } from '../../components/ui/ServiceContainer';
import { InputBox } from '../../components/ui/InputBox';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

export const ImageGeneration = () => {
    const [images, setImages] = useState([]);

    const handleGenerateImage = (prompt) => {
        // Simulate image generation
        setImages(prev => [...prev,
            'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=500&h=500'
        ]);
    };

    return (
        <ServiceContainer title="AI Image Generation">
            <div className="flex-1 overflow-y-auto mb-4">
                <div className="grid grid-cols-2 gap-4">
                    { images.map((url, index) => (
                        <motion.div
                            key={ index }
                            initial={ { opacity: 0, scale: 0.9 } }
                            animate={ { opacity: 1, scale: 1 } }
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                            <img src={ url } alt={ `Generated ${index}` } className="w-full h-full object-cover" />
                        </motion.div>
                    )) }
                </div>
                { images.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <ImageIcon size={ 48 } className="mx-auto mb-2" />
                            <p>Enter a prompt to generate images</p>
                        </div>
                    </div>
                ) }
            </div>
            <InputBox onSubmit={ handleGenerateImage } placeholder="Describe the image you want to generate..." />
        </ServiceContainer>
    );
};