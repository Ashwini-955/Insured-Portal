const Replicate = require('replicate');

const analyzeImages = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ success: false, message: 'REPLICATE_API_TOKEN is not configured' });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prompt = `Write a concise (2–4 sentences), professional "Description of Loss" based on the images. Focus only on clearly visible damage and state observations factually without assumptions`;

    // Process the first image
    const imageUrl = images[0];

    // Using LLaVA model for image analysis - free and effective
    const output = await replicate.run(
      "yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6c6baa33118e2d18e453aa0f4923f62a52b69e8c9",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
        },
      }
    );

    // The output is typically an array of strings
    const description = Array.isArray(output) ? output.join(' ') : output;

    res.status(200).json({ success: true, description });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate AI description' });
  }
};

module.exports = { analyzeImages };
