import axios from 'axios';

export const fetchImage = async(prompt) => {
    const { data } = await axios.get(`https://image.pollinations.ai/prompt/${prompt}`);
    return data.url; // Assuming the API returns `url` as the image URL.
};