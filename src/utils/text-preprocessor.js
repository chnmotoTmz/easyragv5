// This file exports a function preprocessText that cleans and prepares text for analysis by removing unwanted characters and formatting.

function preprocessText(text) {
    // Remove unwanted characters and extra whitespace
    return text
        .replace(/[^\w\s]|_/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Trim leading and trailing whitespace
}

module.exports = preprocessText;