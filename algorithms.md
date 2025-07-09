# Algorithms Used in the RAG System

## Overview

This document provides an overview of the algorithms implemented in the RAG (Retrieval-Augmented Generation) system. The primary algorithms utilized in this system include the Term Frequency-Inverse Document Frequency (TF-IDF) for document representation and various similarity search methods for comparing documents.

## 1. Term Frequency-Inverse Document Frequency (TF-IDF)

### Description

TF-IDF is a statistical measure used to evaluate the importance of a word in a document relative to a collection of documents (corpus). It helps in identifying the most relevant terms in a document based on their frequency and their rarity across the corpus.

### Calculation

The TF-IDF score for a term is calculated using the following formula:

- **Term Frequency (TF)**: Measures how frequently a term occurs in a document. It is calculated as:

  \[
  \text{TF}(t, d) = \frac{\text{Number of times term } t \text{ appears in document } d}{\text{Total number of terms in document } d}
  \]

- **Inverse Document Frequency (IDF)**: Measures how important a term is across the entire corpus. It is calculated as:

  \[
  \text{IDF}(t) = \log\left(\frac{\text{Total number of documents}}{\text{Number of documents containing term } t}\right)
  \]

- **TF-IDF Score**: The final score is computed as:

  \[
  \text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)
  \]

### Implementation

In the RAG system, the `TfidfCalculator` class is responsible for computing the TF-IDF scores for the documents. It processes the documents, calculates the TF and IDF values, and generates the TF-IDF vectors for each document.

## 2. Similarity Search

### Description

The similarity search algorithms are used to compare documents based on their TF-IDF representations. The goal is to find documents that are most similar to a given query document.

### Methods

The RAG system implements the following similarity measures:

- **Cosine Similarity**: This measure calculates the cosine of the angle between two non-zero vectors in an inner product space. It is defined as:

  \[
  \text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}
  \]

  where \( A \) and \( B \) are the TF-IDF vectors of the documents being compared.

- **Jaccard Similarity**: This measure compares the similarity between two sets by dividing the size of the intersection by the size of the union of the sets. It is defined as:

  \[
  \text{Jaccard Similarity}(A, B) = \frac{|A \cap B|}{|A \cup B|}
  \]

### Implementation

The `SimilaritySearch` class in the RAG system implements these similarity measures. It takes the TF-IDF vectors of the documents and computes the similarity scores to identify the most relevant documents based on the user's query.

## Conclusion

The RAG system leverages the TF-IDF algorithm for effective document representation and employs similarity search methods to enhance the retrieval process. These algorithms work together to provide accurate and relevant search results, making the RAG system a powerful tool for document analysis and retrieval.