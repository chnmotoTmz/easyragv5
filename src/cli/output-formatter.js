// This file contains the output formatting function for the CLI application.

function formatOutput(results) {
    if (!results || results.length === 0) {
        console.log("No results found.");
        return;
    }

    console.log("Search Results:");
    results.forEach((result, index) => {
        console.log(`${index + 1}. Similarity: ${result.similarity.toFixed(4)}`);
        console.log(`   Document: ${result.text}`);
    });
}

module.exports = formatOutput;