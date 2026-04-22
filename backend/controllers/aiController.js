const { GoogleGenerativeAI } = require('@google/generative-ai');

const CLAIM_DESCRIPTION_PROMPT =
  'Write a concise (2-4 sentences), professional "Description of Loss" based on the image. Focus only on clearly visible damage and state observations factually without assumptions.';

function fileToGenerativePart(dataUrl) {
  const [prefix, base64Data] = dataUrl.split(',');
  const mimeTypeMatch = prefix.match(/data:(.*?);base64/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

const analyzeImages = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const imageParts = images.map(fileToGenerativePart);

    const result = await model.generateContent([
      CLAIM_DESCRIPTION_PROMPT,
      ...imageParts
    ]);

    const description = result.response.text();

    if (!description) {
      return res.status(502).json({
        success: false,
        message: 'Gemini returned an empty description',
      });
    }

    return res.status(200).json({ success: true, description: description.trim() });
  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI description',
    });
  }
};

module.exports = { analyzeImages };
