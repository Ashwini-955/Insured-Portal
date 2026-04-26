const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sanitizeString } = require('../utils/validation');

const analyzeImages = async (req, res, next) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      const error = new Error('No images provided');
      error.status = 400;
      throw error;
    }

    if (images.length > 5) {
      const error = new Error('Maximum 5 images allowed');
      error.status = 400;
      throw error;
    }

    if (!process.env.GEMINI_API_KEY) {
      const error = new Error('GEMINI_API_KEY is not configured');
      error.status = 500;
      throw error;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert claims adjuster. Analyze these images and write a brief, professional description of the incident/damage for an insurance claim 'Description of Loss' field.
Make it concise (2-4 sentences max). Focus purely on observable damage. Do not mention that you cannot be certain, just state what appears to be damaged in a factual tone.`;

    const imageParts = images.map((img) => {
      let mimeType = 'image/jpeg';
      let data = img;

      const match = img.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        data = match[2];
      }

      return {
        inlineData: {
          data,
          mimeType,
        },
      };
    });

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = sanitizeString(response.text());

    return res.status(200).json({
      success: true,
      description: text
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeImages };
