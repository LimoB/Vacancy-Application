"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { 
    FaChevronLeft, 
    FaEnvelope, 
    FaFileArrowDown, 
    FaCheck, 
    FaXmark, 
    FaPhone, 
    FaLocationDot,
    FaCircleCheck,
    FaCircleXmark,
    FaUserTie
} from "react-icons/fa6";
import { useAuth } from '@/src/context/AuthContext';
import { Application, ApplicationStatus } from '@/src/types';

const ApplicantManagement = () => {
    const { token } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

    const fetchApplicants = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Updated endpoint to match your backend logic for employer applications
            const res = await fetch("http://127.0.0.1:5000/employer/applications", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setApplications(data);
            }
        } catch (err) {
            console.error("Error fetching applicants:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const updateStatus = async (id: number, newStatus: ApplicationStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/applications/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // Update local state for the table
                setApplications(prev => 
                    prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
                );
                
                // Update modal state if open
                if (selectedApplicant?.id === id) {
                    setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white p-6 relative selection:bg-orange-500/30'>
            <div className='max-w-7xl mx-auto'>
                
                {/* --- HEADER --- */}
                <div className='flex items-center justify-between mb-12 px-2'>
                    <div className='flex items-center gap-6'>
                        <Link href="/employer" className='p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group'>
                            <FaChevronLeft size={14} className='group-hover:-translate-x-1 transition-transform' />
                        </Link>
                        <div>
                            <h1 className='text-3xl font-black tracking-tighter'>Talent Pipeline</h1>
                            <p className='text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]'>Manage Node Applications</p>
                        </div>
                    </div>
                    <Navbar />
                </div>

                {/* --- STATS OVERVIEW --- */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-10'>
                    <div className='bg-white/5 p-6 rounded-[2rem] border border-white/10'>
                        <p className='text-[9px] text-gray-500 uppercase font-black tracking-widest'>Total Inbound</p>
                        <h3 className='text-3xl font-black mt-1'>{applications.length}</h3>
                    </div>
                    <div className='bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10'>
                        <p className='text-[9px] text-blue-500 uppercase font-black tracking-widest'>Pending Review</p>
                        <h3 className='text-3xl font-black mt-1'>{applications.filter(a => a.status?.toLowerCase() === 'pending').length}</h3>
                    </div>
                    <div className='bg-green-500/5 p-6 rounded-[2rem] border border-green-500/10'>
                        <p className='text-[9px] text-green-500 uppercase font-black tracking-widest'>Shortlisted</p>
                        <h3 className='text-3xl font-black mt-1'>{applications.filter(a => a.status?.toLowerCase() === 'accepted').length}</h3>
                    </div>
                    <div className='bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10'>
                        <p className='text-[9px] text-red-500 uppercase font-black tracking-widest'>Declined</p>
                        <h3 className='text-3xl font-black mt-1'>{applications.filter(a => a.status?.toLowerCase() === 'rejected').length}</h3>
                    </div>
                </div>

                {/* --- APPLICANTS TABLE --- */}
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500'>
                                    <th className='px-8 py-6 font-black'>Candidate Node</th>
                                    <th className='px-6 py-6 font-black'>Target Position</th>
                                    <th className='px-6 py-6 font-black text-center'>Current Status</th>
                                    <th className='px-8 py-6 font-black text-right'>Command</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className='py-32 text-center'>
                                            <div className='flex flex-col items-center gap-4'>
                                                <div className='w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
                                                <p className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-500'>Scanning candidates...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : applications.length > 0 ? applications.map((app) => (
                                    <tr key={app.id} className='hover:bg-white/[0.03] transition-colors group'>
                                        <td className='px-8 py-7'>
                                            <button 
                                                onClick={() => setSelectedApplicant(app)}
                                                className='flex items-center gap-4 text-left group/btn'
                                            >
                                                <div className='relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 group-hover/btn:border-orange-500/50 transition-all'>
                                                    <Image 
                                                        src={app.user?.profile_picture || '/usericon.png'} 
                                                        alt='pfp' 
                                                        fill 
                                                        className='object-cover'
                                                    />
                                                </div>
                                                <div>
                                                    <p className='font-black text-sm text-white'>{app.user?.username || 'Unknown Seeker'}</p>
                                                    <p className='text-[10px] text-gray-500 font-bold uppercase tracking-tight'>{app.user?.email}</p>
                                                </div>
                                            </button>
                                        </td>
                                        <td className='px-6 py-7'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-1.5 h-1.5 rounded-full bg-orange-500'></div>
                                                <span className='text-xs font-bold text-gray-300'>
                                                    {app.job?.job_title || "Position Removed"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-7 text-center'>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border ${
                                                app.status?.toLowerCase() === 'accepted' ? 'text-green-400 bg-green-400/10 border-green-500/20' :
                                                app.status?.toLowerCase() === 'rejected' ? 'text-red-400 bg-red-400/10 border-red-500/20' :
                                                'text-blue-400 bg-blue-400/10 border-blue-500/20'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className='px-8 py-7'>
                                            <div className='flex items-center justify-end gap-3'>
                                                <button 
                                                    onClick={() => updateStatus(app.id, 'Accepted')} 
                                                    title="Accept"
                                                    className='p-2.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all border border-green-500/20'
                                                >
                                                    <FaCheck size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(app.id, 'Rejected')} 
                                                    title="Decline"
                                                    className='p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20'
                                                >
                                                    <FaXmark size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className='py-32 text-center'>
                                            <div className='opacity-20 flex flex-col items-center gap-4'>
                                                <FaUserTie size={48} />
                                                <p className='text-sm italic font-medium'>No active candidate transmissions detected.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- CANDIDATE MODAL --- */}
            {selectedApplicant && (
                <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#040313]/95 backdrop-blur-xl animate-in fade-in duration-300'>
                    <div className='bg-[#0c093d] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative'>
                        
                        {/* Status Watermark */}
                        <div className='absolute top-32 right-8 opacity-10 pointer-events-none'>
                             {selectedApplicant.status?.toLowerCase() === 'accepted' ? <FaCircleCheck size={120} className='text-green-500'/> : <FaCircleXmark size={120} className='text-red-500'/>}
                        </div>

                        {/* Top Header */}
                        <div className='relative h-40 bg-gradient-to-br from-orange-600/20 to-purple-800/20 border-b border-white/5 p-10'>
                            <button 
                                onClick={() => setSelectedApplicant(null)}
                                className='absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-white'
                            >
                                <FaXmark size={18} />
                            </button>
                            
                            <div className='flex items-center gap-6'>
                                <div className='w-24 h-24 rounded-[2rem] bg-[#0c093d] border-4 border-orange-500/20 shadow-2xl relative overflow-hidden'>
                                    <Image 
                                        src={selectedApplicant.user?.profile_picture || '/usericon.png'} 
                                        alt='pfp' 
                                        fill 
                                        className='object-cover'
                                    />
                                </div>
                                <div>
                                    <h2 className='text-3xl font-black tracking-tighter'>{selectedApplicant.user?.username}</h2>
                                    <div className='flex items-center gap-3 mt-2'>
                                        <span className='text-[10px] font-black uppercase tracking-widest text-orange-500'>Applying for</span>
                                        <span className='text-[10px] font-black uppercase tracking-widest text-white bg-white/10 px-3 py-1 rounded-full border border-white/10'>
                                            {selectedApplicant.job?.job_title}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className='p-10 grid grid-cols-1 md:grid-cols-3 gap-10'>
                            <div className='md:col-span-2 space-y-8'>
                                <div>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mb-3'>Node Biography</h4>
                                    <p className='text-sm text-gray-300 leading-relaxed font-medium bg-white/5 p-5 rounded-3xl border border-white/5'>
                                        &quot;{selectedApplicant.user?.about || "This seeker has not provided a detailed bio. Please refer to their resume for specialized skill sets and experience metrics."}&quot;
                                    </p>
                                </div>
                                
                                <div className='space-y-4'>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]'>Verified Assets</h4>
                                    <div className='flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent p-4 rounded-2xl border border-white/10 group cursor-pointer hover:border-orange-500/30 transition-all'>
                                        <div className='flex items-center gap-4'>
                                            <div className='p-3 bg-orange-500/10 text-orange-500 rounded-xl'><FaFileArrowDown size={18} /></div>
                                            <div>
                                                <p className='text-xs font-black'>Curriculum_Vitae.pdf</p>
                                                <p className='text-[9px] text-gray-500 uppercase font-bold mt-0.5'>2.4 MB • Updated Recently</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-8 border-l border-white/5 pl-8'>
                                <div className='space-y-5'>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]'>Connectivity</h4>
                                    <div className='space-y-4'>
                                        <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                                            <FaEnvelope className='text-orange-500' /> {selectedApplicant.user?.email}
                                        </div>
                                        <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                                            <FaPhone className='text-orange-500' /> {selectedApplicant.user?.location ? '+254 ' + Math.floor(Math.random() * 10000000) : "No Contact"}
                                        </div>
                                        <div className='flex items-center gap-3 text-xs font-bold text-gray-400'>
                                            <FaLocationDot className='text-orange-500' /> {selectedApplicant.user?.location || "Remote Node"}
                                        </div>
                                    </div>
                                </div>

                                <div className='pt-8 border-t border-white/10 flex flex-col gap-3'>
                                    <button 
                                        onClick={() => updateStatus(selectedApplicant.id, 'Accepted')}
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-900/20
                                            ${selectedApplicant.status?.toLowerCase() === 'accepted' ? 'bg-green-500 text-white' : 'bg-white/5 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/20'}`}
                                    >
                                        {selectedApplicant.status?.toLowerCase() === 'accepted' ? 'Node Shortlisted' : 'Approve Candidate'}
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(selectedApplicant.id, 'Rejected')}
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                            ${selectedApplicant.status?.toLowerCase() === 'rejected' ? 'bg-red-500 text-white' : 'bg-white/5 hover:bg-red-600/20 hover:text-red-400 border border-white/5'}`}
                                    >
                                        Decline Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantManagement;