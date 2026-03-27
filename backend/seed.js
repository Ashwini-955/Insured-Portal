const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Policy = require('./models/Policy');
const Claim = require('./models/Claim');
const Billing = require('./models/Billing');

// Data
const policiesData = require('./data/policies.json');
const claimsData = require('./data/claims.json');
const billingsData = require('./data/billing.json');
const usersData = require('./data/users.json');

dotenv.config();

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany();
        await Policy.deleteMany();
        await Claim.deleteMany();
        await Billing.deleteMany();

        try {
            await User.collection.dropIndexes();
        } catch (e) {
            console.log('No indexes to drop');
        }

        console.log('Cleared existing data.');

        // Insert new data
        await User.insertMany(usersData);
        await Policy.insertMany(policiesData);
        await Claim.insertMany(claimsData);
        await Billing.insertMany(billingsData);

        console.log('Seed data successfully added!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error.message);
        if (error.errors) console.error(JSON.stringify(error.errors, null, 2));
        else console.error(error.stack);
        process.exit(1);
    }
};

seedData();
