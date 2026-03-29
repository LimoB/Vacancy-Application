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
  FaMapMarkerAlt
} from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';
import Navbar from '@/src/components/Navbar';
import { Job } from '@/src/types';

const SeekerLandingPage = () => {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching featured jobs for the landing experience
    fetch("http://127.0.0.1:5000/jobs")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedJobs(data.slice(0, 3)); // Just show top 3 for landing
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#040313] bg-gradient-to-br from-[#040313] via-[#080625] to-[#0c093d] text-white selection:bg-orange-500/30">
      
      {/* Header */}
      <nav className='flex w-full items-center justify-between px-6 md:px-10 py-6 backdrop-blur-md sticky top-0 z-[100] border-b border-white/5'>
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-orange-500 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-orange-500/20">
            <SiWorkplace className="text-white text-xl" />
          </div>
          <p className="text-2xl font-black italic tracking-tighter">
            vacan<span className="text-orange-500 not-italic">C</span>
          </p>
        </Link>
        <Navbar />
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-12">
        
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 to-orange-900/10 border border-white/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 z-10">
            <div className='flex items-center gap-2 bg-white/5 w-fit px-4 py-1.5 rounded-full border border-white/10'>
                <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>System Online: Ready for Hire</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                {user?.username || "Seeker"}
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg max-w-lg leading-relaxed">
              Your profile is <span className='text-green-400 font-bold'>88% complete</span>. We found new vacancies matching your expertise in <span className='text-white'>{user?.user_role || "Development"}</span>.
            </p>
            
            {/* Quick Search Redirect */}
            <div className='flex items-center gap-4 pt-4'>
                <Link href="/jobs" className='bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl'>
                    Explore All Jobs
                </Link>
                <Link href="/seeker/profile" className='bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all'>
                    Update Profile
                </Link>
            </div>
          </div>

          <div className='relative w-64 h-64 md:w-80 md:h-80'>
             <div className='absolute inset-0 bg-orange-500/20 blur-[80px] rounded-full animate-pulse'></div>
             <Image 
                src={user?.profile_picture || '/usericon.png'} 
                alt='Profile' 
                fill 
                className='object-cover rounded-[3rem] border-4 border-white/5 shadow-2xl relative z-10'
             />
          </div>
        </section>

        {/* --- STATS GRID --- */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[
                { label: 'Active Applications', value: '03', icon: <FaBriefcase className='text-blue-400' />, color: 'blue' },
                { label: 'Saved Positions', value: '14', icon: <FaRegBookmark className='text-orange-400' />, color: 'orange' },
                { label: 'Interview Invites', value: '01', icon: <FaCheckCircle className='text-green-400' />, color: 'green' },
            ].map((stat, i) => (
                <div key={i} className='bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all cursor-default'>
                    <div>
                        <p className='text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1'>{stat.label}</p>
                        <p className='text-4xl font-black'>{stat.value}</p>
                    </div>
                    <div className='text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all'>
                        {stat.icon}
                    </div>
                </div>
            ))}
        </div>

        {/* --- RECOMMENDED JOBS --- */}
        <section className='space-y-6'>
            <div className='flex items-end justify-between px-2'>
                <div>
                    <h2 className='text-2xl font-black'>Neural Matches</h2>
                    <p className='text-gray-500 text-xs mt-1'>Jobs specifically curated for your skill set</p>
                </div>
                <Link href="/jobs" className='text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2 hover:gap-4 transition-all'>
                    See all matches <FaArrowRight />
                </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {loading ? (
                    [1,2,3].map(i => <div key={i} className='h-48 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/10'></div>)
                ) : featuredJobs.map((job) => (
                    <div key={job.id} className='bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:border-orange-500/50 transition-all group relative overflow-hidden'>
                        <div className='absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity'>
                            <SiWorkplace size={60} />
                        </div>
                        <span className='text-[9px] font-black uppercase text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20'>
                            {job.salary || "Negotiable"}
                        </span>
                        <h3 className='text-xl font-black mt-4 mb-1 truncate'>{job.job_title}</h3>
                        <div className='flex items-center gap-3 text-gray-500 text-[10px] font-bold uppercase tracking-tighter mb-6'>
                            <span className='flex items-center gap-1'><SiWorkplace className='text-purple-500' /> {job.company}</span>
                            <span className='flex items-center gap-1'><FaMapMarkerAlt className='text-green-500' /> Remote</span>
                        </div>
                        <Link href={`/jobs/${job.id}`} className='w-full block text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10'>
                            View Node
                        </Link>
                    </div>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
};

export default SeekerLandingPage;