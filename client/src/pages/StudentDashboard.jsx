import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, User, BookOpen, GraduationCap,
    CreditCard, Calendar, LogOut, Loader2,
    TrendingUp, CheckCircle, AlertCircle, Clock, Megaphone
} from 'lucide-react';
import AnnouncementsChat from '../components/AnnouncementsChat';
import NotificationBell from '../components/NotificationBell';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/student';
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// ─── TABS ────────────────────────────────────────────────────────────────────

const IDCardTab = ({ profile, onUpload }) => {
    const [uploading, setUploading] = useState(false);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API}/profile-pic`, formData, authH());
            onUpload(); // Refresh dashboard data to get new profilePic URL
        } catch (err) {
            alert('Photo upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-[450px] bg-slate-900 rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl shadow-indigo-500/10 relative group">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-indigo-900"></div>
                <div className="absolute top-4 left-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                        <GraduationCap className="text-white" size={18} />
                    </div>
                    <span className="text-white font-black text-xs uppercase tracking-widest">Student Smart Connect  ID</span>
                </div>

                <div className="relative pt-16 pb-10 px-10 flex flex-col items-center">
                    <div className="relative group/photo mb-6">
                        <div className="w-36 h-36 rounded-3xl bg-slate-800 border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center text-5xl font-black text-indigo-400">
                            {profile.profilePic ? (
                                <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile.name[0]
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                            {uploading ? (
                                <Loader2 className="animate-spin text-white" />
                            ) : (
                                <div className="text-center">
                                    <User className="text-white mx-auto mb-1" size={24} />
                                    <span className="text-[10px] text-white font-bold uppercase">Change</span>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" disabled={uploading} />
                        </label>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-1">{profile.name}</h2>
                    <p className="text-indigo-400 font-bold text-sm uppercase tracking-[0.2em] mb-8">Student Card</p>

                    <div className="w-full grid grid-cols-2 gap-y-6 gap-x-8 text-left border-t border-slate-800 pt-8">
                        {[
                            { label: 'Enrollment', value: profile.enrollmentNo },
                            { label: 'Department', value: profile.dept },
                            { label: 'Section', value: profile.sec },
                            { label: 'Validity', value: '2022-2026' }
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="text-sm font-bold text-slate-200">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-800/50 py-4 text-center border-t border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Authorized Digital Identity</p>
                </div>
            </div>
            <p className="mt-8 text-slate-500 text-sm flex items-center gap-2">
                <AlertCircle size={14} /> This is a verified digital document. {!profile.profilePic && "Please upload a photo."}
            </p>
        </div>
    );
};

const LockerTab = ({ documents, onUpload, onDelete }) => {
    const [uploading, setUploading] = useState(false);
    const [docName, setDocName] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', docName || file.name);

        try {
            await axios.post(`${API}/documents/upload`, formData, authH());
            setDocName('');
            onUpload();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="glass p-8 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-md text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-2">Digital Document Locker</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Securely store your academic records, certificates, and identities.
                        Powered by ImageKit cloud storage.
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Document Name (Optional)"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48 hidden md:block"
                    />
                    <label className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-3">
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <BookOpen size={20} />}
                        <span>{uploading ? 'Uploading...' : 'Upload Doc'}</span>
                        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass rounded-3xl border border-slate-700/50">
                        <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-500 italic">Your locker is empty. Start by uploading important documents.</p>
                    </div>
                ) : documents.map((doc) => (
                    <div key={doc._id} className="glass group rounded-3xl border border-slate-700/50 overflow-hidden hover:border-indigo-500/50 transition-all p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                <BookOpen size={24} />
                            </div>
                            <button
                                onClick={() => onDelete(doc._id)}
                                className="text-slate-600 hover:text-rose-500 p-2 transition-colors"
                            >
                                <LogOut size={18} className="rotate-90" />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{doc.name}</h3>
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-6">Added {new Date(doc.createdAt).toLocaleDateString()}</p>

                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-block text-center py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
                        >
                            View & Download
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ComplaintsTab = ({ complaints, onSubmit }) => {
    const [category, setCategory] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/complaints`, { category, description: desc }, authH());
            setCategory('');
            setDesc('');
            onSubmit();
        } catch (err) {
            alert('Failed to register complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass p-8 rounded-3xl border border-slate-700/50 h-max">
                <h2 className="text-2xl font-bold mb-2">Raise Issue</h2>
                <p className="text-slate-400 text-sm mb-8">Let your Faculty Advisor know about any issues or requests.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                        <select
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Category</option>
                            <option value="Academic">Academic</option>
                            <option value="Fees">Fees</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Briefly describe your issue..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <AlertCircle size={20} />}
                        Submit Complaint
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-white mb-2">Recent Complaints</h2>
                {complaints.length === 0 ? (
                    <div className="py-20 text-center glass rounded-3xl border border-slate-700/50 text-slate-500 italic">
                        No previous complaints raised.
                    </div>
                ) : complaints.map((c) => (
                    <div key={c._id} className="glass p-8 rounded-3xl border border-slate-700/50 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-widest ${c.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                            }`}>
                            {c.status}
                        </div>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-indigo-400">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{c.category}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">{c.description}</p>

                        {c.faComment && (
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <CheckCircle size={14} /> FA Response
                                </p>
                                <p className="text-emerald-200/70 text-sm italic">"{c.faComment}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const OverviewTab = ({ profile }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <User className="text-indigo-400" /> Personal Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                {[
                    { label: 'Full Name', value: profile.name },
                    { label: 'Enrollment No.', value: profile.enrollmentNo },
                    { label: 'Email Address', value: profile.email },
                    { label: 'Department', value: profile.dept },
                    { label: 'Section', value: profile.sec },
                    { label: 'Account Status', value: 'Active', color: 'emerald' }
                ].map((item, i) => (
                    <div key={i}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className={`text-lg font-semibold ${item.color === 'emerald' ? 'text-emerald-400' : 'text-slate-200'}`}>{item.value}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-700/50 bg-indigo-500/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <GraduationCap className="text-indigo-400" /> Faculty Advisor
            </h2>
            {profile.fa ? (
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                        <span className="text-2xl font-bold text-indigo-400">{profile.fa.name[0]}</span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-white">{profile.fa.name}</p>
                        <p className="text-sm text-slate-400">{profile.fa.email}</p>
                        <p className="text-sm text-slate-400 mt-1">{profile.fa.phone || 'No phone listed'}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-500 leading-relaxed">
                        Your FA is responsible for academic counseling and administrative approvals.
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <AlertCircle className="mx-auto text-slate-600 mb-3" size={32} />
                    <p className="text-slate-500 italic">No FA assigned yet.</p>
                </div>
            )}
        </div>
    </div>
);

const AttendanceTab = ({ stats }) => {
    const totalPresent = Object.values(stats).reduce((acc, s) => acc + s.present, 0);
    const totalClasses = Object.values(stats).reduce((acc, s) => acc + s.total, 0);
    const percentage = totalClasses > 0 ? (totalPresent / totalClasses * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border-l-4 border-indigo-500 bg-indigo-500/5">
                    <p className="text-slate-400 text-sm font-medium">Aggregate Attendance</p>
                    <p className="text-4xl font-bold text-white mt-1">{percentage}%</p>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500 bg-emerald-500/5">
                    <p className="text-slate-400 text-sm font-medium">Classes Attended</p>
                    <p className="text-4xl font-bold text-white mt-1">{totalPresent}</p>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-slate-500 bg-slate-800/50">
                    <p className="text-slate-400 text-sm font-medium">Total Classes Held</p>
                    <p className="text-4xl font-bold text-white mt-1">{totalClasses}</p>
                </div>
            </div>

            <div className="glass rounded-3xl border border-slate-700/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700/50">
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {Object.entries(stats).length === 0 ? (
                            <tr><td colSpan="3" className="px-8 py-12 text-center text-slate-500 italic">No records found.</td></tr>
                        ) : Object.entries(stats).map(([subject, s], i) => {
                            const p = (s.present / s.total * 100).toFixed(1);
                            return (
                                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-8 py-5 font-semibold text-slate-200">{subject}</td>
                                    <td className="px-8 py-5 min-w-[200px]">
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${Number(p) < 75 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${p}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`font-mono font-bold ${Number(p) < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {s.present}/{s.total} ({p}%)
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MarksTab = ({ marks }) => (
    <div className="glass rounded-3xl border border-slate-700/50 overflow-hidden">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Name</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Marks Obtained</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Percentage</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
                {marks.length === 0 ? (
                    <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-500 italic">No results announced yet.</td></tr>
                ) : marks.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5 text-indigo-400 font-bold">{m.examName}</td>
                        <td className="px-8 py-5 text-slate-200 font-medium">{m.subjectName}</td>
                        <td className="px-8 py-5">
                            <span className="text-white font-bold">{m.marks}</span>
                            <span className="text-slate-500 text-sm ml-1">/ {m.outOf}</span>
                        </td>
                        <td className="px-8 py-5">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                {(m.marks / m.outOf * 100).toFixed(1)}%
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ExamsTab = ({ exams }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.length === 0 ? (
            <div className="col-span-full glass p-12 text-center text-slate-500 rounded-3xl italic">
                No active exam schedules found.
            </div>
        ) : exams.map(exam => (
            <div key={exam._id} className="glass p-6 rounded-3xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">{exam.examName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={12} className="text-slate-500" />
                            <p className="text-xs text-slate-400">{exam.fromDate} to {exam.toDate}</p>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">LIVE</div>
                </div>
                <div className="space-y-3">
                    {exam.schedule.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200">{s.subject}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono font-bold text-indigo-400">{s.startTime}</p>
                                <p className="text-[10px] text-slate-600 font-mono">Starts</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const FeesTab = ({ fee }) => (
    <div className="max-w-4xl mx-auto space-y-8 py-4 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Total Fees', value: fee?.totalFees || 0, icon: CreditCard, color: 'indigo' },
                { label: 'Fees Paid', value: fee?.paidFees || 0, icon: CheckCircle, color: 'emerald' },
                { label: 'Remaining Balance', value: fee?.remainingFees || 0, icon: AlertCircle, color: 'rose' }
            ].map((stat, i) => (
                <div key={i} className={`glass p-8 rounded-3xl border-b-4 border-${stat.color}-500 bg-${stat.color}-500/5`}>
                    <div className="flex items-center justify-between mb-4">
                        <stat.icon className={`text-${stat.color}-400`} size={24} />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-3xl font-black text-white">₹{stat.value.toLocaleString()}</p>
                </div>
            ))}
        </div>

        {fee?.payments && fee.payments.length > 0 && (
            <div className="glass p-8 rounded-3xl border border-slate-700/50">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Clock className="text-indigo-400" /> Payment History
                </h3>
                <div className="overflow-x-auto text-white">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                                <th className="px-4 py-4">Date</th>
                                <th className="px-4 py-4">Description</th>
                                <th className="px-4 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {fee.payments.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-4 py-4 text-sm text-slate-300">
                                        {new Date(p.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium italic text-slate-400">
                                        {p.description || "School Fee Payment"}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-bold text-emerald-400">
                                        ₹{p.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <div className="glass p-8 rounded-3xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <CreditCard size={120} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Payment Summary</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
                Please ensure all pending dues are cleared before the semester exams to avoid any administrative holding of your results.
                Payments can be made via the official college payment portal.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 w-max px-4 py-2 rounded-full border border-indigo-500/20">
                <CheckCircle size={14} /> Official Records Verified
            </div>
        </div>
    </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const fetchDashboard = () => axios.get(`${API}/dashboard`, authH()).then(res => setData(res.data));
    const fetchDocuments = () => axios.get(`${API}/documents`, authH()).then(res => setDocuments(res.data));
    const fetchComplaints = () => axios.get(`${API}/complaints`, authH()).then(res => setComplaints(res.data));

    useEffect(() => {
        Promise.all([fetchDashboard(), fetchDocuments(), fetchComplaints()])
            .then(() => setLoading(false))
            .catch(err => {
                if (err.response?.status === 401) navigate('/login');
                setLoading(false);
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleDeleteDoc = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await axios.delete(`${API}/documents/${id}`, authH());
            fetchDocuments();
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );

    if (!data) return <div className="text-white text-center py-20">Error loading dashboard.</div>;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'attendance', label: 'Attendance', icon: BookOpen },
        { id: 'marks', label: 'Marks', icon: TrendingUp },
        { id: 'exams', label: 'Exams', icon: Calendar },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'locker', label: 'Locker', icon: BookOpen },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'idcard', label: 'ID Card', icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-72 shrink-0 p-8 border-r border-slate-800/60 hidden lg:flex flex-col gap-2 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Student Hub</span>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 group ${activeTab === tab.id
                                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                                : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-500 transition-colors group-hover:text-indigo-400'} />
                            <span className="font-semibold text-sm">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-semibold group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto p-8 lg:p-12">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Hi, {data.profile.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Welcome back to your academic portal</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <div className="glass px-5 py-3 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-none">{data.profile.sec}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{data.profile.dept}</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
                                {data.profile.name[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div>
                    {activeTab === 'overview' && <OverviewTab profile={data.profile} />}
                    {activeTab === 'announcements' && (
                        <div className="py-4 animate-in zoom-in-95 duration-300">
                            <AnnouncementsChat key={loading} />
                        </div>
                    )}
                    {activeTab === 'attendance' && <AttendanceTab stats={data.attendanceStats} />}
                    {activeTab === 'idcard' && <IDCardTab profile={data.profile} onUpload={fetchDashboard} />}
                    {activeTab === 'marks' && <MarksTab marks={data.marks} />}
                    {activeTab === 'exams' && <ExamsTab exams={data.exams} />}
                    {activeTab === 'fees' && <FeesTab fee={data.fee} />}
                    {activeTab === 'locker' && <LockerTab documents={documents} onUpload={fetchDocuments} onDelete={handleDeleteDoc} />}
                    {activeTab === 'complaints' && <ComplaintsTab complaints={complaints} onSubmit={fetchComplaints} />}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
