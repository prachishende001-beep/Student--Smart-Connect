import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Gallery = () => {
    // Array of indices for sample grid
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="min-h-screen bg-slate-950 pt-20">
            <Navbar />
            <header className="py-24 border-b border-slate-900 bg-slate-900/20">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">Campus Gallery</h1>
                    <p className="text-slate-500 mt-4 max-w-2xl font-medium tracking-tight">Capturing the life and spirit of Student Smart Connect .</p>
                </div>
            </header>

            <main className="py-24 max-w-7xl mx-auto px-4">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {items.map((it) => (
                        <div key={it} className="relative group overflow-hidden rounded-3xl break-inside-avoid shadow-2xl">
                            <img
                                src={`https://picsum.photos/seed/${it + 10}/600/${it % 2 === 0 ? '800' : '500'}`}
                                alt="Campus Life"
                                className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Album Title</p>
                                    <p className="text-lg font-black text-white uppercase">Moment {it}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Gallery;
