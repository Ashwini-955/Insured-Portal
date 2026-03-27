import { getPoliciesByEmail } from './src/lib/api.js';
import { config } from './src/config/env.js';

console.log('Testing with baseUrl:', config.api.baseUrl);

const test = async () => {
    try {
        const email = 'nsingh@cogitate.us';
        console.log(`Fetching from: ${config.api.baseUrl}/policies/email/${encodeURIComponent(email)}`);
        
        const res = await fetch(`${config.api.baseUrl}/policies/email/${encodeURIComponent(email)}`);
        console.log('Status', res.status);
        
        const data = await res.json();
        console.log('Success:', data.success);
        console.log('Data count:', data.data ? data.data.length : 0);
    } catch (err) {
        console.error('Network Error:', err.message);
    }
};

test();
