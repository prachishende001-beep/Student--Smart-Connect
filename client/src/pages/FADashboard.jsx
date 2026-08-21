import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, BookOpen, GraduationCap, CheckCircle, Loader2,
    Phone, Mail, Hash, ChevronDown, ChevronUp,
    LayoutDashboard, CreditCard, CalendarDays, Upload, PlusCircle,
    Radio, Zap, Trash2, AlertCircle, TrendingUp, LogOut, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementsChat from '../components/AnnouncementsChat';
import NotificationBell from '../components/NotificationBell';
import { Megaphone } from 'lucide-react';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const API = 'http://localhost:5000/api/fa';

const token = () => localStorage.getItem('token');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${token()}` } });

// ─── FEES TAB ────────────────────────────────────────────────────────────────

const FeesTab = ({ section, students }) => {
    const [fees, setFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState(null);
    const [file, setFile] = useState(null);
    const [manualForm, setManualForm] = useState({ studentId: '', totalFees: '', paymentAmount: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('list');
    const [expandedFee, setExpandedFee] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchFees(); }, []);

    const fetchFees = async () => {
        setLoadingFees(true);
        try {
            const res = await axios.get(`${API}/fees`, authHeaders());
            setFees(res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingFees(false); }
    };

    const handleBulkUpload = async () => {
        if (!file) return;
        setUploadLoading(true);
        setUploadMsg(null);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await axios.post(`${API}/fees/upload`, fd, {
                headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'multipart/form-data' }
            });
            setUploadMsg({ type: 'success', text: res.data.message });
            setFile(null);
            fetchFees();
        } catch (e) {
            setUploadMsg({ type: 'error', text: e.response?.data?.message || 'Upload failed' });
        } finally { setUploadLoading(false); }
    };

    const handleManualSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${API}/fees/manual`, manualForm, authHeaders());
            setManualForm({ studentId: '', totalFees: '', paymentAmount: '', description: '' });
            fetchFees();
            alert('Fee record saved!');
        } catch (e) { alert('Error saving fee'); }
        finally { setSaving(false); }
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await axios.get(`${API}/download-template/fees`, {
                headers: { Authorization: `Bearer ${token()}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fees_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) { /* silently ignore — provide manual template hint */ }
    };

    const subTabs = [
        { id: 'list', label: 'Fee Records' },
        { id: 'bulk', label: 'Bulk Upload' },
        { id: 'manual', label: 'Manual Entry' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-3 border-b border-slate-700/50 pb-4">
                {subTabs.map(t => (
                    <button key={t.id} onClick={() => setActiveSubTab(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSubTab === t.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* LIST */}
            {activeSubTab === 'list' && (
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="text-indigo-400" /> Fee Records — Section {section?.name}
                        </h3>
                        <p className="text-xs text-slate-500 italic">Click on a student to see payment history</p>
                    </div>
                    {loadingFees ? <Loader2 className="animate-spin text-indigo-400 mx-auto" /> : (
                        <div className="overflow-x-auto text-white">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-800/50 text-slate-300 text-xs uppercase">
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Enrollment</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-right">Paid</th>
                                        <th className="px-4 py-3 text-right">Remaining</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {fees.length === 0
                                        ? <tr><td colSpan={6} className="py-8 text-center text-slate-500 italic">No fee records yet</td></tr>
                                        : fees.map(f => (
                                            <React.Fragment key={f._id}>
                                                <tr onClick={() => setExpandedFee(expandedFee === f._id ? null : f._id)}
                                                    className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${expandedFee === f._id ? 'bg-indigo-500/5 shadow-inner shadow-indigo-500/10' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {expandedFee === f._id ? <ChevronUp size={14} className="text-indigo-400" /> : <ChevronDown size={14} className="text-slate-500" />}
                                                            <span className="font-medium text-slate-200">{f.studentName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{f.enrollmentNo}</td>
                                                    <td className="px-4 py-3 text-right text-slate-200">₹{f.totalFees.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-emerald-400">₹{f.paidFees.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right text-rose-400">₹{f.remainingFees.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${f.remainingFees <= 0
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                                            {f.remainingFees <= 0 ? 'Cleared' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expandedFee === f._id && (
                                                    <tr className="bg-indigo-500/5 animate-in slide-in-from-top-1 duration-200">
                                                        <td colSpan={6} className="px-6 py-4">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 border-b border-indigo-500/20 pb-2 mb-2">
                                                                    <CalendarDays size={14} /> PAYMENT HISTORY
                                                                </div>
                                                                {(!f.payments || f.payments.length === 0) ? (
                                                                    <p className="text-xs text-slate-500 italic py-2">No payment history available.</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {f.payments.map((p, pidx) => (
                                                                            <div key={pidx} className="glass p-3 rounded-xl border border-indigo-500/10 flex flex-col gap-1">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-emerald-400 font-bold">₹{p.amount.toLocaleString()}</span>
                                                                                    <span className="text-[10px] text-slate-500">{new Date(p.date).toLocaleDateString()}</span>
                                                                                </div>
                                                                                {p.description && <p className="text-xs text-slate-300 italic">"{p.description}"</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* BULK UPLOAD */}
            {activeSubTab === 'bulk' && (
                <div className="glass p-8 rounded-2xl max-w-lg">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Upload className="text-indigo-400" /> Bulk Fee Upload
                    </h3>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors mb-4">
                        <Upload className="mx-auto text-slate-500 mb-3" size={32} />
                        <p className="text-slate-400 text-sm mb-3">Upload .xlsx / .xls file</p>
                        <label className="cursor-pointer bg-slate-800 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition-all text-sm">
                            {file ? file.name : 'Select File'}
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        </label>
                    </div>
                    <div className="glass p-4 rounded-xl text-xs text-slate-400 mb-6 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white mb-1">Required Columns:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>student name</li>
                                <li>enrollment no.</li>
                                <li>total fees</li>
                                <li>paid fees</li>
                            </ul>
                        </div>
                        <button
                            onClick={handleDownloadTemplate}
                            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-3 py-2 rounded-lg transition-colors border border-indigo-500/30 flex items-center gap-2"
                        >
                            <Download size={16} /> Download Template
                        </button>
                    </div>
                    <button onClick={handleBulkUpload} disabled={!file || uploadLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-white">
                        {uploadLoading ? <Loader2 className="animate-spin" size={18} /> : 'Upload Fees'}
                    </button>
                    {uploadMsg && (
                        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${uploadMsg.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {uploadMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {uploadMsg.text}
                        </div>
                    )}
                </div>
            )}

            {/* MANUAL */}
            {activeSubTab === 'manual' && (
                <div className="glass p-8 rounded-2xl max-w-lg text-white">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <PlusCircle className="text-emerald-400" /> Manual Fee Entry
                    </h3>
                    <form onSubmit={handleManualSave} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Student</label>
                            <select required value={manualForm.studentId}
                                onChange={e => {
                                    const existing = fees.find(f => f.studentId === e.target.value);
                                    setManualForm({
                                        ...manualForm,
                                        studentId: e.target.value,
                                        totalFees: existing ? existing.totalFees : ''
                                    });
                                }}
                                className="input-field w-full">
                                <option value="">Select Student...</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.enrollmentNo})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Total Total Fees (₹)</label>
                            <input required type="number" min="0" value={manualForm.totalFees}
                                onChange={e => setManualForm({ ...manualForm, totalFees: e.target.value })}
                                className="input-field w-full" placeholder="Total college fees" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Payment Amount (₹)</label>
                                <input required type="number" min="0" value={manualForm.paymentAmount}
                                    onChange={e => setManualForm({ ...manualForm, paymentAmount: e.target.value })}
                                    className="input-field w-full" placeholder="e.g. 20000" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Description</label>
                                <input type="text" value={manualForm.description}
                                    onChange={e => setManualForm({ ...manualForm, description: e.target.value })}
                                    className="input-field w-full" placeholder="1st Payment, Sem 1, etc." />
                            </div>
                        </div>
                        {manualForm.studentId && (
                            <div className="glass p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Current Paid:</span>
                                    <span className="text-emerald-400 font-bold">₹{(fees.find(f => f.studentId === manualForm.studentId)?.paidFees || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-1 border-t border-slate-700/50">
                                    <span className="text-slate-300 font-medium">New Remaining:</span>
                                    {(() => {
                                        const currentFee = fees.find(f => f.studentId === manualForm.studentId);
                                        const total = Number(manualForm.totalFees || 0);
                                        const paidAlready = currentFee ? currentFee.paidFees : 0;
                                        const newPaid = Number(manualForm.paymentAmount || 0);
                                        const remaining = total - (paidAlready + newPaid);
                                        return (
                                            <span className={`font-bold ${remaining <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                ₹{Math.max(0, remaining).toLocaleString()}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Process Fee Payment'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
// ─── EXAM TAB ────────────────────────────────────────────────────────────────

const ExamTab = ({ section }) => {
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const subjects = (section?.subjects || []).map(s => s.name);

    const emptyRow = () => ({ subject: '', date: '', startTime: '', endTime: '' });
    const [meta, setMeta] = useState({ examName: '', fromDate: '', toDate: '' });
    const [rows, setRows] = useState([emptyRow()]);

    useEffect(() => { fetchExams(); }, []);

    const fetchExams = async () => {
        setLoadingExams(true);
        try {
            const res = await axios.get(`${API}/exams`, authHeaders());
            setExams(res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingExams(false); }
    };

    const usedSubjects = rows.map(r => r.subject).filter(Boolean);
    const availableFor = (rowIdx) => subjects.filter(s => !usedSubjects.includes(s) || rows[rowIdx].subject === s);
    const allScheduled = subjects.length > 0 && subjects.every(s => usedSubjects.includes(s));
    const rowIsComplete = (row) => row.subject && row.date && row.startTime && row.endTime;

    const updateRow = (idx, field, value) => {
        const updated = rows.map((r, i) => i === idx ? { ...r, [field]: value } : r);
        // Auto-add next row when this row is complete and all subjects not yet covered
        if (rowIsComplete({ ...rows[idx], [field]: value }) && idx === updated.length - 1) {
            const newUsed = updated.map(r => r.subject).filter(Boolean);
            const allDone = subjects.every(s => newUsed.includes(s));
            if (!allDone) updated.push(emptyRow());
        }
        setRows(updated);
    };

    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx));

    const handleCreate = async () => {
        if (!meta.examName || !meta.fromDate || !meta.toDate) return alert('Fill exam name and dates');
        const validRows = rows.filter(rowIsComplete);
        if (validRows.length === 0) return alert('Add at least one subject schedule');
        setSaving(true);
        try {
            await axios.post(`${API}/exams`, { ...meta, schedule: validRows }, authHeaders());
            setMeta({ examName: '', fromDate: '', toDate: '' });
            setRows([emptyRow()]);
            setCreating(false);
            fetchExams();
            alert('Exam scheduled successfully. Notifications have been sent!');
        } catch (e) { alert('Error creating exam'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <CalendarDays className="text-amber-400" /> Exam Schedules
                </h3>
                {!creating && (
                    <button onClick={() => setCreating(true)}
                        className="btn-primary flex items-center gap-2 text-sm">
                        <PlusCircle size={16} /> Create Exam
                    </button>
                )}
            </div>

            {/* CREATE FORM */}
            {creating && (
                <div className="glass p-6 rounded-2xl space-y-6 border border-amber-500/20">
                    <h4 className="text-lg font-semibold text-amber-400">New Exam Schedule</h4>

                    {/* Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Exam Name</label>
                            <input value={meta.examName} onChange={e => setMeta({ ...meta, examName: e.target.value })}
                                className="input-field w-full" placeholder="e.g. Mid Semester Exam" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">From Date</label>
                            <input type="date" value={meta.fromDate} onChange={e => setMeta({ ...meta, fromDate: e.target.value })}
                                className="input-field w-full" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">To Date</label>
                            <input type="date" value={meta.toDate} onChange={e => setMeta({ ...meta, toDate: e.target.value })}
                                className="input-field w-full" />
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div>
                        <p className="text-sm text-slate-400 mb-3">
                            Schedule one subject per row. Next row appears automatically. All {subjects.length} subjects must be scheduled.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-800/50 text-slate-300 text-xs uppercase">
                                        <th className="px-3 py-3 text-left">Subject</th>
                                        <th className="px-3 py-3 text-left">Date</th>
                                        <th className="px-3 py-3 text-left">Start Time</th>
                                        <th className="px-3 py-3 text-left">End Time</th>
                                        <th className="px-3 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className={`${rowIsComplete(row) ? 'bg-emerald-500/5' : ''}`}>
                                            <td className="px-3 py-2">
                                                <select value={row.subject} onChange={e => updateRow(idx, 'subject', e.target.value)}
                                                    className="input-field text-sm py-1.5 min-w-[150px]">
                                                    <option value="">Select Subject</option>
                                                    {availableFor(idx).map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="date" value={row.date} onChange={e => updateRow(idx, 'date', e.target.value)}
                                                    className="input-field text-sm py-1.5" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="time" value={row.startTime} onChange={e => updateRow(idx, 'startTime', e.target.value)}
                                                    className="input-field text-sm py-1.5" />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input type="time" value={row.endTime} onChange={e => updateRow(idx, 'endTime', e.target.value)}
                                                    className="input-field text-sm py-1.5" />
                                            </td>
                                            <td className="px-3 py-2">
                                                {rows.length > 1 && (
                                                    <button onClick={() => removeRow(idx)} className="p-1 text-rose-500 hover:bg-rose-500/20 rounded">
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {allScheduled && (
                            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                                <CheckCircle size={16} /> All subjects scheduled!
                            </div>
                        )}
                        {subjects.length === 0 && (
                            <p className="text-amber-400 text-sm mt-2 flex items-center gap-2">
                                <AlertCircle size={15} /> No subjects assigned to your section yet.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleCreate} disabled={saving}
                            className="btn-primary flex items-center gap-2 text-sm">
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <><PlusCircle size={16} /> Add Exam</>}
                        </button>
                        <button onClick={() => setCreating(false)}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-sm transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* EXAM LIST */}
            {loadingExams ? <Loader2 className="animate-spin text-amber-400 mx-auto" /> : (
                <div className="space-y-4">
                    {exams.length === 0 && !creating && (
                        <div className="glass p-8 text-center text-slate-500 rounded-2xl italic">No exams created yet.</div>
                    )}
                    {exams.map(exam => (
                        <div key={exam._id} className={`glass p-6 rounded-2xl border ${exam.isLive ? 'border-emerald-500/40' : 'border-slate-700/50'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-white">{exam.examName}</h4>
                                        {exam.isLive && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                                                <Radio size={11} /> LIVE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {exam.fromDate} → {exam.toDate} · Section {exam.section} · {exam.dept}
                                    </p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase">
                                            <th className="px-4 py-2 text-left">Subject</th>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2 text-left">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {exam.schedule.map((s, i) => (
                                            <tr key={i} className="hover:bg-slate-800/30">
                                                <td className="px-4 py-2 font-medium text-slate-200">{s.subject}</td>
                                                <td className="px-4 py-2 text-slate-400">{s.date}</td>
                                                <td className="px-4 py-2 text-slate-400">{s.startTime} – {s.endTime}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

const OverviewTab = ({ section, students }) => {
    const [expandedStudent, setExpandedStudent] = useState(null);

    const stats = [
        { label: 'Section', value: section?.name, icon: BookOpen, color: 'indigo' },
        { label: 'Department', value: section?.dept, icon: GraduationCap, color: 'emerald' },
        { label: 'Total Students', value: students.length, icon: Users, color: 'amber' },
        { label: 'Subjects', value: section?.subjects?.length || 0, icon: CheckCircle, color: 'rose' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className={`glass p-6 rounded-2xl border-l-4 border-${stat.color}-500 flex items-center justify-between`}>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 bg-${stat.color}-500/10 rounded-xl text-${stat.color}-400`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students by Batch Pie Chart */}
                <div className="glass p-6 rounded-2xl h-[350px] flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-white mb-4 w-full flex items-center gap-2">
                        <GraduationCap className="text-amber-400" size={20} />
                        Students by Batch
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {(() => {
                            const batches = {};
                            students.forEach(s => {
                                const year = s.passoutYear ? s.passoutYear.toString() : 'Unknown';
                                batches[year] = (batches[year] || 0) + 1;
                            });
                            const batchData = Object.entries(batches).map(([name, value]) => ({ name, value }));

                            if (batchData.length === 0) return <p className="text-slate-500 italic text-center text-sm py-4">No batch data available</p>;

                            const COLORS = ['#FBBF24', '#34D399', '#818CF8', '#F87171', '#A78BFA'];

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={batchData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {batchData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                                            itemStyle={{ color: '#E2E8F0' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </div>

                {/* Subject Assignment Status Pie Chart */}
                <div className="glass p-6 rounded-2xl h-[350px] flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-white mb-4 w-full flex items-center gap-2">
                        <BookOpen className="text-emerald-400" size={20} />
                        Subject Assignment Status
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {(() => {
                            const subjects = section?.subjects || [];
                            if (subjects.length === 0) return <p className="text-slate-500 italic text-center text-sm py-4 flex-1 flex items-center justify-center">No subjects assigned yet.</p>;

                            const assigned = subjects.filter(s => s.teacher).length;
                            const unassigned = subjects.length - assigned;
                            const statusData = [
                                { name: 'Assigned', value: assigned, color: '#10B981' }, // emerald-500
                                { name: 'Unassigned', value: unassigned, color: '#F43F5E' } // rose-500
                            ].filter(d => d.value > 0);

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                                            itemStyle={{ color: '#E2E8F0' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Students */}
                <div className="lg:col-span-2 glass p-6 rounded-2xl">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Users className="text-indigo-400" /> Students — Section {section?.name}
                        <span className="ml-auto text-sm font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                            {students.length} enrolled
                        </span>
                    </h2>
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {students.length === 0
                            ? <p className="text-slate-500 italic text-center py-8">No students found.</p>
                            : students.map((student, index) => (
                                <div key={student._id} className="border border-slate-700/50 rounded-xl overflow-hidden">
                                    <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
                                        onClick={() => setExpandedStudent(expandedStudent === student._id ? null : student._id)}>
                                        <div className="w-9 h-9 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-200 truncate">{student.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                                        </div>
                                        {student.enrollmentNo && (
                                            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                                                {student.enrollmentNo}
                                            </span>
                                        )}
                                        {expandedStudent === student._id ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                                    </button>
                                    {expandedStudent === student._id && (
                                        <div className="px-4 py-3 bg-slate-800/40 border-t border-slate-700/50 grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-slate-300"><Phone size={14} className="text-slate-500" /><span>{student.mobNo || '—'}</span></div>
                                            <div className="flex items-center gap-2 text-slate-300"><Hash size={14} className="text-slate-500" /><span>Sr. {student.srNo || '—'}</span></div>
                                            <div className="flex items-center gap-2 text-slate-300"><GraduationCap size={14} className="text-slate-500" /><span>{student.startingYear} – {student.passoutYear}</span></div>
                                            <div className="flex items-center gap-2 text-slate-300"><Mail size={14} className="text-slate-500" /><span className="truncate">{student.email}</span></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Subjects */}
                <div className="glass p-6 rounded-2xl">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <BookOpen className="text-emerald-400" /> Subjects & Teachers
                    </h2>
                    <div className="space-y-4">
                        {!section?.subjects || section.subjects.length === 0
                            ? <p className="text-slate-500 italic text-center py-8">No subjects assigned yet.</p>
                            : section.subjects.map((sub, i) => (
                                <div key={i} className="border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <BookOpen size={15} className="text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-200 text-sm">{sub.name}</p>
                                            {sub.teacher ? (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                        {sub.teacher.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-300">{sub.teacher.name}</p>
                                                        <p className="text-[10px] text-slate-500">{sub.teacher.email}</p>
                                                    </div>
                                                </div>
                                            ) : <p className="mt-1 text-xs text-slate-500 italic">No teacher assigned</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── ATTENDANCE TAB ──────────────────────────────────────────────────────────

const AttendanceTab = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(''); // New state for date filtering

    useEffect(() => { fetchAttendance(); }, [selectedDate]); // Re-fetch when date changes

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const url = selectedDate ? `${API}/attendance?date=${selectedDate}` : `${API}/attendance`;
            const res = await axios.get(url, authHeaders());
            setAttendance(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="text-indigo-400" /> {selectedDate ? `Daily Attendance: ${selectedDate}` : 'Section Attendance Summary'}
                </h3>
                <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">View Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate('')}
                            className="text-xs text-slate-500 hover:text-white"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {loading ? <Loader2 className="animate-spin text-indigo-400 mx-auto" /> : (
                <div className="glass rounded-2xl overflow-hidden border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-300 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Enrollment</th>
                                    {selectedDate ? (
                                        <>
                                            <th className="px-6 py-4">Subject</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4">Subject Wise Stats</th>
                                            <th className="px-6 py-4 text-center">Aggregate</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {attendance.length === 0 ? (
                                    <tr><td colSpan={4} className="py-10 text-center text-slate-500 italic">No attendance records found.</td></tr>
                                ) : selectedDate ? (
                                    // Daily View
                                    attendance.map((rec, i) => (
                                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{rec.studentName}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">{rec.enrollmentNo}</td>
                                            <td className="px-6 py-4 text-slate-300">{rec.subjectName}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    }`}>
                                                    {rec.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Aggregate View
                                    attendance.map((at, i) => {
                                        const totalPresent = Object.values(at.subjects).reduce((acc, s) => acc + s.present, 0);
                                        const totalClasses = Object.values(at.subjects).reduce((acc, s) => acc + s.total, 0);
                                        const aggregate = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-200">{at.name}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{at.enrollmentNo}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(at.subjects).map(([sub, s], idx) => {
                                                            const p = ((s.present / s.total) * 100).toFixed(0);
                                                            return (
                                                                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1 flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{sub}</span>
                                                                    <span className={`text-[10px] font-bold ${Number(p) < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{p}%</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-2">
                                                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full ${Number(aggregate) < 75 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${aggregate}%` }}></div>
                                                        </div>
                                                        <span className={`text-xs font-bold ${Number(aggregate) < 75 ? 'text-rose-400' : 'text-indigo-400'}`}>{aggregate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── MARKS TAB ───────────────────────────────────────────────────────────────

const MarksTab = () => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]); // To populate dropdown
    const [selectedExamId, setSelectedExamId] = useState('');

    useEffect(() => {
        fetchExams();
        fetchMarks();
    }, [selectedExamId]);

    const fetchExams = async () => {
        try {
            const res = await axios.get(`${API}/exams`, authHeaders());
            setExams(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const url = selectedExamId ? `${API}/marks?examId=${selectedExamId}` : `${API}/marks`;
            const res = await axios.get(url, authHeaders());
            setMarks(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" /> Student Examination Marks
                </h3>
                <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Filter Exam:</label>
                    <select
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 min-w-[200px]"
                    >
                        <option value="">All Exams</option>
                        {exams.map(ex => (
                            <option key={ex._id} value={ex._id}>
                                {ex.examName} ({ex.fromDate})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? <Loader2 className="animate-spin text-emerald-400 mx-auto" /> : (
                <div className="glass rounded-2xl overflow-hidden border border-slate-700/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-800/50 text-slate-300 text-xs uppercase font-bold">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Exam</th>
                                    <th className="px-6 py-2">Subject</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-center">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {marks.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-slate-500 italic">No marks found for this criteria.</td></tr>
                                ) : marks.map((m, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-200">{m.studentName}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{m.enrollmentNo}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-indigo-400">{m.examName}</p>
                                            {/* Showing exam specific date if available might be nice, but examName is usually enough */}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">{m.subjectName}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-200">{m.marks} / {m.outOf}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                                {((m.marks / m.outOf) * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── COMPLAINTS TAB ──────────────────────────────────────────────────────────

const ComplaintsTab = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/complaints`, authHeaders());
            setComplaints(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleResolve = async (id) => {
        if (!comment.trim()) return alert('Please enter a resolution comment');
        try {
            await axios.patch(`${API}/complaints/${id}/resolve`, { faComment: comment }, authHeaders());
            setResolvingId(null);
            setComment('');
            fetchComplaints();
        } catch (e) { alert('Error resolving complaint'); }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="text-rose-400" /> Student Complaints
            </h3>

            {loading ? <Loader2 className="animate-spin text-rose-400 mx-auto" /> : (
                <div className="grid grid-cols-1 gap-4">
                    {complaints.length === 0 ? (
                        <div className="glass p-12 text-center text-slate-500 rounded-2xl italic">No complaints reported yet.</div>
                    ) : complaints.map(c => (
                        <div key={c._id} className={`glass p-6 rounded-2xl border ${c.status === 'resolved' ? 'border-emerald-500/20 opacity-80' : 'border-rose-500/20'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-200">{c.category}</p>
                                        <p className="text-xs text-slate-500 font-medium">Raised by {c.studentId?.name} ({c.studentId?.enrollmentNo})</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                        }`}>
                                        {c.status}
                                    </span>
                                    <p className="text-xs text-slate-500 font-mono">{new Date(c.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30 mb-4">
                                <p className="text-slate-300 text-sm leading-relaxed">"{c.description}"</p>
                            </div>

                            {c.status === 'pending' ? (
                                <div>
                                    {resolvingId === c._id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                placeholder="Enter resolution details or feedback..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleResolve(c._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">Submit Resolution</button>
                                                <button onClick={() => setResolvingId(null)} className="text-slate-400 hover:text-white text-xs px-4 py-2">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setResolvingId(c._id)} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-2">
                                            <CheckCircle size={14} /> Mark as Resolved
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <CheckCircle size={12} /> Resolution Feedback
                                    </p>
                                    <p className="text-emerald-200/60 text-xs italic">"{c.faComment}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────


const FADashboard = () => {
    const [section, setSection] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const user = JSON.parse(localStorage.getItem('user') || '{ }');
    const navigate = useNavigate();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'attendance', label: 'Attendance', icon: BookOpen },
        { id: 'marks', label: 'Marks', icon: TrendingUp },
        { id: 'fees', label: 'Fees', icon: CreditCard },
        { id: 'exam', label: 'Exam', icon: CalendarDays },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    ];

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sectionRes, studentsRes] = await Promise.all([
                axios.get(`${API}/section`, authHeaders()),
                axios.get(`${API}/students`, authHeaders())
            ]);
            setSection(sectionRes.data);
            setStudents(studentsRes.data.students);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
        );
    }

    if (!section) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass p-12 rounded-2xl text-center max-w-md">
                    <CheckCircle className="mx-auto text-amber-400 mb-4" size={48} />
                    <h2 className="text-2xl font-bold mb-2">No Section Assigned</h2>
                    <p className="text-slate-400">You have not been assigned as Faculty Advisor to any section yet. Please contact your HOD.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-60 shrink-0 p-6 border-r border-slate-800 flex flex-col gap-2">
                <div className="mb-8">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl mb-3">
                        {user.name?.charAt(0)}
                    </div>
                    <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500">Faculty Advisor</p>
                    <p className="text-xs text-indigo-400 mt-1 font-medium">{section.dept} — Sec {section.name}</p>
                </div>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <tab.icon size={18} />
                        <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                ))}
                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-semibold group"
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm">Faculty Advisor · {section.dept} / Section {section.name}</p>
                    </div>
                    <NotificationBell />
                </div>

                {activeTab === 'overview' && <OverviewTab section={section} students={students} />}
                {activeTab === 'announcements' && (
                    <div className="space-y-8 py-4">
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                            <div className="xl:col-span-3">
                                <AnnouncementsChat key={loading} />
                            </div>
                            <div className="xl:col-span-2">
                                <AnnouncementForm onFinish={fetchData} />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'attendance' && <AttendanceTab />}
                {activeTab === 'marks' && <MarksTab />}
                {activeTab === 'fees' && <FeesTab section={section} students={students} />}
                {activeTab === 'exam' && <ExamTab section={section} />}
                {activeTab === 'complaints' && <ComplaintsTab />}
            </main>
        </div>
    );
};

export default FADashboard;
