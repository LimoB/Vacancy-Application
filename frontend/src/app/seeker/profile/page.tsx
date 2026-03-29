"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { useRouter } from 'next/navigation';
import { 
  FaUserCircle, FaMapMarkerAlt, FaEnvelope, 
  FaIdBadge, FaSave, FaShieldAlt, FaCheckCircle, FaCheck
} from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';
import Navbar from '@/src/components/Navbar';
import { ImSpinner2 } from "react-icons/im";

const UserProfile = () => {
  const router = useRouter();
  const { user, token, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    about: "",
    user_role: ""
  });
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const userType = useMemo(() => user?.user_type?.toString().toLowerCase() || 'seeker', [user]);

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
    setErrorMsg("");
    
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
        // Handle different backend response structures
        const updatedUser = updatedData.user || updatedData;
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
          setErrorMsg("Failed to sync profile. Check if the email is already taken.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setErrorMsg("Connection to server failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-[#040313] flex items-center justify-center'>
        <ImSpinner2 className='text-orange-500 animate-spin text-4xl' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-4 md:p-10 relative'>
      
      {/* Floating Success Toast */}
      {showSuccess && (
        <div className='fixed top-24 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-3 bg-green-500/20 backdrop-blur-xl border border-green-500/50 text-green-400 px-8 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-top-10 fade-in duration-500 font-black text-xs uppercase tracking-widest'>
            <FaCheckCircle className='text-lg' />
            Neural Link Synced!
        </div>
      )}

      {/* Header */}
      <header className='max-w-7xl mx-auto flex items-center justify-between mb-16 px-4 pt-4'>
        <Link href="/" className='flex items-center gap-2 group'>
          <SiWorkplace className='text-orange-500 text-3xl group-hover:rotate-12 transition-transform' />
          <p className='text-2xl font-black tracking-tighter italic'>vacan<span className='text-orange-500 not-italic'>C</span></p>
        </Link>
        
        <div className='flex items-center gap-6'>
          <Navbar />
          {/* Logout removed here as it is now in the Navbar profile dropdown */}
        </div>
      </header>

      <main className='max-w-6xl mx-auto grid md:grid-cols-12 gap-10'>
        
        {/* Sidebar Info */}
        <div className='md:col-span-4 space-y-6'>
          <div className='bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl relative group'>
            <div className='absolute top-6 right-6'>
              {userType === 'admin' ? (
                <FaShieldAlt className='text-purple-500 text-xl' />
              ) : userType === 'employer' ? (
                <SiWorkplace className='text-blue-400 text-xl' />
              ) : null}
            </div>

            <div className='relative w-36 h-36 mx-auto mb-8 p-1 border-2 border-dashed border-gray-600 rounded-full group-hover:border-orange-500 transition-colors'>
              <Image 
                src={user?.profile_picture || '/usericon.png'} 
                alt='Avatar' 
                fill
                className='rounded-full object-cover p-1'
                sizes="144px"
              />
              <div className='absolute bottom-3 right-3 w-6 h-6 bg-green-500 border-4 border-[#0c093d] rounded-full shadow-lg'></div>
            </div>

            <h2 className='text-3xl font-black tracking-tighter mb-1'>{user?.username}</h2>
            <p className='text-[10px] text-orange-400 font-black uppercase tracking-[0.3em] mb-8'>
              {user?.user_role || user?.user_type || 'Active Member'}
            </p>
            
            <div className='pt-8 border-t border-white/5'>
               <p className='text-xs text-gray-400 leading-relaxed italic'>
                &quot;{user?.about || 'Initiate your professional bio to attract potential nodes.'}&quot;
               </p>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className='bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-8 rounded-[2.5rem]'>
            <h4 className='text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest'>Node Activity</h4>
            <div className='grid grid-cols-2 gap-4'>
                <div className='bg-[#040313] p-4 rounded-2xl border border-white/5'>
                    <p className='text-2xl font-black text-white'>14</p>
                    <p className='text-[8px] text-gray-500 uppercase font-bold tracking-tighter'>Saved</p>
                </div>
                <div className='bg-[#040313] p-4 rounded-2xl border border-white/5'>
                    <p className='text-2xl font-black text-orange-500'>03</p>
                    <p className='text-[8px] text-gray-500 uppercase font-bold tracking-tighter'>Active</p>
                </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className='md:col-span-8'>
          <div className='bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-600 to-blue-500'></div>
            
            <div className='flex items-center justify-between mb-12'>
                <h3 className='text-2xl font-black tracking-tight flex items-center gap-4'>
                Update Identity
                </h3>
                <span className='text-[10px] font-black tracking-widest text-orange-500/50 bg-orange-500/5 px-4 py-2 rounded-full border border-orange-500/10'>
                    UID: {user?.id}
                </span>
            </div>

            {errorMsg && (
                <div className='mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-2xl animate-shake'>
                    ⚠️ {errorMsg}
                </div>
            )}

            <form onSubmit={handleUpdate} className='grid sm:grid-cols-2 gap-x-10 gap-y-8'>
              
              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaUserCircle className='text-orange-500' /> Username
                </label>
                <input 
                  type='text' name='username' value={formData.username} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-orange-500/50 focus:bg-white/10 outline-none transition-all font-medium'
                />
              </div>

              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaEnvelope className='text-purple-500' /> Email
                </label>
                <input 
                  type='email' name='email' value={formData.email} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all font-medium'
                />
              </div>

              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaMapMarkerAlt className='text-green-500' /> Location
                </label>
                <input 
                  type='text' name='location' value={formData.location} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-green-500/50 focus:bg-white/10 outline-none transition-all font-medium'
                />
              </div>

              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaIdBadge className='text-blue-500' /> Professional Role
                </label>
                <input 
                  type='text' name='user_role' value={formData.user_role} onChange={handleInputChange}
                  placeholder='e.g. Senior Software Engineer'
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all font-medium'
                />
              </div>

              <div className='sm:col-span-2 space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]'>About / Summary</label>
                <textarea 
                  name='about' value={formData.about} onChange={handleInputChange}
                  rows={5}
                  className='w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm focus:border-orange-500/50 focus:bg-white/10 outline-none transition-all resize-none font-medium leading-relaxed'
                />
              </div>

              <div className='sm:col-span-2 pt-6'>
                <button 
                  type="submit"
                  disabled={loading || showSuccess}
                  className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all disabled:opacity-50
                    ${showSuccess 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gradient-to-r from-orange-600 to-indigo-600 hover:brightness-110 text-white shadow-indigo-500/20'
                    }`}
                >
                  {loading ? (
                    <ImSpinner2 className="animate-spin text-xl" />
                  ) : showSuccess ? (
                    <FaCheck className='text-xl animate-in zoom-in duration-300' />
                  ) : (
                    <FaSave className='text-xl' />
                  )}
                  
                  {loading ? "Processing..." : showSuccess ? "Successfully Saved" : "Commit Changes"}
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