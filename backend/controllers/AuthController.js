const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models');

// In-memory token blacklist for logout (In production, use Redis)
const revokedTokens = new Set();

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Using a generic message for security
    const invalidMsg = 'Invalid email or password.';

    const user = await db.User.findOne({ 
      where: { email },
      include: [{ model: db.Employee }]
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: invalidMsg } });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: invalidMsg } });
    }

    const payload = {
      userId: user.id,
      employeeId: user.employee_id,
      role: user.role,
      departmentId: user.Employee ? user.Employee.department_id : null
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

    user.last_login_at = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 900,
        user: {
          id: user.id,
          employeeId: user.employee_id,
          role: user.role,
          name: user.Employee ? user.Employee.first_name + ' ' + user.Employee.last_name : 'Admin',
          departmentId: payload.departmentId
        }
      }
    });
  } catch (error) { next(error); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || revokedTokens.has(refreshToken)) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret', (err, decoded) => {
      if (err) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Expired or invalid refresh token' } });
      
      const payload = {
        userId: decoded.userId,
        employeeId: decoded.employeeId,
        role: decoded.role,
        departmentId: decoded.departmentId
      };

      const newAccessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
      res.json({ success: true, data: { accessToken: newAccessToken } });
    });
  } catch (error) { next(error); }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      revokedTokens.add(refreshToken);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (newPassword.length < 8) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' } });
    }

    const user = await db.User.findByPk(req.user.userId);
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Incorrect current password' } });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) { next(error); }
};
