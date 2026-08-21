import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <GraduationCap size={18} />
                            </div>
                            <span className="text-lg font-black uppercase tracking-tighter text-white">Student Smart Connect </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Empowering the next generation of innovators through world-class education and cutting-edge technology.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-400/30 transition-all">
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Quick Links</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Admissions', 'Academics', 'Placements', 'Alumni'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-tighter">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Academic Depts */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Departments</h4>
                        <ul className="space-y-4">
                            {['CS & Engineering', 'Information Tech', 'Electronics', 'Mechanical', 'Basic Sciences'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-tighter">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex gap-4 items-start">
                                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400 mt-1">
                                    <MapPin size={16} />
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed uppercase tracking-tighter">
                                    123 Innovation Campus,<br />Tech Park, State - 560001
                                </p>
                            </li>
                            <li className="flex gap-4 items-center">
                                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                                    <Phone size={16} />
                                </div>
                                <p className="text-sm text-slate-500 font-bold">+91 98765 43210</p>
                            </li>
                            <li className="flex gap-4 items-center">
                                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                                    <Mail size={16} />
                                </div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">admissions@collegehub.edu</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                        © 2026 Student Smart Connect . All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[10px] font-black uppercase text-slate-600 hover:text-white tracking-widest">Privacy Policy</a>
                        <a href="#" className="text-[10px] font-black uppercase text-slate-600 hover:text-white tracking-widest">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
