const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password_hash: String,
  role: String,
  status: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    console.log('Connecting to:', MONGODB_URI.split('@')[1] || 'URL'); // Hide credentials in log
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@eloktantra.in';
    const password = 'Admin123';
    const passwordHash = await bcrypt.hash(password, 12);

    // Dynamic model to avoid schema sync issues in script
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password_hash: String,
      role: String,
      status: String,
    }, { timestamps: true }));

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.password_hash = passwordHash;
      await existingUser.save();
      console.log(`Updated existing admin user: ${email}`);
    } else {
      await User.create({
        name: 'System Administrator',
        email,
        password_hash: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      console.log(`Created new admin user: ${email}`);
    }

    console.log('SUCCESS: Admin user is now in MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('ERROR during seeding:', error.message);
    process.exit(1);
  }
}

seed();
