"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import { FaUsers, FaBriefcase, FaFileAlt, FaTrash, FaCheck, FaTimes, FaSync } from 'react-icons/fa';
import { useAuth } from '@/src/context/AuthContext';
import { User, Job, Application } from '@/src/types'; 

interface AdminData {
  users: User[];
  jobs: Job[];
  applications: Application[];
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'applications'>('users');
  const [data, setData] = useState<AdminData>({ 
    users: [], 
    jobs: [], 
    applications: [] 
  });
  
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchData = useCallback(async () => {
    if (!token) return;
    
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      setLoading(true);
      const [uRes, jRes, aRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/users", { headers }),
        fetch("http://127.0.0.1:5000/jobs", { headers }),
        fetch("http://127.0.0.1:5000/applications", { headers })
      ]);

      if (!uRes.ok || !jRes.ok || !aRes.ok) throw new Error("Failed to fetch system data");

      const [users, jobs, apps]: [User[], Job[], Application[]] = await Promise.all([
        uRes.json(), jRes.json(), aRes.json()
      ]);

      setData({ users, jobs, applications: apps });
    } catch (error) {
      console.error("Admin Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Permanently delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/users/${id}`, { 
        method: 'DELETE', 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      if (res.ok) {
        setData(prev => ({ 
          ...prev, 
          users: prev.users.filter(u => u.id !== id) 
        }));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/applications/${appId}`, {
        method: 'PATCH',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        // We send what the backend expects (usually lowercase)
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          applications: prev.applications.map(app => 
            // We cast using 'as any' then 'as ApplicationStatus' if strict literal types are used
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            app.id === appId ? { ...app, status: newStatus as any } : app
          )
        }));
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040313] text-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-gray-400 font-mono tracking-widest text-xs uppercase">Initializing Admin Core...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white pb-20'>
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-8 mt-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                SYSTEM CONTROL PANEL
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Enterprise oversight of platform entities and traffic.</p>
          </div>
          <button 
            onClick={fetchData}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-orange-500"
            title="Reload Data"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard icon={<FaUsers />} label="Total Users" value={data.users.length} color="text-blue-400" />
          <StatCard icon={<FaBriefcase />} label="Active Jobs" value={data.jobs.length} color="text-orange-400" />
          <StatCard icon={<FaFileAlt />} label="Applications" value={data.applications.length} color="text-green-400" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
          {(['users', 'jobs', 'applications'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-8 py-2.5 rounded-xl transition-all text-sm tracking-wide ${
                activeTab === tab 
                ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-500 uppercase text-[10px] tracking-[0.2em]">
                <tr>
                  {activeTab === 'users' && <><th className="p-6 px-8">Identified User</th><th className="p-6">Security Role</th><th className="p-6">Entity Type</th><th className="p-6 text-center">Actions</th></>}
                  {activeTab === 'jobs' && <><th className="p-6 px-8">Job Designation</th><th className="p-6">Organization</th><th className="p-6">Compensation</th><th className="p-6 text-center">Reference</th></>}
                  {activeTab === 'applications' && <><th className="p-6 px-8">Applicant</th><th className="p-6">Target Job</th><th className="p-6">Current Status</th><th className="p-6 text-center">Decision Core</th></>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data[activeTab] as (User | Job | Application)[]).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                    {activeTab === 'users' && 'username' in item && (
                      <>
                        <td className="p-6 px-8">
                          <div className="font-bold text-gray-100">{item.username}</div>
                          <div className="text-[11px] text-gray-500 font-medium">{item.email}</div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                            item.user_role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>
                            {item.user_role}
                          </span>
                        </td>
                        <td className="p-6 text-gray-400 font-medium capitalize">{item.user_type}</td>
                        <td className="p-6">
                          <div className="flex justify-center">
                            <button onClick={() => handleDeleteUser(item.id)} className="p-3 bg-red-500/10 text-red-400/60 hover:bg-red-500 hover:text-white rounded-2xl transition-all">
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'jobs' && 'job_title' in item && (
                      <>
                        <td className="p-6 px-8">
                          <div className="font-bold text-gray-100">{item.job_title}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1">
                            Added: {new Date(item.date_created).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </div>
                        </td>
                        <td className="p-6 text-gray-300 font-medium">{item.company}</td>
                        <td className="p-6 text-green-400 font-mono font-bold">{item.salary}</td>
                        <td className="p-6 text-center">
                           <span className="text-[10px] text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/5">ID: {item.id}</span>
                        </td>
                      </>
                    )}
                    {activeTab === 'applications' && 'status' in item && (
                      <>
                        <td className="p-6 px-8">
                          <div className="font-bold text-gray-100">{item.user?.username || 'Unknown Seeker'}</div>
                          <div className="text-[11px] text-gray-500">{item.user?.email || 'N/A'}</div>
                        </td>
                        <td className="p-6">
                           <div className="text-orange-400 font-bold">{item.job?.job_title || 'N/A'}</div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                            item.status.toLowerCase() === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            item.status.toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => handleStatusUpdate(item.id, 'accepted')} 
                                className="p-2.5 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                            >
                              <FaCheck size={12} />
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(item.id, 'rejected')} 
                                className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] flex items-center gap-6 shadow-xl hover:border-white/20 transition-all">
    <div className={`text-4xl p-4 bg-white/5 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] uppercase text-gray-500 font-black tracking-[0.2em]">{label}</p>
      <h3 className="text-3xl font-black mt-1">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;