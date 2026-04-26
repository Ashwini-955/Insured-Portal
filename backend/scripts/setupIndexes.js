/**
 * Database Indexes Setup
 * Run this file to create necessary database indexes for optimal performance
 * 
 * Usage: node backend/scripts/setupIndexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Billing = require('../models/Billing');
const User = require('../models/User');

async function setupIndexes() {
  try {
    console.log('🔧 Setting up database indexes...');

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not configured in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ User indexes created');

    // Policy indexes
    await Policy.collection.createIndex({ 'insured.email': 1 });
    await Policy.collection.createIndex({ PolicyNumber: 1 });
    await Policy.collection.createIndex({ status: 1 });
    console.log('✅ Policy indexes created');

    // Claim indexes
    await Claim.collection.createIndex({ PolicyNumber: 1 });
    await Claim.collection.createIndex({ ClaimNumber: 1 }, { unique: true });
    await Claim.collection.createIndex({ Status: 1 });
    await Claim.collection.createIndex({ LossDate: 1 });
    console.log('✅ Claim indexes created');

    // Billing indexes
    await Billing.collection.createIndex({ PolicyNumber: 1 });
    await Billing.collection.createIndex({ currentDueDate: 1 });
    console.log('✅ Billing indexes created');

    console.log('✨ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up indexes:', error.message);
    process.exit(1);
  }
}

setupIndexes();
