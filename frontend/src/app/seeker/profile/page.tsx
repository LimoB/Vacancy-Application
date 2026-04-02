/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiWorkplace } from "react-icons/si";
import { useRouter } from 'next/navigation';
import { 
  FaUserCircle, FaMapMarkerAlt, FaEnvelope, 
  FaIdBadge, FaSave, FaShieldAlt, FaCheckCircle, FaCheck,
  FaArrowUp, FaFilePdf
} from "react-icons/fa";
import { useAuth } from '@/src/context/AuthContext';
import Navbar from '@/src/components/Navbar';
import { ImSpinner2 } from "react-icons/im";

const UserProfile = () => {
  const router = useRouter();
  const { user, token, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    about: "",
    user_role: ""
  });
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
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

  /**
   * UPDATED: Handles CV Upload and breaks the loading loop
   */
  const handleCVUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id || !token) return;

    setErrorMsg("");
    setCvLoading(true); // Start spinner
    
    const cvData = new FormData();
    cvData.append('cv', file);

    try {
      const res = await fetch(`http://127.0.0.1:5000/users/${user.id}/cv`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: cvData
      });

      const data = await res.json();

      if (res.ok) {
        // Merge the new cv_url into existing user state
        const updatedUser = { ...user, cv_url: data.cv_url };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrorMsg(data.message || "CV Upload failed. Ensure file is a PDF under 5MB.");
      }
    } catch (err) {
      setErrorMsg("Connection to file server failed.");
    } finally {
      setCvLoading(false); // Stop spinner regardless of outcome
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
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

      const updatedData = await res.json();

      if (res.ok) {
        const updatedUser = updatedData.user || updatedData;
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
          setErrorMsg(updatedData.message || "Sync failed.");
      }
    } catch (_error) {
      setErrorMsg("Neural link interrupted. Please check your connection.");
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
    <div className='min-h-screen bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#14114d] text-white p-4 md:p-10 relative selection:bg-orange-500/30'>
      
      {showSuccess && (
        <div className='fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-green-500/20 backdrop-blur-xl border border-green-500/50 text-green-400 px-8 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-top-10 duration-500 font-black text-[10px] uppercase tracking-widest'>
            <FaCheckCircle className='text-lg' />
            Identity Synchronized
        </div>
      )}

      <header className='max-w-7xl mx-auto flex items-center justify-between mb-16 px-4 pt-4'>
        <Link href="/" className='flex items-center gap-2 group'>
          <SiWorkplace className='text-orange-500 text-3xl group-hover:rotate-12 transition-transform' />
          <p className='text-2xl font-black tracking-tighter uppercase'>vacan<span className='text-orange-500'>C</span></p>
        </Link>
        <Navbar />
      </header>

      <main className='max-w-6xl mx-auto grid md:grid-cols-12 gap-10'>
        
        <div className='md:col-span-4 space-y-6'>
          <div className='bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group'>
            <div className='absolute -top-4 -right-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700'>
               {userType === 'admin' ? <FaShieldAlt size={120}/> : <SiWorkplace size={120}/>}
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

            <h2 className='text-3xl font-black tracking-tighter mb-1 uppercase'>{user?.username}</h2>
            <p className='text-[10px] text-orange-400 font-black uppercase tracking-[0.3em] mb-8'>
              {user?.user_role === 'admin' ? 'System Administrator' : user?.user_type}
            </p>
            
            <div className='pt-8 border-t border-white/5'>
               <p className='text-xs text-gray-400 leading-relaxed font-medium italic'>
                &quot;{user?.about || 'Seeker has not initialized a professional bio summary.'}&quot;
               </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-8 rounded-[2.5rem]'>
            <h4 className='text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest'>Digital Assets</h4>
            
            {user.cv_url ? (
              <div className='bg-[#040313] p-5 rounded-2xl border border-orange-500/20 flex items-center justify-between group'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-orange-500/10 text-orange-500 rounded-xl'>
                    {cvLoading ? <ImSpinner2 className='animate-spin'/> : <FaFilePdf size={20}/>}
                  </div>
                  <div>
                    <p className='text-[10px] font-black uppercase tracking-tighter'>Curriculum Vitae</p>
                    <a href={`http://127.0.0.1:5000/${user.cv_url}`} target="_blank" className='text-[9px] text-gray-500 hover:text-orange-400 underline uppercase font-bold'>View PDF</a>
                  </div>
                </div>
                <button 
                  disabled={cvLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className='text-gray-600 hover:text-white transition-colors'
                >
                  <FaArrowUp />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={cvLoading}
                className='w-full bg-white/5 border border-dashed border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group'
              >
                {cvLoading ? <ImSpinner2 className='animate-spin text-orange-500'/> : <FaArrowUp className='text-gray-500 group-hover:text-orange-500 transition-colors'/>}
                <span className='text-[9px] font-black uppercase tracking-widest text-gray-500'>
                    {cvLoading ? "Uploading..." : "Upload Resume (PDF)"}
                </span>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleCVUpload} className="hidden" accept=".pdf" />
          </div>
        </div>

        <div className='md:col-span-8'>
          <div className='bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-600 to-blue-500'></div>
            
            <div className='flex items-center justify-between mb-12'>
                <h3 className='text-2xl font-black tracking-tight uppercase'>Registry Update</h3>
                <span className='text-[9px] font-black tracking-[0.2em] text-orange-500/50 bg-orange-500/5 px-4 py-2 rounded-full border border-orange-500/10'>
                    NODE_ID: {user?.id?.toString().padStart(4, '0')}
                </span>
            </div>

            {errorMsg && (
                <div className='mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-2xl'>
                    Protocol Error: {errorMsg}
                </div>
            )}

            <form onSubmit={handleUpdate} className='grid sm:grid-cols-2 gap-x-10 gap-y-8'>
              
              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaUserCircle className='text-orange-500' /> Username
                </label>
                <input 
                  type='text' name='username' value={formData.username} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-orange-500/50 focus:bg-white/10 outline-none transition-all font-bold tracking-tight'
                />
              </div>

              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaEnvelope className='text-purple-500' /> Email Address
                </label>
                <input 
                  type='email' name='email' value={formData.email} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all font-bold tracking-tight'
                />
              </div>

              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaMapMarkerAlt className='text-green-500' /> Location Node
                </label>
                <input 
                  type='text' name='location' value={formData.location} onChange={handleInputChange}
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-green-500/50 focus:bg-white/10 outline-none transition-all font-bold tracking-tight'
                />
              </div>

              <div className='space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase flex items-center gap-2 font-black tracking-[0.2em]'>
                  <FaIdBadge className='text-blue-500' /> Current Designation
                </label>
                <input 
                  type='text' name='user_role' value={formData.user_role} onChange={handleInputChange}
                  placeholder='e.g. Lead Architect'
                  className='w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all font-bold tracking-tight'
                />
              </div>

              <div className='sm:col-span-2 space-y-3'>
                <label className='text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]'>Professional Biography</label>
                <textarea 
                  name='about' value={formData.about} onChange={handleInputChange}
                  rows={4}
                  className='w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm focus:border-orange-500/50 focus:bg-white/10 outline-none transition-all resize-none font-medium leading-relaxed'
                />
              </div>

              <div className='sm:col-span-2 pt-6'>
                <button 
                  type="submit"
                  disabled={loading || showSuccess}
                  className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all
                    ${showSuccess 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gradient-to-r from-orange-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white shadow-xl shadow-indigo-500/20'
                    }`}
                >
                  {loading ? (
                    <ImSpinner2 className="animate-spin text-xl" />
                  ) : showSuccess ? (
                    <FaCheck className='text-xl' />
                  ) : (
                    <FaSave className='text-xl' />
                  )}
                  {loading ? "Transmitting..." : showSuccess ? "Changes Committed" : "Commit to Registry"}
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