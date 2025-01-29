import { Button } from '../../../components/ui/button';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const EnhancedImageCard = ({ image, onDownload }) => {
    return (
        <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            className="relative rounded-lg overflow-hidden"
        >
            <img
                src={ image.url }
                alt={ image.prompt }
                className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-sm mb-2 text-white">{ image.prompt }</p>
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                    onClick={ () => onDownload(image) }
                >
                    <Download className="w-4 h-4 mr-2 text-black" />
                    <span className="text-black">Download</span>
                </Button>
            </div>
        </motion.div>
    );
};

export default EnhancedImageCard;
