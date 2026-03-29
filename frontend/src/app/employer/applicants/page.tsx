"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import { FaChevronLeft, FaEnvelope, FaFileArrowDown, FaCheck, FaXmark, FaPhone, FaLocationDot } from "react-icons/fa6";
import { useAuth } from '@/src/context/AuthContext';

interface Application {
    id: number;
    job_title: string;
    seeker_name: string;
    seeker_email: string;
    seeker_about?: string; // Information for the modal
    status: string;
    applied_at: string;
}

const ApplicantManagement = () => {
    const { token } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

    useEffect(() => {
        if (!token) return;

        fetch("http://127.0.0.1:5000/employer/applications", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => {
                setApplications(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching applicants:", err);
                setLoading(false);
            });
    }, [token]);

    const updateStatus = async (id: number, newStatus: string) => {
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
                setApplications(prev => 
                    prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
                );
                // If modal is open for this person, update the status there too
                if (selectedApplicant?.id === id) {
                    setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    return (
        <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white p-6 relative'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div className='flex items-center gap-4'>
                        <Link href="/employer" className='p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all'>
                            <FaChevronLeft size={14} />
                        </Link>
                        <div>
                            <h1 className='text-2xl font-black'>Talent Pipeline</h1>
                            <p className='text-xs text-gray-400 uppercase tracking-widest'>Manage Incoming Applications</p>
                        </div>
                    </div>
                    <Navbar />
                </div>

                {/* Main Table Area */}
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-400'>
                                    <th className='px-8 py-5 font-black'>Applicant</th>
                                    <th className='px-6 py-5 font-black'>Target Role</th>
                                    <th className='px-6 py-5 font-black text-center'>Status</th>
                                    <th className='px-8 py-5 font-black text-right'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className='py-20 text-center text-xs text-gray-500 animate-pulse font-bold uppercase tracking-widest'>
                                            Retrieving candidate profiles...
                                        </td>
                                    </tr>
                                ) : applications.length > 0 ? applications.map((app) => (
                                    <tr key={app.id} className='hover:bg-white/[0.02] transition-colors group'>
                                        <td className='px-8 py-6'>
                                            <button 
                                                onClick={() => setSelectedApplicant(app)}
                                                className='flex items-center gap-4 hover:opacity-80 transition-opacity text-left'
                                            >
                                                <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center font-bold text-sm'>
                                                    {app.seeker_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className='font-bold text-sm underline decoration-white/10 decoration-2 underline-offset-4 group-hover:decoration-orange-500 transition-all'>{app.seeker_name}</p>
                                                    <p className='text-[10px] text-gray-500'>{app.seeker_email}</p>
                                                </div>
                                            </button>
                                        </td>
                                        <td className='px-6 py-6'>
                                            <span className='text-xs font-medium text-orange-400 bg-orange-400/10 px-3 py-1 rounded-lg border border-orange-400/20'>
                                                {app.job_title}
                                            </span>
                                        </td>
                                        <td className='px-6 py-6 text-center'>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                app.status === 'accepted' ? 'text-green-400 bg-green-400/10' :
                                                app.status === 'rejected' ? 'text-red-400 bg-red-400/10' :
                                                'text-blue-400 bg-blue-400/10'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className='px-8 py-6'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <button onClick={() => updateStatus(app.id, 'accepted')} className='p-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all'><FaCheck size={12} /></button>
                                                <button onClick={() => updateStatus(app.id, 'rejected')} className='p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all'><FaXmark size={12} /></button>
                                                <button className='p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all'><FaFileArrowDown size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className='py-20 text-center text-gray-500 italic text-sm'>
                                            No candidates have applied yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='bg-white/5 p-6 rounded-3xl border border-white/10'>
                        <p className='text-xs text-gray-500 uppercase font-black tracking-widest'>Total Applicants</p>
                        <h3 className='text-3xl font-black mt-2'>{applications.length}</h3>
                    </div>
                    <div className='bg-green-500/5 p-6 rounded-3xl border border-green-500/10'>
                        <p className='text-xs text-green-500 uppercase font-black tracking-widest'>Accepted</p>
                        <h3 className='text-3xl font-black mt-2'>{applications.filter(a => a.status === 'accepted').length}</h3>
                    </div>
                    <div className='bg-red-500/5 p-6 rounded-3xl border border-red-500/10'>
                        <p className='text-xs text-red-500 uppercase font-black tracking-widest'>Pending Review</p>
                        <h3 className='text-3xl font-black mt-2'>{applications.filter(a => a.status === 'pending').length}</h3>
                    </div>
                </div>
            </div>

            {/* --- VIEW RESUME MODAL --- */}
            {selectedApplicant && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040313]/90 backdrop-blur-md animate-in fade-in duration-300'>
                    <div className='bg-[#0c093d] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300'>
                        
                        {/* Modal Top Branding */}
                        <div className='relative h-32 bg-gradient-to-r from-orange-600 to-purple-700 p-8'>
                            <button 
                                onClick={() => setSelectedApplicant(null)}
                                className='absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all'
                            >
                                <FaXmark size={16} />
                            </button>
                            <div className='absolute -bottom-10 left-8 flex items-end gap-4'>
                                <div className='w-24 h-24 rounded-3xl bg-[#0c093d] border-4 border-[#0c093d] shadow-xl flex items-center justify-center text-3xl font-black text-orange-500'>
                                    {selectedApplicant.seeker_name.charAt(0)}
                                </div>
                                <div className='mb-2'>
                                    <h2 className='text-2xl font-black leading-none'>{selectedApplicant.seeker_name}</h2>
                                    <p className='text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>Candidate Profile</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className='p-8 pt-16 grid grid-cols-1 md:grid-cols-3 gap-8'>
                            <div className='md:col-span-2 space-y-6'>
                                <div>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2'>Bio / Summary</h4>
                                    <p className='text-sm text-gray-300 leading-relaxed italic'>
                                        &quot;{selectedApplicant.seeker_about || "Enthusiastic professional looking to contribute skills to the " + selectedApplicant.job_title + " role. Highly motivated and ready to start immediately."}&quot;
                                    </p>
                                </div>
                                
                                <div className='bg-white/5 p-6 rounded-3xl border border-white/5'>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-widest mb-4'>Documents</h4>
                                    <div className='flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 group cursor-pointer hover:border-orange-500/50 transition-all'>
                                        <div className='flex items-center gap-3'>
                                            <div className='p-2 bg-red-500/20 text-red-500 rounded-lg'><FaFileArrowDown /></div>
                                            <span className='text-xs font-bold'>Resume_Final.pdf</span>
                                        </div>
                                        <span className='text-[10px] text-gray-500 uppercase'>PDF</span>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-6'>
                                <div className='space-y-4'>
                                    <h4 className='text-[10px] uppercase font-black text-gray-500 tracking-widest'>Contact Details</h4>
                                    <div className='space-y-3'>
                                        <div className='flex items-center gap-3 text-xs text-gray-400'>
                                            <FaEnvelope className='text-orange-500' /> {selectedApplicant.seeker_email}
                                        </div>
                                        <div className='flex items-center gap-3 text-xs text-gray-400'>
                                            <FaPhone className='text-orange-500' /> +254 700 123 456
                                        </div>
                                        <div className='flex items-center gap-3 text-xs text-gray-400'>
                                            <FaLocationDot className='text-orange-500' /> Nairobi, KE
                                        </div>
                                    </div>
                                </div>

                                <div className='pt-6 border-t border-white/10 flex flex-col gap-2'>
                                    <button 
                                        onClick={() => updateStatus(selectedApplicant.id, 'accepted')}
                                        className='w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
                                    >
                                        Accept Application
                                    </button>
                                    <button 
                                        onClick={() => updateStatus(selectedApplicant.id, 'rejected')}
                                        className='w-full py-3 bg-white/5 hover:bg-red-600/20 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
                                    >
                                        Decline
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