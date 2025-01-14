import axios from "axios"


export const FetchImage = async(prompt) => {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${prompt}`)
    console.log(response.data)
    if (!response.data.success) {
        throw new Error(response.data.message)
    }
    return response.data.data
}