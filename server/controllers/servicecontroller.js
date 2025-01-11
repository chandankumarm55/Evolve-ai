import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios'

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




export const ImageGeneration = async(req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required!" });
        }

        const seedValue = 42;
        const dropDownValue = "EulerAncestralDiscreteScheduler";
        const radioValue = 50;
        const options = {
            method: "POST",
            url: "https://api.segmind.com/v1/sdxl1.0-txt2img",
            headers: {
                "x-api-key": process.env.SEGMIND_API_KEY,
                "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
            data: {
                prompt: prompt,
                seed: seedValue,
                scheduler: dropDownValue,
                num_inference_steps: radioValue,
                negative_prompt: "NONE",
                samples: "1",
                guidance_scale: "7.5",
                strength: "1",
                shape: 512,
            },
        };

        const response = await axios.request(options);

        const base64Image = Buffer.from(response.data, "binary").toString("base64");

        return res.status(200).json({
            message: "Image generated successfully!",
            image: `data:image/jpeg;base64,${base64Image}`,
        });
    } catch (error) {
        console.error("Error while generating image:", error);
        return res.status(500).json({ error: "Internal server error!" });
    }
};


const axios = require('axios');

const apiKey = 'LA-88ddea799df34f4ead49e36a8f59d86cbdb845a0908144af92852ce62c5dbb4c';
const apiEndpoint = 'https://api.meta.ai/v1/';

const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
};

const params = {
    'model': 'llama',
    'prompt': 'Hello, world!',
    'temperature': 0.7,
    'max_tokens': 100
};

axios.post(apiEndpoint + 'generate', params, { headers })
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error(error);
    });