import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Departments', path: '/departments' },
        { name: 'Events', path: '/events' },
        { name: 'Gallery', path: '/gallery' },
    ];

    const handleDashboardRedirect = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        const roleRoutes = {
            principal: '/principal-dashboard',
            hod: '/hod-dashboard',
            fa: '/fa-dashboard',
            teacher: '/teacher-dashboard',
            student: '/student-dashboard',
        };
        navigate(roleRoutes[user.role] || '/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
                            Student Smart Connect
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleDashboardRedirect}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            {user ? 'Dashboard' : 'Portal Login'}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 p-2">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-3 text-base font-bold text-slate-400 hover:bg-slate-800 rounded-xl uppercase tracking-widest"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => { setIsOpen(false); handleDashboardRedirect(); }}
                            className="w-full mt-4 bg-indigo-600 text-white px-4 py-4 rounded-xl font-black text-sm uppercase tracking-widest"
                        >
                            {user ? 'Go to Dashboard' : 'Login to Portal'}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
