const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  ClaimNumber: { type: String, required: true },
  PolicyNumber: { type: String, required: true },
  Status: { type: String },
  LossDate: { type: String },
  ReceivedDate: { type: String },
  DescriptionOfLoss: { type: String },
  AccidentCode: { type: String },
  PaidLoss: { type: Number },
  MainAdjusterName: { type: String },
  Phone: { type: String },
  Email: { type: String },
  ReserveDetails: { type: Array }
});

module.exports = mongoose.model('Claim', claimSchema);