const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Policy = require('./models/Policy');
const Claim = require('./models/Claim');
const Billing = require('./models/Billing');

const run = async () => {
    dotenv.config();
    await connectDB();
    let errors = {};

    try { await Policy.deleteMany(); await Policy.insertMany(require('./data/policies.json')); } catch (e) { errors.policy = { msg: e.message, err: e.errors }; }
    try { await Claim.deleteMany(); await Claim.insertMany(require('./data/claims.json')); } catch (e) { errors.claim = { msg: e.message, err: e.errors }; }
    try { await Billing.deleteMany(); await Billing.insertMany(require('./data/billing.json')); } catch (e) { errors.billing = { msg: e.message, err: e.errors }; }

    fs.writeFileSync('seed-error.json', JSON.stringify(errors, null, 2), 'utf8');
    process.exit(0);
}
run();
