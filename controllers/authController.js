const bcrypt = require("bcryptjs");
const User = require('../models/User');
const AdminRole = require('../models/AdminRoles');
const Carrier = require('../models/Carrier');
const Shipper = require('../models/Shipper');
const AdminUser = require('../models/AdminUsers');
const { generateToken, generateOTP } = require('../utils/jwt');
const { sendEmail } = require('../utils/emailService');
// const SMSService = require('../utils/smsService');
const { encrypt, decrypt } = require('../utils/encryption');
// Signup Controller

exports.signup = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirmPassword, 
      firstName, 
      lastName, 
      phone, 
      roleId, 
      address, 
      zipCode 
    } = req.body;

    // if (!email || !password || !confirmPassword || !firstName || !lastName || !phone || !roleId) {
    //   return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    // }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    const roleDoc = await AdminRole.findById(roleId);
    if (!roleDoc) {
      return res.status(400).json({ success: false, message: 'Invalid role ID' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({
      email,
      password: password,
      firstName,
      lastName,
      phone,
      role: roleDoc._id,
      isApproved: true, 
      isActive: true,
    });

    if (roleDoc.roleType === 'Carrier') {
      await Carrier.create({
        userId: user._id,
        createdBy: user._id,
        status: 'active',
        address: address || '',
        zipCode: zipCode || '',
      });
    } 
    else if (roleDoc.roleType === 'Shipper') {
      await Shipper.create({
        userId: user._id,
        createdBy: user._id,
        address: address,
        zipCode: zipCode,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleDoc.roleType,
        isApproved: user.isApproved,
        profileCompleted: user.profileCompleted,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("req.body", req.body);

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role',
      });
    }
    let account;

    // ✅ Identify correct collection
    if (role === 'admin') {
      account = await AdminUser.findOne({ 'personalInfo.email': email }).select('+password');
    } else if (role === 'user' || role === 'Carrier' || role === 'Shipper') {
      account = await User.findOne({ email }).select('+password');
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role type' });
    }
    // ✅ If not found
    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid credentials1' });
    }

    // ✅ Compare bcrypt password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials2' });
    }
    // Check if active
    if (!account.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // ✅ Fetch role info
    const roleInfo = await AdminRole.findOne({
      _id: account.role ?? account.roleId,      // assuming user.role stores AdminRole id
      isActive: "active"
    });

    if (!roleInfo) {
      return res.status(403).json({
        success: false,
        message: 'Role is inactive or not found',
      });
    }

    // ✅ Update last login
    account.lastLogin = new Date();
    await account.save();

    // ✅ Create session
    req.session.users = {
      _id: account._id,
      email: role === 'admin' ? account.personalInfo?.email : account.email,
      roleId: roleInfo._id,
      roleName: roleInfo.roleName,
      roleType: roleInfo.roleType,
      firstName: account.firstName,
      lastName: account.lastName,
      isApproved: account.isApproved,
      profileCompleted: account.profileCompleted,
    };
    await req.session.save();

    console.log("Session created:", req.session.users);

    // ✅ Generate token
    const token = generateToken(account._id);

    // ✅ Success response
    res.status(200).json({
      success: true,
      token,
      data2: req.session.users,
      data: {
        id: account._id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role: roleInfo.roleType,
        isApproved: account.isApproved,
        profileCompleted: account.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging out'
        });
      }

      // Clear cookie if using cookie-based sessions
      res.clearCookie('connect.sid'); // default cookie name, change if different

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Verify OTP Controller
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Verify OTP (use Redis in production)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isApproved: user.isApproved,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    // await sendEmail(user.email, 'Password Reset OTP', `Your password reset OTP is: ${otp}. Valid for 10 minutes.`);
    // await SMSService.sendSMS(user.phone, `Your password reset OTP is: ${otp}`);

    res.status(200).json({ success: true, message: 'OTP sent to your email and phone', userId: user._id });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    // Verify OTP (use Redis in production)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};