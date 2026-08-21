import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelUpload from '../components/ExcelUpload';
import HodAssignment from '../components/HodAssignment';
import NotificationBell from '../components/NotificationBell';
import DataList from '../components/DataList';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementsChat from '../components/AnnouncementsChat';
import { LayoutDashboard, Users, UserCog, GraduationCap, BookOpen, Loader2, Plus, Trash2, LogOut, Upload, Megaphone, X, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PrincipalDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        dept: '',
        sec: '',
        enrollmentNo: '',
        mobNo: '',
        startingYear: '',
        passoutYear: ''
    });
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
    const [showAllotHodModal, setShowAllotHodModal] = useState(false);
    const [showUploadSection, setShowUploadSection] = useState(false);
    const [showTeacherUploadSection, setShowTeacherUploadSection] = useState(false);
    const [showSubjectUploadSection, setShowSubjectUploadSection] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
    const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
    const [selectedSections, setSelectedSections] = useState({}); // { deptName: sectionName }
    const [newTeacher, setNewTeacher] = useState({
        name: '',
        email: '',
        startingYear: ''
    });
    const [newSubject, setNewSubject] = useState({ name: '', dept: '' });
    const navigate = useNavigate();

    const toggleSelectSubject = (id) => {
        setSelectedSubjectIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAllSubjects = () => {
        if (selectedSubjectIds.length === subjects.length) {
            setSelectedSubjectIds([]);
        } else {
            setSelectedSubjectIds(subjects.map(s => s._id));
        }
    };

    const handleBulkDeleteSubjects = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedSubjectIds.length} subjects?`)) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/principal/subjects/bulk', {
                data: { ids: selectedSubjectIds },
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedSubjectIds([]);
            fetchAllData();
            alert('Subjects deleted successfully');
        } catch (error) {
            alert('Error deleting subjects');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'announcements', name: 'Announcements', icon: Megaphone },
        { id: 'students', name: 'Students', icon: GraduationCap },
        { id: 'teachers', name: 'Teachers', icon: Users },
        { id: 'subjects', name: 'Subjects', icon: BookOpen },
        { id: 'allotment', name: 'HOD Allotment', icon: UserCog },
    ];

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [studentsRes, teachersRes, deptsRes, subjectsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/principal/students'),
                axios.get('http://localhost:5000/api/principal/teachers'),
                axios.get('http://localhost:5000/api/principal/departments'),
                axios.get('http://localhost:5000/api/principal/subjects')
            ]);
            setStudents(studentsRes.data);
            setTeachers(teachersRes.data);
            setDepartments(deptsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/principal/add-subject', newSubject);
            setNewSubject({ name: '', dept: '' });
            fetchAllData();
            alert('Subject added successfully');
        } catch (error) {
            alert('Error adding subject: ' + error.response?.data?.message || error.message);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/principal/add-student', newStudent);
            setNewStudent({
                name: '', email: '', dept: '', sec: '',
                enrollmentNo: '', mobNo: '', startingYear: '', passoutYear: ''
            });
            setShowAddStudentModal(false);
            fetchAllData();
            alert('Student added successfully');
        } catch (error) {
            alert('Error adding student: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/principal/add-teacher', newTeacher);
            setNewTeacher({ name: '', email: '', startingYear: '' });
            fetchAllData();
            alert('Teacher added successfully');
        } catch (error) {
            alert('Error adding teacher: ' + error.response?.data?.message || error.message);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };
    const handleDeleteSubject = async (id) => {
        if (!window.confirm('Delete this subject?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/principal/subject/${id}`);
            fetchAllData();
        } catch (error) {
            alert('Error deleting subject');
        }
    };

    return (
        <div className="min-h-screen p-8 ">
            <header className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
                        Principal Dashboard
                    </h1>
                    <p className="text-slate-400 mt-2">Manage college infrastructure and personnel</p>
                </div>
                <div className="flex items-center gap-4">
                    {loading && <Loader2 className="animate-spin text-indigo-400" />}
                    <NotificationBell />
                    <div className="glass px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                            P
                        </div>
                        <div>
                            <p className="text-sm font-medium">Principal Admin</p>
                            <p className="text-xs text-slate-500">Super User</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex gap-8">
                {/* Sidebar Tabs */}
                <div className="w-64 shrink-0 space-y-2">

                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="font-medium">{tab.name}</span>
                        </button>
                    ))}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-semibold group w-full"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>

                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'Total Students', value: students.length, trend: '+12%', color: 'indigo' },
                                { label: 'Total Teachers', value: teachers.length, trend: '+2', color: 'emerald' },
                                { label: 'Departments', value: departments.length, trend: '0', color: 'amber' },
                            ].map((stat, i) => (
                                <div key={i} className="glass p-6 rounded-2xl border-l-4 border-indigo-500">
                                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                    <div className="flex items-end justify-between mt-2">
                                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                                        <span className={`text-xs px-2 py-1 rounded bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Charts Section */}
                            <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                {/* Students by Department Pie Chart */}
                                <div className="glass p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <GraduationCap className="text-indigo-400" size={20} />
                                        Students by Department
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        {(() => {
                                            const deptData = departments.map(d => ({
                                                name: d.name,
                                                value: students.filter(s => s.dept === d.name).length
                                            })).filter(d => d.value > 0);

                                            const COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#60A5FA'];

                                            if (deptData.length === 0) {
                                                return <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No student data available</div>;
                                            }

                                            return (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={deptData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {deptData.map((entry, index) => (
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

                                {/* Teachers by Role Bar Chart */}
                                <div className="glass p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <UserCog className="text-emerald-400" size={20} />
                                        Faculty Distribution
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        {(() => {
                                            const roles = [...new Set(teachers.map(t => t.role || 'teacher'))];
                                            const roleData = roles.map(role => ({
                                                name: role.toUpperCase(),
                                                count: teachers.filter(t => (t.role || 'teacher') === role).length
                                            }));

                                            if (roleData.length === 0) {
                                                return <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No teacher data available</div>;
                                            }

                                            return (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={roleData}
                                                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                                    >
                                                        <XAxis 
                                                            dataKey="name" 
                                                            stroke="#94A3B8" 
                                                            fontSize={11}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={50}
                                                        />
                                                        <YAxis 
                                                            stroke="#94A3B8" 
                                                            fontSize={11}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            allowDecimals={false}
                                                        />
                                                        <Tooltip 
                                                            cursor={{ fill: '#334155', opacity: 0.4 }}
                                                            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                                                            itemStyle={{ color: '#10B981' }}
                                                        />
                                                        <Bar 
                                                            dataKey="count" 
                                                            fill="#10B981" 
                                                            radius={[6, 6, 0, 0]} 
                                                            name="Teachers"
                                                            barSize={40}
                                                        >
                                                            {roleData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#10B981', '#34D399', '#059669', '#047857'][index % 4]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-3 bg-slate-900/60 backdrop-blur-lg border border-slate-700 p-8 rounded-2xl mt-4 shadow-lg">

                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Quick Actions
                                </h3>

                                <p className="text-slate-400 text-sm mb-6 max-w-xl">
                                    Complete the system setup by uploading the initial student and teacher
                                    lists. You can also send announcements and manage HOD allotments.
                                </p>

                                <div className="flex flex-wrap gap-4">

                                    {/* Upload Students */}
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Upload Student List
                                    </button>

                                    {/* Announcement */}
                                    <button
                                        onClick={() => setActiveTab('announcements')}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Send Announcement
                                    </button>

                                    {/* HOD Allotment */}
                                    <button
                                        onClick={() => setActiveTab('allotment')}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Allot HOD
                                    </button>

                                </div>

                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="space-y-8 py-4">
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

                    {activeTab === 'students' && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="glass p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                        <GraduationCap className="text-indigo-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Student Management</h2>
                                        <p className="text-slate-400 text-sm">Manage students by department</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowUploadSection(!showUploadSection)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showUploadSection ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'}`}
                                    >
                                        <Upload size={18} /> {showUploadSection ? 'Hide Upload' : 'Bulk Upload'}
                                    </button>
                                    <button
                                        onClick={() => setShowAddStudentModal(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        <Plus size={18} /> Add Student
                                    </button>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email or enrollment..."
                                        className="input-field w-full pl-10 pr-10 h-11"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={fetchAllData}
                                    className="flex items-center justify-center gap-2 px-4 h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all font-medium"
                                >
                                    <Loader2 className={`${loading ? 'animate-spin' : ''}`} size={18} /> Refresh
                                </button>
                            </div>

                            {/* Bulk Upload Section - Collapsible */}
                            {showUploadSection && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="lg:col-span-2">
                                        <ExcelUpload
                                            type="students"
                                            title="Bulk Upload Students"
                                            endpoint="upload-students"
                                            onUploadSuccess={fetchAllData}
                                        />
                                    </div>
                                    <div className="glass p-6 rounded-2xl border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen size={18} className="text-indigo-400" />
                                            <h3 className="font-semibold text-sm">Required Columns</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['sr.no.', 'name', 'email', 'mob nu.', 'dept', 'sec', 'enrollment no.', 'starting year', 'year of passout'].map((col) => (
                                                <div key={col} className="flex items-center gap-2 text-xs text-slate-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
                                                    <span className="capitalize">{col}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Department-wise Tables */}
                            <div className="space-y-10">
                                {departments.length === 0 ? (
                                    <div className="glass p-12 rounded-2xl text-center border border-slate-700/50">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users size={32} className="text-slate-600" />
                                        </div>
                                        <p className="text-slate-400">No departments found. Please add departments first.</p>
                                    </div>
                                ) : (
                                    departments.map((dept) => {
                                        const deptAllStudents = students.filter(s => s.dept === dept.name);
                                        const currentDeptSection = selectedSections[dept.name] || 'All';
                                        
                                        const deptStudents = deptAllStudents.filter(s =>
                                            (currentDeptSection === 'All' || s.sec === currentDeptSection) &&
                                            (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())))
                                        ).sort((a, b) => {
                                            if (!a.enrollmentNo) return 1;
                                            if (!b.enrollmentNo) return -1;
                                            return a.enrollmentNo.localeCompare(b.enrollmentNo, undefined, { numeric: true, sensitivity: 'base' });
                                        });
                                        const availableSections = ['All', ...new Set(deptAllStudents.map(s => s.sec).filter(Boolean))].sort();

                                        if (searchTerm && deptStudents.length === 0) return null;

                                        return (
                                            <div key={dept.name} className="space-y-4">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                                                        <h3 className="text-xl font-bold text-white tracking-tight">{dept.name} Department</h3>
                                                        <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-700">
                                                            {deptStudents.length} Students
                                                        </span>
                                                    </div>
                                                    
                                                    {availableSections.length > 1 && (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {availableSections.map((section) => (
                                                                <button
                                                                    key={section}
                                                                    onClick={() => setSelectedSections(prev => ({ ...prev, [dept.name]: section }))}
                                                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${currentDeptSection === section
                                                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                                                                        : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'
                                                                        }`}
                                                                >
                                                                    {section === 'All' ? 'All Sec' : `Sec ${section}`}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
                                                    <DataList data={deptStudents} type="students" onRefresh={fetchAllData} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Fallback for Uncategorized Students */}
                                {(() => {
                                    const deptNames = departments.map(d => d.name);
                                    const otherAllStudents = students.filter(s => !deptNames.includes(s.dept));
                                    const currentOtherSection = selectedSections['Other'] || 'All';

                                    const otherStudents = otherAllStudents.filter(s => 
                                        (currentOtherSection === 'All' || s.sec === currentOtherSection) &&
                                        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())))
                                    ).sort((a, b) => {
                                        if (!a.enrollmentNo) return 1;
                                        if (!b.enrollmentNo) return -1;
                                        return a.enrollmentNo.localeCompare(b.enrollmentNo, undefined, { numeric: true, sensitivity: 'base' });
                                    });
                                    const availableOtherSections = ['All', ...new Set(otherAllStudents.map(s => s.sec).filter(Boolean))].sort();

                                    if (otherStudents.length === 0) return null;

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-1 bg-rose-500 rounded-full"></div>
                                                    <h3 className="text-xl font-bold text-white tracking-tight">Other / Uncategorized</h3>
                                                    <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-700">
                                                        {otherStudents.length} Students
                                                    </span>
                                                </div>

                                                {availableOtherSections.length > 1 && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {availableOtherSections.map((section) => (
                                                            <button
                                                                key={section}
                                                                onClick={() => setSelectedSections(prev => ({ ...prev, ['Other']: section }))}
                                                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${currentOtherSection === section
                                                                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10'
                                                                    : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'
                                                                    }`}
                                                            >
                                                                {section === 'All' ? 'All Sec' : `Sec ${section}`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
                                                <DataList data={otherStudents} type="students" onRefresh={fetchAllData} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Add Student Modal */}
                            {showAddStudentModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="glass w-full max-w-2xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl scale-in duration-200">
                                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                    <Plus className="text-indigo-400" size={20} />
                                                </div>
                                                <h3 className="text-xl font-bold">Add New Student</h3>
                                            </div>
                                            <button
                                                onClick={() => setShowAddStudentModal(false)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddStudent} className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="col-span-2">
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Full Name <span className="text-rose-500">*</span></label>
                                                    <input required type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="input-field w-full" placeholder="e.g. Rahul Sharma" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Email Address <span className="text-rose-500">*</span></label>
                                                    <input required type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} className="input-field w-full" placeholder="rahul@example.com" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Mobile Number</label>
                                                    <input type="text" value={newStudent.mobNo} onChange={(e) => setNewStudent({ ...newStudent, mobNo: e.target.value })} className="input-field w-full" placeholder="9876543210" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Enrollment No. <span className="text-rose-500">*</span></label>
                                                    <input required type="text" value={newStudent.enrollmentNo} onChange={(e) => setNewStudent({ ...newStudent, enrollmentNo: e.target.value })} className="input-field w-full" placeholder="ENR2024001" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Department <span className="text-rose-500">*</span></label>
                                                    <select required value={newStudent.dept} onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })} className="input-field w-full">
                                                        <option value="">Select Department</option>
                                                        {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Section</label>
                                                    <input type="text" value={newStudent.sec} onChange={(e) => setNewStudent({ ...newStudent, sec: e.target.value })} className="input-field w-full" placeholder="A" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Starting Year</label>
                                                    <input type="number" value={newStudent.startingYear} onChange={(e) => setNewStudent({ ...newStudent, startingYear: e.target.value })} className="input-field w-full" placeholder="2024" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-400 block mb-2">Passout Year</label>
                                                    <input type="number" value={newStudent.passoutYear} onChange={(e) => setNewStudent({ ...newStudent, passoutYear: e.target.value })} className="input-field w-full" placeholder="2028" />
                                                </div>
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddStudentModal(false)}
                                                    className="flex-1 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                                                >
                                                    Add Student
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="glass p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Users className="text-emerald-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Teacher Management</h2>
                                        <p className="text-slate-400 text-sm">Manage faculty records and roles</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowAddTeacherModal(true)}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        <Plus size={18} /> Add Teacher
                                    </button>
                                    <button
                                        onClick={() => setShowTeacherUploadSection(!showTeacherUploadSection)}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all border border-slate-700"
                                    >
                                        <Upload size={18} /> Import
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="input-field w-full pl-10 pr-10 h-11"
                                        value={teacherSearchTerm}
                                        onChange={(e) => setTeacherSearchTerm(e.target.value)}
                                    />
                                    {teacherSearchTerm && (
                                        <button
                                            onClick={() => setTeacherSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={fetchAllData}
                                    className="flex items-center justify-center gap-2 px-4 h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all font-medium"
                                >
                                    <Loader2 className={`${loading ? 'animate-spin' : ''}`} size={18} /> Refresh
                                </button>
                            </div>

                            {/* Bulk Upload Section - Collapsible */}
                            {showTeacherUploadSection && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="lg:col-span-2">
                                        <ExcelUpload
                                            type="teachers"
                                            title="Bulk Upload Teachers"
                                            endpoint="upload-teachers"
                                            onUploadSuccess={fetchAllData}
                                        />
                                    </div>
                                    <div className="glass p-6 rounded-2xl border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Users size={18} className="text-emerald-400" />
                                            <h3 className="font-semibold text-sm">Required Columns</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['name', 'email', 'starting year'].map((col) => (
                                                <div key={col} className="flex items-center gap-2 text-xs text-slate-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                                    <span className="capitalize">{col}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Teacher Categories by Role */}
                            <div className="space-y-10">
                                {(() => {
                                    const roles = [...new Set(teachers.map(t => t.role || 'teacher'))].sort();
                                    
                                    if (roles.length === 0) {
                                        return (
                                            <div className="glass p-12 rounded-2xl text-center border border-slate-700/50">
                                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Users size={32} className="text-slate-600" />
                                                </div>
                                                <p className="text-slate-400">No teachers found.</p>
                                            </div>
                                        );
                                    }

                                    return roles.map(role => {
                                        const roleTeachers = teachers.filter(t => 
                                            (t.role || 'teacher') === role &&
                                            (t.name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
                                             t.email.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
                                        );

                                        if (teacherSearchTerm && roleTeachers.length === 0) return null;

                                        return (
                                            <div key={role} className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-1 rounded-full ${role === 'hod' ? 'bg-amber-500' : role === 'principal' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                                                        <h3 className="text-xl font-bold text-white tracking-tight uppercase">{role}s</h3>
                                                        <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-700">
                                                            {roleTeachers.length} Records
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
                                                    <DataList data={roleTeachers} type="teachers" onRefresh={fetchAllData} />
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* Add Teacher Modal */}
                            {showAddTeacherModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="glass w-full max-w-lg rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl scale-in duration-200">
                                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                    <Plus className="text-emerald-400" size={20} />
                                                </div>
                                                <h3 className="text-xl font-bold">Add New Teacher</h3>
                                            </div>
                                            <button
                                                onClick={() => setShowAddTeacherModal(false)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-slate-400 block mb-2">Teacher Name <span className="text-rose-500">*</span></label>
                                                <input required type="text" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} className="input-field w-full" placeholder="Dr. Smith" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-400 block mb-2">Email Address <span className="text-rose-500">*</span></label>
                                                <input required type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} className="input-field w-full" placeholder="smith@college.edu" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-400 block mb-2">Starting Year</label>
                                                <input type="number" value={newTeacher.startingYear} onChange={(e) => setNewTeacher({ ...newTeacher, startingYear: e.target.value })} className="input-field w-full" placeholder="2020" />
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddTeacherModal(false)}
                                                    className="flex-1 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                                                >
                                                    Add Teacher
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'subjects' && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="glass p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <BookOpen className="text-amber-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Subject Management</h2>
                                        <p className="text-slate-400 text-sm">Manage curriculum and department subjects</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowAddSubjectModal(true)}
                                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <Plus size={18} /> Add Subject
                                    </button>
                                    <button
                                        onClick={() => setShowSubjectUploadSection(!showSubjectUploadSection)}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all border border-slate-700"
                                    >
                                        <Upload size={18} /> Import
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search subjects..."
                                        className="input-field w-full pl-10 pr-10 h-11"
                                        value={subjectSearchTerm}
                                        onChange={(e) => setSubjectSearchTerm(e.target.value)}
                                    />
                                    {subjectSearchTerm && (
                                        <button
                                            onClick={() => setSubjectSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={fetchAllData}
                                    className="flex items-center justify-center gap-2 px-4 h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all font-medium"
                                >
                                    <Loader2 className={`${loading ? 'animate-spin' : ''}`} size={18} /> Refresh
                                </button>
                            </div>

                            {/* Bulk Upload Section - Collapsible */}
                            {showSubjectUploadSection && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="lg:col-span-2">
                                        <ExcelUpload
                                            type="subjects"
                                            title="Bulk Upload Subjects"
                                            endpoint="upload-subjects"
                                            onUploadSuccess={fetchAllData}
                                        />
                                    </div>
                                    <div className="glass p-6 rounded-2xl border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen size={18} className="text-amber-400" />
                                            <h3 className="font-semibold text-sm">Required Columns</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['name', 'dept'].map((col) => (
                                                <div key={col} className="flex items-center gap-2 text-xs text-slate-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
                                                    <span className="capitalize">{col}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Selection Actions */}
                            {selectedSubjectIds.length > 0 && (
                                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-indigo-400">{selectedSubjectIds.length} subjects selected</span>
                                        <button onClick={() => setSelectedSubjectIds([])} className="text-xs text-slate-500 hover:text-slate-300 underline">Clear Selection</button>
                                    </div>
                                    <button onClick={handleBulkDeleteSubjects} className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 text-rose-500 hover:bg-rose-500 text-sm font-bold rounded-lg transition-all border border-rose-500/30 hover:text-white">
                                        <Trash2 size={16} /> Delete Selected
                                    </button>
                                </div>
                            )}

                            {/* Subjects Grouped by Department */}
                            <div className="space-y-10">
                                {departments.length === 0 ? (
                                    <div className="glass p-12 rounded-2xl text-center border border-slate-700/50">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen size={32} className="text-slate-600" />
                                        </div>
                                        <p className="text-slate-400">No departments found. Add departments to manage subjects.</p>
                                    </div>
                                ) : (
                                    departments.map((dept) => {
                                        const deptSubjects = subjects.filter(sub => 
                                            sub.dept === dept.name &&
                                            sub.name.toLowerCase().includes(subjectSearchTerm.toLowerCase())
                                        );

                                        if (subjectSearchTerm && deptSubjects.length === 0) return null;

                                        return (
                                            <div key={dept.name} className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                                                        <h3 className="text-xl font-bold text-white tracking-tight">{dept.name} Subjects</h3>
                                                        <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-700">
                                                            {deptSubjects.length} Records
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="bg-slate-800/50 text-slate-300 text-sm">
                                                                <th className="px-4 py-4 w-10">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={deptSubjects.length > 0 && deptSubjects.every(sub => selectedSubjectIds.includes(sub._id))}
                                                                        onChange={() => {
                                                                            const allIds = deptSubjects.map(s => s._id);
                                                                            if (allIds.every(id => selectedSubjectIds.includes(id))) {
                                                                                setSelectedSubjectIds(prev => prev.filter(id => !allIds.includes(id)));
                                                                            } else {
                                                                                setSelectedSubjectIds(prev => [...new Set([...prev, ...allIds])]);
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                                                    />
                                                                </th>
                                                                <th className="px-6 py-4 font-semibold">Subject Name</th>
                                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-700/50">
                                                            {deptSubjects.map((sub) => (
                                                                <tr key={sub._id} className={`hover:bg-slate-800/30 transition-colors ${selectedSubjectIds.includes(sub._id) ? 'bg-indigo-500/5' : ''}`}>
                                                                    <td className="px-4 py-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedSubjectIds.includes(sub._id)}
                                                                            onChange={() => toggleSelectSubject(sub._id)}
                                                                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 text-slate-200">{sub.name}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button
                                                                            onClick={() => handleDeleteSubject(sub._id)}
                                                                            className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Add Subject Modal */}
                            {showAddSubjectModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="glass w-full max-w-lg rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl scale-in duration-200">
                                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                                    <Plus className="text-amber-400" size={20} />
                                                </div>
                                                <h3 className="text-xl font-bold">Add New Subject</h3>
                                            </div>
                                            <button
                                                onClick={() => setShowAddSubjectModal(false)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddSubject} className="p-6 space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-slate-400 block mb-2">Subject Name <span className="text-rose-500">*</span></label>
                                                <input required type="text" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="input-field w-full" placeholder="e.g. Mathematics" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-400 block mb-2">Department <span className="text-rose-500">*</span></label>
                                                <select required value={newSubject.dept} onChange={(e) => setNewSubject({ ...newSubject, dept: e.target.value })} className="input-field w-full">
                                                    <option value="">Select Department</option>
                                                    {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddSubjectModal(false)}
                                                    className="flex-1 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
                                                >
                                                    Add Subject
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'allotment' && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="glass p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                        <UserCog className="text-indigo-400" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">HOD Allotment</h2>
                                        <p className="text-slate-400 text-sm">Assign Head of Departments for each academic wing</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowAllotHodModal(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/30"
                                    >
                                        <UserPlus size={18} /> Allot HOD
                                    </button>
                                </div>
                            </div>

                            {/* HOD Lists Component */}
                            <div className="space-y-6">
                                <HodAssignment />
                            </div>

                            {/* Allot HOD Modal */}
                            {showAllotHodModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="glass w-full max-w-lg rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl scale-in duration-200">
                                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                    <UserPlus className="text-indigo-400" size={20} />
                                                </div>
                                                <h3 className="text-xl font-bold">Allot New HOD</h3>
                                            </div>
                                            <button
                                                onClick={() => setShowAllotHodModal(false)}
                                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <HodAssignmentModalContent onClose={() => {
                                                setShowAllotHodModal(false);
                                                fetchAllData();
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Helper Component for HOD Allotment Modal ---
const HodAssignmentModalContent = ({ onClose }) => {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [dept, setDept] = useState('');
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, dRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/principal/teachers'),
                    axios.get('http://localhost:5000/api/principal/departments')
                ]);
                setTeachers(tRes.data);
                setDepartments(dRes.data);
            } catch (err) {
                console.error('Error fetching modal data', err);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selectedTeacher || !dept) return;
        setLoading(true);
        setStatus(null);
        try {
            await axios.post('http://localhost:5000/api/principal/assign-hod', {
                teacherId: selectedTeacher,
                dept
            });
            setStatus('success');
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 font-medium">Select Teacher</label>
                <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="input-field"
                >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.email}) [{t.role?.toUpperCase()}]</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 font-medium">Department</label>
                <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="input-field"
                >
                    <option value="">Select Department...</option>
                    {departments.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleAssign}
                disabled={!selectedTeacher || !dept || loading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Assign & Send Credentials'}
            </button>

            {status === 'success' && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center text-sm">
                    HOD Assigned Successfully!
                </div>
            )}
            {status === 'error' && (
                <div className="mt-4 p-4 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-center text-sm">
                    Error assigning HOD. Please try again.
                </div>
            )}
        </div>
    );
};

export default PrincipalDashboard;