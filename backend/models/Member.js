const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, select: false },
    course: { type: String, trim: true, default: '' },
    year: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    membershipDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, result) => {
        delete result.password;
        return result;
      },
    },
  }
);

memberSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Member', memberSchema);
