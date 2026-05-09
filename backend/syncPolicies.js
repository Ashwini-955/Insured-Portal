const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Simple schema matching the structure
const policySchema = new mongoose.Schema({}, { strict: false });
const Policy = mongoose.model('Policy', policySchema);

const updatePolicies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all existing policies
    await Policy.deleteMany({});
    console.log('Cleared all existing policies');

    const policiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/policies.json'), 'utf8'));
    
    for (const policyData of policiesData) {
      const email = policyData.ClientInformation?.Communications?.find(c => c.Type === 'Email')?.Value || 'nsingh@cogitate.us';
      await Policy.create({
        ...policyData,
        'insured.email': email
      });
      console.log(`Inserted policy ${policyData.PolicyNumber}: ${policyData.EffectiveDate} to ${policyData.ExpirationDate}`);
    }

    console.log('All policies updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updatePolicies();
