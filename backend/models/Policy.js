const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  PolicyNumber: { type: String, required: true },
  AccountId: { type: String, required: true },
  PolicyStatus: { type: String },
  EffectiveDate: { type: String },
  ExpirationDate: { type: String },
  Transaction: { type: Object },
  TransactionHistory: { type: Array },
  ClientInformation: { type: Object },
  Agent: { type: Object },
  Carrier: { type: Object },
  PolicyCoverages: { type: Object },
  Forms: { type: Array }
});

module.exports = mongoose.model('Policy', policySchema);