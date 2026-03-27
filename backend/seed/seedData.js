const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const rawUsers    = require('../data/users.json');
const rawPolicies = require('../data/policies.json');
const rawClaims   = require('../data/claims.json');
const rawBilling  = require('../data/billing.json');

const User    = mongoose.model('User',    new mongoose.Schema({}, { strict: false }));
const Policy  = mongoose.model('Policy',  new mongoose.Schema({}, { strict: false }));
const Claim   = mongoose.model('Claim',   new mongoose.Schema({}, { strict: false }));
const Billing = mongoose.model('Billing', new mongoose.Schema({}, { strict: false }));

// Transform policies to match model schema
const transformPolicies = (policies) => {
  return policies.map(p => {
    const email = p.ClientInformation?.Communications?.find(c => c.Type === 'Email')?.Value || '';
    const annualPremium = p.TransactionHistory?.[0]?.AnnualPremium || 0;
    const address = p.ClientInformation?.BusinessInfo?.Locations?.[0]?.Address || {};
    
    return {
      policyNumber: p.PolicyNumber,
      accountId: p.AccountId,
      policyType: p.Carrier?.Name || 'Standard',
      status: p.PolicyStatus || 'Active',
      effectiveDate: p.EffectiveDate,
      expirationDate: p.ExpirationDate,
      annualPremium: annualPremium,
      insured: {
        email: email,
        firstName: p.ClientInformation?.FirstName,
        lastName: p.ClientInformation?.LastName
      },
      propertyAddress: {
        addressLine1: address.AddressLine1,
        city: address.City,
        state: address.State,
        zipCode: address.Zip
      },
      coverages: p.PolicyCoverages?.Coverages?.map(c => ({
        name: c.Description,
        limit: c.Limit
      })) || [],
      documents: p.Forms || [],
      transactionHistory: p.TransactionHistory || []
    };
  });
};

// Transform claims to match model schema
const transformClaims = (claims) => {
  return claims.map(c => ({
    ClaimNumber: c.ClaimNumber,
    PolicyNumber: c.PolicyNumber,
    Status: c.Status,
    LossDate: c.LossDate,
    ReceivedDate: c.ReceivedDate,
    DescriptionOfLoss: c.DescriptionOfLoss,
    AccidentCode: c.AccidentCode,
    PaidLoss: c.PaidLoss,
    MainAdjusterName: c.MainAdjusterName,
    Phone: c.Phone,
    Email: c.Email,
    ReserveDetails: c.ReserveDetails || []
  }));
};

// Transform billing to match model schema
const transformBilling = (billing) => {
  return billing.map(b => ({
    PolicyNumber: b.PolicyNumber,
    payPlanDesc: b.payPlanDesc,
    isRecurringPayment: b.isRecurringPayment,
    accountTotalBalance: b.accountTotalBalance,
    currentDueDate: b.currentDueDate,
    currentAmountDue: b.currentAmountDue,
    projectedStatements: b.projectedStatements || []
  }));
};

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set in backend/.env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await User.deleteMany({});
    await Policy.deleteMany({});
    await Claim.deleteMany({});
    await Billing.deleteMany({});
    console.log('Old data cleared');

    await User.insertMany(rawUsers);
    console.log(`✓ ${rawUsers.length} users seeded`);
    
    const transformedPolicies = transformPolicies(rawPolicies);
    await Policy.insertMany(transformedPolicies);
    console.log(`✓ ${transformedPolicies.length} policies seeded`);
    
    const transformedClaims = transformClaims(rawClaims);
    await Claim.insertMany(transformedClaims);
    console.log(`✓ ${transformedClaims.length} claims seeded`);
    
    const transformedBilling = transformBilling(rawBilling);
    await Billing.insertMany(transformedBilling);
    console.log(`✓ ${transformedBilling.length} billing records seeded`);
    
    console.log('\n✅ All data seeded successfully!');

    mongoose.connection.close();

  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedDB();