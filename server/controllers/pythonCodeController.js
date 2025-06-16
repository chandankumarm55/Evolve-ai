import axios from 'axios';

export const pythonCodeGenerator = async(req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        // Get the API key from environment variables
        const API_KEY = process.env.AI_API_KEY;
        const API_URL = process.env.AI_API_URL || 'https://api.mistral.ai/v1/chat/completions';

        if (!API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Create the system message to instruct the AI
        const systemMessage = {
            role: 'system',
            content: `You are an expert Python programmer. Generate Python code based on user requests.
      
      Always format your response into two distinct sections:
      
      1. First, provide only the Python code with proper formatting, indentation, and comments.
      2. After the code, start a new section with the keyword "INFO:" followed by:
         - A brief explanation of what the code does
         - Instructions on how to run the code
         - Any necessary context or usage examples
      
      Example format:
      
      # Python code here
      def example_function():
          # Comments explaining the code
          print("Hello World")
          
      INFO: This code prints "Hello World" to the console.
      To run this code:
      1. Save it to a file named example.py
      2. Open terminal and navigate to the file location
      3. Run: python example.py
      
      When users ask for changes or improvements to existing code, understand their requirements and provide the updated complete code, not just the changes. Always maintain good coding practices with proper error handling and clear comments.`
        };

        // Prepare the conversation history including the system message
        const fullConversation = [systemMessage, ...messages];

        // Make the API request using axios with Mistral AI
        const response = await axios.post(
            API_URL, {
                model: 'mistral-large-latest',
                messages: fullConversation,
                temperature: 0.7,
                max_tokens: 4000
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract the generated content
        const generatedContent = response.data.choices[0].message.content;

        // Parse the response to separate code and info
        const parts = generatedContent.split('INFO:');
        const code = parts[0].trim();
        const info = parts.length > 1 ? `INFO:${parts[1].trim()}` : 'No information provided.';

        // Return the parsed response
        return res.status(200).json({
            code,
            info,
            fullResponse: generatedContent,
            message: { role: 'assistant', content: generatedContent }
        });

    } catch (error) {
        console.error('Error generating Python code:', error);
        return res.status(500).json({
            error: 'Failed to generate Python code',
            details: error.message
        });
    }
};