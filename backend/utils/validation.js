/**
 * Request validation and sanitization utilities
 */

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .slice(0, 1000) // Limit length
    .replace(/[<>]/g, ''); // Remove potential HTML injection
};

const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePolicyNumber = (policyNumber) => {
  if (typeof policyNumber !== 'string') return false;
  return policyNumber.trim().length > 0 && policyNumber.length < 100;
};

const sanitizeEmail = (email) => {
  return sanitizeString(email).toLowerCase();
};

const sanitizePolicyNumbers = (policyNumbers) => {
  if (!Array.isArray(policyNumbers)) {
    return policyNumbers
      .split(',')
      .map((p) => sanitizeString(p))
      .filter(Boolean);
  }
  return policyNumbers.map((p) => sanitizeString(p)).filter(Boolean);
};

module.exports = {
  sanitizeString,
  validateEmail,
  validatePolicyNumber,
  sanitizeEmail,
  sanitizePolicyNumbers,
};
