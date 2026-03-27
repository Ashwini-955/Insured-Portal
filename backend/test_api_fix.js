async function test() {
    const email = 'nsingh@cogitate.us';
    const url = `http://localhost:5000/api/policies/email/${encodeURIComponent(email)}`;
    
    console.log(`Testing URL: ${url}`);
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        console.log(`Status: ${res.status}`);
        console.log('Response body:', JSON.stringify(data, null, 2));
        
        if (res.status === 200 && data.success && data.data.length > 0) {
            console.log('SUCCESS: API is returning policies.');
        } else {
            console.log('FAILURE: API is still not returning policies.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
