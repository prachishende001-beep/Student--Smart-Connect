const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.role === 'student') {
            if (!user.isRegistered) {
                return res.status(403).json({ message: 'Please register your account first' });
            }

            // Generate OTP for 2FA
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
            await user.save();

            const { sendOTP } = require('../utils/mailer');
            await sendOTP(user.email, otp, 'login');

            const tempToken = jwt.sign(
                { id: user._id, role: user.role, type: '2fa' },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '15m' }
            );

            return res.status(200).json({
                message: 'OTP sent to your email',
                requireOTP: true,
                tempToken
            });
        }

        // Standard login for non-students
        const token = jwt.sign(
            { id: user._id, role: user.role, dept: user.dept },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                dept: user.dept
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

const verifyLoginOTP = async (req, res) => {
    try {
        const { tempToken, otp } = req.body;
        if (!tempToken || !otp) return res.status(400).json({ message: 'Token and OTP required' });

        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.type !== '2fa') return res.status(400).json({ message: 'Invalid token type' });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, dept: user.dept },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                dept: user.dept
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Invalid token or server error', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        const { sendOTP } = require('../utils/mailer');
        await sendOTP(user.email, otp, 'password reset');

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword; // bcrypt pre-save hook will hash it
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

module.exports = { login, verifyLoginOTP, forgotPassword, resetPassword };
