// utils/constants.js
export const MODIFICATIONS_TAG_NAME = 'modifications';
export const WORK_DIR = process.env.WORK_DIR || '/home/project';
export const allowedHTMLElements = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'a', 'img', 'ul', 'ol',
    'li', 'code', 'pre', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'tr',
    'th', 'td', 'em', 'strong', 'b', 'i'
];

export default {
    MODIFICATIONS_TAG_NAME,
    WORK_DIR,
    allowedHTMLElements
};