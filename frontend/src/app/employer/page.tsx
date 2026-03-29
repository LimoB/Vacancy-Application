"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { FaPlus, FaTrash, FaUsers, FaChartLine, FaRocket } from "react-icons/fa6";
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

    useEffect(() => {
        if (!token) return;
        
        fetch("http://127.0.0.1:5000/jobs")
            .then((res) => res.json())
            .then((data: Job[]) => {
                // FIX: Specified Job type instead of any
                const filtered = data.filter((j: Job) => 
                    j.employer_id === user?.id || j.company === user?.username
                );
                setMyJobs(filtered);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error:", err);
                setLoading(false);
            });
    }, [token, user]);

    const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                setMyJobs(prev => [result, ...prev]);
                setFormData({ company: "", job_title: "", job_description: "", salary: "" });
                setMessage({ text: "Job published to the feed!", isError: false });
                setTimeout(() => setMessage({ text: "", isError: false }), 3000);
            } else {
                setMessage({ text: result.message || "Error posting job", isError: true });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) { 
            setMessage({ text: "Server connection failed.", isError: true });
        }
    };

    const handleDelete = async (jobId: number) => {
        if (!window.confirm("Permanently remove this job posting?")) return;

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

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-6'>
            
            <header className='flex items-center justify-between mb-10 px-4 max-w-7xl mx-auto'>
                <Link href="/" className='flex items-center gap-2 group'>
                    <SiWorkplace className='text-orange-500 text-2xl group-hover:rotate-12 transition-transform' />
                    <p className='italic text-xl font-bold'>vacan<span className='text-orange-500'>C</span> <span className='text-[10px] uppercase tracking-widest ml-2 opacity-50 font-normal'>Business</span></p>
                </Link>
                <Navbar />
                <Link href="/seeker/profile">
                    <div className='w-10 h-10 rounded-full border-2 border-purple-500 overflow-hidden relative hover:scale-105 transition-transform'>
                        <Image src={user?.profile_picture || '/usericon.png'} alt='profile' fill className='object-cover' />
                    </div>
                </Link>
            </header>

            <main className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto'>
                
                <div className='lg:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-xl text-center'>
                        <div className='relative w-20 h-20 mx-auto mb-4'>
                            <Image className='rounded-full border-2 border-purple-500 p-1' src={user?.profile_picture || '/usericon.png'} alt='avatar' fill />
                        </div>
                        <h2 className='text-lg font-black'>{user?.username || "Employer"}</h2>
                        <p className='text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-4'>Verified Partner</p>
                        
                        <div className='grid grid-cols-2 gap-2 pt-4 border-t border-white/5'>
                            <div className='bg-white/5 p-3 rounded-2xl'>
                                <p className='text-xl font-black'>{myJobs.length}</p>
                                <p className='text-[8px] uppercase text-gray-500 font-bold'>Active Jobs</p>
                            </div>
                            <div className='bg-white/5 p-3 rounded-2xl'>
                                <p className='text-xl font-black'>42</p>
                                <p className='text-[8px] uppercase text-gray-500 font-bold'>Applicants</p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-gradient-to-br from-purple-600/20 to-orange-600/20 border border-white/5 p-6 rounded-[2rem]'>
                        <h4 className='text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2'>
                            <FaChartLine className='text-orange-500' /> Insights
                        </h4>
                        <p className='text-[11px] text-gray-400 leading-relaxed italic'>
                            &quot;Your posts are getting 20% more clicks this week. Try adding salary ranges to increase application quality.&quot;
                        </p>
                    </div>
                </div>

                <div className='lg:col-span-6 space-y-6'>
                    <div className='flex items-center justify-between px-2'>
                        <h1 className='text-2xl font-black tracking-tight'>Manage Postings</h1>
                        <span className='text-[10px] bg-white/10 px-3 py-1 rounded-full text-gray-400 uppercase tracking-widest font-bold'>Live Feed</span>
                    </div>

                    <div className='space-y-4 overflow-y-auto pr-2 custom-scrollbar' style={{ maxHeight: 'calc(100vh - 250px)' }}>
                        {loading ? (
                            <div className='py-20 text-center animate-pulse text-xs font-bold uppercase text-gray-600 tracking-widest'>Loading your dashboard...</div>
                        ) : myJobs.length > 0 ? myJobs.map((job) => (
                            <div key={job.id} className='bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group relative'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex gap-4'>
                                        <div className='w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30'>
                                            <FaRocket className='text-purple-400' />
                                        </div>
                                        <div>
                                            <h3 className='font-bold text-white text-lg'>{job.job_title}</h3>
                                            <p className='text-xs text-purple-400 font-bold mb-2 uppercase tracking-widest'>{job.company}</p>
                                            <div className='flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-wider'>
                                                <span className='flex items-center gap-1 text-green-500'><FaUsers /> 12 Applicants</span>
                                                <span>Budget: {job.salary || "$Negotiable"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(job.id)}
                                        className='p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all'
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className='text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10'>
                                <Image src='/tomandjerry.png' width={150} height={100} className='mx-auto grayscale opacity-20 mb-4' alt='empty' />
                                <p className='text-gray-500 text-sm italic font-medium'>No active job postings found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className='lg:col-span-3'>
                    <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl sticky top-6'>
                        <h2 className='text-lg font-black mb-6 flex items-center gap-3'>
                            <span className='w-2 h-2 bg-orange-500 rounded-full animate-ping'></span>
                            New Vacancy
                        </h2>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-xl text-[10px] font-bold text-center border ${message.isError ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-green-500/20 border-green-500/30 text-green-300'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='space-y-1'>
                                <label className='text-[9px] uppercase font-black tracking-widest text-gray-500 ml-2'>Job Title</label>
                                <input name='job_title' value={formData.job_title} onChange={handleInput} placeholder='e.g. Senior Dev' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-purple-500 transition-all' required />
                            </div>
                            <div className='space-y-1'>
                                <label className='text-[9px] uppercase font-black tracking-widest text-gray-500 ml-2'>Company Name</label>
                                <input name='company' value={formData.company} onChange={handleInput} placeholder='Your brand' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-purple-500 transition-all' required />
                            </div>
                            <div className='space-y-1'>
                                <label className='text-[9px] uppercase font-black tracking-widest text-gray-500 ml-2'>Compensation</label>
                                <input name='salary' value={formData.salary} onChange={handleInput} placeholder='e.g. $80k - $100k' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-purple-500 transition-all' />
                            </div>
                            <div className='space-y-1'>
                                <label className='text-[9px] uppercase font-black tracking-widest text-gray-500 ml-2'>Requirements</label>
                                <textarea name='job_description' value={formData.job_description} onChange={handleInput} placeholder='What are you looking for?' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-purple-500 h-28 resize-none transition-all' required />
                            </div>
                            
                            <button className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2'>
                                <FaPlus /> Launch Posting
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EmployerDashboard;