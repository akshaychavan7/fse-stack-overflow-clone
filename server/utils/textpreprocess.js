const BadWordsFilter = require('bad-words')

/**
 * Filters input text for profanity using a bad words filter of javascript.
 * Assigns a boolean based on indication of profanity in text.
 * 
 * @param {string} input - The input text to be filtered.
 * @returns {boolean} A boolean indicating whether the input text contains profanity.
 * @throws {Error} If there is an error in filtering bad words.
 */
const textfiltering = (input) => {
    try {
        const filter = new BadWordsFilter();
        return filter.isProfane(input);
    }
    catch (err) {
        throw new Error("Error in filtering bad words.");
    }
}

/**
 * Preprocesses input text by trimming whitespace and escaping special characters.
 * 
 * @param {string} input - The input text to be preprocessed.
 * @returns {string} The preprocessed input text.
 * @throws {Error} If there is an error in preprocessing input.
 */
const preprocessing = (input) => {
    try {
        input = input.trim();
        return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
    catch (err) {
        throw new Error("Error in preprocessing input.");
    }
}

module.exports = { preprocessing, textfiltering };