const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sanitizeAdmin = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: 'admin' },
    process.env.JWT_SECRET || 'library_super_secret_key_change_me',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generateUserToken = (member) => {
  return jwt.sign(
    { id: member._id, role: 'user', rollNo: member.memberId },
    process.env.JWT_SECRET || 'library_super_secret_key_change_me',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const sanitizeMember = (member) => ({
  _id: member._id,
  memberId: member.memberId,
  name: member.name,
  email: member.email,
  course: member.course,
  year: member.year,
  department: member.department,
  phone: member.phone,
  address: member.address,
  membershipDate: member.membershipDate,
  status: member.status,
});

module.exports = { sanitizeAdmin, sanitizeMember, hashPassword, comparePassword, generateToken, generateUserToken };
