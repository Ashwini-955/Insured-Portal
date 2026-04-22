const axios = require('axios');

async function test() {
  try {
    // Small transparent pixel base64 for testing (Gemini will likely say it's empty/unknown, but it tests the flow)
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const response = await axios.post('http://localhost:5000/api/ai/analyze-images', {
      images: [base64Image]
    });
    
    console.log('Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

test();
