"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { 
  FaBriefcase, 
  FaRegBookmark, 
  FaCheckCircle, 
  FaArrowRight,
  FaMapMarkerAlt,
  FaUserAstronaut
} from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';
import Navbar from '@/src/components/Navbar';
import { Job } from '@/src/types';

const SeekerLandingPage = () => {
  // Removed 'token' from destructuring to resolve ts(6133) and ESLint warnings
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/jobs");
        const data = await res.json();
        if (Array.isArray(data)) {
            setFeaturedJobs(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Link Failure: Could not sync with job registry", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#040313] bg-gradient-to-br from-[#040313] via-[#080625] to-[#0c093d] text-white selection:bg-orange-500/30">
      
      {/* --- NAVIGATION --- */}
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

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-12">
        
        {/* --- HERO SECTION: WELCOME NODE --- */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-950/30 to-orange-950/10 border border-white/10 rounded-[3.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
          <div className="flex-1 space-y-8 z-10 text-center md:text-left">
            <div className='flex items-center gap-3 bg-white/5 w-fit px-5 py-2 rounded-full border border-white/10 mx-auto md:mx-0'>
                <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]'></span>
                <p className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>Registry Online • {user?.user_type || 'Seeker'} Mode</p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Systems Active, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-purple-500">
                {user?.username?.split(' ')[0] || "Seeker"}
              </span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-lg max-w-lg leading-relaxed font-medium">
              Your profile is currently <span className='text-orange-400 font-black tracking-widest'>OPTIMIZED</span>. We detected <span className='text-white font-black'>{featuredJobs.length}+ new opportunities</span> matching your background in <span className='text-white'>{user?.user_role || "Engineering"}</span>.
            </p>
            
            <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4'>
                <Link href="/jobs" className='bg-white text-black px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95'>
                    Explore Registry
                </Link>
                <Link href="/seeker/profile" className='bg-white/5 border border-white/10 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all active:scale-95'>
                    Update Profile
                </Link>
            </div>
          </div>

          <div className='relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center'>
             <div className='absolute inset-0 bg-orange-500/10 blur-[120px] rounded-full'></div>
             <div className='relative w-full h-full p-4 border-2 border-dashed border-white/10 rounded-[4rem] group-hover:rotate-6 transition-transform duration-1000'>
                <Image 
                    src={user?.profile_picture || '/usericon.png'} 
                    alt='Identity' 
                    fill 
                    className='object-cover rounded-[3.5rem] border-4 border-[#0c093d] shadow-2xl z-10'
                />
                <div className='absolute -bottom-4 -right-4 bg-[#0c093d] border border-white/10 p-5 rounded-3xl z-20 shadow-2xl animate-bounce'>
                    <FaUserAstronaut className='text-orange-500 text-2xl' />
                </div>
             </div>
          </div>
        </section>

        {/* --- TELEMETRY: STATS GRID --- */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
                { label: 'Active Transmissions', value: '03', icon: <FaBriefcase className='text-blue-400' />, color: 'blue', desc: 'Active Applications' },
                { label: 'Pinned Nodes', value: '14', icon: <FaRegBookmark className='text-orange-400' />, color: 'orange', desc: 'Saved Positions' },
                { label: 'Direct Response', value: '01', icon: <FaCheckCircle className='text-green-400' />, color: 'green', desc: 'Interview Invites' },
            ].map((stat, i) => (
                <div key={i} className='bg-white/5 border border-white/10 p-10 rounded-[3rem] flex items-center justify-between group hover:bg-white/[0.08] transition-all cursor-default shadow-xl'>
                    <div>
                        <p className='text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2'>{stat.label}</p>
                        <p className='text-5xl font-black tracking-tighter mb-1'>{stat.value}</p>
                        <p className='text-[9px] font-bold text-gray-600 uppercase'>{stat.desc}</p>
                    </div>
                    <div className='text-4xl opacity-30 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500'>
                        {stat.icon}
                    </div>
                </div>
            ))}
        </div>

        {/* --- NEURAL MATCHES --- */}
        <section className='space-y-8 pb-20'>
            <div className='flex items-end justify-between px-4'>
                <div>
                    <h2 className='text-3xl font-black tracking-tighter uppercase'>Neural Matches</h2>
                    <p className='text-gray-500 text-xs font-medium mt-1'>Synthesized opportunities based on your professional signature.</p>
                </div>
                <Link href="/jobs" className='text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 flex items-center gap-3 hover:gap-5 transition-all'>
                    Sync full registry <FaArrowRight />
                </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className='h-64 bg-white/5 rounded-[3rem] animate-pulse border border-white/10 flex flex-col p-10 gap-4'>
                            <div className='w-1/3 h-4 bg-white/10 rounded-full'></div>
                            <div className='w-full h-8 bg-white/10 rounded-full'></div>
                            <div className='w-2/3 h-4 bg-white/10 rounded-full'></div>
                        </div>
                    ))
                ) : featuredJobs.length > 0 ? featuredJobs.map((job) => (
                    <div key={job.id} className='bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:border-orange-500/50 transition-all group relative overflow-hidden shadow-xl'>
                        <div className='absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-45 transition-all duration-1000'>
                            <SiWorkplace size={120} />
                        </div>
                        
                        <div className='flex justify-between items-start mb-6'>
                            <span className='text-[9px] font-black uppercase text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20 tracking-widest'>
                                {job.salary || "Ksh 45k - 80k"}
                            </span>
                            <FaRegBookmark className='text-gray-600 hover:text-orange-500 cursor-pointer transition-colors' />
                        </div>

                        <h3 className='text-2xl font-black tracking-tighter mb-2 group-hover:text-orange-400 transition-colors truncate'>{job.job_title}</h3>
                        
                        <div className='flex flex-wrap items-center gap-4 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-10'>
                            <span className='flex items-center gap-2'><SiWorkplace className='text-purple-500' /> {job.company}</span>
                            <span className='flex items-center gap-2'><FaMapMarkerAlt className='text-green-500' /> Remote</span>
                        </div>

                        <Link href={`/jobs/${job.id}`} className='w-full block text-center py-5 bg-white/5 group-hover:bg-orange-500 group-hover:text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10 group-hover:border-transparent group-hover:shadow-xl group-hover:shadow-orange-500/20'>
                            Interface Node
                        </Link>
                    </div>
                )) : (
                    <div className='col-span-3 py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10'>
                        <p className='text-[10px] uppercase font-black tracking-[0.4em] text-gray-600'>No immediate neural matches detected.</p>
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
};

export default SeekerLandingPage;