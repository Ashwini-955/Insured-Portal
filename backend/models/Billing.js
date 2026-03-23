const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  PolicyNumber: { type: String, required: true },
  payPlanDesc: { type: String },
  isRecurringPayment: { type: Boolean },
  accountTotalBalance: { type: Number },
  currentDueDate: { type: String },
  currentAmountDue: { type: Number },
  projectedStatements: { type: Array }
});

module.exports = mongoose.model('Billing', billingSchema);