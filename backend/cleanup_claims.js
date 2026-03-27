const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Claim = require('./models/Claim');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Delete from MongoDB
        const result = await Claim.deleteMany({ ClaimNumber: { $regex: '^CLM-' } });
        console.log(`Deleted ${result.deletedCount} claims from MongoDB.`);

        // Delete from claims.json
        const claimsFilePath = path.join(__dirname, 'data/claims.json');
        if (fs.existsSync(claimsFilePath)) {
            const claimsData = JSON.parse(fs.readFileSync(claimsFilePath, 'utf8'));
            const filteredData = claimsData.filter(c => !c.ClaimNumber.startsWith('CLM-'));
            
            if (claimsData.length !== filteredData.length) {
                fs.writeFileSync(claimsFilePath, JSON.stringify(filteredData, null, 2), 'utf8');
                console.log(`Removed ${claimsData.length - filteredData.length} claims from claims.json.`);
            } else {
                console.log('No matching claims found in claims.json');
            }
        }
        
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        mongoose.connection.close();
    }
};

cleanup();
