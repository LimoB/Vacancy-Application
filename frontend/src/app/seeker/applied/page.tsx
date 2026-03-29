"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';

interface Application {
  id: number;
  created_at: string;
  status: string;
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

  // Use a constant for the API URL to avoid port mismatches
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

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to the server. Please ensure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (appId: number) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setApplications(prev => prev.filter((app) => app.id !== appId));
        setMessage({ text: "Application withdrawn successfully.", isError: false });
        setTimeout(() => setMessage({ text: "", isError: false }), 3000);
      } else {
        throw new Error("Withdrawal failed");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setMessage({ text: "Failed to withdraw. Server might be offline.", isError: true });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const baseClass = "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border";
    
    if (s === 'accepted') return <span className={`${baseClass} text-green-400 border-green-500/20 bg-green-500/5`}><FaCheckCircle /> Accepted</span>;
    if (s === 'rejected') return <span className={`${baseClass} text-red-400 border-red-500/20 bg-red-500/5`}><FaTimesCircle /> Rejected</span>;
    return <span className={`${baseClass} text-blue-400 border-blue-500/20 bg-blue-500/5`}><FaHourglassHalf /> Pending</span>;
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white flex flex-col'>
      {/* Header */}
      <header className='flex w-full py-8 items-center justify-between px-6 md:px-12 z-50'>
        <Link href="/">
          <div className='flex items-center gap-2 group cursor-pointer'>
            <SiWorkplace className='text-orange-500 text-3xl group-hover:scale-110 transition-transform' />
            <div className='flex items-baseline'>
                <p className='italic text-2xl tracking-tighter font-light'>vacan</p>
                <span className='text-3xl font-black text-orange-500'>C</span>
            </div>
          </div>
        </Link>
        <Navbar />
        <div className='hidden lg:block w-[120px]'></div>
      </header>

      <main className='flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 pt-20'>
        <div className='mb-12 text-center'>
          <h1 className='text-4xl md:text-5xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500'>
            Application Tracker
          </h1>
          <p className='text-gray-400 text-sm max-w-md mx-auto leading-relaxed'>
            Monitor your career moves. Status updates from employers will appear here in real-time.
          </p>
        </div>

        {/* Status Messages */}
        {(message.text || error) && (
          <div className={`mb-8 p-4 rounded-2xl text-center text-sm font-bold border backdrop-blur-md animate-in fade-in slide-in-from-top-4 ${
            (message.isError || error) ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
            <div className='flex items-center justify-center gap-2'>
                {(message.isError || error) && <FaExclamationTriangle />}
                {error || message.text}
            </div>
          </div>
        )}

        <div className='bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl mb-20'>
          {loading ? (
            <div className='p-32 text-center flex flex-col items-center gap-6'>
               <div className='w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
               <p className='text-gray-500 text-xs uppercase tracking-[0.3em] animate-pulse font-black'>Synchronizing Data</p>
            </div>
          ) : applications.length > 0 ? (
            <div className='divide-y divide-white/5'>
              {applications.map((app) => (
                <div key={app.id} className='p-8 md:p-10 hover:bg-white/[0.03] transition-all group'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-8'>
                    
                    <div className='flex gap-8 items-center'>
                      <div className='relative w-16 h-16 bg-gradient-to-br from-orange-500/10 to-purple-600/10 rounded-[1.5rem] flex items-center justify-center border border-white/10 shrink-0 shadow-2xl group-hover:border-orange-500/30 transition-all'>
                        <Image src='/rocket1.png' width={36} height={36} alt='job-icon' className='object-contain group-hover:scale-110 transition-transform duration-500' />
                      </div>
                      
                      <div className='space-y-1.5'>
                        <h3 className='font-black text-2xl tracking-tight text-gray-100 group-hover:text-orange-400 transition-colors'>
                            {app.job?.job_title || "Redacted Position"}
                        </h3>
                        <p className='text-sm text-gray-400 font-bold uppercase tracking-widest'>{app.job?.company || "Confidential"}</p>
                        
                        <div className='flex flex-wrap items-center gap-x-6 gap-y-3 mt-4'>
                          <span className='flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5'>
                            <FaClock className='text-orange-500/50' /> 
                            {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex items-center gap-4 self-end md:self-center'>
                      <Link 
                        href={`/jobs`} 
                        className='px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95'
                      >
                        View Job
                      </Link>
                      <button 
                        onClick={() => handleWithdraw(app.id)}
                        className='p-4 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group/trash'
                        title="Withdraw Application"
                      >
                        <FaTrash size={18} className='group-hover/trash:rotate-12 transition-transform' />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-32 px-10 text-center'>
              <div className='relative w-48 h-48 mb-10 opacity-10 grayscale hover:opacity-20 transition-opacity'>
                <Image src='/tomandjerry.png' fill alt='Empty state' className='object-contain' />
              </div>
              <h2 className='text-3xl font-black text-gray-200 tracking-tight'>No Active Missions</h2>
              <p className='text-gray-500 text-sm mt-3 max-w-xs leading-relaxed'>
                Your application feed is currently empty. Head over to the job board to start your next journey.
              </p>
              <Link href="/jobs" className='mt-10 px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:brightness-110 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-orange-900/40 transition-all active:scale-95'>
                Explore Openings
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppliedJobs;