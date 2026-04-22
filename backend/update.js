const fs = require('fs'); 
const file = './data/claims.json'; 
const data = JSON.parse(fs.readFileSync(file, 'utf8')); 
data.forEach(c => c.CarrierName = 'SafeHome Mutual Insurance'); 
fs.writeFileSync(file, JSON.stringify(data, null, 2));
