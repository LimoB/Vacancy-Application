"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import { CiStar } from "react-icons/ci";
import { FaBars, FaTrash } from "react-icons/fa6";
import { TbBadgeFilled } from "react-icons/tb";
import { FaFilePdf } from "react-icons/fa";

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    job_title: "",
    job_description: "",
    salary: ""
  });
  const [message, setMessage] = useState({ text: "", isError: false });

  // Get token and user from localStorage
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    // 1. Fetch All Jobs
    fetch("http://127.0.0.1:5555/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));

    // 2. Get User Profile from Local Storage (set during login)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    try {
      const response = await fetch("http://127.0.0.1:5555/jobs", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setJobs([result.job, ...jobs]); // Add new job to top of list
        setFormData({ company: "", job_title: "", job_description: "", salary: "" });
        setMessage({ text: "Job posted successfully!", isError: false });
      } else {
        setMessage({ text: result.message, isError: true });
      }
    } catch (error) {
      setMessage({ text: "Failed to create job.", isError: true });
    }
  };

  const handleDelete = async (jobId) => {
    const token = getToken();
    if (!window.confirm("Delete this job posting?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5555/jobs/${jobId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setJobs(jobs.filter((j) => j.id !== jobId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8 px-4'>
        <Link href="/" className='flex items-center gap-2'>
          <SiWorkplace className='text-orange-500 text-2xl' />
          <p className='italic text-xl'>vacan<span className='font-bold text-orange-500'>C</span></p>
        </Link>
        <Navbar />
        <div className='flex items-center gap-4'>
          <input type='text' placeholder='Search jobs...' className='bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-orange-500 w-64' />
          <Link href="/user">
            <div className='w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden'>
              <img src='/usericon.png' alt='profile' />
            </div>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-6 max-w-7xl mx-auto'>
        
        {/* Left Sidebar: Profile & Quick Links */}
        <div className='col-span-3 space-y-6'>
          <div className='bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center shadow-xl'>
            <img className='w-20 h-20 mx-auto rounded-full border-2 border-green-500 mb-4' src='/usericon.png' alt='avatar' />
            <h2 className='text-lg font-bold'>{user?.username || "Guest User"}</h2>
            <p className='text-xs text-gray-400 italic mb-2'>{user?.about || "Job Portal User"}</p>
            <p className='text-xs text-orange-400'>{user?.location || "Remote"}</p>
          </div>

          <div className='bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl'>
            <button className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
              <CiStar className='text-orange-500' size={20} /> AI Job Match
            </button>
            <button className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
              <FaBars className='text-blue-400' size={18} /> Preferences
            </button>
            <button className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm border-b border-white/5'>
              <TbBadgeFilled className='text-green-400' size={20} /> My Applications
            </button>
            <Link href="https://google.com" target="_blank" className='w-full flex items-center gap-3 px-6 py-4 hover:bg-white/10 transition-all text-sm'>
              <FaFilePdf className='text-red-400' size={18} /> Interview Docs
            </Link>
          </div>
        </div>

        {/* Center: Job Feed */}
        <div className='col-span-6 space-y-4'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold'>Current Openings</h1>
            <p className='text-gray-400 text-sm'>Manage and explore the latest vacancies</p>
          </div>

          <div className='space-y-4 overflow-y-auto pr-2' style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {jobs.length > 0 ? jobs.map((kazi) => (
              <div key={kazi.id} className='bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group relative'>
                <div className='flex gap-4'>
                  <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center'>
                    <img src='/rocket1.png' className='w-8' alt='icon' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-orange-400'>{kazi.job_title}</h3>
                    <p className='text-sm font-medium text-gray-300'>{kazi.company}</p>
                    <p className='text-xs text-gray-400 mt-2 line-clamp-2'>{kazi.job_description}</p>
                    <div className='mt-4 flex items-center justify-between'>
                      <span className='text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md'>{kazi.salary}</span>
                      <button className='text-xs bg-orange-600 hover:bg-orange-500 px-4 py-1.5 rounded-lg transition-all font-medium'>View Details</button>
                    </div>
                  </div>
                </div>
                {/* Only show delete if user is admin */}
                {user?.user_role === 'admin' && (
                  <button onClick={() => handleDelete(kazi.id)} className='absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors'>
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            )) : (
              <div className='text-center py-20 opacity-40'>
                <img src='/tomandjerry.png' className='w-48 mx-auto grayscale mb-4' alt='empty' />
                <p>No jobs available right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Post Job */}
        <div className='col-span-3 space-y-6'>
          <div className='bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl'>
            <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
              <span className='w-2 h-2 bg-orange-500 rounded-full animate-pulse'></span>
              Post Vacancy
            </h2>
            
            {message.text && (
              <p className={`text-[10px] mb-4 p-2 rounded ${message.isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {message.text}
              </p>
            )}

            <form onSubmit={handleSubmit} className='space-y-3'>
              <input name='company' value={formData.company} onChange={handleInput} placeholder='Company Name' className='w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500' required />
              <input name='job_title' value={formData.job_title} onChange={handleInput} placeholder='Job Title' className='w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500' required />
              <textarea name='job_description' value={formData.job_description} onChange={handleInput} placeholder='Description' className='w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500 h-24' required />
              <input name='salary' value={formData.salary} onChange={handleInput} placeholder='Salary (e.g. $5k - $8k)' className='w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-orange-500' />
              <button className='w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-purple-900/40'>
                Launch Job Posting
              </button>
            </form>
          </div>
          
          <div className='bg-gradient-to-br from-orange-600/20 to-purple-600/20 border border-white/5 p-6 rounded-3xl text-center'>
            <p className='text-xs text-gray-400'>Applications Received</p>
            <h3 className='text-2xl font-black mt-1'>24</h3>
            <Link href="/appliedjobs" className='text-[10px] text-orange-400 mt-2 block hover:underline'>View Dashboard</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default JobsPage;