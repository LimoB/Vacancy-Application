"use client";
import React, { useEffect, useState } from 'react';
import UserNavbar from '../components/UserNavbar';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import { FaTrash, FaClock, FaCheckCircle } from "react-icons/fa";

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch only applications for the logged-in user
    fetch("http://127.0.0.1:5555/applications", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        // data will be a list of application objects
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching applications:", err);
        setLoading(false);
      });
  }, []);

  const handleWithdraw = async (appId) => {
    const token = getToken();
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;

    try {
      // Assuming you have a DELETE route for applications
      const response = await fetch(`http://127.0.0.1:5555/applications/${appId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setApplications(applications.filter((app) => app.id !== appId));
        setMessage({ text: "Application withdrawn.", isError: false });
      }
    } catch (error) {
      setMessage({ text: "Failed to withdraw application.", isError: true });
    }
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white flex flex-col'>
      {/* Header */}
      <div className='flex w-full mt-4 items-center justify-between px-10'>
        <Link href="/">
          <div className='flex items-center gap-2'>
            <SiWorkplace className='text-orange-500 text-2xl' />
            <p className='italic text-xl'>vacan<span className='font-bold text-orange-500'>C</span></p>
          </div>
        </Link>
        <UserNavbar />
        <div className='w-[250px]'></div> {/* Spacer to keep navbar centered */}
      </div>

      <div className='flex-1 max-w-5xl mx-auto w-full p-6'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold mb-2'>My Applications</h1>
          <p className='text-gray-400 text-sm'>Track the status of your job submissions</p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-center text-sm border ${message.isError ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}>
            {message.text}
          </div>
        )}

        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl'>
          {loading ? (
            <div className='p-20 text-center animate-pulse text-gray-400'>Loading your applications...</div>
          ) : applications.length > 0 ? (
            <div className='divide-y divide-white/5'>
              {applications.map((app) => (
                <div key={app.id} className='p-6 hover:bg-white/5 transition-all group'>
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-5 items-center'>
                      <div className='w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30'>
                        <img src='/rocket1.png' className='w-8' alt='job-icon' />
                      </div>
                      <div>
                        {/* Assuming the backend returns 'job' object inside application */}
                        <h3 className='font-bold text-lg'>{app.job?.job_title || "Position"}</h3>
                        <p className='text-sm text-orange-400'>{app.job?.company || "Company"}</p>
                        <div className='flex items-center gap-4 mt-2'>
                          <span className='flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-widest'>
                            <FaClock className='text-blue-400' /> Applied on: {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          <span className='flex items-center gap-1 text-[10px] text-green-400 uppercase tracking-widest'>
                            <FaCheckCircle /> Status: Pending
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex items-center gap-4'>
                      <Link 
                        href={`/jobs/${app.job?.id}`} 
                        className='px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition-all'
                      >
                        View Job
                      </Link>
                      <button 
                        onClick={() => handleWithdraw(app.id)}
                        className='p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all'
                        title="Withdraw Application"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-24'>
              <img src='/tomandjerry.png' alt='Empty' className='w-48 opacity-20 grayscale mb-6' />
              <h2 className='text-xl font-medium text-gray-500 italic'>You haven't applied for any jobs yet.</h2>
              <Link href="/userjobs" className='mt-4 text-orange-500 hover:underline text-sm'>
                Browse available jobs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppliedJobs;