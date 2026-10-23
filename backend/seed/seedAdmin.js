const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const Admin = require('../models/Admin');

dotenv.config();

(async () => {
  try {
    await connectDB();
    await Admin.ensureDefaultAdmin();
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await disconnectDB();
  }
})();
