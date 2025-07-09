// This file contains a utility function to track performance metrics in the RAG CLI system.

function trackPerformance(label, callback) {
    const start = process.hrtime();
    const result = callback();
    const end = process.hrtime(start);
    const timeTaken = end[0] * 1e3 + end[1] / 1e6; // Convert to milliseconds
    console.log(`${label} took ${timeTaken.toFixed(3)} ms`);
    return result;
}

module.exports = trackPerformance;