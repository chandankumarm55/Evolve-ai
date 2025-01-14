import { useToast } from "../../../hooks/use-toast";
export const handleCopyCode = async (code) => {
    const { toast } = useToast();

    try {
        await navigator.clipboard.writeText(code); // Copy the code to clipboard

        toast({
            title: "Copied to Clipboard",
            description: `Code snippet #${index + 1} has been copied!`,
            variant: "success",
        });
    } catch (error) {

        toast({
            title: "Copy Failed",
            description: "There was an issue copying the code to your clipboard. Please try again.",
            variant: "error", // Indicates an error
        });
    }
};
