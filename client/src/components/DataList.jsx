import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, GraduationCap, Calendar, MapPin, Hash, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

const DataList = ({ data, type, onRefresh }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    if (!data || data.length === 0) {
        return (
            <div className="glass p-8 rounded-2xl text-center text-slate-400">
                No {type} found. Please upload a list to get started.
            </div>
        );
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/principal/user/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Error deleting user');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/principal/users/bulk`, {
                data: { ids: selectedIds },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedIds([]);
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Error deleting users');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(item => item._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setEditForm({ ...item });
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/principal/user/${editingId}`, editForm, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEditingId(null);
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Error updating user');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-indigo-400">{selectedIds.length} items selected</span>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                            Clear Selection
                        </button>
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/20 text-rose-500 hover:bg-rose-500 text-sm font-bold rounded-lg transition-all border border-rose-500/30 hover:text-white"
                    >
                        <Trash2 size={16} />
                        Delete Selected
                    </button>
                </div>
            )}

            <div className="glass rounded-2xl overflow-hidden border border-slate-700/50 relative">
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-400" size={32} />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-300 text-sm uppercase tracking-wider">
                                <th className="px-4 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={data.length > 0 && selectedIds.length === data.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                    />
                                </th>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                {type === 'students' ? (
                                    <>
                                        <th className="px-6 py-4 font-semibold">Enrollment</th>
                                        <th className="px-6 py-4 font-semibold">Dept & Sec</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 font-semibold">Started</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                    </>
                                )}
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {data.map((item, index) => (
                                <tr key={item._id || index} className={`hover:bg-slate-800/30 transition-colors ${selectedIds.includes(item._id) ? 'bg-indigo-500/5' : ''}`}>
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item._id)}
                                            onChange={() => toggleSelect(item._id)}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item._id ? (
                                            <input
                                                name="name"
                                                value={editForm.name}
                                                onChange={handleChange}
                                                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-full"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                    {item.name?.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-200">{item.name}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {editingId === item._id ? (
                                            <input
                                                name="email"
                                                value={editForm.email}
                                                onChange={handleChange}
                                                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-full"
                                            />
                                        ) : item.email}
                                    </td>
                                    {type === 'students' ? (
                                        <>
                                            <td className="px-6 py-4 text-sm text-slate-300">
                                                {editingId === item._id ? (
                                                    <input
                                                        name="enrollmentNo"
                                                        value={editForm.enrollmentNo}
                                                        onChange={handleChange}
                                                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm outline-none w-full"
                                                    />
                                                ) : item.enrollmentNo}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingId === item._id ? (
                                                    <div className="flex gap-2">
                                                        <input name="dept" value={editForm.dept} onChange={handleChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs w-16" />
                                                        <input name="sec" value={editForm.sec} onChange={handleChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs w-12" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold border border-indigo-500/20">
                                                            {item.dept}
                                                        </span>
                                                        <span className="text-slate-500 text-xs">{item.sec}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 text-slate-300">
                                                {editingId === item._id ? (
                                                    <input name="startingYear" value={editForm.startingYear} onChange={handleChange} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm w-20" />
                                                ) : item.startingYear}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.role === 'hod'
                                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    : item.role === 'fa'
                                                        ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    }`}>
                                                    {item.role}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {editingId === item._id ? (
                                                <>
                                                    <button onClick={handleUpdate} className="p-1.5 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors">
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(item)} className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataList;
