const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Claim = require('./models/Claim');
const Billing = require('./models/Billing');

const run = async () => {
    dotenv.config();
    await connectDB();

    const claims = await Claim.find({});
    const billings = await Billing.find({});

    const testQuery = await Claim.find({ PolicyNumber: { $in: ['FPP2000002139-00', 'FPP1900008896-00'] } });

    const out = {
        claims_schema_keys: claims.length ? Object.keys(claims[0].toObject()) : [],
        testQueryLength: testQuery.length,
        all_claims: claims,
        all_billings: billings
    };

    fs.writeFileSync('db-dump.json', JSON.stringify(out, null, 2), 'utf8');
    process.exit(0);
}
run();
