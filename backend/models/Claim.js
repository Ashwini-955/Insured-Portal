const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimNumber:      { type: String, required: true },
  policyNumber:     { type: String, required: true },
  accountId:        { type: String },
  title:            { type: String },
  status:           { type: String },
  lossDate:         { type: String },
  filedDate:        { type: String },
  descriptionOfLoss: { type: String },
  amountClaimed:    { type: Number },
  amountPaid:       { type: Number },
  adjuster:         { type: Object },
  recentActivity:   { type: Array }
});

module.exports = mongoose.model('Claim', claimSchema);