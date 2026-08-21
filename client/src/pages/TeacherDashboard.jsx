import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Users, CalendarCheck, BookMarked,
    Loader2, Upload, CheckCircle, AlertCircle, Trash2,
    ChevronDown, GraduationCap, Download, Calendar, LogOut, Megaphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AnnouncementsChat from '../components/AnnouncementsChat';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:5000/api/teacher';
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const downloadBlob = (data, fileName) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', fileName);
    document.body.appendChild(a); a.click(); a.remove();
};

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
const OverviewTab = ({ assignments, studentMap }) => {
    const uniqueSections = [...new Set(assignments.map(a => `${a.dept}|${a.section}`))];
    const totalStudents = Object.values(studentMap).reduce((s, arr) => s + arr.length, 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: 'Subjects', value: assignments.length, color: 'indigo' },
                    { label: 'Sections', value: uniqueSections.length, color: 'emerald' },
                    { label: 'Students', value: totalStudents, color: 'amber' },
                ].map((s, i) => (
                    <div key={i} className={`glass p-6 rounded-2xl border-l-4 border-${s.color}-500`}>
                        <p className="text-slate-400 text-sm">{s.label}</p>
                        <p className={`text-3xl font-bold text-${s.color}-400 mt-1`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Students per Class Chart */}
            <div className="glass p-6 rounded-2xl h-[350px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 shrink-0">
                    <Users className="text-indigo-400" size={20} />
                    Students per Class
                </h3>
                <div className="flex-1 w-full min-h-0">
                    {(() => {
                        const chartData = assignments.map(a => {
                            const key = `${a.dept}|${a.section}`;
                            const count = (studentMap[key] || []).length;
                            return {
                                name: `${a.dept}-${a.section} (${a.subjectName})`,
                                count
                            };
                        });

                        if (chartData.length === 0) return <p className="text-slate-500 italic text-center py-4 flex-1 flex items-center justify-center">No classes assigned yet.</p>;

                        return (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#94A3B8" 
                                        fontSize={11} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        angle={-15} 
                                        textAnchor="end"
                                        height={40}
                                    />
                                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ fill: '#334155', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                                        formatter={(val) => [val, 'Students']}
                                    />
                                    <Bar dataKey="count" fill="#818CF8" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#818CF8', '#34D399', '#FBBF24', '#F87171'][index % 4]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        );
                    })()}
                </div>
            </div>

            {assignments.map((a, i) => {
                const key = `${a.dept}|${a.section}`;
                const students = studentMap[key] || [];
                return (
                    <div key={i} className="glass p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-500/20">{a.dept} / Sec {a.section}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-sm border border-emerald-500/20">{a.subjectName}</span>
                            <span className="ml-auto text-slate-400 text-sm">{students.length} students</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-slate-800/50 text-slate-300 text-xs uppercase">
                                    <th className="px-4 py-2 text-left">Sr.</th>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Enrollment</th>
                                    <th className="px-4 py-2 text-left">Email</th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {students.map((st, idx) => (
                                        <tr key={st._id} className="hover:bg-slate-800/30">
                                            <td className="px-4 py-2 text-slate-400">{st.srNo || idx + 1}</td>
                                            <td className="px-4 py-2 text-slate-200 font-medium">{st.name}</td>
                                            <td className="px-4 py-2 font-mono text-xs text-slate-400">{st.enrollmentNo || '—'}</td>
                                            <td className="px-4 py-2 text-slate-400 text-xs">{st.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── ATTENDANCE TAB ──────────────────────────────────────────────────────────
const AttendanceTab = ({ assignments, studentMap }) => {
    const [subTab, setSubTab] = useState('manual');
    const [sel, setSel] = useState({ subjectIdx: '', date: today() });
    const [records, setRecords] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [msg, setMsg] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const assignment = sel.subjectIdx !== '' ? assignments[sel.subjectIdx] : null;
    const students = assignment ? (studentMap[`${assignment.dept}|${assignment.section}`] || []) : [];

    const loadExisting = useCallback(async () => {
        if (!assignment || !sel.date) return;
        try {
            const res = await axios.get(`${API}/attendance`, {
                ...authH(),
                params: { date: sel.date, subjectName: assignment.subjectName, section: assignment.section, dept: assignment.dept }
            });
            const map = {};
            res.data.forEach(r => { map[r.enrollmentNo] = r.status; });
            setRecords(students.map(s => ({ studentId: s._id, enrollmentNo: s.enrollmentNo || '', studentName: s.name, status: map[s.enrollmentNo] || 'present' })));
        } catch (e) { setRecords(students.map(s => ({ studentId: s._id, enrollmentNo: s.enrollmentNo || '', studentName: s.name, status: 'present' }))); }
    }, [assignment, sel.date, students]);

    useEffect(() => { loadExisting(); }, [loadExisting]);

    const toggleRow = (idx, status) => setRecords(r => r.map((x, i) => i === idx ? { ...x, status } : x));
    const markAll = (status) => setRecords(r => r.map(x => ({ ...x, status })));

    const handleSave = async () => {
        if (!assignment) return;
        setSaving(true); setMsg(null);
        try {
            await axios.post(`${API}/attendance`, { date: sel.date, subjectName: assignment.subjectName, section: assignment.section, dept: assignment.dept, records }, authH());
            setMsg({ type: 'success', text: 'Attendance saved!' });
        } catch { setMsg({ type: 'error', text: 'Save failed' }); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!assignment || !window.confirm(`Delete all attendance for ${sel.date}?`)) return;
        setDeleting(true);
        try {
            await axios.delete(`${API}/attendance`, { ...authH(), params: { date: sel.date, subjectName: assignment.subjectName, section: assignment.section, dept: assignment.dept } });
            setMsg({ type: 'success', text: 'Attendance deleted' });
            loadExisting();
        } catch { setMsg({ type: 'error', text: 'Delete failed' }); }
        finally { setDeleting(false); }
    };

    const handleDownloadTemplate = async () => {
        if (!assignment) return;
        const res = await axios.get(`${API}/template`, { ...authH(), params: { type: 'attendance', section: assignment.section, dept: assignment.dept }, responseType: 'blob' });
        downloadBlob(res.data, `attendance_template_${assignment.section}.xlsx`);
    };

    const handleBulkUpload = async () => {
        if (!file || !assignment || !sel.date) return;
        setUploadLoading(true); setMsg(null);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('date', sel.date);
        fd.append('subjectName', assignment.subjectName);
        fd.append('section', assignment.section);
        fd.append('dept', assignment.dept);
        try {
            const res = await axios.post(`${API}/attendance/upload`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } });
            setMsg({ type: 'success', text: res.data.message });
            setFile(null); loadExisting();
        } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Upload failed' }); }
        finally { setUploadLoading(false); }
    };

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;

    return (
        <div className="space-y-6">
            {/* Selector bar */}
            <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-end">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Subject / Section</label>
                    <select value={sel.subjectIdx} onChange={e => setSel({ ...sel, subjectIdx: e.target.value })} className="input-field text-sm py-2 min-w-[220px]">
                        <option value="">Select Subject...</option>
                        {assignments.map((a, i) => <option key={i} value={i}>{a.subjectName} — {a.dept} / Sec {a.section}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Date</label>
                    <input type="date" value={sel.date} onChange={e => setSel({ ...sel, date: e.target.value })} className="input-field text-sm py-2" />
                </div>
                <div className="flex gap-2 ml-auto">
                    <button onClick={() => setSubTab('manual')} className={`px-3 py-2 text-sm rounded-lg transition-all ${subTab === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Manual</button>
                    <button onClick={() => setSubTab('bulk')} className={`px-3 py-2 text-sm rounded-lg transition-all ${subTab === 'bulk' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Bulk Upload</button>
                </div>
            </div>

            {msg && (
                <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg.text}
                </div>
            )}

            {/* MANUAL */}
            {subTab === 'manual' && assignment && (
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-3 text-sm">
                            <span className="text-emerald-400 font-medium">✓ {present} Present</span>
                            <span className="text-rose-400 font-medium">✗ {absent} Absent</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => markAll('present')} className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20">All Present</button>
                            <button onClick={() => markAll('absent')} className="px-3 py-1.5 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20">All Absent</button>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                        {records.map((r, idx) => (
                            <div key={idx} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/30">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">{idx + 1}</div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-200 text-sm">{r.studentName}</p>
                                    <p className="text-xs text-slate-500 font-mono">{r.enrollmentNo}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleRow(idx, 'present')}
                                        className={`px-4 py-1.5 text-xs rounded-lg font-semibold border transition-all ${r.status === 'present' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-transparent text-slate-400 border-slate-600 hover:border-emerald-500/50'}`}>
                                        P
                                    </button>
                                    <button onClick={() => toggleRow(idx, 'absent')}
                                        className={`px-4 py-1.5 text-xs rounded-lg font-semibold border transition-all ${r.status === 'absent' ? 'bg-rose-500 text-white border-rose-500' : 'bg-transparent text-slate-400 border-slate-600 hover:border-rose-500/50'}`}>
                                        A
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Save Attendance
                        </button>
                        <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 text-sm bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-all">
                            {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} Delete
                        </button>
                    </div>
                </div>
            )}

            {/* BULK */}
            {subTab === 'bulk' && (
                <div className="glass p-8 rounded-2xl max-w-lg space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Upload className="text-indigo-400" /> Bulk Attendance Upload</h3>
                    {assignment && (
                        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 underline">
                            <Download size={15} /> Download Template (with students pre-filled)
                        </button>
                    )}
                    <div className="glass p-4 rounded-xl text-xs text-slate-400">
                        <p className="font-semibold text-white mb-1">Required Columns:</p>
                        <ul className="list-disc list-inside space-y-1"><li>enrollment no.</li><li>student name</li><li>status (present / absent)</li></ul>
                    </div>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center">
                        <label className="cursor-pointer bg-slate-800 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                            {file ? file.name : 'Select File'}
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        </label>
                    </div>
                    <button onClick={handleBulkUpload} disabled={!file || !assignment || !sel.date || uploadLoading} className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                        {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : 'Upload'}
                    </button>
                </div>
            )}

            {!assignment && <div className="glass p-8 text-center text-slate-500 rounded-2xl italic">Please select a subject and date above.</div>}
        </div>
    );
};

// ─── MARKS TAB ───────────────────────────────────────────────────────────────
const MarksTab = ({ assignments, studentMap }) => {
    const [subTab, setSubTab] = useState('manual');
    const [exams, setExams] = useState([]);
    const [sel, setSel] = useState({ subjectIdx: '', examId: '' });
    const [records, setRecords] = useState([]);
    const [outOf, setOutOf] = useState(100);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API}/exams`, authH()).then(r => setExams(r.data)).catch(() => { });
    }, []);

    const assignment = sel.subjectIdx !== '' ? assignments[sel.subjectIdx] : null;
    const students = assignment ? studentMap[`${assignment.dept}|${assignment.section}`] || [] : [];
    const selectedExam = exams.find(e => e._id === sel.examId);

    const loadExistingMarks = useCallback(async () => {
        if (!assignment || !sel.examId) return;
        try {
            const res = await axios.get(`${API}/marks`, { ...authH(), params: { examId: sel.examId, subjectName: assignment.subjectName, section: assignment.section, dept: assignment.dept } });
            const map = {};
            res.data.forEach(r => { map[r.enrollmentNo] = r.marks; });
            if (res.data[0]?.outOf) setOutOf(res.data[0].outOf);
            setRecords(students.map(s => ({ studentId: s._id, enrollmentNo: s.enrollmentNo || '', studentName: s.name, marks: map[s.enrollmentNo] ?? '' })));
        } catch {
            setRecords(students.map(s => ({ studentId: s._id, enrollmentNo: s.enrollmentNo || '', studentName: s.name, marks: '' })));
        }
    }, [assignment, sel.examId, students]);

    useEffect(() => { loadExistingMarks(); }, [loadExistingMarks]);

    const updateMark = (idx, val) => setRecords(r => r.map((x, i) => i === idx ? { ...x, marks: val } : x));

    const handleSave = async () => {
        if (!assignment || !sel.examId) return;
        setSaving(true); setMsg(null);
        try {
            const filled = records.map(r => ({ ...r, outOf }));
            await axios.post(`${API}/marks`, { examId: sel.examId, examName: selectedExam?.examName, subjectName: assignment.subjectName, section: assignment.section, dept: assignment.dept, records: filled }, authH());
            setMsg({ type: 'success', text: 'Marks saved!' });
        } catch { setMsg({ type: 'error', text: 'Save failed' }); }
        finally { setSaving(false); }
    };

    const handleDownloadTemplate = async () => {
        if (!assignment) return;
        const res = await axios.get(`${API}/template`, { ...authH(), params: { type: 'marks', section: assignment.section, dept: assignment.dept }, responseType: 'blob' });
        downloadBlob(res.data, `marks_template_${assignment.section}.xlsx`);
    };

    const handleBulkUpload = async () => {
        if (!file || !assignment || !sel.examId) return;
        setUploadLoading(true); setMsg(null);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('examId', sel.examId);
        fd.append('examName', selectedExam?.examName || '');
        fd.append('subjectName', assignment.subjectName);
        fd.append('section', assignment.section);
        fd.append('dept', assignment.dept);
        try {
            const res = await axios.post(`${API}/marks/upload`, fd, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } });
            setMsg({ type: 'success', text: res.data.message });
            setFile(null); loadExistingMarks();
        } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Upload failed' }); }
        finally { setUploadLoading(false); }
    };

    return (
        <div className="space-y-6">
            {/* Selector */}
            <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-end">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Subject / Section</label>
                    <select value={sel.subjectIdx} onChange={e => setSel({ ...sel, subjectIdx: e.target.value, examId: '' })} className="input-field text-sm py-2 min-w-[220px]">
                        <option value="">Select Subject...</option>
                        {assignments.map((a, i) => <option key={i} value={i}>{a.subjectName} — {a.dept} / Sec {a.section}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Exam (Completed Only)</label>
                    <select value={sel.examId} onChange={e => setSel({ ...sel, examId: e.target.value })} className="input-field text-sm py-2 min-w-[200px]">
                        <option value="">Select Exam...</option>
                        {exams.map(e => <option key={e._id} value={e._id}>{e.examName} ({e.section})</option>)}
                    </select>
                </div>
                <div className="flex gap-2 ml-auto">
                    <button onClick={() => setSubTab('manual')} className={`px-3 py-2 text-sm rounded-lg transition-all ${subTab === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Manual</button>
                    <button onClick={() => setSubTab('bulk')} className={`px-3 py-2 text-sm rounded-lg transition-all ${subTab === 'bulk' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Bulk Upload</button>
                </div>
            </div>

            {msg && (
                <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg.text}
                </div>
            )}

            {/* MANUAL */}
            {subTab === 'manual' && assignment && sel.examId && (
                <div className="glass p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-slate-400">Out of:</span>
                        <input type="number" value={outOf} onChange={e => setOutOf(e.target.value)} className="input-field text-sm py-1.5 w-24" min="1" />
                        <span className="text-xs text-slate-500 ml-2">Apply same to all students</span>
                    </div>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                        {records.map((r, idx) => (
                            <div key={idx} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/30">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">{idx + 1}</div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-200 text-sm">{r.studentName}</p>
                                    <p className="text-xs text-slate-500 font-mono">{r.enrollmentNo}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" max={outOf} value={r.marks}
                                        onChange={e => updateMark(idx, e.target.value)}
                                        className="input-field text-sm py-1.5 w-20 text-center"
                                        placeholder="Marks" />
                                    <span className="text-slate-500 text-sm">/ {outOf}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm mt-4">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Save Marks
                    </button>
                </div>
            )}

            {/* BULK */}
            {subTab === 'bulk' && (
                <div className="glass p-8 rounded-2xl max-w-lg space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Upload className="text-amber-400" /> Bulk Marks Upload</h3>
                    {assignment && (
                        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 underline">
                            <Download size={15} /> Download Template (with students pre-filled)
                        </button>
                    )}
                    <div className="glass p-4 rounded-xl text-xs text-slate-400">
                        <p className="font-semibold text-white mb-1">Required Columns:</p>
                        <ul className="list-disc list-inside space-y-1"><li>enrollment no.</li><li>student name</li><li>marks</li><li>out of</li></ul>
                    </div>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center">
                        <label className="cursor-pointer bg-slate-800 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                            {file ? file.name : 'Select File'}
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        </label>
                    </div>
                    <button onClick={handleBulkUpload} disabled={!file || !assignment || !sel.examId || uploadLoading} className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                        {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : 'Upload Marks'}
                    </button>
                </div>
            )}

            {(!assignment || !sel.examId) && subTab === 'manual' && (
                <div className="glass p-8 text-center text-slate-500 rounded-2xl italic">
                    {exams.length === 0 ? 'No completed exams found. Exams go to completed state when their end date has passed and they are Live.' : 'Please select a subject and exam above.'}
                </div>
            )}
        </div>
    );
};

// ─── TIMETABLE TAB ───────────────────────────────────────────────────────────
const TimetableTab = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/timetable`, authH())
            .then(r => setExams(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.length === 0 ? (
                    <div className="col-span-full glass p-12 text-center text-slate-500 rounded-2xl italic">
                        No live exams at the moment.
                    </div>
                ) : exams.map(exam => (
                    <div key={exam._id} className="glass p-6 rounded-2xl border border-indigo-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{exam.examName}</h3>
                                <p className="text-xs text-slate-400 mt-1">{exam.dept} · Section {exam.section}</p>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">LIVE</div>
                        </div>
                        <div className="space-y-3">
                            {exam.schedule.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{s.subject}</p>
                                            <p className="text-[10px] text-slate-500">{s.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono text-slate-400">{s.startTime} - {s.endTime}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TeacherDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'marks', label: 'Marks', icon: BookMarked },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
    ];
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };
    useEffect(() => {
        axios.get(`${API}/data`, authH())
            .then(r => setData(r.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

    if (!data || data.assignments.length === 0) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass p-12 rounded-2xl text-center max-w-md">
                <GraduationCap className="mx-auto text-amber-400 mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-2">No Subjects Assigned</h2>
                <p className="text-slate-400">You have not been assigned as a subject teacher to any section yet. Please contact your HOD.</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-60 shrink-0 p-6 border-r border-slate-800 flex flex-col gap-2">
                <div className="mb-8">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl mb-3">{user.name?.charAt(0)}</div>
                    <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500">Teacher</p>
                    <p className="text-xs text-amber-400 mt-1 font-medium">{data.assignments.length} subject{data.assignments.length > 1 ? 's' : ''}</p>
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

            {/* Main */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-indigo-400 bg-clip-text text-transparent">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm">Teacher Dashboard · {user.name}</p>
                    </div>
                    <NotificationBell />
                </div>

                {activeTab === 'overview' && <OverviewTab assignments={data.assignments} studentMap={data.studentMap} />}
                {activeTab === 'announcements' && (
                    <div className="py-4 animate-in zoom-in-95 duration-300">
                        <AnnouncementsChat key={loading} />
                    </div>
                )}
                {activeTab === 'attendance' && <AttendanceTab assignments={data.assignments} studentMap={data.studentMap} />}
                {activeTab === 'marks' && <MarksTab assignments={data.assignments} studentMap={data.studentMap} />}
                {activeTab === 'timetable' && <TimetableTab />}
            </main>
        </div>
    );
};

export default TeacherDashboard;
