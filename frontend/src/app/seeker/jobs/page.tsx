"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { CiLocationOn } from "react-icons/ci";
import { FaBars, FaCheck } from "react-icons/fa6";
import { TbBadgeFilled } from "react-icons/tb";
import { FaFilePdf, FaArrowRight } from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';
import { Job } from '@/src/types';
import { ImSpinner2 } from "react-icons/im";

const SeekerJobsPage = () => {
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // UI States for interactions
    const [applyingId, setApplyingId] = useState<number | null>(null);
    const [successId, setSuccessId] = useState<number | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5000/jobs");
            const data = await res.json();
            setJobs(data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const filteredJobs = jobs.filter(job => 
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApply = async (jobId: number) => {
        if (!token) return;
        setApplyingId(jobId);

        try {
            const response = await fetch("http://127.0.0.1:5000/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ job_id: jobId })
            });

            if (response.ok) {
                setSuccessId(jobId);
                setTimeout(() => setSuccessId(null), 3000);
            } else {
                const err = await response.json();
                console.error(err.message);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            console.error("Failed to submit application.");
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#080625] to-[#0c093d] text-white p-4 md:p-6'>
            
            {/* Header: Simplified - Profile/Logout is now in Navbar dropdown */}
            <header className='flex items-center justify-between mb-14 px-4 max-w-7xl mx-auto pt-8'>
                <Link href="/" className='flex items-center gap-2 group'>
                    <SiWorkplace className='text-orange-500 text-3xl group-hover:rotate-12 transition-transform' />
                    <p className='italic text-2xl tracking-tighter'>vacan<span className='font-black text-orange-500 not-italic'>C</span></p>
                </Link>
                
                <Navbar />

                <div className='hidden lg:flex items-center bg-white/5 border border-white/10 px-5 py-2 rounded-2xl focus-within:border-orange-500/50 transition-all'>
                    <input 
                        type='text' 
                        placeholder='Search nodes...' 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='bg-transparent text-xs outline-none w-48' 
                    />
                </div>
            </header>

            <div className='grid grid-cols-1 md:grid-cols-12 gap-8 max-w-7xl mx-auto'>
                
                {/* Left Sidebar: Contextual View */}
                <aside className='md:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600'></div>
                        <div className='relative w-24 h-24 mx-auto mb-5 p-1 border border-dashed border-gray-600 rounded-full'>
                            <Image 
                                className='rounded-full object-cover' 
                                src={user?.profile_picture || '/usericon.png'} 
                                alt='avatar' 
                                fill 
                            />
                        </div>
                        <h2 className='text-xl font-black tracking-tight'>{user?.username || "Guest Seeker"}</h2>
                        <p className='text-[10px] uppercase tracking-[0.2em] text-orange-400 font-bold mt-1'>
                            {user?.user_role || "Job Seeker"}
                        </p>
                        
                        <div className='mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-2'>
                            <div className='bg-white/5 p-3 rounded-2xl'>
                                <p className='text-lg font-bold'>14</p>
                                <p className='text-[8px] uppercase text-gray-500'>Saved</p>
                            </div>
                            <div className='bg-white/5 p-3 rounded-2xl'>
                                <p className='text-lg font-bold text-orange-500'>3</p>
                                <p className='text-[8px] uppercase text-gray-500'>Active</p>
                            </div>
                        </div>
                    </div>

                    <nav className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-xl'>
                        <div className='p-4 bg-white/5 text-[10px] uppercase tracking-widest font-black text-gray-500 px-6'>Resources</div>
                        <Link href="/seeker/applied" className='w-full flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-all text-xs font-bold border-b border-white/5'>
                            <span className='flex items-center gap-3'><TbBadgeFilled className='text-green-400' size={20} /> My Applications</span>
                            <FaArrowRight size={10} className='opacity-30' />
                        </Link>
                        <button className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-xs font-bold'>
                            <FaFilePdf className='text-red-400' size={18} /> Resume Builder
                        </button>
                    </nav>
                </aside>

                {/* Main Content: Job Feed */}
                <main className='md:col-span-9 space-y-6'>
                    <div className='flex items-end justify-between px-2'>
                        <div>
                            <h1 className='text-3xl font-black tracking-tight'>Active Opportunities</h1>
                            <p className='text-gray-400 text-sm mt-1'>Showing {filteredJobs.length} matches for your stack.</p>
                        </div>
                        <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/10'>
                            <FaBars className='text-orange-500' /> Filter Results
                        </div>
                    </div>

                    <div className='grid gap-4 overflow-y-auto pr-2 custom-scrollbar' style={{ maxHeight: 'calc(100vh - 240px)' }}>
                        {loading ? (
                            <div className='py-20 text-center animate-pulse text-gray-500 uppercase tracking-widest text-xs font-bold'>
                                Scanning Vacancy Nodes...
                            </div>
                        ) : filteredJobs.length > 0 ? filteredJobs.map((job) => (
                            <div key={job.id} className='bg-white/5 border border-white/10 p-6 rounded-[2.5rem] hover:bg-white/10 hover:border-orange-500/30 transition-all group relative'>
                                <div className='flex flex-col md:flex-row gap-6'>
                                    <div className='w-16 h-16 bg-gradient-to-br from-purple-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/5'>
                                        <Image src='/rocket1.png' width={32} height={32} alt='icon' className='group-hover:rotate-12 transition-transform' />
                                    </div>
                                    
                                    <div className='flex-1'>
                                        <div className='flex items-start justify-between'>
                                            <div>
                                                <h3 className='font-black text-xl text-white group-hover:text-orange-500 transition-colors'>{job.job_title}</h3>
                                                <div className='flex items-center gap-4 mt-1'>
                                                    <p className='text-sm font-bold text-gray-400 flex items-center gap-1'>
                                                        <SiWorkplace className='text-purple-500' /> {job.company}
                                                    </p>
                                                    <p className='text-xs text-gray-500 flex items-center gap-1'>
                                                        <CiLocationOn /> Hybrid
                                                    </p>
                                                </div>
                                            </div>
                                            <span className='text-xs font-black text-green-400 bg-green-400/10 px-4 py-1.5 rounded-full border border-green-400/20'>
                                                {job.salary || "Competitive"}
                                            </span>
                                        </div>
                                        
                                        <p className='text-xs text-gray-400 mt-4 leading-relaxed line-clamp-2 max-w-2xl'>
                                            {job.job_description}
                                        </p>

                                        <div className='mt-6 flex items-center gap-3'>
                                            <button 
                                                disabled={applyingId !== null || successId === job.id}
                                                onClick={() => handleApply(job.id)}
                                                className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2
                                                    ${successId === job.id ? 'bg-green-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'}
                                                    disabled:opacity-70`}
                                            >
                                                {applyingId === job.id ? (
                                                    <ImSpinner2 className="animate-spin" />
                                                ) : successId === job.id ? (
                                                    <FaCheck className="animate-in zoom-in" />
                                                ) : null}
                                                
                                                {applyingId === job.id ? "Syncing..." : successId === job.id ? "Applied" : "Apply Now"}
                                            </button>
                                            <Link 
                                                href={`/jobs/${job.id}`}
                                                className='px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10'
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className='text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10'>
                                <p className='text-gray-500 italic text-sm'>No vacancy matches for &quot;{searchTerm}&quot;</p>
                            </div>
                        )}
                    </div>
                </main>

            </div>
        </div>
    );
}

export default SeekerJobsPage;