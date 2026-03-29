"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { FaBars, FaTrash, FaPeopleGroup, FaCheckDouble, FaCheck } from "react-icons/fa6";
import { TbBadgeFilled, TbBriefcase } from "react-icons/tb";
import { useAuth } from '@/src/context/AuthContext';
import { Job } from '@/src/types';
import { MdPostAdd } from 'react-icons/md';
import { ImSpinner2 } from "react-icons/im";

interface ApplicationResponse {
    job_id?: number;
    job?: { id: number };
}

const JobsPage = () => {
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]); 
    const [formData, setFormData] = useState({
        company: "",
        job_title: "",
        job_description: "",
        salary: ""
    });
    
    // UI States
    const [message, setMessage] = useState({ text: "", isError: false });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingJobId, setLoadingJobId] = useState<number | null>(null);
    const [successJobId, setSuccessJobId] = useState<number | null>(null); // For "Quick Apply" success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successSubmit, setSuccessSubmit] = useState(false); // For "Post Vacancy" success

    const userRole = user?.user_role?.toString().toLowerCase();
    const userType = user?.user_type?.toString().toLowerCase();

    const isAdmin = userRole === 'admin';
    const isEmployer = userType === 'employer' || userRole === 'employer';
    const isSeeker = userType === 'seeker' || userRole === 'seeker';

    const fetchUserApplications = useCallback(async () => {
        if (!token || !isSeeker) return;
        try {
            const res = await fetch("http://127.0.0.1:5000/applications", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                const ids = data.map((app: ApplicationResponse) => app.job_id || app.job?.id).filter(Boolean) as number[];
                setAppliedJobIds(ids);
            }
        } catch (err) {
            console.error("Error fetching user apps:", err);
        }
    }, [token, isSeeker]);

    const fetchJobs = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("http://127.0.0.1:5000/jobs");
            const data = await res.json();
            setJobs(data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
        fetchUserApplications();
    }, [fetchJobs, fetchUserApplications]);

    const handleApply = async (jobId: number) => {
        if (!token || loadingJobId) return;
        setLoadingJobId(jobId);
        try {
            const res = await fetch("http://127.0.0.1:5000/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ job_id: jobId })
            });
            const result = await res.json();
            if (res.ok) {
                setSuccessJobId(jobId);
                setAppliedJobIds(prev => [...prev, jobId]);
                // Show success animation for 2 seconds
                setTimeout(() => setSuccessJobId(null), 2000);
            } else {
                setMessage({ text: result.message || "Failed to apply.", isError: true });
            }
        } catch (err) {
            console.error("Apply error:", err);
            setMessage({ text: "Connection error.", isError: true });
        } finally {
            setLoadingJobId(null);
        }
    };

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
            if (result.success) {
                setJobs(prev => [result.job, ...prev]);
                setFormData({ company: "", job_title: "", job_description: "", salary: "" });
                setSuccessSubmit(true);
                setTimeout(() => setSuccessSubmit(false), 3000);
            } else {
                setMessage({ text: result.message, isError: true });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            setMessage({ text: "Failed to connect to server.", isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (jobId: number) => {
        if (!window.confirm("Delete this entry?") || !token) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/jobs/${jobId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                setJobs(prev => prev.filter((j) => j.id !== jobId));
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white p-6'>
            {/* Header / Navbar */}
            <div className='flex items-center justify-between mb-12 px-4 max-w-7xl mx-auto pt-10'>
                <Link href="/" className='flex items-center gap-2 group'>
                    <SiWorkplace className='text-orange-500 text-3xl group-hover:rotate-12 transition-transform' />
                    <p className='italic text-2xl tracking-tighter'>vacan<span className='font-black text-orange-500 not-italic'>C</span></p>
                </Link>
                <Navbar />
                <div className='flex items-center gap-4'>
                    <div className='hidden lg:flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-2xl group focus-within:border-orange-500/50 transition-all'>
                         <input type='text' placeholder='Search listings...' className='bg-transparent text-sm outline-none w-48' />
                    </div>
                    <Link href="/seeker/profile" className='hover:scale-105 transition-transform'>
                        <div className='w-11 h-11 rounded-2xl border-2 border-orange-500/30 p-0.5 overflow-hidden'>
                            <div className='relative w-full h-full rounded-xl overflow-hidden'>
                                <Image src='/usericon.png' alt='profile' fill className='object-cover' />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-12 gap-8 max-w-7xl mx-auto'>
                {/* Left Column */}
                <div className='md:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600'></div>
                        <div className='relative w-24 h-24 mx-auto mb-4 p-1 border-2 border-dashed border-gray-600 rounded-full group-hover:border-orange-500 transition-colors'>
                            <Image className='rounded-full object-cover' src='/usericon.png' alt='avatar' fill />
                        </div>
                        <h2 className='text-xl font-black tracking-tight'>{user?.username || "Guest"}</h2>
                        <p className='text-xs text-gray-500 font-medium mb-3 uppercase tracking-widest'>
                            {isAdmin ? '🛡️ Admin' : isEmployer ? '🏢 Employer' : '🚀 Seeker'}
                        </p>
                    </div>

                    <div className='bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl'>
                        <div className='p-4 bg-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 px-6'>Navigation</div>
                        {isSeeker && (
                            <Link href="/seeker/applied" className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
                                <TbBadgeFilled className='text-green-400' size={20} /> Applications
                            </Link>
                        )}
                        {isEmployer && (
                             <Link href="/employer/applicants" className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
                                <FaPeopleGroup className='text-blue-400' size={20} /> Applicants
                             </Link>
                        )}
                        <Link href="/jobs" className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm'>
                            <TbBriefcase className='text-orange-500' size={20} /> Browse All
                        </Link>
                    </div>
                </div>

                {/* Middle Column: Feed */}
                <div className='md:col-span-6 space-y-6'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-3xl font-black tracking-tighter'>Active Nodes</h1>
                        <button onClick={fetchJobs} className={`p-2 rounded-full hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
                             <FaBars className='text-orange-500' />
                        </button>
                    </div>

                    {message.text && (
                         <div className={`p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center border animate-in fade-in slide-in-from-top-2 duration-300 ${message.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className='space-y-4 overflow-y-auto pr-3 custom-scrollbar' style={{ maxHeight: 'calc(100vh - 280px)' }}>
                        {jobs.map((kazi) => {
                            const alreadyApplied = appliedJobIds.includes(kazi.id);
                            const isThisLoading = loadingJobId === kazi.id;
                            const isThisSuccess = successJobId === kazi.id;
                            
                            return (
                                <div key={kazi.id} className='bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.08] transition-all group relative'>
                                    <div className='flex gap-5'>
                                        <div className='w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0'>
                                            <Image src='/rocket1.png' width={32} height={32} alt='icon' />
                                        </div>
                                        <div className='flex-1'>
                                            <h3 className='font-bold text-orange-400 text-lg'>{kazi.job_title}</h3>
                                            <p className='text-sm font-semibold text-gray-300'>{kazi.company}</p>
                                            <p className='text-xs text-gray-400 mt-2 line-clamp-2'>{kazi.job_description}</p>
                                            <div className='mt-6 flex items-center justify-between'>
                                                <span className='text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20'>
                                                    {kazi.salary || "Competitive"}
                                                </span>
                                                
                                                {isSeeker && (
                                                    (alreadyApplied && !isThisSuccess) ? (
                                                        <div className='flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-xl border border-green-500/30 text-[10px] font-bold uppercase tracking-wider animate-in fade-in zoom-in-95'>
                                                            <FaCheckDouble size={14} /> Applied Already
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            disabled={loadingJobId !== null || alreadyApplied}
                                                            onClick={() => handleApply(kazi.id)}
                                                            className={`text-xs px-6 py-2 rounded-xl transition-all font-bold shadow-lg flex items-center gap-2 min-w-[120px] justify-center 
                                                                ${isThisSuccess ? 'bg-green-500 text-white scale-105 shadow-green-900/40' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'}`}
                                                        >
                                                            {isThisLoading ? (
                                                                <ImSpinner2 className="animate-spin" />
                                                            ) : isThisSuccess ? (
                                                                <FaCheck className="animate-bounce" />
                                                            ) : "Quick Apply"}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button onClick={() => handleDelete(kazi.id)} className='absolute top-6 right-6 p-2 text-gray-500 hover:text-red-500 transition-colors'>
                                            <FaTrash size={12} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className='md:col-span-3 space-y-6'>
                    {(isEmployer || isAdmin) ? (
                        <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative'>
                            <h2 className='text-lg font-black tracking-tight mb-6 flex items-center gap-2'>
                                <MdPostAdd className='text-orange-500' /> Post Vacancy
                            </h2>
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                <input name='company' value={formData.company} onChange={handleInput} placeholder='Brand Name' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-orange-500/50' required />
                                <input name='job_title' value={formData.job_title} onChange={handleInput} placeholder='Position' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-orange-500/50' required />
                                <textarea name='job_description' value={formData.job_description} onChange={handleInput} placeholder='Objectives...' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-orange-500/50 h-28 resize-none' required />
                                <input name='salary' value={formData.salary} onChange={handleInput} placeholder='Budget' className='w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs outline-none focus:border-orange-500/50' />
                                <button 
                                    disabled={isSubmitting}
                                    className={`w-full font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50
                                        ${successSubmit ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110'}`}
                                >
                                    {isSubmitting ? (
                                        <ImSpinner2 className="animate-spin" size={14}/>
                                    ) : successSubmit ? (
                                        <><FaCheck size={14}/> Successfully Posted</>
                                    ) : "Broadcast Job"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className='bg-gradient-to-br from-orange-600/10 to-transparent border border-white/5 p-8 rounded-[2.5rem] text-center'>
                             <TbBriefcase className='text-orange-500 mx-auto mb-4' size={32} />
                            <h4 className='text-sm font-bold'>Employer Mode</h4>
                            <p className='text-[11px] text-gray-500 mt-3 leading-relaxed'>Validated employer accounts can deploy vacancies here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobsPage;