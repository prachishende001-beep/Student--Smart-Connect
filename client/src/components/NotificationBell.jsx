import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Info, AlertTriangle, MessageSquare, Megaphone, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notifications');
            const data = res.data;
            setNotifications(data);

            // Calculate unread count
            const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
            const unread = data.filter(n => {
                if (n.isBroadcast) {
                    return !n.isReadBy.includes(userId);
                }
                return !n.isRead;
            }).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

        // Handle clicks outside dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await axios.patch('http://localhost:5000/api/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (title) => {
        const t = title.toLowerCase();
        if (t.includes('exam')) return <AlertTriangle size={16} className="text-amber-400" />;
        if (t.includes('announcement')) return <Megaphone size={16} className="text-indigo-400" />;
        if (t.includes('fee')) return <Info size={16} className="text-emerald-400" />;
        return <MessageSquare size={16} className="text-slate-400" />;
    };

    const getPublisherName = (n) => {
        const role = String(n.senderId?.role || n.senderRole || '').toLowerCase();
        if (role === 'principal') return 'Principal';
        if (role === 'fa') return 'FA';
        if (role === 'hod') return 'HOD';
        if (role === 'teacher') return 'Teacher';
        return n.senderId?.name || 'System';
    };

    return (
        <div className="relative z-100" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl glass hover:bg-slate-800 transition-all group"
            >
                <Bell size={22} className={`${unreadCount > 0 ? 'text-indigo-400' : 'text-slate-400'} group-hover:scale-110 transition-transform`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 glass rounded-2xl border border-slate-700/50 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                            >
                                {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 italic text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const userId = localStorage.getItem('userId');
                                const isRead = n.isBroadcast ? n.isReadBy.includes(userId) : n.isRead;

                                return (
                                    <div
                                        key={n._id}
                                        className={`p-4 border-b bg-black border-slate-700/30 flex gap-3 transition-colors ${!isRead ? 'bg-gray-700 hover:bg-gray-500' : 'hover:bg-black'}`}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${!isRead ? 'bg-gray-700' : 'bg-slate-800'}`}>
                                            {getIcon(n.title || n.message)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${!isRead ? 'text-white' : 'text-slate-400'}`}>
                                                        {n.title || 'System Alert'}
                                                    </p>
                                                    <p className="text-[10px] text-indigo-400/90 font-medium mt-0.5 truncate">
                                                        From: {getPublisherName(n)}
                                                    </p>
                                                </div>
                                                {!isRead && (
                                                    <button
                                                        onClick={() => markAsRead(n._id)}
                                                        className="p-1 hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-slate-600 mt-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
