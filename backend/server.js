const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env from backend/.env (repo root may not contain .env)
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB(); // Re-enabled connection to MongoDB
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/policies', require('./routes/policyRoutes'));
app.use('/api/claims',   require('./routes/claimRoutes'));
app.use('/api/billing',  require('./routes/billingRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));


app.get('/', (req, res) => {
  res.json({
    message: 'Insured Portal API is running',
    version: '1.0.0',
    status: 'success'
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    status: 'error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});