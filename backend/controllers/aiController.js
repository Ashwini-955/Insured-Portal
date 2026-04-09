const Replicate = require('replicate');

const CLAIM_DESCRIPTION_PROMPT =
  'Write a concise (2-4 sentences), professional "Description of Loss" based on the image. Focus only on clearly visible damage and state observations factually without assumptions.';

const normalizeOutput = (output) => {
  if (Array.isArray(output)) {
    return output.join(' ').trim();
  }

  if (typeof output === 'string') {
    return output.trim();
  }

  return '';
};

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

    const output = await replicate.run(
      'yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6c6baa33118e2d18e453aa0f4923f62a52b69e8c9',
      {
        input: {
          image: images[0],
          prompt: CLAIM_DESCRIPTION_PROMPT,
        },
      }
    );

    const description = normalizeOutput(output);

    if (!description) {
      return res.status(502).json({
        success: false,
        message: 'Replicate returned an empty description',
      });
    }

    return res.status(200).json({ success: true, description });
  } catch (error) {
    console.error('AI Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI description',
    });
  }
};

module.exports = { analyzeImages };
