"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { FaPlus, FaTrash, FaUsers, FaRocket, FaArrowRight } from "react-icons/fa6";
import { useAuth } from '@/src/context/AuthContext';
import { Job } from '@/src/types';

const EmployerDashboard = () => {
    const { user, token } = useAuth();
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        company: "",
        job_title: "",
        job_description: "",
        salary: ""
    });
    const [message, setMessage] = useState({ text: "", isError: false });

    // --- FETCH & FILTER LOGIC ---
const fetchMyJobs = useCallback(async () => {
        if (!token || !user) return;
        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5000/jobs", {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!res.ok) throw new Error("Failed to fetch jobs");
            
            const data: Job[] = await res.json();
            
            // FILTER: Purely type-safe logic using your updated Job interface
            const filtered = data.filter((job: Job) => {
                // We check employer_id first, then fallback to user_id
                const ownerId = job.employer_id ?? job.user_id; 
                return ownerId === user.id;
            });
            
            setMyJobs(filtered);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [token, user]);
    
    useEffect(() => {
        fetchMyJobs();
    }, [fetchMyJobs]);

    const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- SUBMIT NEW JOB ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            const response = await fetch("http://127.0.0.1:5000/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Add the new job to the top of the list immediately
                setMyJobs(prev => [result, ...prev]);
                setFormData({ company: "", job_title: "", job_description: "", salary: "" });
                setMessage({ text: "VacanCy Published Successfully!", isError: false });
                setTimeout(() => setMessage({ text: "", isError: false }), 4000);
            } else {
                setMessage({ text: result.message || "Error publishing job", isError: true });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) { 
            setMessage({ text: "Network Error: Check Backend Connection", isError: true });
        }
    };

    // --- DELETE JOB ---
    const handleDelete = async (jobId: number) => {
        if (!window.confirm("This will permanently delete this job and all associated applications. Continue?")) return;

        try {
            const response = await fetch(`http://127.0.0.1:5000/jobs/${jobId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setMyJobs(prev => prev.filter((j) => j.id !== jobId));
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Calculate total pending applicants across all jobs
    const totalApplicants = myJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-6 selection:bg-orange-500/30'>
            
            {/* Header Area */}
            <header className='flex items-center justify-between mb-12 px-4 max-w-7xl mx-auto pt-4 border-b border-white/5 pb-8'>
                <div className='flex flex-col'>
                    <Link href="/" className='flex items-center gap-2 group mb-1'>
                        <SiWorkplace className='text-orange-500 text-2xl group-hover:rotate-12 transition-transform' />
                        <p className='italic text-xl font-black tracking-tighter'>vacan<span className='text-orange-500'>C</span></p>
                    </Link>
                    <span className='text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black'>Employer Hub v2.0</span>
                </div>
                <Navbar />
                <div className='hidden md:flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-2xl border border-white/10'>
                    <div className='w-10 h-10 rounded-xl border border-orange-500/50 overflow-hidden relative'>
                        <Image src={user?.profile_picture || '/usericon.png'} alt='profile' fill className='object-cover' />
                    </div>
                    <div>
                        <p className='text-xs font-black truncate max-w-[100px]'>{user?.username}</p>
                        <p className='text-[8px] uppercase font-black text-orange-500'>Authorized User</p>
                    </div>
                </div>
            </header>

            <main className='grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto'>
                
                {/* --- COLUMN 1: ANALYTICS & QUICK ACTIONS --- */}
                <div className='lg:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group'>
                        <div className='absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 opacity-80'></div>
                        <h3 className='text-[10px] uppercase font-black text-gray-500 tracking-widest mb-6'>Recruitment Stats</h3>
                        
                        <div className='space-y-4'>
                            <div className='bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-orange-500/20 transition-all'>
                                <p className='text-4xl font-black tracking-tighter'>{myJobs.length}</p>
                                <p className='text-[9px] uppercase text-gray-500 font-black mt-1 tracking-widest'>Active Listings</p>
                            </div>
                            <div className='bg-blue-500/5 p-5 rounded-3xl border border-blue-500/10 hover:border-blue-500/30 transition-all'>
                                <p className='text-4xl font-black tracking-tighter text-blue-400'>{totalApplicants}</p>
                                <p className='text-[9px] uppercase text-gray-500 font-black mt-1 tracking-widest'>Candidate Inbound</p>
                            </div>
                        </div>

                        <Link href="/employer/applicants" className='mt-8 flex items-center justify-between bg-orange-500 hover:bg-orange-400 text-white p-5 rounded-2xl transition-all group shadow-xl shadow-orange-950/20'>
                            <div className='flex items-center gap-3'>
                                <FaUsers className='text-lg' />
                                <span className='text-[10px] font-black uppercase tracking-widest'>Review Talent</span>
                            </div>
                            <FaArrowRight className='group-hover:translate-x-1 transition-transform' />
                        </Link>
                    </div>

                    <div className='bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity cursor-help'>
                        <div className='p-3 bg-purple-500/20 rounded-xl text-purple-400'><FaRocket /></div>
                        <p className='text-[10px] font-bold leading-tight'>Global visibility is currently active for all nodes.</p>
                    </div>
                </div>

                {/* --- COLUMN 2: JOB MANAGEMENT --- */}
                <div className='lg:col-span-6 space-y-6'>
                    <div className='flex items-center justify-between px-2 mb-2'>
                        <h2 className='text-2xl font-black'>Live Postings</h2>
                        <div className='flex gap-2'>
                           <div className='w-2 h-2 rounded-full bg-green-500'></div>
                           <span className='text-[9px] font-black uppercase tracking-widest text-gray-500'>Synchronized</span>
                        </div>
                    </div>

                    <div className='space-y-4 overflow-y-auto pr-3 custom-scrollbar' style={{ maxHeight: '75vh' }}>
                        {loading ? (
                            <div className='py-32 text-center flex flex-col items-center gap-6 bg-white/5 rounded-[3rem] border border-white/5'>
                                <div className='w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
                                <p className='text-[10px] uppercase font-black tracking-[0.3em] text-gray-600'>Fetching Active Nodes...</p>
                            </div>
                        ) : myJobs.length > 0 ? myJobs.map((job) => (
                            <div key={job.id} className='bg-[#0c093d] border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.04] transition-all group relative border-l-4 border-l-orange-500/30 hover:border-l-orange-500 shadow-xl'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <h3 className='font-black text-white text-xl tracking-tight'>{job.job_title}</h3>
                                            <span className='bg-orange-500/10 text-orange-500 text-[8px] font-black px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest'>Active</span>
                                        </div>
                                        <p className='text-xs text-gray-400 font-bold mb-6 tracking-wide'>{job.company}</p>
                                        
                                        <div className='flex flex-wrap gap-4 items-center mt-auto'>
                                            <div className='flex items-center gap-2 text-blue-400 bg-blue-400/10 px-4 py-2 rounded-xl border border-blue-500/10 text-[10px] font-black uppercase tracking-widest'>
                                                <FaUsers size={14} /> {job.applications?.length || 0} Candidates
                                            </div>
                                            <div className='flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-xl border border-green-500/10 text-[10px] font-black uppercase tracking-widest'>
                                                {job.salary || "TBD"}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(job.id)}
                                        className='p-4 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 shadow-inner'
                                        title="Archive Posting"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className='text-center py-32 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5'>
                                <div className='w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6'>
                                    <SiWorkplace className='text-gray-700 text-3xl' />
                                </div>
                                <p className='text-gray-400 text-sm font-bold tracking-tight'>The pipeline is currently empty.</p>
                                <p className='text-[10px] text-gray-600 uppercase mt-2 tracking-widest'>Use the &quot;New Vacancy&quot; tool to start recruiting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- COLUMN 3: POSTING FORM --- */}
                <div className='lg:col-span-3'>
                    <div className='bg-[#0c093d] border border-white/10 p-8 rounded-[3rem] shadow-2xl sticky top-8'>
                        <div className='flex items-center gap-3 mb-8'>
                            <div className='w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]'></div>
                            <h2 className='text-lg font-black tracking-tight'>Deploy Vacancy</h2>
                        </div>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border animate-in slide-in-from-top-4 duration-300 ${message.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-3'>Official Title</label>
                                <input name='job_title' value={formData.job_title} onChange={handleInput} placeholder='e.g. Systems Architect' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-gray-700' required />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-3'>Company Entity</label>
                                <input name='company' value={formData.company} onChange={handleInput} placeholder='Entity name' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-gray-700' required />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-3'>Remuneration</label>
                                <input name='salary' value={formData.salary} onChange={handleInput} placeholder='e.g. 120k - 150k' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-gray-700' />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-3'>Mission Specs</label>
                                <textarea name='job_description' value={formData.job_description} onChange={handleInput} placeholder='Briefly explain the role requirements...' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 h-32 resize-none transition-all placeholder:text-gray-700' required />
                            </div>
                            
                            <button className='w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-[1.5rem] text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-orange-950/40 flex items-center justify-center gap-3 group mt-4'>
                                <FaPlus className='group-hover:rotate-90 transition-transform' /> Launch Node
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EmployerDashboard;