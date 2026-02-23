const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  billingId:           { type: String },
  policyNumber:        { type: String, required: true },
  accountId:           { type: String },
  payPlanDesc:         { type: String },
  isAutoPay:           { type: Boolean },
  totalAccountBalance: { type: Number },
  currentAmountDue:    { type: Number },
  currentDueDate:      { type: String },
  projectedStatements: { type: Array }
});

module.exports = mongoose.model('Billing', billingSchema);