"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Fixed: Import Next.js Image component
import { SiWorkplace } from "react-icons/si";
import { useRouter } from 'next/navigation';
import { 
  FaUserCircle, FaMapMarkerAlt, FaEnvelope, 
  FaIdBadge, FaSave, FaSignOutAlt, FaShieldAlt 
} from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';
import Navbar from '@/src/components/Navbar';

const UserProfile = () => {
  const router = useRouter();
  const { user, token, logout, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    about: "",
    user_role: ""
  });
  const [loading, setLoading] = useState(false);

  // Helper to safely check user type as a string to avoid ts(2367)
  const userType = user?.user_type?.toString().toLowerCase();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        location: user.location || "",
        about: user.about || "",
        user_role: user.user_role || ""
      });
    } else if (!token && !localStorage.getItem('token')) {
      router.push("/login");
    }
  }, [user, token, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id || !token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedData = await res.json();
        const updatedUser = updatedData.user || updatedData;
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profile updated successfully! ✨");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-4 md:p-10'>
      
      <header className='max-w-7xl mx-auto flex items-center justify-between mb-10 px-4'>
        <Link href="/" className='flex items-center gap-2 group'>
          <SiWorkplace className='text-orange-500 text-2xl group-hover:rotate-12 transition-transform' />
          <p className='text-xl font-bold tracking-tighter italic'>vacan<span className='text-orange-500'>C</span></p>
        </Link>
        
        <div className='flex items-center gap-6'>
          <div className='hidden md:block'>
            <Navbar />
          </div>
          <button 
            onClick={logout}
            className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 transition-all'
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <main className='max-w-6xl mx-auto grid md:grid-cols-12 gap-8'>
        
        {/* Sidebar Info */}
        <div className='md:col-span-4 space-y-6'>
          <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] text-center shadow-2xl relative overflow-hidden'>
            <div className='absolute top-4 right-4'>
              {userType === 'admin' ? (
                <FaShieldAlt className='text-purple-500' title="Admin Account" />
              ) : userType === 'employer' ? (
                <SiWorkplace className='text-blue-400' title="Employer Account" />
              ) : null}
            </div>

            <div className='relative w-32 h-32 mx-auto mb-6'>
              {/* Fixed: Replaced <img> with Next.js <Image /> */}
              <Image 
                src={user?.profile_picture || '/usericon.png'} 
                alt='Avatar' 
                fill
                className='rounded-full border-4 border-orange-500/30 object-cover p-1'
                sizes="(max-width: 128px) 100vw, 128px"
              />
              <div className='absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[#0c093d] rounded-full'></div>
            </div>

            <h2 className='text-2xl font-black tracking-tight'>{user?.username || "Fetching..."}</h2>
            <p className='text-[10px] text-orange-400 font-bold mb-6 uppercase tracking-[0.2em]'>
              {user?.user_type?.toString() || 'Member'}
            </p>
            
            <div className='pt-6 border-t border-white/5 space-y-3'>
               <p className='text-xs text-gray-400 italic'>&quot;{user?.about || 'No bio set yet...'}&quot;</p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-orange-600/10 to-purple-600/10 border border-white/5 p-6 rounded-3xl'>
            <h4 className='text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest'>Quick Stats</h4>
            <div className='grid grid-cols-2 gap-4'>
                <div className='bg-white/5 p-3 rounded-2xl'>
                    <p className='text-lg font-bold'>{userType === 'employer' ? '12' : '4'}</p>
                    <p className='text-[9px] text-gray-400 uppercase'>{userType === 'employer' ? 'Jobs Posted' : 'Applied'}</p>
                </div>
                <div className='bg-white/5 p-3 rounded-2xl'>
                    <p className='text-lg font-bold'>88%</p>
                    <p className='text-[9px] text-gray-400 uppercase'>Profile</p>
                </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className='md:col-span-8'>
          <div className='bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl'>
            <div className='flex items-center justify-between mb-10'>
                <h3 className='text-xl font-bold flex items-center gap-3'>
                <span className='w-2 h-2 bg-orange-500 rounded-full animate-ping'></span>
                Account Details
                </h3>
                <span className='text-[10px] bg-white/10 px-3 py-1 rounded-full text-gray-400'>ID: #{user?.id}</span>
            </div>

            <form onSubmit={handleUpdate} className='grid sm:grid-cols-2 gap-x-8 gap-y-6'>
              
              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-black tracking-wider'>
                  <FaUserCircle className='text-orange-500' /> Display Name
                </label>
                <input 
                  type='text' name='username' value={formData.username} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-orange-500 outline-none transition-all'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-black tracking-wider'>
                  <FaEnvelope className='text-purple-500' /> Email Address
                </label>
                <input 
                  type='email' name='email' value={formData.email} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-purple-500 outline-none transition-all'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-black tracking-wider'>
                  <FaMapMarkerAlt className='text-green-500' /> Current Location
                </label>
                <input 
                  type='text' name='location' value={formData.location} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-green-500 outline-none transition-all'
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase flex items-center gap-2 font-black tracking-wider'>
                  <FaIdBadge className='text-blue-500' /> {userType === 'employer' ? 'Company Role' : 'Professional Headline'}
                </label>
                <input 
                  type='text' name='user_role' value={formData.user_role} onChange={handleInputChange}
                  placeholder={userType === 'employer' ? 'e.g. HR Manager' : 'e.g. Fullstack Developer'}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 outline-none transition-all'
                />
              </div>

              <div className='sm:col-span-2 space-y-2'>
                <label className='text-[10px] text-gray-400 uppercase font-black tracking-wider'>Professional Bio</label>
                <textarea 
                  name='about' value={formData.about} onChange={handleInputChange}
                  rows={4}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-orange-500 outline-none transition-all resize-none'
                />
              </div>

              <div className='sm:col-span-2 pt-6'>
                <button 
                  type="submit"
                  disabled={loading}
                  className='w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-500 hover:to-purple-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/20 transition-all disabled:opacity-50'
                >
                  <FaSave className='text-lg' /> {loading ? "Syncing..." : "Update Profile"}
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