"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import Navbar from '@/src/components/Navbar';
import { Job } from '@/src/types';
import { FaArrowLeft } from 'react-icons/fa6'; // Added Back Icon

const JobDetails = () => {
    const params = useParams();
    const router = useRouter(); // Initialize router for "back" functionality
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                if (!params.id) return;
                const res = await fetch(`http://127.0.0.1:5000/jobs/${params.id}`);
                if (res.ok) {
                    const data: Job = await res.json();
                    setJob(data);
                }
            } catch (err) {
                console.error("Link Failure: Node data unreachable", err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#040313] flex items-center justify-center">
                <p className="text-orange-500 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">
                    Syncing Node Data...
                </p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-[#040313] text-white p-6">
                <Navbar />
                <div className="pt-32 text-center">
                    <p className="font-black uppercase text-[10px] tracking-widest text-red-500">
                        Error: Job node not found in system.
                    </p>
                    <button 
                        onClick={() => router.back()} 
                        className="mt-4 text-orange-500 text-[10px] font-black uppercase hover:underline"
                    >
                        Return to Previous Node
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040313] text-white p-6 selection:bg-orange-500/30">
            <Navbar />

            <div className="max-w-4xl mx-auto pt-32 pb-20">
                {/* --- BACK BUTTON --- */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-all mb-6 group"
                >
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-orange-500/50">
                        <FaArrowLeft size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Marketplace</span>
                </button>

                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 to-purple-600"></div>
                    
                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-orange-500 mb-2 tracking-tighter uppercase">
                            {job.job_title}
                        </h1>
                        <p className="text-gray-400 uppercase tracking-[0.3em] text-[10px] font-black">
                            {job.company}
                        </p>
                    </header>
                    
                    <div className="space-y-6">
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative group">
                            <div className="absolute top-6 right-8 w-2 h-2 bg-orange-500/20 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                            <h2 className="text-orange-400 font-black mb-4 text-[10px] uppercase tracking-widest">
                                Requirement Protocols
                            </h2>
                            <p className="text-gray-300 leading-relaxed text-sm italic">
                                &quot;{job.job_description}&quot;
                            </p>
                        </div>

                        <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/[0.07] transition-all">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                                    Financial Compensation
                                </span>
                                <span className="text-[8px] text-orange-500/50 uppercase font-bold">Verified Sector Rate</span>
                            </div>
                            <span className="text-2xl font-black text-green-400 tracking-tight">
                                {job.salary || "CREDITS_PENDING"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[8px] font-black uppercase text-gray-600 tracking-tighter">Node Active</span>
                        </div>
                        <span className="text-[8px] font-black uppercase text-gray-600">Sector OS v2.4.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;