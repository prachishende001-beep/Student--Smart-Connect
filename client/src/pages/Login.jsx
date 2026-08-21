import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [requireOTP, setRequireOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Forgot Password States
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [forgotEmail, setForgotEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);

            if (res.data.requireOTP) {
                setRequireOTP(true);
                setTempToken(res.data.tempToken);
                return;
            }

            const { token, user } = res.data;
            completeLogin(token, user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { tempToken, otp });
            const { token, user } = res.data;
            completeLogin(token, user);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail });
            setForgotStep(2);
            setSuccess('OTP sent to your email');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', {
                email: forgotEmail,
                otp: otp,
                newPassword: newPassword
            });
            setSuccess('Password reset successfully! You can now login.');
            setForgotMode(false);
            setForgotStep(1);
            setOtp('');
            setFormData({ ...formData, email: forgotEmail });
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    const completeLogin = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (user.role === 'principal') navigate('/principal-dashboard');
        else if (user.role === 'hod') navigate('/hod-dashboard');
        else if (user.role === 'fa') navigate('/fa-dashboard');
        else if (user.role === 'teacher') navigate('/teacher-dashboard');
        else if (user.role === 'student') navigate('/student-dashboard');
        else setError('Dashboard not available.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="glass p-8 rounded-3xl w-full max-w-md border border-slate-700/50 shadow-2xl relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl blur-safe"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl blur-safe"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700/50 shadow-xl">
                            <Lock className="text-indigo-400" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                            Student Smart Connect
                        </h1>
                        <p className="text-slate-400 mt-2">
                            {forgotMode ? 'Reset your password' : (requireOTP ? 'Verify Identity' : 'Sign in to your account')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {!forgotMode ? (
                        <form onSubmit={requireOTP ? handleVerifyOTP : handleLogin} className="space-y-6">
                            {!requireOTP ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-sm font-medium text-slate-300">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => { setForgotMode(true); setError(''); setSuccess(''); }}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">6-Digit OTP</label>
                                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs text-center mb-4">
                                        A 2FA code has been sent to your registered email.
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            type="text"
                                            required
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="000000"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (requireOTP ? 'Verify & Login' : 'Sign In')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={forgotStep === 1 ? handleForgotPassword : handleResetPassword} className="space-y-6">
                            {forgotStep === 1 ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Registered Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200"
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">6-Digit OTP</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                            <input
                                                type="text"
                                                required
                                                maxLength="6"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 tracking-[0.5em] font-mono"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                            <input
                                                type="password"
                                                required
                                                minLength="6"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (forgotStep === 1 ? 'Send Reset OTP' : 'Reset Password')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setForgotMode(false); setForgotStep(1); setError(''); setSuccess(''); }}
                                className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-500">
                            New student?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Activate Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
