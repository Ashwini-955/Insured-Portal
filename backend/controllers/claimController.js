const Claim = require('../models/Claim');
const fs = require('fs');
const path = require('path');

// GET /api/claims?policyNumbers=FPP1,FPP2,FPP3
const getClaimsByPolicyNumbers = async (req, res) => {
  try {
    const raw = req.query.policyNumbers || '';
    const policyNumbers = raw.split(',').map((s) => s.trim()).filter(Boolean);

    if (policyNumbers.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const claimsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/claims.json'), 'utf8'));
    const claims = claimsData.filter(c => policyNumbers.includes(c.PolicyNumber));

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// POST /api/claims
const createClaim = async (req, res) => {
  try {
    // fields will be in req.body, files in req.files
    const { policyNumber, incidentDate, incidentTime, location, description } = req.body;
    
    // Extract uploaded image URLs from multer 'req.files'
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    if (!policyNumber || !incidentDate || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Generate claim number to match previous format (e.g., CFPD000888-00-03222026-01)
    const randomSuffix = String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');
    const [year, month, day] = incidentDate.split('-');
    const dateStr = `${month}${day}${year}`;
    const newClaimNumber = `CFPD${randomSuffix}-00-${dateStr}-01`;

    const newClaim = new Claim({
      ClaimNumber: newClaimNumber,
      PolicyNumber: policyNumber,
      Status: 'Pending Review',
      LossDate: incidentDate,
      ReceivedDate: new Date().toISOString().split('T')[0],
      DescriptionOfLoss: description,
      Location: location,
      IncidentTime: incidentTime,
      PaidLoss: 0,
      ReserveDetails: [],
      Images: imagePaths
    });

    await newClaim.save();

    // Sync to claims.json
    try {
      const claimsFilePath = path.join(__dirname, '../data/claims.json');
      if (fs.existsSync(claimsFilePath)) {
        const claimsData = JSON.parse(fs.readFileSync(claimsFilePath, 'utf8'));
        claimsData.push(newClaim.toObject());
        fs.writeFileSync(claimsFilePath, JSON.stringify(claimsData, null, 2), 'utf8');
      }
    } catch (fsErr) {
      console.error('Error syncing to claims.json:', fsErr);
      // We still return 201 since DB save succeeded
    }

    res.status(201).json({
      success: true,
      data: newClaim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getClaimsByPolicyNumbers, createClaim };