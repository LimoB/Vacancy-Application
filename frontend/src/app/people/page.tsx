"use client";
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { SiWorkplace } from "react-icons/si";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdModeEditOutline, MdVerifiedUser } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";
import { User } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";

const People = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Unified fetch for all users (Admin Access)
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Ensure port 5000 is used to match your Flask backend
      const response = await fetch("http://127.0.0.1:5000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) throw new Error("Security Override: Unauthorized access to user node list.");
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Link Failure:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: number) => {
    if (!confirm("Confirm Purge: Permanently remove this user node from the system?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("Security Error: Could not delete node.");
      }
    } catch (error) {
      console.error("Purge failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white selection:bg-orange-500/30">
      {/* --- HEADER --- */}
      <header className='flex items-center justify-between mb-8 px-10 max-w-7xl mx-auto pt-8 border-b border-white/5 pb-8'>
          <div className='flex flex-col'>
              <Link href="/" className='flex items-center gap-2 group mb-1'>
                  <SiWorkplace className='text-orange-500 text-2xl group-hover:rotate-12 transition-transform' />
                  <p className='italic text-xl font-black tracking-tighter uppercase'>Vacan<span className='text-orange-500 not-italic'>C</span></p>
              </Link>
              <span className='text-[8px] uppercase tracking-[0.4em] text-gray-500 font-black text-center lg:text-left'>Admin Terminal v2.4.0</span>
          </div>
          <Navbar />
      </header>

      <div className="w-full max-w-7xl px-10 mx-auto mt-6">
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Node Directory</h1>
            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em]">Central User Management</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">System Load</p>
                <p className="text-xs font-bold text-green-400">Stable Connection</p>
             </div>
             <p className="text-xl font-black bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
               {users.length} <span className="text-[10px] text-gray-500 ml-2 uppercase tracking-widest">Active Nodes</span>
             </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Decrypting User Data...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-hidden bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl mb-20">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] bg-white/5">
                    <th className="px-8 py-7 text-left font-black">Identity Node</th>
                    <th className="px-6 py-7 text-left font-black">Auth Level</th>
                    <th className="px-6 py-7 text-left font-black">Sector</th>
                    <th className="px-6 py-7 text-left font-black">CV Asset</th>
                    <th className="px-6 py-7 text-left font-black">Deployment</th>
                    <th className="px-8 py-7 text-center font-black">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 transition-all">
                            <Image 
                                src={u.profile_picture || '/usericon.png'} 
                                alt={u.username} 
                                fill 
                                className="object-cover"
                            />
                          </div>
                          <div>
                            <h1 className="text-sm font-black text-white">{u.username}</h1>
                            <p className="text-[10px] text-gray-500 font-bold tracking-tight">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`flex items-center gap-2 text-[9px] px-3 py-1.5 rounded-xl uppercase font-black tracking-widest border w-fit ${
                          u.user_role === "admin" 
                          ? "bg-red-500/10 text-red-400 border-red-500/20" 
                          : "bg-white/5 text-gray-400 border-white/10"
                        }`}>
                          {u.user_role === "admin" && <MdVerifiedUser size={12}/>}
                          {u.user_role}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[9px] px-3 py-1.5 rounded-xl uppercase font-black tracking-widest border ${
                          u.user_type === "employer"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {u.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        {u.cv_url ? (
                          <a 
                            href={`http://127.0.0.1:5000/${u.cv_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center w-fit border border-orange-500/20"
                          >
                            <FaFilePdf size={16} />
                          </a>
                        ) : (
                          <span className="text-[9px] text-gray-700 uppercase font-black tracking-widest">Missing</span>
                        )}
                      </td>
                      <td className="px-6 py-6 text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                        {u.date_created ? new Date(u.date_created).toLocaleDateString() : "Historical"}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-3">
                          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-gray-400 hover:text-white">
                            <MdModeEditOutline size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/20 transition-all shadow-xl shadow-red-900/10"
                          >
                            <RiDeleteBin6Line size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
            <SiWorkplace size={80} className="text-white/5 mb-6 rotate-12" />
            <h1 className="text-gray-600 font-black uppercase text-[10px] tracking-[0.4em]">No users found in global directory.</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default People;