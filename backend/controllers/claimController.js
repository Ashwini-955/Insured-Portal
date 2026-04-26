const Claim = require('../models/Claim');
const { sanitizeString, sanitizePolicyNumbers, validatePolicyNumber } = require('../utils/validation');

// GET /api/claims?policyNumbers=FPP1,FPP2,FPP3
const getClaimsByPolicyNumbers = async (req, res, next) => {
  try {
    const raw = req.query.policyNumbers || '';
    const policyNumbers = sanitizePolicyNumbers(raw);

    if (policyNumbers.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Validate policy numbers
    for (const pn of policyNumbers) {
      if (!validatePolicyNumber(pn)) {
        const error = new Error('Invalid policy number format');
        error.status = 400;
        throw error;
      }
    }

    const claims = await Claim.find({ PolicyNumber: { $in: policyNumbers } }).lean();

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/claims
const createClaim = async (req, res, next) => {
  try {
    const { policyNumber, incidentDate, incidentTime, location, description, accidentCode } = req.body;
    
    // Extract uploaded image URLs from multer
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    // Validate required fields
    if (!policyNumber || !incidentDate || !description) {
      const error = new Error('Missing required fields: policyNumber, incidentDate, description');
      error.status = 400;
      throw error;
    }

    // Sanitize inputs
    const sanitizedPolicyNumber = sanitizeString(policyNumber);
    const sanitizedDescription = sanitizeString(description);
    const sanitizedLocation = sanitizeString(location || '');

    if (!validatePolicyNumber(sanitizedPolicyNumber)) {
      const error = new Error('Invalid policy number format');
      error.status = 400;
      throw error;
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(incidentDate)) {
      const error = new Error('Invalid date format. Use YYYY-MM-DD');
      error.status = 400;
      throw error;
    }

    // Generate claim number
    const randomSuffix = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
    const [year, month, day] = incidentDate.split('-');
    const dateStr = `${month}${day}${year}`;
    const newClaimNumber = `CFPD${randomSuffix}-00-${dateStr}-01`;

    const newClaim = new Claim({
      ClaimNumber: newClaimNumber,
      PolicyNumber: sanitizedPolicyNumber,
      Status: 'Pending Review',
      LossDate: incidentDate,
      ReceivedDate: new Date().toISOString().split('T')[0],
      DescriptionOfLoss: sanitizedDescription,
      AccidentCode: accidentCode || null,
      Location: sanitizedLocation,
      IncidentTime: incidentTime || null,
      PaidLoss: 0,
      ReserveDetails: [],
      Images: imagePaths
    });

    await newClaim.save();

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: newClaim
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClaimsByPolicyNumbers, createClaim };