"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { SiWorkplace } from "react-icons/si";
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaMapMarkerAlt, FaEnvelope, FaIdBadge, FaSave, FaSignOutAlt } from "react-icons/fa";

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    about: "",
    user_role: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Check BOTH places to be safe, but prioritize localStorage
    const id = localStorage.getItem("id") || sessionStorage.getItem("id");
    const token = localStorage.getItem("token");

    // 2. Only redirect if BOTH are missing
    if (!id || !token) {
      console.log("No credentials found, redirecting to login...");
      router.push("/login");
      return;
    }

    // 3. Use the unified ID for the fetch
    fetch(`http://127.0.0.1:5555/users/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or user not found");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          location: data.location || "",
          about: data.about || "",
          user_role: data.user_role || ""
        });
      })
      .catch((err) => {
        console.error("Profile load error:", err);
        // If the token is actually invalid, then we log out
        // handleLogOut(); 
      });
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = localStorage.getItem("id") || sessionStorage.getItem("id");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://127.0.0.1:5555/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated.user || updated); // Adapt to your backend response structure
        alert("Profile updated successfully! ✨");
      }
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-6 md:p-10'>
      
      <header className='max-w-6xl mx-auto flex items-center justify-between mb-12'>
        <Link href="/" className='flex items-center gap-2 group'>
          <SiWorkplace className='text-orange-500 text-2xl group-hover:rotate-12 transition-transform' />
          <p className='text-xl font-bold tracking-tighter italic'>vacan<span className='text-orange-500'>C</span></p>
        </Link>
        <button 
          onClick={handleLogOut}
          className='flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors bg-white/5 px-4 py-2 rounded-lg'
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </header>

      <main className='max-w-5xl mx-auto grid md:grid-cols-12 gap-8'>
        
        <div className='md:col-span-4 space-y-6'>
          <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-xl'>
            <div className='relative w-32 h-32 mx-auto mb-6'>
              <img 
                src='/usericon.png' 
                alt='Avatar' 
                className='w-full h-full rounded-full border-4 border-orange-500/50 object-cover p-1 hover:scale-105 transition-transform'
              />
              <div className='absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#0c093d] rounded-full'></div>
            </div>
            <h2 className='text-xl font-black truncate'>{user?.username || "Loading..."}</h2>
            <p className='text-xs text-orange-400 font-medium mb-6 uppercase tracking-widest'>{user?.user_role || "Professional"}</p>
            
            <div className='flex flex-col gap-3'>
              <button className='w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold transition-all'>
                Change Photo
              </button>
              <button className='w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold transition-all'>
                Remove Photo
              </button>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-600/20 to-orange-600/20 border border-white/10 p-6 rounded-3xl backdrop-blur-sm'>
            <p className='text-[10px] text-gray-400 uppercase tracking-widest mb-2'>Account Type</p>
            <p className='text-sm font-bold capitalize'>{user?.user_type || 'User'}</p>
          </div>
        </div>

        <div className='md:col-span-8'>
          <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl'>
            <h3 className='text-lg font-bold mb-8 flex items-center gap-3'>
              <span className='w-1.5 h-6 bg-orange-500 rounded-full'></span>
              Profile Settings
            </h3>

            <form onSubmit={handleUpdate} className='grid sm:grid-cols-2 gap-6'>
              
              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-bold'>
                  <FaUserCircle className='text-orange-500' /> Username
                </label>
                <input 
                  type='text' name='username' value={formData.username} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-bold'>
                  <FaEnvelope className='text-purple-500' /> Email Address
                </label>
                <input 
                  type='email' name='email' value={formData.email} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-bold'>
                  <FaMapMarkerAlt className='text-green-500' /> Location
                </label>
                <input 
                  type='text' name='location' value={formData.location} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-all'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-bold'>
                  <FaIdBadge className='text-blue-500' /> Headline / Role
                </label>
                <input 
                  type='text' name='user_role' value={formData.user_role} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all'
                />
              </div>

              <div className='sm:col-span-2 space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase font-bold'>Bio / About Me</label>
                <textarea 
                  name='about' value={formData.about} onChange={handleInputChange}
                  rows={4}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all resize-none'
                />
              </div>

              <div className='sm:col-span-2 pt-4'>
                <button 
                  type="submit"
                  disabled={loading}
                  className='w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-purple-500/20 transition-all disabled:opacity-50'
                >
                  <FaSave /> {loading ? "Updating..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;