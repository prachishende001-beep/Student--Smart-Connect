import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Cpu, FlaskConical, Wrench, Building2, Briefcase, Users, BookOpen, Award, TrendingUp, Calendar, Mail, Phone, MapPin, GraduationCap, Microscope, ChevronRight } from 'lucide-react';

const Departments = () => {
    const [selectedDept, setSelectedDept] = useState(0);
    const [depts, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);

    const staticDeptDetails = {
        'Computer Science & Engineering': {
            icon: Cpu,
            color: 'indigo',
            desc: 'Shaping the future of technology through cutting-edge research and innovation.',
            established: 2005,
            programs: [
                { degree: 'B.Tech', duration: '4 Years', seats: 120 },
                { degree: 'M.Tech', duration: '2 Years', seats: 30 },
                { degree: 'Ph.D', duration: '3-5 Years', seats: 15 }
            ],
            specializations: ['Artificial Intelligence & Machine Learning', 'Data Science & Analytics', 'Cloud Computing', 'Cybersecurity', 'Internet of Things', 'Blockchain Technology'],
            facilities: ['Advanced Computing Labs with 200+ workstations', 'AI & ML Research Center', 'Cloud Computing Lab (AWS, Azure, GCP)', 'Cybersecurity Lab with latest tools', '24/7 High-speed Internet connectivity', 'Dedicated Project Lab'],
            research: ['Deep Learning for Medical Diagnosis', 'Smart City Infrastructure using IoT', 'Quantum Computing Applications', 'Natural Language Processing for Regional Languages'],
            placements: { average: '12.5 LPA', highest: '45 LPA', companies: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Goldman Sachs', 'Oracle'] }
        },
        'Electronics & Communication': {
            icon: FlaskConical,
            color: 'emerald',
            desc: 'Pioneering innovations in electronics, communication systems, and embedded technologies.',
            established: 2008,
            programs: [
                { degree: 'B.Tech', duration: '4 Years', seats: 100 },
                { degree: 'M.Tech', duration: '2 Years', seats: 25 },
                { degree: 'Ph.D', duration: '3-5 Years', seats: 10 }
            ],
            specializations: ['VLSI Design', 'Embedded Systems', 'Signal Processing', 'Wireless Communication', 'Optical Communication', 'Robotics & Automation'],
            facilities: ['VLSI Design Lab with Cadence tools', 'Embedded Systems Lab', 'Communication Systems Lab', 'Digital Signal Processing Lab', 'Microwave & Antenna Lab', 'PCB Fabrication Unit'],
            research: ['5G and Beyond Communication Systems', 'Low Power VLSI Design', 'Medical Electronics & Biosensors', 'Autonomous Vehicle Communication'],
            placements: { average: '10.8 LPA', highest: '38 LPA', companies: ['Intel', 'Qualcomm', 'Texas Instruments', 'Samsung', 'MediaTek', 'Broadcom'] }
        },
        'Mechanical Engineering': {
            icon: Wrench,
            color: 'rose',
            desc: 'Engineering excellence in design, manufacturing, and sustainable energy solutions.',
            established: 2006,
            programs: [
                { degree: 'B.Tech', duration: '4 Years', seats: 90 },
                { degree: 'M.Tech', duration: '2 Years', seats: 20 },
                { degree: 'Ph.D', duration: '3-5 Years', seats: 8 }
            ],
            specializations: ['Thermal Engineering', 'Manufacturing & Automation', 'Robotics', 'Automobile Engineering', 'Renewable Energy', 'Mechatronics'],
            facilities: ['Advanced Manufacturing Lab with CNC machines', 'CAD/CAM Lab with CATIA & SolidWorks', 'Robotics & Automation Lab', 'Thermal Engineering Lab', 'Material Testing Lab', 'Wind Tunnel & Aerodynamics Lab'],
            research: ['Electric Vehicle Design & Optimization', 'Additive Manufacturing (3D Printing)', 'Renewable Energy Systems', 'Smart Manufacturing using Industry 4.0'],
            placements: { average: '9.5 LPA', highest: '32 LPA', companies: ['Tata Motors', 'Mahindra', 'L&T', 'Bosch', 'Siemens', 'ABB'] }
        },
        'Civil Engineering': {
            icon: Building2,
            color: 'amber',
            desc: 'Building tomorrow\'s infrastructure with sustainable and innovative engineering practices.',
            established: 2007,
            programs: [
                { degree: 'B.Tech', duration: '4 Years', seats: 80 },
                { degree: 'M.Tech', duration: '2 Years', seats: 18 },
                { degree: 'Ph.D', duration: '3-5 Years', seats: 7 }
            ],
            specializations: ['Structural Engineering', 'Transportation Engineering', 'Environmental Engineering', 'Geotechnical Engineering', 'Construction Management', 'Smart Cities & Urban Planning'],
            facilities: ['Concrete Technology Lab', 'Soil Mechanics Lab', 'Survey & Geomatics Lab with Total Station', 'Environmental Engineering Lab', 'Structural Analysis Lab with STAAD Pro', 'Hydraulics & Fluid Mechanics Lab'],
            research: ['Green Building Technologies', 'Smart City Infrastructure', 'Earthquake Resistant Structures', 'Sustainable Construction Materials'],
            placements: { average: '8.2 LPA', highest: '25 LPA', companies: ['L&T Construction', 'Shapoorji Pallonji', 'DLF', 'Tata Projects', 'Afcons', 'Gammon India'] }
        },
        'Business Administration': {
            icon: Briefcase,
            color: 'purple',
            desc: 'Nurturing business leaders with strategic thinking and entrepreneurial mindset.',
            established: 2010,
            programs: [
                { degree: 'BBA', duration: '3 Years', seats: 60 },
                { degree: 'MBA', duration: '2 Years', seats: 100 },
                { degree: 'Executive MBA', duration: '18 Months', seats: 40 }
            ],
            specializations: ['Finance & Accounting', 'Marketing Management', 'Human Resource Management', 'Operations Management', 'Business Analytics', 'Entrepreneurship & Innovation'],
            facilities: ['Bloomberg Terminal Lab', 'Case Study Discussion Rooms', 'Entrepreneurship Development Cell', 'Digital Marketing Lab', 'Simulation & Analytics Lab', 'Corporate Resource Center'],
            research: ['Digital Transformation in Business', 'Sustainable Business Practices', 'FinTech & Financial Innovation', 'Consumer Behavior in Digital Era'],
            placements: { average: '11.5 LPA', highest: '40 LPA', companies: ['Deloitte', 'KPMG', 'EY', 'PwC', 'McKinsey', 'Boston Consulting Group'] }
        }
    };

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/public/departments');
                const backendDepts = response.data;

                const formattedDepts = backendDepts.map(dept => {
                    const deptName = dept.name.toUpperCase();
                    let staticDetails = staticDeptDetails['Computer Science & Engineering']; // Default

                    if (deptName.includes('CSE') || deptName.includes('COMPUTER')) {
                        staticDetails = staticDeptDetails['Computer Science & Engineering'];
                    } else if (deptName.includes('ECE') || deptName.includes('EXTC') || deptName.includes('ELECTRONICS')) {
                        staticDetails = staticDeptDetails['Electronics & Communication'];
                    } else if (deptName.includes('MECH') || deptName.includes('MECHANICAL')) {
                        staticDetails = staticDeptDetails['Mechanical Engineering'];
                    } else if (deptName.includes('CIVIL')) {
                        staticDetails = staticDeptDetails['Civil Engineering'];
                    } else if (deptName.includes('MBA') || deptName.includes('BUSINESS')) {
                        staticDetails = staticDeptDetails['Business Administration'];
                    } else if (deptName.includes('IT') || deptName.includes('INFORMATION')) {
                        staticDetails = staticDeptDetails['Computer Science & Engineering']; // Map IT to CSE static details if and only if IT specific details aren't there
                    }

                    return {
                        ...dept,
                        ...staticDetails,
                        placements: {
                            ...staticDetails?.placements,
                        }
                    };
                });

                if (formattedDepts.length > 0) {
                    setDepts(formattedDepts);
                } else {
                    // Fallback to static if no depts in DB
                    setDepts(Object.keys(staticDeptDetails).map(name => ({
                        name,
                        ...staticDeptDetails[name],
                        head: 'TBD',
                        email: 'contact@college.edu',
                        phone: '+91 00000 00000',
                        students: 0,
                        faculty: 0
                    })));
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching departments:', error);
                // Fallback to static
                setDepts(Object.keys(staticDeptDetails).map(name => ({
                    name,
                    ...staticDeptDetails[name],
                    head: 'TBD',
                    email: 'contact@college.edu',
                    phone: '+91 00000 00000',
                    students: 0,
                    faculty: 0
                })));
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white text-2xl font-black animate-pulse">LOADING...</div>
        </div>
    );

    const dept = depts[selectedDept] || depts[0];

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            {/* Hero Header */}
            <header className="pt-32 pb-20 border-b border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-14 h-14 bg-${dept.color}-500/10 rounded-2xl flex items-center justify-center text-${dept.color}-400`}>
                            <dept.icon size={28} />
                        </div>
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Department of</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase mb-6">{dept.name}</h1>
                    <p className="text-slate-400 text-lg max-w-3xl font-medium leading-relaxed">{dept.desc}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        <div className="glass p-6 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="text-indigo-400" size={20} />
                                <span className="text-3xl font-black text-white">{dept.students}</span>
                            </div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Students</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-3 mb-2">
                                <GraduationCap className="text-emerald-400" size={20} />
                                <span className="text-3xl font-black text-white">{dept.faculty}</span>
                            </div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Faculty</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="text-rose-400" size={20} />
                                <span className="text-3xl font-black text-white">{dept.established}</span>
                            </div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Established</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="text-amber-400" size={20} />
                                <span className="text-3xl font-black text-white">{dept.placements.highest}</span>
                            </div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Highest Package</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="glass p-6 rounded-3xl border border-slate-800/50 sticky top-24">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6">All Departments</h3>
                            <nav className="space-y-2">
                                {depts.map((d, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDept(i)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${selectedDept === i
                                            ? `bg-${d.color}-500/10 text-${d.color}-400`
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <d.icon size={18} />
                                        <span className="text-sm font-bold tracking-tight flex-1">{d.name.split('&')[0].trim()}</span>
                                        {selectedDept === i && <ChevronRight size={16} />}
                                    </button>
                                ))}
                            </nav>

                            {/* Contact Info */}
                            <div className="mt-8 pt-8 border-t border-slate-800/50">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Department Head</h4>
                                <p className="text-white font-bold mb-4">{dept.head}</p>
                                <div className="space-y-3">
                                    <a href={`mailto:${dept.email}`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm">
                                        <Mail size={16} />
                                        <span className="truncate">{dept.email}</span>
                                    </a>
                                    <a href={`tel:${dept.phone}`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm">
                                        <Phone size={16} />
                                        <span>{dept.phone}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-12">
                        {/* Programs Offered */}
                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                                <BookOpen className="text-indigo-400" size={32} />
                                Programs Offered
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {dept.programs.map((prog, i) => (
                                    <div key={i} className="glass p-8 rounded-3xl border border-slate-800/50 hover:border-slate-700/50 transition-all">
                                        <div className="text-4xl font-black text-white mb-3">{prog.degree}</div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Duration:</span>
                                            <span className="text-slate-300 font-bold">{prog.duration}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-2">
                                            <span className="text-slate-500">Seats:</span>
                                            <span className="text-indigo-400 font-bold">{prog.seats}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Specializations */}
                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                                <Microscope className="text-emerald-400" size={32} />
                                Areas of Specialization
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dept.specializations.map((spec, i) => (
                                    <div key={i} className="glass p-6 rounded-2xl border border-slate-800/50 hover:bg-slate-800/30 transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-2 h-2 rounded-full bg-${dept.color}-400 mt-2 group-hover:scale-150 transition-transform`} />
                                            <p className="text-slate-300 font-medium leading-relaxed">{spec}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Facilities */}
                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                                <Building2 className="text-rose-400" size={32} />
                                State-of-the-Art Facilities
                            </h2>
                            <div className="glass p-8 rounded-3xl border border-slate-800/50">
                                <ul className="space-y-4">
                                    {dept.facilities.map((facility, i) => (
                                        <li key={i} className="flex items-start gap-4 text-slate-300">
                                            <ChevronRight className={`text-${dept.color}-400 flex-shrink-0 mt-1`} size={20} />
                                            <span className="leading-relaxed">{facility}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Research Areas */}
                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                                <Award className="text-amber-400" size={32} />
                                Current Research Areas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dept.research.map((research, i) => (
                                    <div key={i} className="glass p-8 rounded-3xl border border-slate-800/50 hover:border-slate-700/50 transition-all">
                                        <div className={`w-12 h-12 bg-${dept.color}-500/10 rounded-xl flex items-center justify-center text-${dept.color}-400 mb-4`}>
                                            <Microscope size={24} />
                                        </div>
                                        <p className="text-white font-bold leading-relaxed">{research}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Placements */}
                        <section>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                                <TrendingUp className="text-purple-400" size={32} />
                                Placement Highlights
                            </h2>
                            <div className="glass p-8 rounded-3xl border border-slate-800/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <p className="text-slate-500 text-sm uppercase tracking-wider font-bold mb-2">Average Package</p>
                                        <p className="text-4xl font-black text-emerald-400">{dept.placements.average}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm uppercase tracking-wider font-bold mb-2">Highest Package</p>
                                        <p className="text-4xl font-black text-indigo-400">{dept.placements.highest}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold mb-4">Top Recruiters:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {dept.placements.companies.map((company, i) => (
                                            <span key={i} className="px-4 py-2 bg-slate-800/50 rounded-xl text-slate-300 text-sm font-medium border border-slate-700/50">
                                                {company}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <section className="glass p-12 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-center">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Ready to Join Us?</h3>
                            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Explore our admission process and take the first step towards an exceptional education.</p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105">
                                    Apply Now
                                </button>
                                <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-black uppercase tracking-wider rounded-xl transition-all border border-slate-700/50">
                                    Download Brochure
                                </button>
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Departments;