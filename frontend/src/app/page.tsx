"use client";
import React, { useEffect, useState } from 'react';
import { SiWorkplace } from "react-icons/si";
import Link from 'next/link';
import { FaChevronDown, FaSearch, FaMapMarkerAlt } from "react-icons/fa";

// 1. Define what a User looks like
interface UserProfile {
  id: number;
  username: string;
  email: string;
  user_type: string;
  user_role: string;
  location?: string;
  about?: string;
}

const Page = () => {
  // 2. Tell useState the types (e.g., UserProfile or null)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem("id");
      const storedType = sessionStorage.getItem("user_type");
      setUserType(storedType);

      if (id) {
        fetch(`http://127.0.0.1:5555/users/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
          .then((res) => res.ok ? res.json() : Promise.reject())
          .then((data: UserProfile) => {
            setUser(data);
            sessionStorage.setItem('user_type', data.user_type);
            setUserType(data.user_type);
          })
          .catch(() => console.error("Session expired or user not found"));
      }
    }
  }, []);

  return (
    <div className='min-h-screen w-full flex flex-col bg-[#040313] bg-gradient-to-br from-[#040313] via-[#0c093d] to-[#1a1464] text-white selection:bg-purple-500/30'>
      
      {/* --- NAVBAR --- */}
      <nav className='flex w-full items-center justify-between px-10 py-6 backdrop-blur-md sticky top-0 z-50'>
        <div className='flex items-center gap-2 group cursor-pointer'>
          <div className='bg-orange-500 p-2 rounded-lg group-hover:rotate-12 transition-transform'>
            <SiWorkplace className='text-white text-xl' />
          </div>
          <p className='text-2xl font-black italic tracking-tighter'>
            vacan<span className='text-orange-500'>C</span>
          </p>
        </div>

        <div className='flex items-center gap-8'>
          <ul className='hidden md:flex gap-8 text-sm font-medium text-gray-400'>
            <li className='hover:text-white transition-colors cursor-pointer'>Explore</li>
            <li className='hover:text-white transition-colors cursor-pointer'>Companies</li>
            <li className='hover:text-white transition-colors cursor-pointer'>Salary Guide</li>
          </ul>

          <div className='flex items-center'>
            {user ? (
              <Link href={userType === "admin" ? "/admin" : "/user"}>
                <div className='flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-full border border-white/10 hover:bg-white/10 transition-all cursor-pointer'>
                  <img 
                    className='w-10 h-10 rounded-full border-2 border-orange-500 object-cover' 
                    src='/usericon.png' 
                    alt='profile' 
                  />
                  <div className='hidden sm:block'>
                    <p className='text-[10px] text-gray-400 leading-none'>Welcome back,</p>
                    {/* TS now knows 'username' exists because of the Interface */}
                    <p className='text-xs font-bold'>{user.username}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <button className='px-8 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all shadow-lg shadow-purple-500/20'>
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className='flex-1 grid lg:grid-cols-2 items-center px-10 max-w-7xl mx-auto w-full gap-12 py-10'>
        
        <div className='flex flex-col space-y-8 animate-in fade-in slide-in-from-left duration-1000'>
          <div className='space-y-2'>
            <span className='px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest'>
              Over 15,000+ jobs available
            </span>
            <h1 className='text-6xl md:text-7xl font-black leading-[1.1] tracking-tight'>
              Finding The <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400'>
                Job Beyond
              </span> <br />
              Borders
            </h1>
            <p className='text-gray-400 text-lg max-w-md pt-4'>
              Discover roles you love at top-tier companies. Your next career milestone starts here.
            </p>
          </div>

          <div className='relative group'>
            <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000'></div>
            <form className='relative flex items-center bg-[#16142e] rounded-2xl p-2 border border-white/10'>
              <div className='flex items-center flex-1 px-4 gap-3'>
                <FaSearch className='text-purple-400' />
                <input 
                  type='text' 
                  placeholder='Job title or keyword...' 
                  className='bg-transparent w-full text-sm outline-none py-4 border-r border-white/10' 
                />
              </div>
              <div className='flex items-center gap-2 px-4'>
                <FaMapMarkerAlt className='text-orange-400' />
                <span className='text-sm font-medium'>Location</span>
                <FaChevronDown className='text-[10px] text-gray-500' />
              </div>
              <button type="button" className='bg-white text-black px-8 py-4 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors'>
                Search
              </button>
            </form>
          </div>
        </div>

        <div className='relative hidden lg:block animate-in fade-in zoom-in duration-1000'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]'></div>
          <div 
            style={{ backgroundImage: "url('/bg.png')" }} 
            className='relative z-10 bg-contain bg-center bg-no-repeat p-10 flex items-center justify-center'
          >
            <img 
              src='/man.png' 
              className='w-full max-w-[500px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transform hover:-translate-y-2 transition-transform duration-500' 
              alt='Professional' 
            />
          </div>
          
          <div className='absolute bottom-10 left-0 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl animate-bounce delay-700'>
            <p className='text-[10px] text-gray-400'>Hiring Now</p>
            <p className='text-xs font-bold'>Senior DevOps Engineer</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;