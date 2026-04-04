const { GoogleGenerativeAI } = require('@google/generative-ai');

const analyzeImages = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the Gemini 2.5 Flash model for fast multimodal tasks
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert claims adjuster. Analyze these images and write a brief, professional description of the incident/damage for an insurance claim 'Description of Loss' field. 
    Make it concise (2-4 sentences max). Focus purely on observable damage. Do not mention that you cannot be certain, just state what appears to be damaged in a factual tone.`;

    const imageParts = images.map(img => {
      // The frontend will send Data URIs like "data:image/jpeg;base64,...base64string..."
      // We need to parse the mimeType and the base64 data.
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
          mimeType
        }
      };
    });

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ success: true, description: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate AI description' });
  }
};

module.exports = { analyzeImages };
