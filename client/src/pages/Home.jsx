import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, PlayCircle, Star } from 'lucide-react';
import heroImg from '/hro.png';

const Home = () => {
    const [stats, setStats] = useState([
        { label: 'Students', value: '12,000+' },
        { label: 'Courses', value: '85+' },
        { label: 'Placements', value: '98%' },
        { label: 'Experience', value: '25 Yrs' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/public/stats');
                const data = response.data;
                setStats([
                    { label: 'Students', value: `${data.students}+` },
                    { label: 'Departments', value: `${data.departments}` },
                    { label: 'Placements', value: data.placements },
                    { label: 'Experience', value: data.experience },
                ]);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 pt-20">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={heroImg} alt="College Campus" className="w-full h-full object-cover opacity-30 transform scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Star size={12} /> Excellence in Education
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            LIMITLESS<br />POSSIBILITIES<br />FOR EVERY BRAIN
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl font-medium leading-relaxed">
                            Join a community of scholars, researchers, and innovators dedicated to shaping a better future through technology and collaboration.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-slate-900/50 border-y border-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center group">
                            <p className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{s.value}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: 'Academic Excellence', desc: 'Rigorous curriculum designed by industry experts for real-world readiness.', icon: BookOpen },
                        { title: 'Global Community', desc: 'A diverse environment with students from over 20+ countries and cultures.', icon: Users },
                        { title: 'Modern Facilities', desc: 'State-of-the-art labs, sports complex, and a high-tech digital library.', icon: Trophy },
                    ].map((f, i) => (
                        <div key={i} className="glass p-8 rounded-3xl border border-slate-800/50 hover:border-indigo-500/30 transition-all group">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                <f.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">{f.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
