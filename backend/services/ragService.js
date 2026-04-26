const natural = require("natural");
const insuranceDocuments = require("../data/insuranceData");

const TfIdf = natural.TfIdf;

/**
 * Retrieve context from insurance documents based on query
 * @param {string} query - The search query
 * @param {number} topK - Number of top results to return (default: 1)
 * @returns {Object} Object containing context and sources
 */
function retrieveContext(query, topK = 1) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    console.warn('retrieveContext called with empty query');
    return {
      context: '',
      sources: [],
    };
  }

  if (!Array.isArray(insuranceDocuments) || insuranceDocuments.length === 0) {
    console.warn('No insurance documents available');
    return {
      context: '',
      sources: [],
    };
  }

  try {
    const tfidf = new TfIdf();

    // Add documents to TF-IDF
    insuranceDocuments.forEach((doc) => {
      if (doc.title && doc.content) {
        tfidf.addDocument(`${doc.title} ${doc.content}`);
      }
    });

    const scores = [];

    tfidf.tfidfs(query, (index, measure) => {
      if (insuranceDocuments[index]) {
        scores.push({
          document: insuranceDocuments[index],
          score: measure,
        });
      }
    });

    // Sort by relevance score (descending)
    scores.sort((a, b) => b.score - a.score);

    // Filter and slice top results
    const topResults = scores
      .filter((item) => item.score > 0)
      .slice(0, Math.min(topK, scores.length));

    return {
      context: topResults
        .map((item) => item.document.content)
        .filter((content) => content && content.length > 0)
        .join("\n\n"),
      sources: topResults.map((item) => ({
        title: item.document.title || 'Unknown',
        score: item.score.toFixed(4),
      })),
    };
  } catch (error) {
    console.error('Error in retrieveContext:', error.message);
    return {
      context: '',
      sources: [],
    };
  }
}

module.exports = {
  retrieveContext,
};