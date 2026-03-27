import { getPoliciesByEmail } from './src/lib/api.js';

// Since this uses Next.js fetch behavior, we'll just write a quick script to test the endpoint
// exactly as the browser would (minus CORS, which might be the issue).

const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/policies/email/nsingh@cogitate.us');
        const data = await res.json();
        console.log('Status', res.status);
        console.log('Data count', data.data ? data.data.length : 0);
    } catch (err) {
        console.error('Error fetching policies', err);
    }
};

test();
