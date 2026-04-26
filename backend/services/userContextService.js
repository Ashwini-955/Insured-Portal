const Policy = require("../models/Policy");
const Claim = require("../models/Claim");
const Billing = require("../models/Billing");

function formatMoney(value) {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN")}`;
}

async function buildUserContext(email) {
  if (!email) {
    return "No logged-in user email was provided.";
  }

  try {
    const policies = await Policy.find({ "insured.email": email });
    const policyNumbers = policies.map((p) => p.policyNumber).filter(Boolean);

    const [claims, billing] = await Promise.all([
      Claim.find({ PolicyNumber: { $in: policyNumbers } }),
      Billing.find({ PolicyNumber: { $in: policyNumbers } }),
    ]);

    const policySection = policies.length
      ? policies
          .map(
            (p, i) =>
              `${i + 1}. Policy: ${p.policyNumber}, Type: ${p.policyType || "N/A"}, Status: ${p.status || "N/A"}\n` +
              `   - Address: ${p.propertyAddress ? `${p.propertyAddress.addressLine1}, ${p.propertyAddress.city}, ${p.propertyAddress.state} ${p.propertyAddress.zipCode}` : "N/A"}\n` +
              `   - Premium: ${formatMoney(p.annualPremium)}, Agent: ${p.agent?.name || "N/A"}\n` +
              `   - Coverages: ${p.coverages?.length ? p.coverages.map(c => `${c.name} (${formatMoney(c.limit)})`).join(", ") : "None"}\n` +
              `   - Documents: ${p.documents?.length ? p.documents.map(d => d.name || d.documentName || d.fileName || "Doc").join(", ") : "None"}\n` +
              `   - History: ${p.transactionHistory?.length ? p.transactionHistory.map(t => `${t.transactionType || t.type} (${t.transactionDate || t.date || "N/A"})`).join(", ") : "None"}`
          )
          .join("\n")
      : "No policies found.";

    const claimSection = claims.length
      ? claims
          .map(
            (c, i) =>
              `${i + 1}. Claim: ${c.ClaimNumber}, Status: ${c.Status}, Loss Date: ${c.LossDate || "N/A"}\n` +
              `   - Description: ${c.DescriptionOfLoss || "N/A"}\n` +
              `   - Paid: ${formatMoney(c.PaidLoss)}`
          )
          .join("\n")
      : "No claims found.";

    const billingSection = billing.length
      ? billing
          .map((b, i) => {
            const nextDue = b.currentAmountDue > 0 ? `${formatMoney(b.currentAmountDue)} due on ${b.currentDueDate || "N/A"}` : "No payment due";
            return `${i + 1}. Policy ${b.PolicyNumber} → ${nextDue}\n` +
                   `   - Plan: ${b.payPlanDesc || "N/A"}, Total Balance: ${formatMoney(b.accountTotalBalance)}`;
          })
          .join("\n")
      : "No billing records found.";

    return `
User Account Context for ${email}:

User Policies:
${policySection}

User Claims:
${claimSection}

User Billing:
${billingSection}
`;
  } catch (error) {
    console.error("Error building user context:", error);
    return "Error retrieving user account data.";
  }
}

module.exports = {
  buildUserContext,
};