import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Events = () => {
    const events = [
        { title: 'TechNova 2026: Annual Tech Symposium', date: 'March 15, 2026', time: '09:00 AM', loc: 'Auditorium A', category: 'Technical' },
        { title: 'Inter-College Basketball Championship', date: 'March 22, 2026', time: '10:30 AM', loc: 'Sports Arena', category: 'Sports' },
        { title: 'International Workshop on Cybersecurity', date: 'April 05, 2026', time: '11:00 AM', loc: 'Seminar Hall 3', category: 'Academic' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 pt-20">
            <Navbar />
            <header className="py-24 border-b border-slate-900 bg-slate-900/20">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">Events & News</h1>
                    <p className="text-slate-500 mt-4 max-w-2xl font-medium tracking-tight">Stay updated with the latest happenings on campus.</p>
                </div>
            </header>

            <main className="py-24 max-w-7xl mx-auto px-4">
                <div className="space-y-6">
                    {events.map((ev, i) => (
                        <div key={i} className="glass p-8 rounded-3xl border border-slate-800/50 flex flex-col md:flex-row gap-8 items-start md:items-center hover:bg-slate-800/20 transition-all">
                            <div className="bg-indigo-600 rounded-2xl p-6 text-center min-w-[120px]">
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Month</p>
                                <p className="text-3xl font-black text-white">{ev.date.split(' ')[1].replace(',', '')}</p>
                                <p className="text-xs font-bold text-white uppercase">{ev.date.split(' ')[0]}</p>
                            </div>
                            <div className="flex-1 space-y-3">
                                <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">{ev.category}</span>
                                <h3 className="text-2xl font-black text-white hover:text-indigo-400 transition-colors uppercase tracking-tight">{ev.title}</h3>
                                <div className="flex flex-wrap gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Clock size={14} /> {ev.time}</span>
                                    <span className="flex items-center gap-2"><MapPin size={14} /> {ev.loc}</span>
                                </div>
                            </div>
                            <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Events;
