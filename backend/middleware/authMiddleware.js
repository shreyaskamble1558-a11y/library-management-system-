const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Member = require('../models/Member');

const authenticate = (role) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  let decoded;
  try {
    const token = authHeader.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'library_super_secret_key_change_me');
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (decoded.role !== role) {
    return res.status(403).json({ message: 'You are not authorized to access this resource' });
  }

  try {
    const account = role === 'admin'
      ? await Admin.findById(decoded.id).select('-password')
      : await Member.findById(decoded.id).select('-password');

    if (!account || (role === 'user' && account.status !== 'Active')) {
      return res.status(401).json({ message: 'Account not found or inactive' });
    }

    req[role === 'admin' ? 'admin' : 'member'] = account;
  } catch (error) {
    return next(error);
  }
  return next();
};

const protect = authenticate('admin');
const protectUser = authenticate('user');

module.exports = { protect, protectUser };
