const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'nsingh@cogitate.us'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
