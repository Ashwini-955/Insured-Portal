const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateAnswer(question, context) {
  try {
    const prompt = `
You are an insurance assistant.

Rules:
- Answer ONLY from provided context
- Keep answer short and clear
- If not found, say: "I don't have enough information"

Context:
${context}

Question:
${question}

Answer:
`;

    const result = await model.generateContent(prompt);

    let text;

    try {
      text = result.response.text();
    } catch (innerError) {
      throw innerError; // force catch below
    }

    return text;

  } catch (error) {
    console.error("Gemini Error:", error);

    const errorStr = JSON.stringify(error).toLowerCase();

    if (
      errorStr.includes("429") ||
      errorStr.includes("quota") ||
      errorStr.includes("limit")
    ) {
      return "Limit exceeded - can't generate response right now. Please try again later.";
    }

    return "Something went wrong while generating the response.";
  }
}

module.exports = {
  generateAnswer,
};