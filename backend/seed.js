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
        const mappedUsers = usersData.map(u => ({ ...u, email: u.email, password: u.password, firstName: u.firstName, lastName: u.lastName }));
        await User.insertMany(mappedUsers);

        const mappedPolicies = policiesData.map(p => {
            let pType = 'Insurance Policy';
            if (p.PolicyNumber === 'FPP2000002139-00') pType = 'Home Insurance';
            else if (p.PolicyNumber === 'FPP1900008896-00') pType = 'Farm Insurance';
            else if (p.PolicyNumber === 'FPP2025001234-00') pType = 'Vehicle Insurance';
            
            return {
                ...p,
                policyNumber: p.PolicyNumber,
                accountId: p.AccountId,
                policyType: pType,
                status: p.PolicyStatus || p.status || 'Active',
                insured: {
                    email: p.ClientInformation?.Communications?.find(c => c.Type === 'Email')?.Value || ''
                }
            };
        });
        await Policy.insertMany(mappedPolicies);

        const mappedClaims = claimsData.map(c => ({
            ...c,
            claimId: c.ClaimNumber || c.claimId || 'Unknown',
            policyId: c.PolicyNumber || c.policyId || 'Unknown',
            status: c.ClaimStatus || c.status || 'Open'
        }));
        await Claim.insertMany(mappedClaims);

        const mappedBilling = billingsData.map(b => ({
            ...b,
            accountId: b.AccountId || b.accountId || 'Unknown',
            status: b.status || 'Active'
        }));
        await Billing.insertMany(mappedBilling);

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
