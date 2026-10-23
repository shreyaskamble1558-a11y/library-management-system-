const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const { generateToken, generateUserToken, sanitizeAdmin, sanitizeMember, comparePassword } = require('../utils/jwt');

const loginAdmin = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    const admin = await Admin.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(admin);

    return res.json({
      token,
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const rollNo = String(req.body.rollNo || '').trim();
    const member = await Member.findOne({
      memberId: new RegExp(`^${rollNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    }).select('+password');

    if (!member || member.status !== 'Active' || !member.password || !(await bcrypt.compare(req.body.password, member.password))) {
      return res.status(401).json({ message: 'Invalid roll number or password.' });
    }

    return res.json({ token: generateUserToken(member), user: sanitizeMember(member) });
  } catch (error) {
    next(error);
  }
};

const getCurrentAdmin = async (req, res) => {
  return res.json({ admin: sanitizeAdmin(req.admin) });
};

const getCurrentUser = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await Transaction.updateMany(
      { member: req.member._id, status: 'Issued', expectedReturnDate: { $lt: today } },
      { $set: { status: 'Overdue' } }
    );

    const [books, transactions] = await Promise.all([
      Book.find().sort({ title: 1 }),
      Transaction.find({ member: req.member._id })
        .populate('book')
        .sort({ createdAt: -1 }),
    ]);

    return res.json({
      user: sanitizeMember(req.member),
      books,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.name = name;
    admin.email = String(email).toLowerCase();
    await admin.save();

    return res.json({ admin: sanitizeAdmin(admin), message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginAdmin, loginUser, getCurrentAdmin, getCurrentUser, updateProfile, changePassword };
