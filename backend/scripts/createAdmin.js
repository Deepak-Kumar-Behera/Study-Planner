/**
 * Run once to create an admin user:
 *   node scripts/createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL    = 'admin@studyplanner.com';
const ADMIN_PASSWORD = 'Admin@1234';

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/study-planner');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Ensure isAdmin flag is set
    existing.isAdmin = true;
    await existing.save();
    console.log('Existing user updated with isAdmin=true:', ADMIN_EMAIL);
  } else {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: hashed, isAdmin: true });
    console.log('Admin user created!');
    console.log('  Email   :', ADMIN_EMAIL);
    console.log('  Password:', ADMIN_PASSWORD);
  }

  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
