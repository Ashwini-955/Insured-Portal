const Policy = require('../models/Policy');
const User = require('../models/User');
const fallbackPolicies = require('../data/policies.json');

const getCommunicationValue = (communications = [], typeAliases = []) => {
  if (!Array.isArray(communications)) return '';

  const aliases = typeAliases.map(alias => alias.toLowerCase());
  const match = communications.find(item => {
    const itemType = (item.Type || item.type || '').toLowerCase();
    return aliases.includes(itemType);
  });

  return match?.Value || match?.value || '';
};

const getPoliciesByEmail = async (req, res) => {
  try {
    const email = (req.params.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const matched = await Policy.find({ 'insured.email': new RegExp('^' + email + '$', 'i') }).lean();

    const transformedPolicies = matched.map(p => {
      const policyNumber = p.PolicyNumber || p.policyNumber;
      const fallbackPolicy = fallbackPolicies.find(item => (item.PolicyNumber || item.policyNumber) === policyNumber);

      // Handle nested property address
      let addr = p.propertyAddress;
      if (!addr && p.ClientInformation?.BusinessInfo?.Locations?.[0]?.Address) {
        const locAddr = p.ClientInformation.BusinessInfo.Locations[0].Address;
        addr = {
          addressLine1: locAddr.AddressLine1,
          city: locAddr.City,
          state: locAddr.State,
          zipCode: locAddr.Zip || locAddr.ZipCode
        };
      }

      // Handle nested coverages
      let covs = p.coverages || [];
      if ((!covs || covs.length === 0) && p.PolicyCoverages?.Coverages) {
        covs = p.PolicyCoverages.Coverages.map(c => ({
          name: c.Description,
          limit: c.Limit
        }));
      }

      // Determine policyType dynamically from coverages
      const allCoveragesText = covs.map(c => (c.name || '').toLowerCase()).join(' ');
      let derivedPolicyType = 'General Insurance';
      if (allCoveragesText.includes('farm') || allCoveragesText.includes('livestock')) {
        derivedPolicyType = 'Farm Insurance';
      } else if (allCoveragesText.includes('auto') || allCoveragesText.includes('collision') || allCoveragesText.includes('motorist') || allCoveragesText.includes('bodily injury')) {
        derivedPolicyType = 'Auto Insurance';
      } else if (allCoveragesText.includes('dwelling') || allCoveragesText.includes('home')) {
        derivedPolicyType = 'Home Insurance';
      }

      // Extract agent information. Data may come from raw JSON (Agent/Communications)
      // or Mongo documents shaped by the schema (agent/communications).
      const rawAgent = p.Agent || p.agent || fallbackPolicy?.Agent || fallbackPolicy?.agent;
      let transformedAgent = null;
      if (rawAgent) {
        const communications = rawAgent.Communications || rawAgent.communications || [];
        const emailComm = rawAgent.Email || rawAgent.email || getCommunicationValue(communications, ['Email']);
        const phoneComm = rawAgent.Phone || rawAgent.phone || getCommunicationValue(communications, ['PhNo', 'Phone', 'PhoneNumber']);

        transformedAgent = {
          name: rawAgent.Name || rawAgent.name || rawAgent.AgentName || rawAgent.agentName || 'N/A',
          email: emailComm,
          phone: phoneComm
        };
      }

      return {
        policyNumber,
        status: p.PolicyStatus || p.status || 'Active',
        effectiveDate: p.EffectiveDate || p.effectiveDate,
        expirationDate: p.ExpirationDate || p.expirationDate,
        accountId: p.AccountId || p.accountId,
        policyType: derivedPolicyType,
        insured: {
          email: p.insured?.email || email
        },
        propertyAddress: addr || null,
        coverages: covs,
        agent: transformedAgent
      };
    });

    if (!transformedPolicies || transformedPolicies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No policies found for this email'
      });
    }

    res.status(200).json({
      success: true,
      count: transformedPolicies.length,
      data: transformedPolicies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getPoliciesByEmail };
