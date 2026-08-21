import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Trash2, Loader2, UserCog } from 'lucide-react';

const HodAssignment = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/principal/departments');
            setDepartments(res.data);
        } catch (error) {
            console.error('Error fetching departments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (deptName) => {
        if (!window.confirm(`Are you sure you want to remove the HOD for ${deptName}?`)) return;
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/principal/remove-hod', { dept: deptName });
            fetchDepartments(); // Refresh HOD list
        } catch (error) {
            console.error('Error removing HOD', error);
            alert('Error removing HOD');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-2xl border border-slate-700/50 relative min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 rounded-2xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-400" size={32} />
                </div>
            )}
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <CheckCircle className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Department HODs</h2>
                        <p className="text-slate-400 text-sm">Overview of currently assigned department heads</p>
                    </div>
                </div>
                <button 
                    onClick={fetchDepartments}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Refresh List"
                >
                    <Loader2 className={`${loading ? 'animate-spin' : ''}`} size={20} />
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-300 text-sm">
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Allotted HOD</th>
                            <th className="px-6 py-4 font-semibold">Contact Info</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">
                                    <div className="flex flex-col items-center gap-2">
                                        <UserCog size={40} className="text-slate-700 mb-2" />
                                        <p>No departments found to assign HODs.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            departments.map((d, i) => (
                                <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-500/20">
                                            {d.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {d.hod ? (
                                            <div className="flex flex-col">
                                                <span className="text-slate-200 font-medium">{d.hod.name}</span>
                                                <span className="text-slate-500 text-xs">Assigned Head</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 italic">No HOD assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {d.hod ? (
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 text-sm">{d.hod.email}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {d.hod && (
                                            <button
                                                onClick={() => handleRemove(d.name)}
                                                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20 opacity-0 group-hover:opacity-100"
                                                title={`Remove HOD from ${d.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HodAssignment;
