"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import { useRouter } from 'next/navigation';
import { SiWorkplace } from "react-icons/si";
import Navbar from '@/src/components/Navbar';
import { useAuth } from '@/src/context/AuthContext';

const SeekerProfile = () => {
  const { user, token, logout, setUser } = useAuth(); // Using global auth state
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    about: "",
    user_role: "",
  });

  const [uploading, setUploading] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Sync form data with user context when it loads
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        location: user.location || "",
        about: user.about || "",
        user_role: user.user_role || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !token) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Update failed');
      
      const updatedUser = await response.json();
      setUser(updatedUser); // Update global context
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save changes.');
    }
  };

  const handlePictureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const imageFormData = new FormData();
    imageFormData.append("file", file);
    imageFormData.append("upload_preset", "yqanaohn"); 

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dnowgdk4r/image/upload", {
        method: "POST",
        body: imageFormData,
      });
      const data = await res.json();
      
      // Update backend with new image URL
      const patchRes = await fetch(`http://127.0.0.1:5555/user/${user?.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ profile_picture: data.secure_url }),
      });

      if (patchRes.ok) {
        const updatedUser = await patchRes.json();
        setUser(updatedUser);
        alert("Profile picture updated!");
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white flex flex-col items-center">
      {/* Header */}
      <div className="flex w-full items-center justify-between p-6 px-10 lg:px-[60px]">
        <Link href="/">
          <div className="flex items-center gap-2 group cursor-pointer">
            <SiWorkplace className="text-orange-500 text-2xl group-hover:scale-110 transition-transform" />
            <div className='flex items-baseline'>
              <p className='italic font-light text-xl tracking-tight'>vacan</p>
              <span className='text-2xl font-bold text-orange-500'>C</span>
            </div>
          </div>
        </Link>
        <Navbar />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-3 gap-10 p-10 mt-5">
        
        {/* Left Column: Avatar & Actions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl h-fit">
          <div className="relative w-32 h-32 mb-6">
            <Image
              src={user?.profile_picture || '/usericon.png'}
              alt="Profile"
              fill
              className="rounded-full border-4 border-orange-500/30 object-cover"
            />
          </div>
          
          <div className="space-y-3 w-full">
            <button
              onClick={() => profileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Update Photo"}
            </button>
            
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureUpload}
              className="hidden"
            />

            <button 
              onClick={logout}
              className="w-full py-2.5 bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/5 rounded-xl text-xs font-semibold transition-all"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold">{user?.username}</h3>
            <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">{user?.user_type || 'Seeker'}</p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-8">Account Settings</h2>
          
          <form onSubmit={handleSaveChanges} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Role Title</label>
              <input
                name="user_role"
                value={formData.user_role}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">About Me</label>
              <textarea
                name="about"
                rows={4}
                value={formData.about}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/40"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SeekerProfile;