export const formatMessageContent = (content) => {
    // Regular expressions for code blocks and inline code
    const tripleCodeRegex = /```([\w]*)\n([\s\S]*?)```/g; // Matches triple backtick code blocks with optional language
    const singleCodeRegex = /`([^`]+)`/g; // Matches inline code enclosed in single backticks

    let match; // Variable to hold regex matches
    const parts = []; // Array to hold processed content parts
    let lastIndex = 0; // Tracks the position of the last processed character

    // Process triple backtick code blocks first
    while ((match = tripleCodeRegex.exec(content)) !== null) {
        const [fullMatch, language, code] = match;
        const textBeforeCode = content.slice(lastIndex, match.index);

        // Add any plain text before the code block
        if (textBeforeCode) {
            parts.push({ type: 'text', content: textBeforeCode });
        }

        // Add the code block
        parts.push({
            type: 'codeBlock',
            language: language || 'plaintext', // Default to 'plaintext' if no language specified
            content: code.trim(),
        });

        lastIndex = match.index + fullMatch.length; // Update lastIndex to the end of this code block
    }

    // Handle the remaining text after the last code block
    let remainingText = content.slice(lastIndex);
    if (remainingText) {
        let inlineLastIndex = 0; // Tracks position of the last processed character for inline code
        const inlineParts = []; // Temporary array for inline parts

        // Process inline code within the remaining text
        while ((match = singleCodeRegex.exec(remainingText)) !== null) {
            const [fullMatch, code] = match;
            const textBeforeCode = remainingText.slice(inlineLastIndex, match.index);

            // Add plain text before inline code
            if (textBeforeCode) {
                inlineParts.push({ type: 'text', content: textBeforeCode });
            }

            // Add the inline code
            inlineParts.push({ type: 'inlineCode', content: code });

            inlineLastIndex = match.index + fullMatch.length; // Update position
        }

        // Add any remaining plain text after the last inline code
        if (inlineLastIndex < remainingText.length) {
            inlineParts.push({
                type: 'text',
                content: remainingText.slice(inlineLastIndex),
            });
        }

        parts.push(...inlineParts); // Merge inline parts into the main parts array
    }

    return parts; // Return the fully processed message content
};
