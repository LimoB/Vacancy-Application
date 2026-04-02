/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { FaTrash, FaPeopleGroup, FaCheckDouble, FaCheck, FaEye, FaArrowRight, FaRotateRight, FaTerminal, FaXmark } from "react-icons/fa6";
import { TbBadgeFilled, TbBriefcase } from "react-icons/tb";
import { useAuth } from '@/src/context/AuthContext';
import { Job, Application } from '@/src/types';
import { MdPostAdd } from 'react-icons/md';
import { ImSpinner2 } from "react-icons/im";

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
    
    // UI Feedback States
    const [message, setMessage] = useState({ text: "", isError: false });
    const [serverNotification, setServerNotification] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingJobId, setLoadingJobId] = useState<number | null>(null);
    const [successJobId, setSuccessJobId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successSubmit, setSuccessSubmit] = useState(false);

    // Normalize roles for logic
    const userRole = user?.user_role?.toString().toLowerCase();
    const userType = user?.user_type?.toString().toLowerCase();
    const isAdmin = userRole === 'admin';
    const isEmployer = userType === 'employer' || userRole === 'employer';
    const isSeeker = !isAdmin && !isEmployer;

    // --- API ACTIONS ---

const fetchApplications = useCallback(async () => {
    if (!token) return;
    
    try {
        const res = await fetch("http://127.0.0.1:5000/applications", {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data: Application[] = await res.json();
        
        if (Array.isArray(data)) {
            // Replaced (app: any) with (app: Application)
            const ids = data.map((app: Application) => app.job_id);
            setAppliedJobIds(ids);
        }
    } catch (err) {
        console.error("Link Failure: Applications feed unreachable", err);
    }
}, [token]);

    const fetchJobs = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("http://127.0.0.1:5000/jobs");
            const data = await res.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Link Failure: Global job feed offline", err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [fetchJobs, fetchApplications]);

    // --- HANDLERS ---

    const handleApply = async (jobId: number) => {
        if (!token || loadingJobId) return;
        setLoadingJobId(jobId);
        setMessage({ text: "", isError: false });

        try {
            const res = await fetch("http://127.0.0.1:5000/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ job_id: jobId })
            });
            
            const data = await res.json();

            if (res.ok) {
                setSuccessJobId(jobId);
                setAppliedJobIds(prev => [...prev, jobId]);
                // Set the automated message from backend
                setServerNotification(data.message || "Transmission success. Application logged in core.");
                setTimeout(() => { setSuccessJobId(null); }, 3000);
            } else {
                setMessage({ text: data.message || "Protocol Error: Already Applied.", isError: true });
            }
        } catch (err) {
            setMessage({ text: "Critical Link Failure.", isError: true });
        } finally {
            setLoadingJobId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || isSubmitting) return;
        setIsSubmitting(true);
        setMessage({ text: "", isError: false });

        try {
            const response = await fetch("http://127.0.0.1:5000/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newJob = await response.json();
                setJobs(prev => [newJob, ...prev]);
                setFormData({ company: "", job_title: "", job_description: "", salary: "" });
                setSuccessSubmit(true);
                setMessage({ text: "Node deployed to global feed.", isError: false });
                setTimeout(() => { setSuccessSubmit(false); setMessage({ text: "", isError: false }); }, 3000);
            } else {
                setMessage({ text: "Security override: Deployment unauthorized.", isError: true });
            }
        } catch (err) {
            setMessage({ text: "Sync lost with central server.", isError: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (jobId: number) => {
        if (!window.confirm("Confirm deletion: Permanent purge of node from system?")) return;
        try {
            const response = await fetch(`http://127.0.0.1:5000/jobs/${jobId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                setJobs(prev => prev.filter((j) => j.id !== jobId));
                setMessage({ text: "Node purged successfully.", isError: false });
                setTimeout(() => setMessage({ text: "", isError: false }), 3000);
            }
        } catch (error) {
            console.error("Purge failed:", error);
        }
    };

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-6 selection:bg-orange-500/30'>
            
            {/* --- SYSTEM NOTIFICATION OVERLAY --- */}
            {serverNotification && (
                <div className="fixed bottom-10 right-10 z-[200] w-full max-w-sm animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-[#080625] border border-orange-500/30 p-6 rounded-[2rem] shadow-2xl shadow-orange-900/20 backdrop-blur-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-xl text-orange-400">
                                <FaTerminal size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1">Incoming Signal</p>
                                <p className="text-xs font-medium italic text-gray-200 leading-relaxed">&quot;{serverNotification}&quot;</p>
                            </div>
                            <button onClick={() => setServerNotification(null)} className="text-gray-600 hover:text-white">
                                <FaXmark />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className='flex items-center justify-between mb-12 px-4 max-w-7xl mx-auto pt-6 border-b border-white/5 pb-8'>
                <div className='flex flex-col'>
                    <Link href="/" className='flex items-center gap-2 group mb-1'>
                        <SiWorkplace className='text-orange-500 text-2xl group-hover:rotate-12 transition-transform' />
                        <p className='italic text-xl font-black tracking-tighter uppercase'>Vacan<span className='text-orange-500 not-italic'>C</span></p>
                    </Link>
                    <span className='text-[8px] uppercase tracking-[0.4em] text-gray-500 font-black'>Sector OS v2.4.0</span>
                </div>
                <Navbar />
                <div className='flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-2xl border border-white/10'>
                    <Link href={getProfileLink(userRole, userType)} className='w-10 h-10 rounded-xl border-2 border-orange-500/30 overflow-hidden relative'>
                        <Image src={user?.profile_picture || '/usericon.png'} alt='profile' fill className='object-cover' />
                    </Link>
                    <div className='hidden sm:block'>
                        <p className='text-xs font-black truncate max-w-[100px]'>{user?.username || "Guest_Node"}</p>
                        <p className='text-[8px] uppercase font-black text-orange-500 animate-pulse'>Secure Connection</p>
                    </div>
                </div>
            </header>

            {message.text && (
                <div className={`max-w-7xl mx-auto mb-8 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center border animate-in slide-in-from-top-4 duration-300 ${message.isError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    {message.text}
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-12 gap-10 max-w-7xl mx-auto'>
                <aside className='md:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group'>
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isAdmin ? 'from-red-600 to-red-400' : 'from-orange-600 to-purple-600'}`}></div>
                        <div className='relative w-24 h-24 mx-auto mb-6 p-1.5 border-2 border-dashed border-gray-700 rounded-full'>
                            <Image className='rounded-full object-cover' src={user?.profile_picture || '/usericon.png'} alt='avatar' fill />
                        </div>
                        <h2 className='text-xl font-black tracking-tight mb-1'>{user?.username || "Unknown_User"}</h2>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAdmin ? 'text-red-500' : 'text-orange-500'}`}>
                            {isAdmin ? '🛡️ Global Admin' : isEmployer ? '🏢 Employer Node' : '🚀 Seeker Node'}
                        </p>
                        
                        <Link href={isEmployer ? "/employer/applicants" : "/seeker/applied"} className='mt-8 flex items-center justify-center gap-3 bg-white/5 hover:bg-orange-600 hover:text-white transition-all py-4 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest group'>
                             {isEmployer ? "Manage Recruitment" : "Application History"} <FaArrowRight className='group-hover:translate-x-1 transition-transform'/>
                        </Link>
                    </div>

                    <div className='bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden'>
                        <div className='p-5 bg-white/5 text-[9px] uppercase tracking-[0.2em] font-black text-gray-500 px-8 border-b border-white/5'>Sector Navigation</div>
                        {isSeeker && (
                            <Link href="/seeker/applied" className='w-full flex items-center gap-4 px-8 py-5 hover:bg-white/10 transition-all text-xs font-bold border-b border-white/5'>
                                <TbBadgeFilled className='text-green-500' size={18} /> Active Offers
                            </Link>
                        )}
                        {isEmployer && (
                             <Link href="/employer/applicants" className='w-full flex items-center gap-4 px-8 py-5 hover:bg-white/10 transition-all text-xs font-bold border-b border-white/5'>
                                <FaPeopleGroup className='text-blue-500' size={18} /> Incoming Talent
                             </Link>
                        )}
                        <Link href="/jobs" className='w-full flex items-center gap-4 px-8 py-5 hover:bg-white/10 transition-all text-xs font-bold'>
                            <TbBriefcase className='text-orange-500' size={18} /> Global Uplink
                        </Link>
                    </div>
                </aside>

                <main className='md:col-span-6 space-y-6'>
                    <div className='flex items-center justify-between px-2'>
                        <h1 className='text-3xl font-black tracking-tighter'>
                            {isEmployer && !isAdmin ? "Managed Nodes" : "Global Job Sync"}
                        </h1>
                        <button onClick={fetchJobs} className={`p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin text-orange-500' : 'text-gray-500'}`}>
                            <FaRotateRight />
                        </button>
                    </div>

                    <div className='space-y-5 overflow-y-auto pr-2 custom-scrollbar' style={{ maxHeight: '75vh' }}>
                        {jobs.length > 0 ? jobs.map((job) => {
                            const alreadyApplied = appliedJobIds.includes(job.id);
                            const isApplying = loadingJobId === job.id;
                            const isSuccessful = successJobId === job.id;
                            const isOwner = (job.employer_id === user?.id) || isAdmin;

                            return (
                                <div key={job.id} className='bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.08] transition-all group relative shadow-xl'>
                                    <div className='flex gap-6'>
                                        <div className='w-14 h-14 bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl flex items-center justify-center border border-white/10 shrink-0'>
                                            <Image src='/rocket1.png' width={30} height={30} alt='icon' className='opacity-80' />
                                        </div>
                                        <div className='flex-1'>
                                            <h3 className='font-black text-orange-400 text-lg tracking-tight mb-1'>{job.job_title}</h3>
                                            <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest'>{job.company}</p>
                                            <p className='text-xs text-gray-500 mt-4 line-clamp-2 leading-relaxed'>{job.job_description}</p>
                                            
                                            <div className='mt-8 flex items-center justify-between'>
                                                <span className='text-[10px] font-black text-green-400 bg-green-400/5 px-4 py-2 rounded-xl border border-green-400/10 uppercase tracking-widest'>
                                                    {job.salary || "TBD"}
                                                </span>
                                                
                                                <div className='flex items-center gap-3'>
                                                    {isSeeker && (
                                                        alreadyApplied && !isSuccessful ? (
                                                            <div className='text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20 flex items-center gap-2'>
                                                                <FaCheckDouble /> Applied
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                disabled={isApplying}
                                                                onClick={() => handleApply(job.id)}
                                                                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95
                                                                    ${isSuccessful ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}
                                                            >
                                                                {isApplying ? <ImSpinner2 className='animate-spin' /> : isSuccessful ? <FaCheck /> : "Initiate Apply"}
                                                            </button>
                                                        )
                                                    )}

                                                    {(isEmployer && isOwner) && (
                                                        <Link href="/employer/applicants" className='text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors bg-white/5 px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-2'>
                                                            <FaEye /> Stats
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button onClick={() => handleDelete(job.id)} className='absolute top-8 right-8 p-2 text-gray-700 hover:text-red-500 transition-colors'>
                                            <FaTrash size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className='py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]'>
                                <TbBriefcase className='mx-auto text-gray-800 mb-6' size={64}/>
                                <p className='text-gray-600 font-black uppercase text-[10px] tracking-widest'>No active sectors detected.</p>
                            </div>
                        )}
                    </div>
                </main>

                <aside className='md:col-span-3'>
                    {(isEmployer || isAdmin) ? (
                        <div className='bg-[#0c093d] border border-white/10 p-8 rounded-[3rem] shadow-2xl sticky top-8'>
                            <div className='flex items-center gap-3 mb-8'>
                                <div className='w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]'></div>
                                <h2 className='text-lg font-black tracking-tight uppercase'>Post Vacancy</h2>
                            </div>
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                <input 
                                    name='job_title' 
                                    value={formData.job_title} 
                                    onChange={(e) => setFormData({...formData, job_title: e.target.value})} 
                                    placeholder='Job Title' 
                                    className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 transition-all text-white' 
                                    required 
                                />
                                <input 
                                    name='company' 
                                    value={formData.company} 
                                    onChange={(e) => setFormData({...formData, company: e.target.value})} 
                                    placeholder='Company Name' 
                                    className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 transition-all text-white' 
                                    required 
                                />
                                <input 
                                    name='salary' 
                                    value={formData.salary} 
                                    onChange={(e) => setFormData({...formData, salary: e.target.value})} 
                                    placeholder='Salary (e.g. 100k - 150k)' 
                                    className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 transition-all text-white' 
                                />
                                <textarea 
                                    name='job_description' 
                                    value={formData.job_description} 
                                    onChange={(e) => setFormData({...formData, job_description: e.target.value})} 
                                    placeholder='Description & Requirements' 
                                    className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-orange-500 h-32 resize-none transition-all text-white' 
                                    required 
                                />
                                
                                <button 
                                    disabled={isSubmitting}
                                    type="submit"
                                    className={`w-full font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3
                                        ${successSubmit ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}
                                >
                                    {isSubmitting ? <ImSpinner2 className="animate-spin" /> : successSubmit ? <FaCheck /> : <><MdPostAdd size={18}/> Deploy Node</>}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className='bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center sticky top-8'>
                            <SiWorkplace className='text-orange-500/20 text-6xl mx-auto mb-6' />
                            <h4 className='text-xs font-black uppercase tracking-widest mb-4'>Interface Locked</h4>
                            <p className='text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest'>Only validated employers can deploy new job nodes.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

const getProfileLink = (role?: string, type?: string) => {
    if (role === 'admin') return '/admin';
    if (type === 'employer' || role === 'employer') return '/employer';
    return '/seeker/profile';
};

export default JobsPage;