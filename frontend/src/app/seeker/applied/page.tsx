"use client";
import React, { useEffect, useState } from 'react';
import UserNavbar from '@/src/components//UserNavbar';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
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
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:5555/applications", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching applications:", err);
        setLoading(false);
      });
  }, [token]);

  const handleWithdraw = async (appId: number) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/applications/${appId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setApplications(prev => prev.filter((app) => app.id !== appId));
        setMessage({ text: "Application withdrawn successfully.", isError: false });
        setTimeout(() => setMessage({ text: "", isError: false }), 3000);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage({ text: "Failed to withdraw application.", isError: true });
    }
  };

  // Helper to render status badges dynamically
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'accepted') return <span className='flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-wider'><FaCheckCircle /> Accepted</span>;
    if (s === 'rejected') return <span className='flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-wider'><FaTimesCircle /> Rejected</span>;
    return <span className='flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider'><FaHourglassHalf /> Pending</span>;
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white flex flex-col'>
      {/* Header */}
      <header className='flex w-full py-6 items-center justify-between px-6 md:px-12'>
        <Link href="/">
          <div className='flex items-center gap-2 group cursor-pointer'>
            <SiWorkplace className='text-orange-500 text-2xl group-hover:scale-110 transition-transform' />
            <p className='italic text-xl tracking-tight'>vacan<span className='font-bold text-orange-500'>C</span></p>
          </div>
        </Link>
        <UserNavbar />
        <div className='hidden lg:block w-[100px]'></div>
      </header>

      <main className='flex-1 max-w-5xl mx-auto w-full p-4 md:p-6'>
        <div className='mb-10 text-center'>
          <h1 className='text-3xl md:text-4xl font-black mb-3 tracking-tight'>Application Tracker</h1>
          <p className='text-gray-400 text-sm max-w-md mx-auto'>Manage and monitor the status of your recent job submissions in real-time.</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-bold border animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.isError ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className='bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl'>
          {loading ? (
            <div className='p-32 text-center flex flex-col items-center gap-4'>
               <div className='w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
               <p className='text-gray-400 font-medium animate-pulse'>Syncing applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className='divide-y divide-white/10'>
              {applications.map((app) => (
                <div key={app.id} className='p-6 md:p-8 hover:bg-white/[0.03] transition-colors group'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                    
                    <div className='flex gap-6 items-center'>
                      <div className='relative w-14 h-14 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 shadow-inner'>
                        <Image src='/rocket1.png' width={32} height={32} alt='job-icon' className='object-contain group-hover:scale-110 transition-transform' />
                      </div>
                      
                      <div className='space-y-1'>
                        <h3 className='font-bold text-xl tracking-tight group-hover:text-orange-400 transition-colors'>
                            {app.job?.job_title || "Untitled Position"}
                        </h3>
                        <p className='text-sm text-gray-300 font-medium'>{app.job?.company || "Unknown Company"}</p>
                        
                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 mt-3'>
                          <span className='flex items-center gap-2 text-[10px] text-gray-400 uppercase font-black tracking-widest'>
                            <FaClock className='text-orange-500' /> {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex items-center gap-3 self-end md:self-center'>
                      <Link 
                        href={`/jobs/${app.job?.id}`} 
                        className='px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all'
                      >
                        Details
                      </Link>
                      <button 
                        onClick={() => handleWithdraw(app.id)}
                        className='p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all'
                        title="Withdraw"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
              <div className='relative w-40 h-40 mb-8 opacity-20 grayscale'>
                <Image src='/tomandjerry.png' fill alt='Empty state' className='object-contain' />
              </div>
              <h2 className='text-2xl font-bold text-gray-300'>No active applications</h2>
              <p className='text-gray-500 text-sm mt-2 max-w-xs italic'>Opportunities are waiting! Start applying to see your progress here.</p>
              <Link href="/userjobs" className='mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-900/20 transition-all'>
                Find Jobs Now
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppliedJobs;