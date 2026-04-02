/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle, FaArrowLeft, FaTerminal } from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';

interface Application {
  id: number;
  application_date: string; // Updated to match backend field name
  status: string;
  employer_message: string; // New field from backend
  job?: {
    id: number;
    job_title: string;
    company: string;
  };
}

const AppliedJobs = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", isError: false });

  const API_BASE_URL = "http://127.0.0.1:5000";

  const fetchApplications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error(`Transmission Error: ${res.status}`);

      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Registry Sync Failure:", err);
      setError("Unable to sync with the application registry. Check backend connectivity.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (appId: number) => {
    if (!window.confirm("Confirm de-authorization of this application?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setApplications(prev => prev.filter((app) => app.id !== appId));
        setMessage({ text: "Application node successfully purged.", isError: false });
        setTimeout(() => setMessage({ text: "", isError: false }), 3000);
      } else {
        throw new Error("Purge failed");
      }
    } catch (_error) {
      setMessage({ text: "Failed to withdraw. Terminal link offline.", isError: true });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const baseClass = "flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-sm";
    
    if (s === 'accepted') return <span className={`${baseClass} text-green-400 border-green-500/30 bg-green-500/5`}><FaCheckCircle className="animate-pulse" /> Accepted</span>;
    if (s === 'rejected') return <span className={`${baseClass} text-red-400 border-red-500/30 bg-red-500/5`}><FaTimesCircle /> Declined</span>;
    return <span className={`${baseClass} text-orange-400 border-orange-500/30 bg-orange-500/5`}><FaHourglassHalf className="animate-spin-slow" /> Pending</span>;
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#080625] to-[#0c093d] text-white selection:bg-orange-500/30'>
      
      <nav className='flex w-full items-center justify-between px-6 md:px-10 py-6 backdrop-blur-xl sticky top-0 z-[100] border-b border-white/5'>
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-xl shadow-orange-500/20">
            <SiWorkplace className="text-white text-xl" />
          </div>
          <p className="text-2xl font-black italic tracking-tighter uppercase">
            vacan<span className="text-orange-500 not-italic">C</span>
          </p>
        </Link>
        <Navbar />
      </nav>

      <main className='max-w-6xl mx-auto w-full px-6 py-12 md:py-20'>
        
        <div className='mb-16 space-y-4'>
            <Link href="/jobs" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-orange-500 transition-colors w-fit group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Return to Registry
            </Link>
            <h1 className='text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]'>
                Application <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">Telemetry</span>
            </h1>
            <p className='text-gray-500 text-sm font-medium max-w-md'>
                Live monitoring of all active vacancy transmissions. Updates sync in real-time with the employer nodes.
            </p>
        </div>

        {(message.text || error) && (
          <div className={`mb-10 p-6 rounded-[2rem] border backdrop-blur-md flex items-center gap-4 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-500 ${
            (message.isError || error) ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
          }`}>
            <FaExclamationTriangle className={error || message.isError ? "text-red-500" : "text-green-500"} size={18} />
            {error || message.text}
          </div>
        )}

        <div className='bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl relative'>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[80px] rounded-full"></div>

          {loading ? (
            <div className='p-40 text-center flex flex-col items-center gap-6'>
               <div className='w-14 h-14 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin'></div>
               <p className='text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black animate-pulse'>Decrypting History</p>
            </div>
          ) : applications.length > 0 ? (
            <div className='divide-y divide-white/5'>
              {applications.map((app) => (
                <div key={app.id} className='p-8 md:p-12 hover:bg-white/[0.04] transition-all group relative'>
                  <div className='flex flex-col gap-8'>
                    
                    {/* Top Row: Info and Actions */}
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10'>
                      <div className='flex gap-10 items-center'>
                        <div className='relative w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-orange-500/10 rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0 shadow-inner group-hover:border-orange-500/40 transition-all duration-500'>
                          <Image src='/rocket1.png' width={40} height={40} alt='node-icon' className='object-contain group-hover:rotate-12 group-hover:scale-110 transition-all duration-500' />
                        </div>
                        
                        <div className='space-y-3'>
                          <h3 className='font-black text-3xl tracking-tighter text-white uppercase group-hover:text-orange-400 transition-colors'>
                              {app.job?.job_title || "Unknown Vector"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-6">
                              <p className='text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2'>
                                  <SiWorkplace className="text-purple-500" /> {app.job?.company || "Confidential Source"}
                              </p>
                              <span className='flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/5 px-4 py-1 rounded-full border border-white/5'>
                                  <FaClock className='text-orange-500/40' /> 
                                  {new Date(app.application_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className='flex flex-wrap items-center gap-6 self-start md:self-center'>
                        {getStatusBadge(app.status)}
                        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                        <div className='flex items-center gap-3'>
                          <Link 
                              href={`/jobs/${app.job?.id}`} 
                              className='px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95'
                          >
                              Node Details
                          </Link>
                          <button 
                              onClick={() => handleWithdraw(app.id)}
                              className='p-4 text-gray-600 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-2xl transition-all group/trash'
                              title="Withdraw Application"
                          >
                              <FaTrash size={18} className='group-hover/trash:rotate-12 transition-transform' />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Transmission Message Log Section */}
                    {app.employer_message && (
                      <div className={`p-6 rounded-[2rem] border animate-in fade-in slide-in-from-bottom-2 duration-700 ${
                        app.status === 'accepted' ? 'bg-green-500/5 border-green-500/20' : 
                        app.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' : 
                        'bg-white/5 border-white/10'
                      }`}>
                        <div className='flex gap-4 items-start'>
                          <div className={`p-3 rounded-xl mt-1 ${
                            app.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 
                            app.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            <FaTerminal size={14} />
                          </div>
                          <div className='space-y-1'>
                            <p className='text-[10px] font-black uppercase tracking-[0.2em] opacity-40'>Transmission Log Output:</p>
                            <p className={`text-sm leading-relaxed font-medium italic ${
                              app.status === 'accepted' ? 'text-green-100' : 
                              app.status === 'rejected' ? 'text-red-100' : 
                              'text-orange-100'
                            }`}>
                              &quot;{app.employer_message}&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-40 px-10 text-center space-y-10'>
              <div className='relative w-64 h-64 opacity-20 animate-pulse'>
                <Image src='/tomandjerry.png' fill alt='Empty state' className='object-contain grayscale' />
              </div>
              <div className="space-y-4">
                  <h2 className='text-4xl font-black text-white tracking-tighter uppercase'>No Active Signals</h2>
                  <p className='text-gray-500 text-sm font-medium max-w-sm mx-auto leading-relaxed'>
                    Your application registry is currently dormant. Initialize a new search to find your next mission.
                  </p>
              </div>
              <Link href="/jobs" className='px-12 py-5 bg-gradient-to-r from-orange-600 to-orange-400 hover:brightness-110 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-orange-900/40 transition-all active:scale-95'>
                Explore Registry
              </Link>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AppliedJobs;