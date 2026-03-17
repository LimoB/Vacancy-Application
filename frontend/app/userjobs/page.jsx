"use client";
import React, { useEffect, useState } from 'react';
import UserNavbar from '../components/UserNavbar';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import { CiStar } from "react-icons/ci";
import { FaBars } from "react-icons/fa6";
import { TbBadgeFilled } from "react-icons/tb";
import { FaFilePdf } from "react-icons/fa";

const UserJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Get token and user from localStorage
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    // 1. Fetch All Available Jobs
    fetch("http://127.0.0.1:5555/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));

    // 2. Load User Profile from Local Storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleApply = async (jobId) => {
    const token = getToken();
    if (!token) {
      setMessage({ text: "Please login to apply.", isError: true });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5555/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ job_id: jobId })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ text: "Application submitted successfully!", isError: false });
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ text: "", isError: false }), 3000);
      } else {
        setMessage({ text: result.message, isError: true });
      }
    } catch (error) {
      setMessage({ text: "Failed to submit application.", isError: true });
    }
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8 px-4'>
        <Link href="/" className='flex items-center gap-2 group'>
          <SiWorkplace className='text-orange-500 text-2xl group-hover:scale-110 transition-transform' />
          <p className='italic text-xl tracking-tight'>vacan<span className='font-bold text-orange-500'>C</span></p>
        </Link>
        <div className='hidden md:block'>
          <UserNavbar />
        </div>
        <div className='flex items-center gap-4'>
          <input 
            type='text' 
            placeholder='Search opportunities...' 
            className='bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-orange-500 w-64' 
          />
          <Link href="/userprofile">
            <div className='w-10 h-10 rounded-full border-2 border-[#4fb877] overflow-hidden hover:scale-105 transition-transform'>
              <img src='/usericon.png' alt='profile' />
            </div>
          </Link>
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-20 right-10 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${message.isError ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-green-500/20 border-green-500/50 text-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto'>
        
        {/* Left Sidebar: Seeker Profile */}
        <div className='md:col-span-3 space-y-6'>
          <div className='bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center shadow-xl'>
            <img className='w-20 h-20 mx-auto rounded-full border-2 border-[#4fb877] mb-4 shadow-lg shadow-[#4fb877]/20' src='/usericon.png' alt='avatar' />
            <h2 className='text-lg font-bold'>{user?.username || "Seeker"}</h2>
            <p className='text-xs text-gray-400 italic mb-2 px-4'>{user?.about || "Looking for new opportunities"}</p>
            <p className='text-xs text-orange-400 font-medium'>{user?.location || "Remote Available"}</p>
          </div>

          <div className='bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl'>
            <button className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5 group'>
              <CiStar className='text-orange-500 group-hover:rotate-12 transition-transform' size={22} /> AI Job Matcher
            </button>
            <button className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
              <FaBars className='text-blue-400' size={18} /> Career Goals
            </button>
            <Link href="/appliedjobs" className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
              <TbBadgeFilled className='text-green-400' size={20} /> My Applications
            </Link>
            <Link href="https://www.uopeople.edu/blog/top-12-interview-tips-for-success/" target="_blank" className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm'>
              <FaFilePdf className='text-red-400' size={18} /> Interview Guide
            </Link>
          </div>
        </div>

        {/* Center: Job Feed */}
        <div className='md:col-span-6 space-y-4'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight'>Available Vacancies</h1>
            <p className='text-gray-400 text-sm'>Find your next career move</p>
          </div>

          <div className='space-y-4 overflow-y-auto pr-2 custom-scrollbar' style={{ maxHeight: '70vh' }}>
            {jobs.length > 0 ? jobs.map((kazi) => (
              <div key={kazi.id} className='bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group'>
                <div className='flex gap-5'>
                  <div className='w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/20'>
                    <img src='/rocket1.png' className='w-8' alt='icon' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-bold text-lg text-white group-hover:text-orange-400 transition-colors'>{kazi.job_title}</h3>
                        <p className='text-sm font-medium text-gray-300'>{kazi.company}</p>
                      </div>
                      <span className='text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20'>
                        {kazi.salary || "Competitive"}
                      </span>
                    </div>
                    <p className='text-xs text-gray-400 mt-3 leading-relaxed line-clamp-3 italic'>
                      "{kazi.job_description}"
                    </p>
                    <div className='mt-6 flex items-center gap-3'>
                      <button 
                        onClick={() => handleApply(kazi.id)}
                        className='flex-1 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-orange-900/20'
                      >
                        Quick Apply
                      </button>
                      <button className='px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs transition-all'>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className='text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10'>
                <img src='/tomandjerry.png' className='w-48 mx-auto grayscale opacity-30 mb-4' alt='empty' />
                <p className='text-gray-500 italic'>No jobs available at the moment. Check back later!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Tips/Stats */}
        <div className='md:col-span-3 space-y-6'>
          <div className='bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 p-6 rounded-3xl shadow-xl'>
            <h3 className='text-sm font-bold mb-4 flex items-center gap-2'>
               Career Tip
            </h3>
            <p className='text-[11px] text-gray-300 leading-relaxed'>
              "Tailor your profile description to include keywords found in the job titles you're targeting. It increases your visibility to employers by 40%."
            </p>
          </div>

          <div className='bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl text-center'>
            <p className='text-[10px] text-gray-400 uppercase tracking-widest mb-1'>Application Limit</p>
            <div className='h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2'>
              <div className='h-full bg-orange-500 w-1/3 shadow-[0_0_10px_#f97316]'></div>
            </div>
            <p className='text-xs text-white font-medium'>5 of 15 used this month</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserJobs;