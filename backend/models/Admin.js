const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.statics.ensureDefaultAdmin = async function () {
  const defaultEmail = 'admin@library.com';
  const defaultPassword = 'Admin@123';

  let admin = await this.findOne({ email: defaultEmail });

  if (!admin) {
    admin = await this.create({
      name: 'Library Admin',
      email: defaultEmail,
      password: defaultPassword,
      role: 'admin',
    });
    console.log('Default admin seeded successfully');
    return admin;
  }

  const isPlainTextPassword = typeof admin.password === 'string' && !admin.password.startsWith('$2');
  if (isPlainTextPassword) {
    admin.password = defaultPassword;
    await admin.save();
    console.log('Default admin password corrected');
  }

  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
