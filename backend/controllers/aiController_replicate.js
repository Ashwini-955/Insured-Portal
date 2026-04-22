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

    // Using MiniGPT-4 for image analysis - free and effective
    const output = await replicate.run(
      "daanelson/minigpt-4-b2:3551af4ad4d9ae0e6c929b5f6c86a4e7b5e1b3b2",
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
