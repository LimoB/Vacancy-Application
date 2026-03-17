"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { FaUsers, FaBriefcase, FaFileAlt, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({ users: [], jobs: [], applications: [] });
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const headers = { "Authorization": `Bearer ${token}` };

      try {
        const [uRes, jRes, aRes] = await Promise.all([
          fetch("http://127.0.0.1:5555/users", { headers }), // Note: You'll need to add a GET /users route in app.py
          fetch("http://127.0.0.1:5555/jobs", { headers }),
          fetch("http://127.0.0.1:5555/applications", { headers })
        ]);

        const [users, jobs, apps] = await Promise.all([
          uRes.json(), jRes.json(), aRes.json()
        ]);

        setData({ users, jobs, applications: apps });
      } catch (error) {
        console.error("Admin Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm("Permanently delete this user?")) return;
    const res = await fetch(`http://127.0.0.1:5555/users/${id}`, { 
      method: 'DELETE', 
      headers: { "Authorization": `Bearer ${getToken()}` } 
    });
    if (res.ok) setData({ ...data, users: data.users.filter(u => u.id !== id) });
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    const res = await fetch(`http://127.0.0.1:5555/applications/${appId}`, {
      method: 'PATCH',
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}` 
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      const updatedApps = data.applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      );
      setData({ ...data, applications: updatedApps });
    }
  };

  if (loading) return <div className="min-h-screen bg-[#040313] text-white flex items-center justify-center">Initializing Admin Core...</div>;

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] to-[#0c093d] text-white'>
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">
            SYSTEM CONTROL PANEL
          </h1>
          <p className="text-gray-400">Overview of platform activity and entity management.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<FaUsers />} label="Total Users" value={data.users.length} color="text-blue-400" />
          <StatCard icon={<FaBriefcase />} label="Active Jobs" value={data.jobs.length} color="text-orange-400" />
          <StatCard icon={<FaFileAlt />} label="Applications" value={data.applications.length} color="text-green-400" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
          {['users', 'jobs', 'applications'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-6 py-2 rounded-t-xl transition-all ${activeTab === tab ? 'bg-orange-500 text-white font-bold' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Table Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest">
              <tr>
                {activeTab === 'users' && <><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Type</th><th className="p-4">Actions</th></>}
                {activeTab === 'jobs' && <><th className="p-4">Title</th><th className="p-4">Company</th><th className="p-4">Salary</th><th className="p-4">Actions</th></>}
                {activeTab === 'applications' && <><th className="p-4">Applicant</th><th className="p-4">Job</th><th className="p-4">Status</th><th className="p-4">Actions</th></>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data[activeTab].map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  {activeTab === 'users' && (
                    <>
                      <td className="p-4">
                        <div className="font-bold">{item.username}</div>
                        <div className="text-[10px] text-gray-500">{item.email}</div>
                      </td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-[10px] ${item.user_role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20'}`}>{item.user_role}</span></td>
                      <td className="p-4 capitalize">{item.user_type}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteUser(item.id)} className="text-gray-500 hover:text-red-500"><FaTrash /></button>
                      </td>
                    </>
                  )}
                  {activeTab === 'jobs' && (
                    <>
                      <td className="p-4 font-bold">{item.job_title}</td>
                      <td className="p-4">{item.company}</td>
                      <td className="p-4 text-green-400">{item.salary}</td>
                      <td className="p-4">
                         {/* Job deletion logic already exists in your app */}
                         <span className="text-gray-600 text-[10px]">Managed in Jobs Feed</span>
                      </td>
                    </>
                  )}
                  {activeTab === 'applications' && (
                    <>
                      <td className="p-4 font-bold">{item.user?.username}</td>
                      <td className="p-4 text-orange-400">{item.job?.job_title}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === 'Accepted' ? 'bg-green-500/20 text-green-400' : item.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => handleStatusUpdate(item.id, 'Accepted')} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"><FaCheck /></button>
                        <button onClick={() => handleStatusUpdate(item.id, 'Rejected')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><FaTimes /></button>
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
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex items-center gap-4 shadow-xl">
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] uppercase text-gray-500 tracking-widest">{label}</p>
      <h3 className="text-2xl font-black">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;