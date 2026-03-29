"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/src/components/Navbar';
import { 
  FaUsers, FaBriefcase, FaFileAlt, FaTrash, 
  FaCheck, FaTimes, FaSync, FaShieldAlt 
} from 'react-icons/fa';
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
    
    const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    
    try {
      setLoading(true);
      const [uRes, jRes, aRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/users", { headers }),
        fetch("http://127.0.0.1:5000/jobs", { headers }),
        fetch("http://127.0.0.1:5000/applications", { headers })
      ]);

      if (!uRes.ok || !jRes.ok || !aRes.ok) throw new Error("Access Denied or System Offline");

      const [users, jobs, apps] = await Promise.all([
        uRes.json(), jRes.json(), aRes.json()
      ]);

      setData({ users, jobs, applications: apps });
    } catch (error) {
      console.error("Critical System Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Confirm Deletion: This will permanently purge the user entity from the database.")) return;
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
      console.error("Purge failed:", err);
    }
  };

  const handleStatusUpdate = async (appId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/applications/${appId}`, {
        method: 'PATCH',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          applications: prev.applications.map(app => 
            app.id === appId ? { ...app, status: newStatus as Application['status'] } : app
          )
        }));
      }
    } catch (err) {
      console.error("Status override failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#040313] text-white flex flex-col items-center justify-center gap-6 z-50">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <FaShieldAlt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-xl animate-pulse" />
        </div>
        <div className="text-center space-y-1">
            <p className="text-white font-black tracking-[0.3em] text-[10px] uppercase">Authorizing Admin Session</p>
            <p className="text-gray-600 font-mono text-[9px]">Fetching Platform Metadata...</p>
        </div>
      </div>
    );
  }

  return (
    /* Wrapped in a main container with the dark background to prevent white gaps at the top */
    <div className='min-h-screen w-full bg-[#040313] text-white selection:bg-orange-500/30'>
      <Navbar />
      
      {/* Container for the actual content */}
      <main className="bg-gradient-to-br from-[#040313] via-[#080625] to-[#0c093d] min-h-screen pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                  <span className="h-1 w-12 bg-orange-500 rounded-full"></span>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Superuser Environment</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase">
                  System<span className="text-orange-500 not-italic">_</span>Core
              </h1>
              <p className="text-gray-500 text-sm font-medium">Global platform oversight and entity management.</p>
            </div>
            
            <button 
              onClick={fetchData}
              className="group flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-orange-500/10 hover:border-orange-500/50 transition-all shadow-2xl"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-orange-500">Sync Data</span>
              <FaSync className={`text-orange-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <StatCard icon={<FaUsers />} label="Identified Users" value={data.users.length} color="text-blue-400" />
            <StatCard icon={<FaBriefcase />} label="Live Vacancies" value={data.jobs.length} color="text-orange-400" />
            <StatCard icon={<FaFileAlt />} label="Neural Matches" value={data.applications.length} color="text-purple-400" />
          </div>

          <div className="flex gap-2 mb-10 bg-white/5 p-2 rounded-3xl border border-white/10 w-fit backdrop-blur-xl">
            {(['users', 'jobs', 'applications'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize px-10 py-3.5 rounded-[1.25rem] transition-all text-xs font-black tracking-widest uppercase ${
                  activeTab === tab 
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-500 uppercase text-[9px] font-black tracking-[0.3em]">
                    {activeTab === 'users' && <><th className="p-8">Entity Name</th><th className="p-8">Privilege Level</th><th className="p-8">Class</th><th className="p-8 text-center">Protocol</th></>}
                    {activeTab === 'jobs' && <><th className="p-8">Role Designation</th><th className="p-8">Org Unit</th><th className="p-8">Value Band</th><th className="p-8 text-center">Entity ID</th></>}
                    {activeTab === 'applications' && <><th className="p-8">Subject</th><th className="p-8">Target Node</th><th className="p-8">Status State</th><th className="p-8 text-center">Decision</th></>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data[activeTab] as (User | Job | Application)[]).map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.04] transition-all group">
                      {activeTab === 'users' && 'username' in item && (
                        <>
                          <td className="p-8">
                            <div className="font-black text-gray-100 text-base">{item.username}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{item.email}</div>
                          </td>
                          <td className="p-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                              item.user_role === 'admin' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {item.user_role}
                            </span>
                          </td>
                          <td className="p-8 text-gray-400 font-black text-[10px] uppercase tracking-widest">{item.user_type}</td>
                          <td className="p-8">
                            <div className="flex justify-center">
                              <button 
                                  onClick={() => handleDeleteUser(item.id)} 
                                  className="p-4 bg-white/5 text-gray-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all border border-white/5"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                      {activeTab === 'jobs' && 'job_title' in item && (
                        <>
                          <td className="p-8">
                            <div className="font-black text-gray-100 text-base">{item.job_title}</div>
                            <div className="text-[9px] text-gray-600 font-black uppercase mt-1">
                              Uploaded: {new Date(item.date_created).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-8 text-gray-300 font-bold text-[11px] uppercase tracking-widest">{item.company}</td>
                          <td className="p-8 text-orange-500 font-black tracking-tighter text-lg">{item.salary}</td>
                          <td className="p-8 text-center">
                             <span className="text-[10px] font-mono text-gray-500">NODE_{item.id.toString().padStart(4, '0')}</span>
                          </td>
                        </>
                      )}
                      {activeTab === 'applications' && 'status' in item && (
                        <>
                          <td className="p-8">
                            <div className="font-black text-gray-100 text-base">{item.user?.username || 'GHOST_USER'}</div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{item.user?.email || 'N/A'}</div>
                          </td>
                          <td className="p-8">
                             <div className="text-blue-400 font-black text-[11px] uppercase tracking-widest">{item.job?.job_title || 'NULL_NODE'}</div>
                          </td>
                          <td className="p-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                              item.status.toLowerCase() === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                              item.status.toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                              'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-8">
                            <div className="flex justify-center gap-4">
                              <button 
                                  onClick={() => handleStatusUpdate(item.id, 'accepted')} 
                                  className="p-3 bg-white/5 text-green-500 border border-green-500/10 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                                  title="Approve Application"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button 
                                  onClick={() => handleStatusUpdate(item.id, 'rejected')} 
                                  className="p-3 bg-white/5 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                  title="Reject Application"
                              >
                                <FaTimes size={14} />
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
      </main>
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
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[3rem] flex items-center gap-8 shadow-2xl hover:border-orange-500/30 transition-all group relative overflow-hidden">
    <div className="absolute -right-4 -bottom-4 text-white/5 text-7xl group-hover:scale-110 transition-transform">{icon}</div>
    <div className={`text-5xl p-5 bg-white/5 rounded-[2rem] border border-white/5 ${color}`}>{icon}</div>
    <div className="relative z-10">
      <p className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em] mb-1">{label}</p>
      <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;