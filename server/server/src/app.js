const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authController = require('./controllers/authController');
const voteController = require('./controllers/voteController');
const candidateRoutes = require('./routes/candidateRoutes');
const electionRoutes = require('./routes/electionRoutes');
const constituencyRoutes = require('./routes/constituencyRoutes');
const partyRoutes = require('./routes/partyRoutes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));

app.get('/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Database Connection with Fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eloktantra';
const connectWithFallback = async () => {
  try {
    // Try primary URI
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB: Connected to Primary (Atlas/Env)');
  } catch (err) {
    console.warn('MongoDB: Connection to Primary failed, falling back to Local (127.0.0.1)');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/eloktantra');
      console.log('MongoDB: Connected to Localhost');
    } catch (localErr) {
      console.error('MongoDB: Fatal - Local connection also failed:', localErr);
    }
  }
};
connectWithFallback();

// Middleware for Device Check
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  req.deviceId = Buffer.from(userAgent).toString('base64');
  next();
});

// Routes
app.get('/auth/digilocker/callback', authController.digilockerCallback);
app.get('/auth/users', authController.getUsers);
app.post('/verify-face', authController.faceVerify);
app.post('/risk/evaluate', voteController.evaluateRisk);
app.post('/generate-token', voteController.generateVotingToken);
app.get('/vote/count/:id', (req, res) => res.json(0)); 
app.post('/auth/login', authController.login); // Proper admin login
app.post('/auth/login', voteController.generateVotingToken); // Alias for frontend
app.post('/voter/verify', authController.faceVerify); // Alias for face verify
app.post('/vote/submit', voteController.castVote); // New vote submission route
app.use('/candidates', candidateRoutes); // Keep standard
app.use('/voting/candidates', candidateRoutes); // Some frontend calls might use this
app.use('/elections', electionRoutes); // Standard
app.use('/voting/elections', electionRoutes); // Frontend detail fetch prefix
app.use('/election', electionRoutes); // Frontend active fetch prefix
app.use('/api/admin/election', electionRoutes); // Admin portal alias
app.use('/api/admin/constituency', constituencyRoutes); 
app.use('/api/candidates', candidateRoutes); // Common alias
app.use('/api/admin/candidate', candidateRoutes); // Admin portal alias
app.use('/api/admin/party', partyRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
