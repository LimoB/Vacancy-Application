/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { FaPlus, FaTrash, FaUsers, FaRocket, FaArrowRight, FaRotateRight } from "react-icons/fa6";
import { useAuth } from '@/src/context/AuthContext';
import { Job } from '@/src/types';
import { ImSpinner2 } from "react-icons/im";

const EmployerDashboard = () => {
    const { user, token } = useAuth();
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        company: "",
        job_title: "",
        job_description: "",
        salary: ""
    });
    const [message, setMessage] = useState({ text: "", isError: false });

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
            
            const filtered = data.filter((job: Job) => {
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!token || isSubmitting) return;
        setIsSubmitting(true);

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
                setMyJobs(prev => [result, ...prev]);
                setFormData({ company: "", job_title: "", job_description: "", salary: "" });
                setMessage({ text: "Node Deployed Successfully", isError: false });
                setTimeout(() => setMessage({ text: "", isError: false }), 4000);
            } else {
                setMessage({ text: result.message || "Deployment Failed", isError: true });
            }
        } catch (_error) { 
            setMessage({ text: "Network Interference: Link Severed", isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (jobId: number) => {
        if (!window.confirm("Purge this vacancy from system core?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/jobs/${jobId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                setMyJobs(prev => prev.filter((j) => j.id !== jobId));
                setMessage({ text: "Node Purged Successfully", isError: false });
                setTimeout(() => setMessage({ text: "", isError: false }), 3000);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const totalApplicants = myJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-6 selection:bg-orange-500/30'>
            
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
                    <div className='w-10 h-10 rounded-xl border-2 border-orange-500/30 overflow-hidden relative'>
                        <Image src={user?.profile_picture || '/usericon.png'} alt='profile' fill className='object-cover' />
                    </div>
                    <div>
                        <p className='text-xs font-black truncate max-w-[100px]'>{user?.username}</p>
                        <p className='text-[8px] uppercase font-black text-orange-500 animate-pulse'>Live Session</p>
                    </div>
                </div>
            </header>

            <main className='grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto'>
                
                {/* --- ANALYTICS --- */}
                <div className='lg:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group'>
                        <div className='absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 opacity-80'></div>
                        <h3 className='text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-6'>Recruitment Stats</h3>
                        
                        <div className='space-y-4'>
                            <div className='bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all'>
                                <p className='text-5xl font-black tracking-tighter'>{myJobs.length}</p>
                                <p className='text-[9px] uppercase text-gray-500 font-black mt-2 tracking-widest'>Active Nodes</p>
                            </div>
                            <div className='bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10 hover:border-blue-500/20 transition-all'>
                                <p className='text-5xl font-black tracking-tighter text-blue-400'>{totalApplicants}</p>
                                <p className='text-[9px] uppercase text-gray-500 font-black mt-2 tracking-widest'>Candidate Inbound</p>
                            </div>
                        </div>

                        <Link href="/employer/applicants" className='mt-8 flex items-center justify-between bg-orange-600 hover:bg-orange-500 text-white p-5 rounded-2xl transition-all group shadow-xl shadow-orange-950/20'>
                            <div className='flex items-center gap-3'>
                                <FaUsers className='text-lg' />
                                <span className='text-[10px] font-black uppercase tracking-widest'>Talent Pipeline</span>
                            </div>
                            <FaArrowRight className='group-hover:translate-x-1 transition-transform' />
                        </Link>
                    </div>

                    <div className='bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity'>
                        <div className='p-3 bg-green-500/20 rounded-xl text-green-400'><FaRocket /></div>
                        <p className='text-[9px] font-black uppercase tracking-wider leading-relaxed'>Network integrity confirmed. All nodes operational.</p>
                    </div>
                </div>

                {/* --- FEED --- */}
                <div className='lg:col-span-6 space-y-6'>
                    <div className='flex items-center justify-between px-2'>
                        <h2 className='text-3xl font-black tracking-tighter'>Live Postings</h2>
                        <button onClick={fetchMyJobs} className='p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all'>
                            <FaRotateRight className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className='space-y-5 overflow-y-auto pr-3 custom-scrollbar' style={{ maxHeight: '75vh' }}>
                        {loading ? (
                            <div className='py-32 text-center flex flex-col items-center gap-6 bg-white/5 rounded-[3rem] border border-white/5'>
                                <ImSpinner2 className='text-orange-500 text-3xl animate-spin' />
                                <p className='text-[10px] uppercase font-black tracking-[0.3em] text-gray-600'>Syncing Network Data...</p>
                            </div>
                        ) : myJobs.length > 0 ? myJobs.map((job) => (
                            <div key={job.id} className='bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.08] transition-all group relative border-l-4 border-l-orange-500/20 hover:border-l-orange-500 shadow-xl'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-3 mb-2'>
                                            <h3 className='font-black text-orange-400 text-xl tracking-tight'>{job.job_title}</h3>
                                            <div className='flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20'>
                                                <div className='w-1 h-1 rounded-full bg-green-500 animate-pulse'></div>
                                                <span className='text-[8px] font-black uppercase text-green-500'>Active</span>
                                            </div>
                                        </div>
                                        <p className='text-xs text-gray-400 font-bold mb-6 tracking-wide'>{job.company}</p>
                                        
                                        <div className='flex flex-wrap gap-3 items-center'>
                                            <div className='flex items-center gap-2 text-blue-400 bg-blue-400/5 px-4 py-2 rounded-xl border border-blue-500/10 text-[9px] font-black uppercase tracking-widest'>
                                                <FaUsers size={12} /> {job.applications?.length || 0} Applicants
                                            </div>
                                            <div className='flex items-center gap-2 text-green-400 bg-green-400/5 px-4 py-2 rounded-xl border border-green-500/10 text-[9px] font-black uppercase tracking-widest'>
                                                {job.salary || "Competitive"}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(job.id)}
                                        className='p-4 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all'
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className='text-center py-32 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5'>
                                <SiWorkplace className='text-gray-700 text-4xl mx-auto mb-6 opacity-20' />
                                <p className='text-gray-500 text-sm font-bold'>No active nodes detected.</p>
                                <p className='text-[9px] text-gray-600 uppercase mt-2 tracking-widest font-black'>Initialize deployment from the sidebar.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- DEPLOYMENT FORM --- */}
                <div className='lg:col-span-3'>
                    <div className='bg-[#0c093d] border border-white/10 p-8 rounded-[3rem] shadow-2xl sticky top-8'>
                        <div className='flex items-center gap-3 mb-8'>
                            <div className='w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]'></div>
                            <h2 className='text-lg font-black tracking-tight uppercase'>Deploy Node</h2>
                        </div>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center border animate-in slide-in-from-top-4 duration-300 ${message.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-4'>Role Title</label>
                                <input name='job_title' value={formData.job_title} onChange={handleInput} placeholder='Lead Engineer' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all' required />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-4'>Company</label>
                                <input name='company' value={formData.company} onChange={handleInput} placeholder='Entity Name' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all' required />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-4'>Budget</label>
                                <input name='salary' value={formData.salary} onChange={handleInput} placeholder='e.g. 150k - 200k' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all' />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 ml-4'>Parameters</label>
                                <textarea name='job_description' value={formData.job_description} onChange={handleInput} placeholder='Technical requirements...' className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white/10 h-32 resize-none transition-all' required />
                            </div>
                            
                            <button 
                                disabled={isSubmitting}
                                className='w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-[1.5rem] text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-orange-950/40 flex items-center justify-center gap-3 group disabled:opacity-50'
                            >
                                {isSubmitting ? <ImSpinner2 className='animate-spin' /> : <><FaPlus className='group-hover:rotate-90 transition-transform' /> Launch Node</>}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EmployerDashboard;