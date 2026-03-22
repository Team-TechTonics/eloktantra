const userRepository = require('../repositories/userRepository');
const { fetchToken, fetchUserInfo } = require('../integrations/digilocker');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const digilockerCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Auth code missing' });
    }

    // 1. Get token
    const tokenData = await fetchToken(code);
    const accessToken = tokenData.access_token;

    // 2. Get user info
    const digilockerUser = await fetchUserInfo(accessToken);

    const { name, voterId, dob } = digilockerUser;

    // 3. User Management logic (Using repository for robustness)
    let user = await userRepository.findOne({ voterId });
    if (!user) {
      user = await userRepository.create({
        name,
        voterId,
        dob: new Date(dob),
        hasVoted: false
      });
    }

    // 4. Eligibility check (Age >= 18)
    const birthDate = new Date(user.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const isAdult = age >= 18;

    if (!isAdult) {
      return res.status(403).json({ error: 'Not eligible: Must be 18+' });
    }

    if (user.hasVoted) {
      return res.status(403).json({ error: 'Already voted' });
    }

    // 5. Issue JWT
    const authToken = jwt.sign({ userId: user._id, verified: true }, JWT_SECRET, { expiresIn: '30m' });

    res.json({
      user,
      authToken,
      status: 'VERIFICATION_PENDING' // User needs Face verify next
    });
  } catch (error) {
    console.error('DigiLocker Auth Error:', error.message);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

const faceVerify = async (req, res) => {
  try {
    const { image } = req.body;
    // Mock face verification response
    const mockResponse = {
      match: true,
      confidence: 0.92
    };

    if (mockResponse.confidence < 0.85) {
      return res.status(403).json({ match: false, error: 'Low face confidence score' });
    }

    res.json({ success: true, ...mockResponse });
  } catch (error) {
    res.status(500).json({ error: 'Face verification failed' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userRepository.findAll();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded for Admin Portal demo/setup as seen in eloktantra-admin/.env.local
  // Email: admin@eloktantra.in, Password: Admin@2024
  if (email === 'admin@eloktantra.in' && password === 'Admin@2024') {
    const token = jwt.sign({ email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      success: true,
      token: token,
      user: {
        id: 'admin-id',
        name: 'System Administrator',
        email: 'admin@eloktantra.in',
        role: 'ADMIN'
      }
    });
  }

  res.status(401).json({ success: false, error: 'Invalid credentials' });
};

module.exports = {
  digilockerCallback,
  faceVerify,
  getUsers,
  login
};
