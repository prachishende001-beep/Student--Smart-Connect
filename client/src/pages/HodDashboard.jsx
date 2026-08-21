import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, BookOpen, GraduationCap, CheckCircle, Loader2,
    LayoutDashboard, TrendingUp, UserCheck, Calendar,
    ChevronDown, ChevronUp, Mail, Phone, Hash, Search, Filter, LogOut, Megaphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import DataList from '../components/DataList';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementsChat from '../components/AnnouncementsChat';
import NotificationBell from '../components/NotificationBell';

const API = 'http://localhost:5000/api/hod';
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${token()}` } });

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

const OverviewTab = ({ stats, sections, attendance, marks }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'indigo' },
                    { label: 'Total Teachers', value: stats.teachers, icon: Users, color: 'emerald' },
                    { label: 'Active Sections', value: stats.sections, icon: BookOpen, color: 'amber' },
                    { label: 'Faculty Advisors', value: stats.fas, icon: UserCheck, color: 'rose' },
                ].map((stat, i) => (
                    <div key={i} className={`glass p-6 rounded-2xl border-l-4 border-${stat.color}-500 flex items-center justify-between`}>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 bg-${stat.color}-500/10 rounded-xl text-${stat.color}-400`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Overview Chart */}
                <div className="glass p-6 rounded-2xl h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 shrink-0">
                        <Calendar className="text-indigo-400" /> Section Attendance Overview
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {(() => {
                            const attData = Object.entries(attendance).map(([sec, data]) => ({
                                name: `Sec ${sec}`,
                                percent: Number(((data.present / data.total) * 100).toFixed(1))
                            }));

                            if (attData.length === 0) {
                                return <p className="text-slate-500 italic text-center py-4 flex-1 flex items-center justify-center">No attendance data yet.</p>;
                            }

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip 
                                            cursor={{ fill: '#334155', opacity: 0.4 }}
                                            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                                            formatter={(val) => [`${val}%`, 'Attendance']}
                                        />
                                        <Bar dataKey="percent" fill="#818CF8" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                            {attData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.percent < 75 ? '#F87171' : '#818CF8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </div>

                {/* Performance Overview Chart */}
                <div className="glass p-6 rounded-2xl h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 shrink-0">
                        <TrendingUp className="text-emerald-400" /> Section Performance (Marks)
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {(() => {
                            const markData = marks.slice(0, 10).map((m) => ({
                                name: `Sec ${m.section} - ${m.examName}`,
                                percent: Number(((m.totalMarks / m.outOf) * 100).toFixed(1))
                            }));

                            if (markData.length === 0) {
                                return <p className="text-slate-500 italic text-center py-4 flex-1 flex items-center justify-center">No marks data yet.</p>;
                            }

                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={markData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#94A3B8" 
                                            fontSize={11} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            angle={-30} 
                                            textAnchor="end"
                                            height={40}
                                        />
                                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip 
                                            cursor={{ fill: '#334155', opacity: 0.4 }}
                                            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                                            formatter={(val) => [`${val}%`, 'Avg. Score']}
                                        />
                                        <Bar dataKey="percent" fill="#34D399" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── MANAGEMENT TAB ──────────────────────────────────────────────────────────

const ManagementTab = ({ uniqueStudentSections, teachers, subjects, onRefresh }) => {
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedSectionFA, setSelectedSectionFA] = useState('');
    const [selectedTeacherFA, setSelectedTeacherFA] = useState('');
    const [selectedSectionSub, setSelectedSectionSub] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [selectedTeacherSub, setSelectedTeacherSub] = useState('');

    const handleAssignFA = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await axios.post(`${API}/assign-fa`, {
                sectionName: selectedSectionFA,
                teacherId: selectedTeacherFA
            }, authHeaders());
            onRefresh();
            setSelectedSectionFA('');
            setSelectedTeacherFA('');
            alert('Faculty Advisor assigned successfully!');
        } catch (error) {
            alert('Failed to assign FA.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignSubject = async (e) => {
        e.preventDefault();
        if (!subjectName.trim()) return alert('Subject name is required');
        setActionLoading(true);
        try {
            await axios.post(`${API}/assign-subject`, {
                sectionName: selectedSectionSub,
                subjectName,
                teacherId: selectedTeacherSub
            }, authHeaders());
            onRefresh();
            setSelectedSectionSub('');
            setSubjectName('');
            setSelectedTeacherSub('');
            alert('Subject Teacher assigned successfully!');
        } catch (error) {
            alert('Failed to assign Subject Teacher.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-2xl h-fit">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <UserCheck className="text-indigo-400" /> Allot Faculty Advisor
                </h2>
                <form onSubmit={handleAssignFA} className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-slate-400">Section</label>
                        <select required value={selectedSectionFA} onChange={(e) => setSelectedSectionFA(e.target.value)} className="input-field">
                            <option value="">Select Section...</option>
                            {uniqueStudentSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-slate-400">Teacher (FA)</label>
                        <select required value={selectedTeacherFA} onChange={(e) => setSelectedTeacherFA(e.target.value)} className="input-field">
                            <option value="">Select Teacher...</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={actionLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {actionLoading ? <Loader2 className="animate-spin" /> : 'Assign Faculty Advisor'}
                    </button>
                </form>
            </div>

            <div className="glass p-6 rounded-2xl h-fit">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <BookOpen className="text-emerald-400" /> Assign Subject Teacher
                </h2>
                <form onSubmit={handleAssignSubject} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm text-slate-400">Section</label>
                            <select required value={selectedSectionSub} onChange={(e) => setSelectedSectionSub(e.target.value)} className="input-field">
                                <option value="">Select Section...</option>
                                {uniqueStudentSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm text-slate-400">Subject</label>
                            <select required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="input-field">
                                <option value="">Select Subject...</option>
                                {subjects.map(sub => <option key={sub._id} value={sub.name}>{sub.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-slate-400">Teacher</label>
                        <select required value={selectedTeacherSub} onChange={(e) => setSelectedTeacherSub(e.target.value)} className="input-field">
                            <option value="">Select Teacher...</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={actionLoading} className="btn-primary w-full bg-emerald-600 hover:bg-emerald-500 border-none flex items-center justify-center gap-2">
                        {actionLoading ? <Loader2 className="animate-spin" /> : 'Assign Subject Teacher'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── SECTIONS TAB ────────────────────────────────────────────────────────────

const SectionsTab = ({ sections, uniqueStudentSections }) => {
    return (
        <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BookOpen className="text-amber-400" /> Sections Repository
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                            <th className="pb-4 font-bold">Section</th>
                            <th className="pb-4 font-bold">Faculty Advisor</th>
                            <th className="pb-4 font-bold">Subject Teachers</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {uniqueStudentSections.map((sec, i) => {
                            const sectionData = sections.find(s => s.name === sec);
                            return (
                                <tr key={i} className="text-sm hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4">
                                        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-xs font-black border border-amber-500/20">
                                            SEC {sec}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        {sectionData?.fa ? (
                                            <div>
                                                <p className="font-bold text-slate-200">{sectionData.fa.name}</p>
                                                <p className="text-[10px] text-slate-500">{sectionData.fa.email}</p>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 italic text-xs">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        {sectionData?.subjects && sectionData.subjects.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {sectionData.subjects.map((sub, idx) => (
                                                    <div key={idx} className="bg-slate-800/50 border border-slate-700/50 px-2 py-1 rounded-lg text-[10px]">
                                                        <span className="font-bold text-emerald-400 uppercase">{sub.name}</span>
                                                        <span className="text-slate-400 ml-1">· {sub.teacher?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 italic text-xs">No assignments</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── ATTENDANCE TAB ──────────────────────────────────────────────────────────

const AttendanceTab = ({ attendance }) => {
    return (
        <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="text-indigo-400" /> Department Attendance Dashboard
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                            <th className="pb-4 font-bold">Section</th>
                            <th className="pb-4 font-bold">Total Records</th>
                            <th className="pb-4 font-bold">Average Attendance</th>
                            <th className="px-6 pb-4 font-bold">Relative Performance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {Object.entries(attendance).map(([sec, data], i) => {
                            const percent = ((data.present / data.total) * 100).toFixed(1);
                            return (
                                <tr key={i} className="text-sm">
                                    <td className="py-4">
                                        <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg font-black text-xs w-max">
                                            SECTION {sec}
                                        </div>
                                    </td>
                                    <td className="py-4 text-slate-400 font-mono">{data.total} Check-ins</td>
                                    <td className="py-4">
                                        <span className={`font-black text-lg ${Number(percent) < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {percent}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${Number(percent) < 75 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }}></div>
                                        </div>
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

// ─── MARKS TAB ───────────────────────────────────────────────────────────────

const MarksTab = ({ marks }) => {
    return (
        <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" /> Department Academic Performance
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                            <th className="pb-4 font-bold">Exam Name</th>
                            <th className="pb-4 font-bold">Section</th>
                            <th className="pb-4 font-bold text-center">Avg. Score</th>
                            <th className="pb-4 font-bold text-center">Student Participation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {marks.map((m, i) => {
                            const percent = ((m.totalMarks / m.outOf) * 100).toFixed(1);
                            return (
                                <tr key={i} className="text-sm hover:bg-slate-800/10 transition-colors">
                                    <td className="py-4 font-bold text-slate-200">{m.examName}</td>
                                    <td className="py-4">
                                        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-bold">SEC {m.section}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="text-emerald-400 font-black text-lg">{percent}%</span>
                                    </td>
                                    <td className="py-4 text-center text-slate-500 font-mono">
                                        {m.count} Students
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

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

const HodDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        students: [],
        teachers: [],
        sections: [],
        subjects: [],
        attendance: {},
        marks: []
    });
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const uniqueStudentSections = [...new Set(data.students.map(s => s.sec))].sort();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'management', label: 'Assignments', icon: UserCheck },
        { id: 'sections', label: 'Sections', icon: BookOpen },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'marks', label: 'Marks', icon: TrendingUp },
        { id: 'students', label: 'Students', icon: GraduationCap },
    ];

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [students, teachers, sections, subjects, attendance, marks] = await Promise.all([
                axios.get(`${API}/students`, authHeaders()),
                axios.get(`${API}/teachers`, authHeaders()),
                axios.get(`${API}/sections`, authHeaders()),
                axios.get(`${API}/subjects`, authHeaders()),
                axios.get(`${API}/attendance`, authHeaders()),
                axios.get(`${API}/marks`, authHeaders())
            ]);
            setData({
                students: students.data,
                teachers: teachers.data,
                sections: sections.data,
                subjects: subjects.data,
                attendance: attendance.data,
                marks: marks.data
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
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

    const stats = {
        students: data.students.length,
        teachers: data.teachers.length,
        sections: uniqueStudentSections.length,
        fas: data.sections.filter(s => s.fa).length
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 p-6 border-r border-slate-800 flex flex-col gap-2 bg-slate-900/50">
                <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-indigo-500/20">
                        {user.dept?.charAt(0)}
                    </div>
                    <p className="font-bold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-widest font-black text-indigo-400 mt-1">{user.dept} HOD</p>
                </div>

                <nav className="flex-1 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            <span className="font-bold text-sm">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <div className="glass p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Academic Session</p>
                        <p className="text-xs font-bold text-slate-300 italic">2025-2026</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold group"
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-tighter font-medium">Departmental Administration · {user.dept}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="flex gap-2">
                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700">
                                <Search size={18} />
                            </button>
                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {activeTab === 'overview' && <OverviewTab stats={stats} sections={data.sections} attendance={data.attendance} marks={data.marks} />}
                    {activeTab === 'announcements' && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                                <div className="xl:col-span-3">
                                    <AnnouncementsChat key={loading} />
                                </div>
                                <div className="xl:col-span-2">
                                    <AnnouncementForm onFinish={fetchAllData} />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'management' && <ManagementTab uniqueStudentSections={uniqueStudentSections} teachers={data.teachers} subjects={data.subjects} onRefresh={fetchAllData} />}
                    {activeTab === 'sections' && <SectionsTab sections={data.sections} uniqueStudentSections={uniqueStudentSections} />}
                    {activeTab === 'attendance' && <AttendanceTab attendance={data.attendance} />}
                    {activeTab === 'marks' && <MarksTab marks={data.marks} />}
                    {activeTab === 'students' && (
                        <div className="animate-in zoom-in-95 duration-300">
                            <DataList data={data.students} type="students" onRefresh={fetchAllData} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HodDashboard;
