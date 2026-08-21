import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Megaphone, FileText, ExternalLink, User, CalendarDays, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api/notifications';
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const AnnouncementsChat = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const currentUser = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));

    useEffect(() => {
        fetchAnnouncements();
        const interval = setInterval(fetchAnnouncements, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [announcements]);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get(API, authH());
            // Filter only broadcast/announcements
            setAnnouncements(res.data.filter(n => n.isBroadcast).reverse());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'principal': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
            case 'hod': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'fa': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            case 'teacher': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            default: return 'bg-slate-800/50 border-slate-700/50 text-slate-400';
        }
    };

    const getBubbleColor = (role) => {
        switch (role) {
            case 'principal': return 'bg-indigo-600/10 border-indigo-500/30';
            case 'hod': return 'bg-emerald-600/10 border-emerald-500/30';
            case 'fa': return 'bg-amber-600/10 border-amber-500/30';
            default: return 'bg-slate-800/80 border-slate-700/50';
        }
    };

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <div className="glass rounded-3xl border border-slate-700/50 flex flex-col h-[700px] overflow-hidden bg-slate-900/40 backdrop-blur-xl">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">College Announcements</h2>
                        <p className="text-xs text-slate-400">Stay updated with the latest notices</p>
                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar bg-gradient-to-b from-transparent to-slate-900/20"
            >
                {announcements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-4">
                        <Megaphone size={48} className="opacity-20" />
                        <p>No announcements yet.</p>
                    </div>
                ) : announcements.map((ann, idx) => {
                    const isSystem = ann.senderRole === 'principal';
                    const date = new Date(ann.createdAt).toLocaleDateString();
                    const prevDate = idx > 0 ? new Date(announcements[idx - 1].createdAt).toLocaleDateString() : null;
                    const showDate = date !== prevDate;

                    return (
                        <React.Fragment key={ann._id}>
                            {showDate && (
                                <div className="flex justify-center my-6">
                                    <span className="px-4 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700/50">
                                        {date}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col gap-2 max-w-[85%]">
                                {/* Sender Label */}
                                <div className="flex items-center gap-2 px-2">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleColor(ann.senderRole)}`}>
                                        {ann.senderRole}
                                    </span>
                                    {ann.targetDept && (
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                                            to {ann.targetDept} {ann.targetSection ? `Sec ${ann.targetSection}` : ''}
                                        </span>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`p-5 rounded-3xl border shadow-xl ${getBubbleColor(ann.senderRole)} backdrop-blur-md`}>
                                    {ann.title && (
                                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{ann.title}</h3>
                                    )}
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {ann.message}
                                    </p>

                                    {/* Attachments */}
                                    {ann.attachments && ann.attachments.length > 0 && (
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {ann.attachments.map((att, aidx) => (
                                                <a
                                                    key={aidx}
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-300 hover:bg-white/10 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                        <FileText size={16} />
                                                    </div>
                                                    <span className="truncate flex-1 font-medium">{att.name}</span>
                                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-end">
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default AnnouncementsChat;
