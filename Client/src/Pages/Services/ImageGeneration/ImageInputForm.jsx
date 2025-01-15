import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/button';
import { Loader2, SendIcon } from 'lucide-react';

const ImageInputForm = ({ onGenerateImage, loading, prompt, setPrompt }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        onGenerateImage(prompt);
        setPrompt('');
    };

    return (
        <form onSubmit={ handleSubmit } className="p-4 border-t">
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
    );
};
export default ImageInputForm;
