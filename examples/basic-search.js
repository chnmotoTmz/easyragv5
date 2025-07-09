// This file demonstrates how to perform a basic search using the RAG CLI system.

const { DocumentProcessor } = require('../src/core/document-processor');
const { SimilaritySearch } = require('../src/core/similarity-search');
const { TfidfCalculator } = require('../src/core/tfidf-calculator');
const { readFile } = require('../src/utils/file-reader');
const { preprocessText } = require('../src/utils/text-preprocessor');

// Load and preprocess documents
const documents = readFile('./src/data/sample-documents.js');
const processedDocuments = documents.map(doc => preprocessText(doc));

// Initialize the document processor
const documentProcessor = new DocumentProcessor(processedDocuments);

// Create an instance of the TF-IDF calculator
const tfidfCalculator = new TfidfCalculator(documentProcessor.getDocuments());

// Perform TF-IDF calculation
const tfidfScores = tfidfCalculator.calculate();

// Initialize the similarity search
const similaritySearch = new SimilaritySearch(tfidfScores);

// Define a search query
const query = "your search term here"; // Replace with your search term

// Preprocess the query
const processedQuery = preprocessText(query);

// Perform the search
const results = similaritySearch.search(processedQuery);

// Display the results
console.log("Search Results:");
results.forEach(result => {
    console.log(`Document: ${result.document}, Similarity: ${result.similarity}`);
});