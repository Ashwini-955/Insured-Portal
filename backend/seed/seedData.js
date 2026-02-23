const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env file
dotenv.config();

// Import JSON files
const users    = require('../data/users.json');
const policies = require('../data/policies.json');
const claims   = require('../data/claims.json');
const billing  = require('../data/billing.json');

// Define simple schemas just for seeding
const User    = mongoose.model('User',    new mongoose.Schema({}, { strict: false }));
const Policy  = mongoose.model('Policy',  new mongoose.Schema({}, { strict: false }));
const Claim   = mongoose.model('Claim',   new mongoose.Schema({}, { strict: false }));
const Billing = mongoose.model('Billing', new mongoose.Schema({}, { strict: false }));

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Policy.deleteMany({});
    await Claim.deleteMany({});
    await Billing.deleteMany({});
    console.log('🗑️  Old data cleared');

    // Insert new data
    await User.insertMany(users);
    await Policy.insertMany(policies);
    await Claim.insertMany(claims);
    await Billing.insertMany(billing);
    console.log('✅ All data seeded successfully!');

    // Close connection
    mongoose.connection.close();
    console.log('🔌 Connection closed');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();