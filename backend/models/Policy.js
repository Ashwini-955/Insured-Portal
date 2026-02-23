const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyNumber:    { type: String, required: true },
  accountId:       { type: String, required: true },
  policyType:      { type: String },
  status:          { type: String },
  effectiveDate:   { type: String },
  expirationDate:  { type: String },
  coveragePlan:    { type: String },
  annualPremium:   { type: Number },
  cancellationReason: { type: String },
  carrier:         { type: String },
  insured:         { type: Object },
  propertyAddress: { type: Object },
  agent:           { type: Object },
  coverages:       { type: Array },
  documents:       { type: Array },
  transactionHistory: { type: Array }
});

module.exports = mongoose.model('Policy', policySchema);