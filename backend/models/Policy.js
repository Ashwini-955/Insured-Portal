const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true },
  accountId: { type: String, required: true },
  policyType: { type: String },
  status: { type: String },
  effectiveDate: { type: String },
  expirationDate: { type: String },
  annualPremium: { type: Number },
  insured: {
    email: { type: String }
  },
  propertyAddress: {
    addressLine1: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String }
  },
  coverages: [{
    name: { type: String },
    limit: { type: Number }
  }],
  documents: { type: Array },
  transactionHistory: { type: Array }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);