/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { FaCheck, FaCloudUploadAlt, FaMap, FaSearch, FaTerminal, FaTimes } from "react-icons/fa"; 
import { useAuth } from '@/src/context/AuthContext';
import { Job } from '@/src/types';
import { ImSpinner2 } from "react-icons/im";

const SeekerJobsPage = () => {
    const { user, token, setUser } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [applyingId, setApplyingId] = useState<number | null>(null);
    const [successId, setSuccessId] = useState<number | null>(null);
    const [serverMessage, setServerMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5000/jobs");
            const data = await res.json();
            if (Array.isArray(data)) setJobs(data);
        } catch (err) {
            console.error("Registry Sync Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleApplyProcess = async (jobId: number) => {
        if (user?.cv_url) {
            // QUICK APPLY MODE
            setApplyingId(jobId);
            try {
                const res = await fetch("http://127.0.0.1:5000/applications", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ job_id: jobId })
                });
                const data = await res.json();
                
                if (res.ok) {
                    setSuccessId(jobId);
                    // Set the warm message from backend
                    setServerMessage(data.message || "Application successfully transmitted to the employer node.");
                }
            } catch (err) {
                alert("Quick Apply failed.");
            } finally {
                setApplyingId(null);
            }
        } else {
            // UPLOAD MODE
            setSelectedJobId(jobId);
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedJobId || !token) return;

        setApplyingId(selectedJobId);
        const formData = new FormData();
        formData.append('job_id', selectedJobId.toString());
        formData.append('cv', file);

        try {
            const response = await fetch("http://127.0.0.1:5000/applications", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                setSuccessId(selectedJobId);
                setServerMessage(data.message || "CV Uploaded and application transmitted successfully.");
            }
        } catch (error) {
            console.error("Transmission Interrupted.");
        } finally {
            setApplyingId(null);
            setSelectedJobId(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#080625] to-[#0c093d] text-white selection:bg-orange-500/30'>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />

            {/* --- SUCCESS MESSAGE OVERLAY --- */}
            {serverMessage && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-lg animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-[#0c093d] border border-green-500/30 p-6 rounded-[2.5rem] shadow-2xl shadow-green-900/20 backdrop-blur-2xl flex items-start gap-5">
                        <div className="bg-green-500/20 p-3 rounded-2xl text-green-400 shrink-0">
                            <FaTerminal size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60 mb-1">Incoming Transmission:</p>
                            <p className="text-sm font-medium italic text-green-100 leading-relaxed">&quot;{serverMessage}&quot;</p>
                        </div>
                        <button onClick={() => setServerMessage(null)} className="text-gray-500 hover:text-white transition-colors">
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            <header className='sticky top-0 z-[100] backdrop-blur-xl border-b border-white/5'>
                <div className='max-w-7xl mx-auto flex items-center justify-between px-6 py-6'>
                    <Link href="/" className='flex items-center gap-2 group'>
                        <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                            <SiWorkplace className='text-white text-xl' />
                        </div>
                        <p className='italic text-2xl tracking-tighter font-black uppercase'>vacan<span className='text-orange-500 not-italic'>C</span></p>
                    </Link>
                    
                    <div className='hidden lg:flex items-center bg-white/5 border border-white/10 px-6 py-3 rounded-2xl w-96 gap-3 focus-within:border-orange-500/50 transition-colors'>
                        <FaSearch className='text-gray-500 text-sm' />
                        <input 
                            type='text' placeholder='Search vacancy nodes...' value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none w-full placeholder:text-gray-700' 
                        />
                    </div>
                    <Navbar />
                </div>
            </header>

            <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 p-6 md:p-10'>
                <aside className='md:col-span-3 space-y-6'>
                    <div className='bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] text-center relative overflow-hidden group'>
                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-indigo-500'></div>
                        <div className='relative w-28 h-28 mx-auto mb-6 p-1 border-2 border-dashed border-gray-700 rounded-full group-hover:border-orange-500/50 transition-colors'>
                            <Image className='rounded-full object-cover p-1' src={user?.profile_picture || '/usericon.png'} alt='avatar' fill sizes="112px" />
                        </div>
                        <h2 className='text-2xl font-black tracking-tighter uppercase'>{user?.username || "Guest"}</h2>
                        
                        <div className={`mt-4 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest mx-auto w-fit transition-colors ${user?.cv_url ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-red-500/20 text-red-400 bg-red-500/5'}`}>
                            {user?.cv_url ? 'CV Synchronized' : 'CV Missing'}
                        </div>
                    </div>
                </aside>

                <main className='md:col-span-9 space-y-8'>
                    <div className='grid gap-6 overflow-y-auto pr-2 custom-scrollbar' style={{ maxHeight: 'calc(100vh - 280px)' }}>
                        {loading ? (
                            <div className='py-32 text-center flex flex-col items-center gap-4'>
                                <ImSpinner2 className="text-4xl text-orange-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Decrypting Registry</p>
                            </div>
                        ) : filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <div key={job.id} className='bg-white/5 border border-white/10 p-8 rounded-[3rem] hover:bg-white/[0.07] transition-all group relative overflow-hidden'>
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full group-hover:bg-orange-500/10 transition-colors"></div>
                                    
                                    <div className='flex flex-col md:flex-row gap-8 relative z-10'>
                                        <div className='w-20 h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-white/10 group-hover:border-orange-500/30 transition-colors'>
                                            <Image src='/rocket1.png' width={40} height={40} alt='icon' className="group-hover:rotate-12 transition-transform" />
                                        </div>
                                        
                                        <div className='flex-1'>
                                            <div className='flex justify-between items-start'>
                                                <div>
                                                    <h3 className='font-black text-2xl uppercase group-hover:text-orange-400 transition-colors'>{job.job_title}</h3>
                                                    <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 flex items-center gap-2'>
                                                        <SiWorkplace className="text-indigo-500" /> {job.company}
                                                    </p>
                                                </div>
                                                <span className='text-[10px] font-black text-green-400 bg-green-400/10 px-5 py-2 rounded-full border border-green-400/20'>
                                                    {job.salary || "KSH 75k+"}
                                                </span>
                                            </div>
                                            
                                            <div className='mt-8 flex gap-4'>
                                                <button 
                                                    disabled={applyingId !== null || successId === job.id}
                                                    onClick={() => handleApplyProcess(job.id)}
                                                    className={`px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center gap-3 active:scale-95
                                                        ${successId === job.id ? 'bg-green-600 cursor-default' : user?.cv_url ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-900/20' : 'bg-orange-600 hover:bg-orange-500 shadow-xl shadow-orange-900/20'}`}
                                                >
                                                    {applyingId === job.id ? <ImSpinner2 className="animate-spin text-lg" /> : 
                                                     successId === job.id ? <FaCheck /> : 
                                                     user?.cv_url ? <FaMap className="text-yellow-400" /> : <FaCloudUploadAlt />}
                                                    
                                                    {applyingId === job.id ? "Processing..." : 
                                                     successId === job.id ? "Applied" : 
                                                     user?.cv_url ? "Quick Apply" : "Upload & Apply"}
                                                </button>

                                                <Link href={`/jobs/${job.id}`} className="px-6 py-4 border border-white/10 hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center opacity-50">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">No matching nodes found in registry</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SeekerJobsPage;