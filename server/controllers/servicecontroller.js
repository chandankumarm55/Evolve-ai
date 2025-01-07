import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDHCRgVEuqo6e54gAf3fR2k8Q4JyGfcz2w');
const Conversationmodel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const ConversationService = async(req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required!" });
        }
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('image') || lowerPrompt.includes('picture')) {
            return res.status(200).json({
                message: "I only support conversations, not image processing or generation.",
            });
        }

        const result = await Conversationmodel.generateContent(prompt);
        const text = result.response.text();

        return res.status(200).json({ message: text });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error!" });
    }
};


const Imagemodel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const ImageGeneration = async(req, res) => {
    try {
        const { prompt } = req.body;

        // Validate input prompt
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required!" });
        }

        // Generate content using Gemini API
        const result = await Imagemodel.generateContent({
            contents: [{
                parts: [{ text: prompt }],
            }, ],
        });

        // Log the full response for debugging
        console.log("Full Response:", JSON.stringify(result, null, 2));

        // Check if result and candidates exist
        if (!result || !result.candidates || result.candidates.length === 0) {
            return res.status(500).json({ error: "No response generated from AI." });
        }

        const candidate = result.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            return res.status(500).json({ error: "Invalid response format." });
        }

        const text = candidate.content.parts[0].text;

        // Return the generated content
        return res.status(200).json({ message: text });
    } catch (error) {
        console.error("Image Generation Error:", error);
        return res.status(500).json({ error: "Internal server error!" });
    }
};