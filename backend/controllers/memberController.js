const Member = require('../models/Member');
const Transaction = require('../models/Transaction');

const withMemberFilters = (query = {}) => {
  const filter = {};
  const { search, status } = query;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { memberId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  return filter;
};

const getMembers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filter = withMemberFilters(req.query);

    const total = await Member.countDocuments(filter);
    const members = await Member.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.json({ member });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const { memberId, name, email, phone, address, membershipDate, status, password, course, year, department } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'A password is required to create a user login' });
    }

    const normalizedMemberId = String(memberId).trim().toUpperCase();
    const duplicateId = await Member.findOne({
      memberId: new RegExp(`^${normalizedMemberId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    if (duplicateId) {
      return res.status(409).json({ message: 'Member ID already exists' });
    }

    const duplicateEmail = await Member.findOne({ email: String(email).trim().toLowerCase() });
    if (duplicateEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const member = await Member.create({
      memberId: normalizedMemberId,
      name,
      email: String(email).trim().toLowerCase(),
      password,
      course,
      year,
      department,
      phone,
      address,
      membershipDate,
      status: status || 'Active',
    });

    return res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const { name, email, phone, address, status, password, course, year, department } = req.body;
    const existingEmail = email
      ? await Member.findOne({ email: String(email).trim().toLowerCase() })
      : null;
    if (existingEmail && existingEmail._id.toString() !== member._id.toString()) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    member.name = name || member.name;
    member.email = email ? String(email).trim().toLowerCase() : member.email;
    member.phone = phone || member.phone;
    member.address = address || member.address;
    member.course = course ?? member.course;
    member.year = year ?? member.year;
    member.department = department ?? member.department;
    member.status = status || member.status;
    if (password) member.password = password;

    await member.save();
    return res.json({ message: 'Member updated successfully', member });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const activeLoan = await Transaction.exists({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] },
    });
    if (activeLoan) {
      return res.status(409).json({ message: 'This member has an active loan and cannot be deleted yet.' });
    }

    await Member.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMembers, getMemberById, createMember, updateMember, deleteMember };
