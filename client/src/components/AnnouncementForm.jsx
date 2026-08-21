import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Send, Paperclip, X, Loader2, CheckCircle, AlertCircle, Users, Building2, LayoutGrid, FileText } from 'lucide-react';

const AnnouncementForm = ({ onFinish }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRoles, setTargetRoles] = useState([]);
    const [targetDept, setTargetDept] = useState('');
    const [targetSection, setTargetSection] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [departments, setDepartments] = useState([]);

    const user = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
    const isPrincipal = user.role === 'principal';
    const isHod = user.role === 'hod';
    const isFa = user.role === 'fa';

    const roles = [
        { id: 'hod', label: 'HOD' },
        { id: 'teacher', label: 'Teacher' },
        { id: 'fa', label: 'FA' },
        { id: 'student', label: 'Student' },
    ].filter(r => {
        if (isHod) return r.id !== 'hod'; // HOD can't target HODs generally in this scope
        if (isFa) return r.id === 'student'; // FA targets students
        return true;
    });

    useEffect(() => {
        if (isPrincipal) {
            axios.get('http://localhost:5000/api/principal/departments', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }).then(res => setDepartments(res.data)).catch(e => console.error(e));
        }
        if (isHod || isFa) {
            setTargetDept(user.dept);
            if (isFa) {
                setTargetSection(user.sec);
                setTargetRoles(['student']);
            }
        }
    }, []);

    const handleRoleChange = (roleId) => {
        setTargetRoles(prev =>
            prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
        );
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            alert("Maximum 5 files allowed");
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (targetRoles.length === 0) {
            alert("Please select at least one target role");
            return;
        }

        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);
        formData.append('targetRoles', JSON.stringify(targetRoles));
        formData.append('targetDept', targetDept);
        formData.append('targetSection', targetSection);
        files.forEach(file => formData.append('files', file));

        const token = localStorage.getItem('token');
        const endpoint = isPrincipal ? 'principal' : (isHod ? 'hod' : 'fa');

        try {
            await axios.post(`http://localhost:5000/api/${endpoint}/announcement`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus('success');
            setTitle('');
            setMessage('');
            if (!isFa) setTargetRoles([]);
            setFiles([]);
            if (onFinish) onFinish();
        } catch (error) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-3xl border border-slate-700/50 max-w-2xl mx-auto backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Megaphone size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Create Announcement</h2>
                    <p className="text-slate-400 text-sm">Reach your team with important updates</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Subject</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field w-full"
                            placeholder="Announcement Title"
                        />
                    </div>

                    {!isFa && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Target Roles</label>
                            <div className="flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => handleRoleChange(role.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${targetRoles.includes(role.id)
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isPrincipal && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                <Building2 size={12} /> Target Department
                            </label>
                            <select
                                value={targetDept}
                                onChange={(e) => setTargetDept(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d.name || d} value={d.name || d}>{d.name || d}</option>)}
                            </select>
                        </div>
                    )}

                    {!isFa && (
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                <LayoutGrid size={12} /> Target Section
                            </label>
                            <input
                                type="text"
                                value={targetSection}
                                onChange={(e) => setTargetSection(e.target.value.toUpperCase())}
                                className="input-field w-full"
                                placeholder="e.g. A (Optional)"
                                disabled={isHod && !targetDept}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Message</label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="input-field w-full min-h-[150px] resize-none text-slate-200"
                        placeholder="Type your official announcement here..."
                    />
                </div>

                <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attachments</label>
                        <span className="text-[10px] font-bold text-indigo-400">{files.length}/5 Files</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <label className="cursor-pointer w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 transition-colors">
                            <Paperclip size={20} />
                            <input type="file" multiple onChange={handleFileChange} className="hidden" />
                        </label>
                        {files.map((file, idx) => (
                            <div key={idx} className="relative group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <FileText size={20} />
                                </div>
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-widest"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <Send size={18} />
                            <span>Post Announcement</span>
                        </>
                    )}
                </button>

                {status === 'success' && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Broadcasted successfully!</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">Failed to broadcast. Please check your connection.</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AnnouncementForm;
