const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/users');
const Policy = require('./models/Policy');
const Claim = require('./models/Claim');
const Billing = require('./models/Billing');

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

        // Users
        const users = await User.insertMany([
            { email: 'john@example.com', name: 'John Doe', ssoId: 'sso-123' },
            { email: 'jane@example.com', name: 'Jane Smith', ssoId: 'sso-456' }
        ]);

        // Policies
        const policies = await Policy.insertMany([
            {
                policyNumber: 'POL-1001',
                accountId: 'ACC-100',
                policyType: 'Auto',
                status: 'Active',
                effectiveDate: '2024-01-01',
                expirationDate: '2025-01-01',
                coveragePlan: 'Comprehensive',
                annualPremium: 1200,
                carrier: 'Insured Co',
                insured: { name: 'John Doe', email: 'john@example.com', phone: '555-0100' }
            },
            {
                policyNumber: 'POL-1002',
                accountId: 'ACC-100',
                policyType: 'Home',
                status: 'Active',
                effectiveDate: '2024-06-01',
                expirationDate: '2025-06-01',
                coveragePlan: 'Premium',
                annualPremium: 1500,
                carrier: 'Insured Co',
                insured: { name: 'John Doe', email: 'john@example.com', phone: '555-0100' }
            },
            {
                policyNumber: 'POL-2001',
                accountId: 'ACC-200',
                policyType: 'Auto',
                status: 'Active',
                effectiveDate: '2024-03-01',
                expirationDate: '2025-03-01',
                coveragePlan: 'Basic',
                annualPremium: 800,
                carrier: 'Insured Co',
                insured: { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0200' }
            }
        ]);

        // Claims
        const claims = await Claim.insertMany([
            {
                claimNumber: 'CLM-1001-A',
                policyNumber: 'POL-1001',
                accountId: 'ACC-100',
                title: 'Auto Accident - Minor Collision',
                status: 'Pending Review',
                filedDate: '2024-05-28',
                amountClaimed: 1500,
                descriptionOfLoss: 'Rear-ended at stoplight.'
            },
            {
                claimNumber: 'CLM-1002-A',
                policyNumber: 'POL-1002',
                accountId: 'ACC-100',
                title: 'Home Damage - Water Leak',
                status: 'Submitted',
                filedDate: '2024-05-20',
                amountClaimed: 3500,
                descriptionOfLoss: 'Pipe burst in the kitchen.'
            },
            {
                claimNumber: 'CLM-2001-A',
                policyNumber: 'POL-2001',
                accountId: 'ACC-200',
                title: 'Auto Accident - Windshield',
                status: 'Approved',
                filedDate: '2024-04-10',
                amountClaimed: 400,
                descriptionOfLoss: 'Rock chipped windshield.'
            }
        ]);

        // Billings
        const billings = await Billing.insertMany([
            {
                billingId: 'INV-2024-06-001',
                policyNumber: 'POL-1001',
                accountId: 'ACC-100',
                currentAmountDue: 150.00,
                currentDueDate: '2024-06-10',
                status: 'Due'
            },
            {
                billingId: 'INV-2024-06-002',
                policyNumber: 'POL-1002',
                accountId: 'ACC-100',
                currentAmountDue: 300.00,
                currentDueDate: '2024-06-15',
                status: 'Due'
            },
            {
                billingId: 'INV-2024-05-015',
                policyNumber: 'POL-1001',
                accountId: 'ACC-100',
                currentAmountDue: 220.00,
                currentDueDate: '2024-05-25',
                status: 'Overdue'
            }
        ]);

        console.log('Seed data successfully added!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
