"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { 
    FaChevronLeft, 
    FaFileArrowDown, 
    FaCheck, 
    FaXmark, 
    FaUserTie,
    FaShieldHalved,
    FaBuilding
} from "react-icons/fa6";
import { useAuth } from '@/src/context/AuthContext';
import { Application, ApplicationStatus } from '@/src/types';

const ApplicantManagement = () => {
    const { token, user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

    // --- STABLE ACCESS CONTROL ---
    const isAdmin = useMemo(() => {
        return user?.user_role?.toLowerCase() === 'admin';
    }, [user]);

    const fetchApplicants = useCallback(async () => {
        if (!token) {
            console.warn("Access Denied: No Auth Token found.");
            return;
        }
        setLoading(true);
        try {
            console.log("Fetching applications from backend...");
            const res = await fetch("http://127.0.0.1:5000/applications", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            
            const data = await res.json();
            console.log("RAW DATA FROM BACKEND:", data);
            
            if (Array.isArray(data)) {
                setApplications(data);
                if(data.length > 0) {
                    console.log("Structure Check (First Item):", {
                        app_id: data[0].id,
                        job_owner_obj: data[0].job?.employer?.id,
                        job_owner_fk: data[0].job?.employer_id
                    });
                }
            }
        } catch (err) {
            console.error("Link Failure: Talent feed unreachable", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // --- BULLETPROOF FILTER LOGIC ---
    const filteredApplications = useMemo(() => {
        if (!user || loading) return [];

        if (isAdmin) {
            console.log("⚡ Admin Override: Showing all", applications.length, "transmissions.");
            return applications;
        }

        const filtered = applications.filter(app => {
            // Check all possible ID locations based on Flask serialization
            const jobOwnerId =
                app.job?.employer?.id ||
                app.job?.employer_id ||
                (typeof app.job === 'object' && app.job !== null && 'user_id' in app.job ? (app.job as { user_id?: number }).user_id : undefined);

            if (!jobOwnerId) {
                console.warn(`Integrity Error: App #${app.id} has no valid Owner ID.`);
                return false;
            }

            const isMatch = String(jobOwnerId).trim() === String(user?.id).trim();
            
            if (!isMatch) {
                console.log(`Filtered: App #${app.id} (Owner ${jobOwnerId}) != Current User (${user.id})`);
            }

            return isMatch;
        });

        console.log("Filter Results:", filtered.length, "matches found.");
        return filtered;
    }, [applications, user, isAdmin, loading]);

    const updateStatus = async (id: number, newStatus: ApplicationStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/applications/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    status: newStatus.toLowerCase(),
                    message: newStatus.toLowerCase() === 'accepted' 
                        ? "Congratulations! Your profile has been shortlisted." 
                        : "Thank you for applying. We have reviewed your profile."
                })
            });

            if (response.ok) {
                setApplications(prev => 
                    prev.map(app => app.id === id ? { ...app, status: newStatus.toLowerCase() } : app)
                );
                if (selectedApplicant?.id === id) {
                    setSelectedApplicant(prev => prev ? { ...prev, status: newStatus.toLowerCase() } : null);
                }
            }
        } catch (error) {
            console.error("Protocol Error: Update failed", error);
        }
    };

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white p-6 relative selection:bg-orange-500/30'>
            <div className='max-w-7xl mx-auto'>
                
                {/* --- HEADER --- */}
                <div className='flex items-center justify-between mb-12 px-2'>
                    <div className='flex items-center gap-6'>
                        <Link href="/jobs" className='p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group'>
                            <FaChevronLeft size={14} className='group-hover:-translate-x-1 transition-transform' />
                        </Link>
                        <div>
                            <h1 className='text-3xl font-black tracking-tighter flex items-center gap-3'>
                                Talent Pipeline 
                                {isAdmin ? <FaShieldHalved className="text-red-500 text-xl" /> : <FaBuilding className="text-orange-500 text-xl" />}
                            </h1>
                            <p className='text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]'>
                                {isAdmin ? "Global Transmission Override" : "Manage Node Applications"}
                            </p>
                        </div>
                    </div>
                    <Navbar />
                </div>

                {/* --- STATS --- */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-10'>
                    <div className='bg-white/5 p-6 rounded-[2rem] border border-white/10'>
                        <p className='text-[9px] text-gray-500 uppercase font-black tracking-widest'>Total Inbound</p>
                        <h3 className='text-3xl font-black mt-1'>{filteredApplications.length}</h3>
                    </div>
                    <div className='bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10'>
                        <p className='text-[9px] text-blue-500 uppercase font-black tracking-widest'>Pending</p>
                        <h3 className='text-3xl font-black mt-1'>{filteredApplications.filter(a => a.status?.toLowerCase() === 'pending').length}</h3>
                    </div>
                    <div className='bg-green-500/5 p-6 rounded-[2rem] border border-green-500/10'>
                        <p className='text-[9px] text-green-500 uppercase font-black tracking-widest'>Shortlisted</p>
                        <h3 className='text-3xl font-black mt-1'>{filteredApplications.filter(a => a.status?.toLowerCase() === 'accepted').length}</h3>
                    </div>
                    <div className='bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10'>
                        <p className='text-[9px] text-red-500 uppercase font-black tracking-widest'>Declined</p>
                        <h3 className='text-3xl font-black mt-1'>{filteredApplications.filter(a => a.status?.toLowerCase() === 'rejected').length}</h3>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500'>
                                    <th className='px-8 py-6 font-black'>Candidate Node</th>
                                    <th className='px-6 py-6 font-black'>Target Position</th>
                                    <th className='px-6 py-6 font-black text-center'>Status</th>
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
                                ) : filteredApplications.length > 0 ? filteredApplications.map((app) => (
                                    <tr key={app.id} className='hover:bg-white/[0.03] transition-colors group'>
                                        <td className='px-8 py-7'>
                                            <button onClick={() => setSelectedApplicant(app)} className='flex items-center gap-4 text-left group/btn'>
                                                <div className='relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 group-hover/btn:border-orange-500/50 transition-all'>
                                                    <Image 
                                                        src={app.user?.profile_picture || '/usericon.png'} 
                                                        alt='pfp' 
                                                        fill 
                                                        sizes="48px"
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
                                                <span className='text-xs font-bold text-gray-300'>{app.job?.job_title}</span>
                                            </div>
                                            {isAdmin && <p className='text-[8px] text-orange-500 font-black mt-1 uppercase'>Owner ID: {app.job?.employer_id || app.job?.employer?.id}</p>}
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
                                                <button onClick={() => updateStatus(app.id, 'accepted')} className='p-2.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all border border-green-500/20 active:scale-90'>
                                                    <FaCheck size={14} />
                                                </button>
                                                <button onClick={() => updateStatus(app.id, 'rejected')} className='p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 active:scale-90'>
                                                    <FaXmark size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className='py-32 text-center'>
                                            <div className='opacity-20 flex flex-col items-center gap-4 mb-4'>
                                                <FaUserTie size={48} />
                                                <p className='text-sm italic font-medium uppercase tracking-widest'>No candidate nodes detected.</p>
                                            </div>
                                            <p className='text-[10px] text-gray-600 font-mono'>
                                                DEBUG: Role={user?.user_role} | ID={user?.id} | RawCount={applications.length}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            {selectedApplicant && (
                <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#040313]/95 backdrop-blur-xl animate-in fade-in'>
                    <div className='bg-[#0c093d] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative'>
                        <div className='relative h-40 bg-gradient-to-br from-orange-600/20 to-purple-800/20 border-b border-white/5 p-10'>
                            <button onClick={() => setSelectedApplicant(null)} className='absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all'>
                                <FaXmark size={18} />
                            </button>
                            <div className='flex items-center gap-6'>
                                <div className='w-24 h-24 rounded-[2rem] bg-[#0c093d] border-4 border-orange-500/20 relative overflow-hidden'>
                                    <Image 
                                        src={selectedApplicant.user?.profile_picture || '/usericon.png'} 
                                        alt='pfp' 
                                        fill 
                                        sizes="96px"
                                        className='object-cover'
                                    />
                                </div>
                                <div>
                                    <h2 className='text-3xl font-black tracking-tighter'>{selectedApplicant.user?.username}</h2>
                                    <span className='text-[10px] font-black uppercase tracking-widest text-orange-500'>Target: {selectedApplicant.job?.job_title}</span>
                                </div>
                            </div>
                        </div>

                        <div className='p-10 grid grid-cols-1 md:grid-cols-3 gap-10'>
                            <div className='md:col-span-2 space-y-8'>
                                <div>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mb-3'>Node Biography</h4>
                                    <p className='text-sm text-gray-300 leading-relaxed font-medium bg-white/5 p-5 rounded-3xl border border-white/5'>
                                        &quot;{selectedApplicant.user?.about || "This seeker has not provided a bio."}&quot;
                                    </p>
                                </div>
                                {selectedApplicant.user?.cv_url && (
                                    <a href={`http://127.0.0.1:5000/${selectedApplicant.user.cv_url}`} target="_blank" className='flex items-center justify-between bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 hover:border-orange-500/50 transition-all'>
                                        <div className='flex items-center gap-4'>
                                            <FaFileArrowDown className='text-orange-500' />
                                            <p className='text-xs font-black'>Download Curriculum Vitae</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                            <div className='space-y-8 border-l border-white/5 pl-8'>
                                <div className='pt-8 flex flex-col gap-3'>
                                    <button onClick={() => updateStatus(selectedApplicant.id, 'accepted')} className='w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-green-600 text-white shadow-xl shadow-green-900/20 active:scale-95 transition-transform'>Approve</button>
                                    <button onClick={() => updateStatus(selectedApplicant.id, 'rejected')} className='w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-600 text-white active:scale-95 transition-transform'>Decline</button>
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