# API Documentation for RAG CLI System

## Overview

The RAG CLI System provides a command-line interface for document processing and similarity searching using advanced text analysis techniques. This documentation outlines the key classes and methods available in the system.

## Classes

### DocumentProcessor

- **Description**: Manages the loading, processing, and management of documents.
- **Methods**:
  - `loadDocuments(filePath: string): void`
    - Loads documents from the specified file path.
  - `processDocuments(): void`
    - Processes the loaded documents for analysis.
  - `getDocuments(): Array<Document>`
    - Returns the processed documents.

### TextTokenizer

- **Description**: Provides methods for tokenizing text into words or n-grams.
- **Methods**:
  - `tokenize(text: string, n: number): Array<string>`
    - Tokenizes the input text into n-grams of size `n`.
  - `tokenizeWords(text: string): Array<string>`
    - Tokenizes the input text into individual words.

### TfidfCalculator

- **Description**: Computes the Term Frequency-Inverse Document Frequency (TF-IDF) scores for documents.
- **Methods**:
  - `calculateTFIDF(documents: Array<Document>): Object`
    - Calculates the TF-IDF scores for the provided documents.
  - `getTFIDFVector(document: Document): Array<number>`
    - Returns the TF-IDF vector for a specific document.

### SimilaritySearch

- **Description**: Implements methods for searching and comparing document similarities based on TF-IDF scores.
- **Methods**:
  - `findSimilarDocuments(query: string, documents: Array<Document>): Array<SimilarityResult>`
    - Finds and returns documents similar to the query based on TF-IDF scores.
  - `calculateSimilarity(vectorA: Array<number>, vectorB: Array<number>): number`
    - Calculates the similarity score between two TF-IDF vectors.

## Usage

To use the RAG CLI System, you can invoke the command-line interface and utilize the available commands for searching and processing documents. Refer to the `docs/setup.md` for installation and setup instructions.

## Example

```bash
node src/app.js search "your query here"
```

This command will search for documents similar to the provided query and display the results in the terminal.