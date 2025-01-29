import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Download } from 'lucide-react';

export const ImageCard = ({ image }) => {
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

    return (
        <motion.div
            initial={ { opacity: 0, scale: 0.9 } }
            animate={ { opacity: 1, scale: 1 } }
            exit={ { opacity: 0, scale: 0.9 } }
            className="group"
        >
            <Card className="overflow-hidden">
                <div className="relative aspect-square">
                    <img
                        src={ image.url }
                        alt="Generated"
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
    );
};
